const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');
const { Models, Op } = require('../config/DB');

const ObjectHelper = require('./ObjectHelper');
const ChatIdentity = require('./ChatIdentity');

/**
 * Data access for chat.
 *
 * Every function here takes an already-resolved participant ({UserType, UserId}
 * from ChatIdentity.Me) and never a raw id from a request. Authorization lives
 * in the controller's AssertMembership, which is built on IsMember below.
 *
 * What this replaced:
 *   - SaveMessages, which resolved the sender with Models.Users.findOne({Id})
 *     and therefore wrote a patient's message under whichever staff account
 *     shared that id.
 *   - GetUsersByChatRoomId, which returned every membership row including the
 *     inactive ones, so a doctor removed from a room still received its
 *     messages.
 */

const LIVE = '1';
const INACTIVE = '0';

// Predicates shared by the room list and the message list, so "what counts as a
// visible message" is written once.
const VISIBLE_MESSAGE = "m.Status = 'S' AND (m.IsDelete IS NULL OR m.IsDelete <> '1')";

class ChatHelper {
  /**
   * The caller's ACTIVE membership row for this room, or null.
   *
   * This is the whole authorization model. Null means refuse - never fall back
   * to an unscoped query.
   */
  IsMember = async function (Me, ChatRoomId) {
    if (!Me || !ChatRoomId) return null;

    const Row = await Models.ChatRoomTooUsers.findOne({
      where: {
        ChatRoomId: parseInt(ChatRoomId, 10),
        UserId: Me.UserId,
        UserType: Me.UserType,
        IsActive: LIVE,
      },
      raw: true,
    });

    return Row || null;
  };

  /**
   * Active members of one room. Used for socket fan-out, so it must never
   * include someone who was removed.
   */
  GetRoomMembers = async function (ChatRoomId, IncludeInactive) {
    const Where = { ChatRoomId: parseInt(ChatRoomId, 10) };
    if (!IncludeInactive) Where.IsActive = LIVE;

    return await Models.ChatRoomTooUsers.findAll({
      attributes: [
        'Id',
        'ChatRoomId',
        'UserId',
        'UserType',
        'IsActive',
        'LastReadMessageId',
        'IsMuted',
        'CreateDate',
      ],
      where: Where,
      order: [['Id', 'ASC']],
      raw: true,
    });
  };

  /**
   * Active members of MANY rooms in one query - so building a room list of N
   * rooms stays at a constant number of round trips instead of N.
   */
  GetMembersForRooms = async function (ChatRoomIds) {
    if (!ChatRoomIds || ChatRoomIds.length === 0) return [];

    return await Models.ChatRoomTooUsers.findAll({
      attributes: ['ChatRoomId', 'UserId', 'UserType', 'LastReadMessageId'],
      where: { ChatRoomId: { [Op.in]: ChatRoomIds }, IsActive: LIVE },
      order: [
        ['ChatRoomId', 'ASC'],
        ['Id', 'ASC'],
      ],
      raw: true,
    });
  };

  /**
   * Insert one message. The sender is the resolved participant, never a value
   * off the request.
   *
   * Status 'P' is a carrier row for an attachment whose bytes are not uploaded
   * yet - invisible to everyone but its author until CommitMessage promotes it.
   */
  CreateMessage = async function ({ ChatRoomId, Me, MessageText, Status, AttachmentCount }) {
    const Row = await Models.ChatMessages.create({
      ChatRoomId: parseInt(ChatRoomId, 10),
      UserId: Me.UserId,
      UserType: Me.UserType,
      MessageText: MessageText || null,
      CreateDate: ObjectHelper.getDateYMDHMS(),
      IsDelete: INACTIVE,
      Status: Status || 'S',
      AttachmentCount: AttachmentCount || 0,
    });

    // create() returns the identity value on the instance for MSSQL, so there
    // is no need for the old createNew's racy
    // "SELECT TOP 1 Id ... ORDER BY Id DESC".
    return JSON.parse(JSON.stringify(Row));
  };

  /**
   * The room list for one participant: last message, unread count, ordered by
   * recency. One query.
   *
   * Replaces a loop that ran one findAllNew per room plus one uncached sharp
   * resize per member per room, and returned the rooms in no particular order
   * with no last message and no unread count.
   *
   * Unread deliberately excludes the participant's OWN messages - otherwise
   * sending a message to a room you are not looking at increments your own
   * badge.
   */
  BuildRoomList = async function (Me) {
    if (!Me) return [];

    return await sequelize.query(
      `SELECT
         t.ChatRoomId,
         t.LastReadMessageId,
         t.IsMuted,
         r.RoomName,
         r.RoomType,
         r.CreateDate                AS RoomCreateDate,
         lm.Id                       AS LastMessageId,
         lm.MessageText              AS LastMessageText,
         lm.CreateDate               AS LastMessageDate,
         lm.UserId                   AS LastMessageUserId,
         lm.UserType                 AS LastMessageUserType,
         lm.AttachmentCount          AS LastMessageAttachmentCount,
         ISNULL(un.Cnt, 0)           AS UnreadCount
       FROM [ChatRoomTooUsers] t
       JOIN [ChatRooms] r ON r.Id = t.ChatRoomId
       OUTER APPLY (
         SELECT TOP 1 m.Id, m.MessageText, m.CreateDate, m.UserId, m.UserType,
                m.AttachmentCount
           FROM [ChatMessages] m
          WHERE m.ChatRoomId = t.ChatRoomId AND ${VISIBLE_MESSAGE}
          ORDER BY m.Id DESC
       ) lm
       OUTER APPLY (
         SELECT COUNT(*) AS Cnt
           FROM [ChatMessages] m
          WHERE m.ChatRoomId = t.ChatRoomId AND ${VISIBLE_MESSAGE}
            AND m.Id > ISNULL(t.LastReadMessageId, 0)
            AND NOT (m.UserId = t.UserId AND m.UserType = t.UserType)
       ) un
       WHERE t.UserId = :UserId
         AND t.UserType = :UserType
         AND t.IsActive = '1'
       ORDER BY ISNULL(lm.Id, 0) DESC, r.Id DESC`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { UserId: Me.UserId, UserType: Me.UserType },
      }
    );
  };

  /**
   * Find the existing 1:1 room between two participants, or create it.
   *
   * Idempotent by design. AddChatRoom used to create a room unconditionally, so
   * two clicks made two rooms and CheckChatRoom existed only to paper over it
   * with an extra round trip (and a TOCTOU race). Here the lookup and the
   * insert are the same call, inside a transaction, and
   * UX_ChatRoomTooUsers_Room_User turns a genuine race into a constraint
   * violation the caller re-reads rather than a duplicate room.
   *
   * "The 1:1 room" means exactly two active members and RoomType DD or DP - a
   * group that happens to contain both people is not it.
   */
  FindDirectRoom = async function (Me, Target) {
    const Rows = await sequelize.query(
      `SELECT TOP 1 r.Id AS ChatRoomId
         FROM [ChatRooms] r
         JOIN [ChatRoomTooUsers] a
           ON a.ChatRoomId = r.Id AND a.UserId = :MeId AND a.UserType = :MeType
          AND a.IsActive = '1'
         JOIN [ChatRoomTooUsers] b
           ON b.ChatRoomId = r.Id AND b.UserId = :TgId AND b.UserType = :TgType
          AND b.IsActive = '1'
        WHERE r.RoomType IN ('DD', 'DP')
          AND (SELECT COUNT(*) FROM [ChatRoomTooUsers] c
                WHERE c.ChatRoomId = r.Id AND c.IsActive = '1') = 2
        ORDER BY r.Id ASC`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: {
          MeId: Me.UserId,
          MeType: Me.UserType,
          TgId: Target.UserId,
          TgType: Target.UserType,
        },
      }
    );

    return Rows.length > 0 ? Rows[0].ChatRoomId : null;
  };

  ResolveOrCreateDirectRoom = async function (Me, Target, RoomName) {
    const Existing = await this.FindDirectRoom(Me, Target);
    if (Existing) return { ChatRoomId: Existing, Created: false };

    // A room with a patient on either side is DP, which the member routes then
    // refuse to add anyone to.
    const RoomType = ChatIdentity.IsPatient(Me) || ChatIdentity.IsPatient(Target) ? 'DP' : 'DD';

    try {
      const ChatRoomId = await sequelize.transaction(async (Tx) => {
        const Room = await Models.ChatRooms.create(
          {
            RoomName: RoomName || null,
            RoomType,
            CreateUserId: Me.UserId,
            CreateUserType: Me.UserType,
            CreateDate: ObjectHelper.getDateYMDHMS(),
            IsActive: LIVE,
          },
          { transaction: Tx }
        );

        await Models.ChatRoomTooUsers.bulkCreate(
          [Me, Target].map((P) => ({
            ChatRoomId: Room.Id,
            UserId: P.UserId,
            UserType: P.UserType,
            CreateUserId: Me.UserId,
            CreateDate: ObjectHelper.getDateYMDHMS(),
            IsActive: LIVE,
            IsMuted: false,
          })),
          { transaction: Tx }
        );

        return Room.Id;
      });

      return { ChatRoomId, Created: true };
    } catch (ex) {
      // Lost the race against a concurrent create - the unique index fired.
      // Re-read rather than surfacing a constraint error.
      const Retry = await this.FindDirectRoom(Me, Target);
      if (Retry) return { ChatRoomId: Retry, Created: false };
      throw ex;
    }
  };

  /**
   * Advance the caller's unread high-water mark. Never moves backwards, so an
   * out-of-order client cannot resurrect an unread count.
   */
  MarkRead = async function (Me, ChatRoomId, LastMessageId) {
    let Target = parseInt(LastMessageId, 10);

    if (!Target || Number.isNaN(Target)) {
      const Rows = await sequelize.query(
        `SELECT ISNULL(MAX(m.Id), 0) AS MaxId
           FROM [ChatMessages] m
          WHERE m.ChatRoomId = :ChatRoomId AND ${VISIBLE_MESSAGE}`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: { ChatRoomId: parseInt(ChatRoomId, 10) },
        }
      );
      Target = Rows.length > 0 ? Rows[0].MaxId : 0;
    }

    await Models.ChatRoomTooUsers.update(
      { LastReadMessageId: Target, LastReadDate: ObjectHelper.getDateYMDHMS() },
      {
        where: {
          ChatRoomId: parseInt(ChatRoomId, 10),
          UserId: Me.UserId,
          UserType: Me.UserType,
          [Op.or]: [
            { LastReadMessageId: { [Op.lt]: Target } },
            { LastReadMessageId: { [Op.is]: null } },
          ],
        },
      }
    );

    return Target;
  };

  /**
   * Total unread across every room, for the FAB badge.
   */
  GetUnreadCount = async function (Me) {
    const Rows = await sequelize.query(
      `SELECT t.ChatRoomId, COUNT(m.Id) AS UnreadCount
         FROM [ChatRoomTooUsers] t
         LEFT JOIN [ChatMessages] m
           ON m.ChatRoomId = t.ChatRoomId
          AND ${VISIBLE_MESSAGE}
          AND m.Id > ISNULL(t.LastReadMessageId, 0)
          AND NOT (m.UserId = t.UserId AND m.UserType = t.UserType)
        WHERE t.UserId = :UserId AND t.UserType = :UserType AND t.IsActive = '1'
        GROUP BY t.ChatRoomId`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { UserId: Me.UserId, UserType: Me.UserType },
      }
    );

    const Total = Rows.reduce((Sum, R) => Sum + (R.UnreadCount || 0), 0);
    return { Total, Rooms: Rows };
  };

  /**
   * Attachments for a whole page of messages in one query, keyed by message id.
   * The per-message alternative is an N+1 on every scroll.
   */
  GetFilesForMessages = async function (MessageIds) {
    const ByMessageId = new Map();
    if (!MessageIds || MessageIds.length === 0) return ByMessageId;

    const Files = await Models.File.findAll({
      attributes: [
        'id_data',
        'ext',
        'original_name',
        'generated_name',
        'size',
        'LinkedObjectName',
        'LinkedObjectId',
        'FieldName',
      ],
      where: {
        LinkedObjectId: { [Op.in]: MessageIds },
        LinkedObjectName: 'ChatMessages',
        rec_status: { [Op.in]: ['9', '1'] },
      },
      order: [['id_data', 'ASC']],
      raw: true,
    });

    for (let i = 0; i < Files.length; i++) {
      const F = Files[i];
      if (!ByMessageId.has(F.LinkedObjectId)) ByMessageId.set(F.LinkedObjectId, []);
      ByMessageId.get(F.LinkedObjectId).push(F);
    }

    return ByMessageId;
  };
}

module.exports = new ChatHelper();
