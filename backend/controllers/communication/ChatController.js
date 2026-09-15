const express = require('express');
const router = express.Router();

const mime = require('mime-types');
const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');
const ChatHelper = require('../../helper/ChatHelper');
const ChatIdentity = require('../../helper/ChatIdentity');
const CareTeam = require('../../helper/CareTeam');
const ChatSocket = require('../../WebSockets/ChatSocket');
const MediaTicket = require('../../helper/MediaTicket');
const MediaStream = require('../../helper/MediaStream');
const MediaMeta = require('../../helper/MediaMeta');
const MediaTranscode = require('../../helper/MediaTranscode');
const PushHelper = require('../../helper/PushHelper');
const NotificationHelper = require('../../helper/NotificationHelper');
const NotificationSocket = require('../../WebSockets/NotificationSocket');

/**
 * Chat.
 *
 * TWO RULES GOVERN THIS FILE.
 *
 * 1. Identity comes from the token, never from the body. ChatIdentity.Me
 *    resolves req.LogedUser into a {UserType, UserId} pair; no route accepts a
 *    caller identifier. This is the principle /api/patient/* is built on, and it
 *    is why a patient cannot read someone else's conversation - there is nowhere
 *    in the request to put the id.
 *
 * 2. Every room-addressed route goes through AssertMembership first. There is no
 *    admin bypass: RoleId 1 is not a participant and does not read clinical
 *    conversations it is not in. (Flagged to ZSUT - if compliance access is
 *    required it needs its own audited route and, per the mobile tender, a
 *    notification to the patient.)
 *
 * WHAT THIS REPLACED, so nobody reintroduces it:
 *
 *   - There was no SendMessage route at all. The frontend called it, got a 404,
 *     and painted a delivered tick anyway. Sending only ever worked over an
 *     unauthenticated socket.
 *   - GetMessages took a client-supplied `ObjectName` and handed it to
 *     BaseControllerHelper.BaseGetList. It was a generic read of any registered
 *     model, with no room-membership check of any kind.
 *   - GetChatRoomUsers, AddUserToChatRoom and RemoveUserFromChatRoom had no
 *     authorization whatsoever: any authenticated user could enumerate any
 *     room's members, add anyone to any room, or eject anyone from any room.
 *   - AddChatRoom created a room unconditionally, so two clicks made two rooms.
 *
 * Envelope is the legacy PascalCase {Success, Message, Data, Option} sent via
 * res.send(JSON.stringify(...)), with errors at HTTP 200 - CLAUDE.md §5.
 */

// routes
router.post('/GetChatRoomList', GetChatRoomList);
router.post('/GetMessages', GetMessages);
router.post('/SendMessage', SendMessage);
router.post('/CommitMessage', CommitMessage);
router.post('/MarkRead', MarkRead);
router.post('/GetUnreadCount', GetUnreadCount);
router.post('/AddChatRoom', AddChatRoom);
router.post('/StartChat', AddChatRoom);
router.post('/CheckChatRoom', CheckChatRoom);
router.post('/CreateGroupRoom', CreateGroupRoom);
router.post('/GetChatRoomUsers', GetChatRoomUsers);
router.post('/AddUserToChatRoom', AddUserToChatRoom);
router.post('/RemoveUserFromChatRoom', RemoveUserFromChatRoom);
router.post('/SearchUsers', SearchUsers);
router.post('/GetDirectoryFilters', GetDirectoryFilters);
router.post('/DownloadAttachment', DownloadAttachment);
router.post('/GetAttachmentLink', GetAttachmentLink);

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_SIZE = 50;
const MAX_DIRECTORY_PAGE_SIZE = 50;

// Patients may reach the doctor directory, but not all of it. 'careteam' (the
// default) limits them to doctors who already have a clinical relationship with
// them; 'all' opens the national register.
//
// This is a config switch rather than a code branch because it is a ZSUT policy
// decision, not an engineering one: "any citizen may open a direct chat with any
// cardiologist in the country" is an unbounded workload commitment that a vendor
// must not make unilaterally.
const PatientDirectoryMode = () => (process.env.CHAT_PATIENT_DIRECTORY || 'careteam').toLowerCase();

// Cheap in-memory rate limit for the patient directory, so the endpoint is not a
// bulk scrape of the national physician register. Same shape as the userCache
// Map in helper/Auth.js:5 - process-local, and that is fine for this purpose.
const DirectoryHits = new Map();
const DIRECTORY_WINDOW_MS = 60000;
const DIRECTORY_MAX_PER_WINDOW = 30;

function Ok(res, Data, Message, Option) {
  return res.send(
    JSON.stringify({
      Success: true,
      Message: Message || '',
      Data: Data === undefined ? {} : Data,
      Option: Option || {},
    })
  );
}

function Fail(res, Message) {
  return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(Message)));
}

/**
 * The one authorization primitive.
 *
 * Resolves the caller's real identity and proves they are an ACTIVE member of
 * this room. Ok:false means refuse the request - never degrade to an unscoped
 * query.
 */
async function AssertMembership(LogedUser, ChatRoomId) {
  const Me = ChatIdentity.Me(LogedUser);
  if (!Me) return { Ok: false, Reason: 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна' };

  const RoomId = parseInt(ChatRoomId, 10);
  if (!RoomId || Number.isNaN(RoomId)) return { Ok: false, Reason: 'Мэдээлэл дутуу байна' };

  const Member = await ChatHelper.IsMember(Me, RoomId);
  if (!Member) return { Ok: false, Reason: 'Хандах эрхгүй байна' };

  return { Ok: true, Me, Member, ChatRoomId: RoomId };
}

/**
 * Shape one message row for the wire. Used by GetMessages, SendMessage and the
 * socket fan-out, so every channel emits an identical message object and the
 * client can reconcile them on Id / ClientMsgId alone.
 */
function ShapeMessage(Row, People, FilesByMessageId, Me) {
  const Person = People.get(ChatIdentity.Key({ UserType: Row.UserType, UserId: Row.UserId }));
  const Files = (FilesByMessageId && FilesByMessageId.get(Row.Id)) || [];

  return {
    Id: Row.Id,
    ChatRoomId: Row.ChatRoomId,
    UserId: Row.UserId,
    UserType: Row.UserType,
    MessageText: Row.MessageText,
    CreateDate: Row.CreateDate,
    Status: Row.Status,
    AttachmentCount: Row.AttachmentCount || 0,
    SenderName: Person ? Person.Name : '',
    SenderImageSrc: Person ? Person.ImageSrc : '',
    IsMine: !!Me && ChatIdentity.Same(Me, { UserType: Row.UserType, UserId: Row.UserId }),
    Attachment: Files,
  };
}

/**
 * Attach image thumbnails to a page of message attachments.
 *
 * Only images carry bytes. A PDF or a .dcm returns FileInfo alone, so a message
 * list never ships megabytes of base64 for documents nobody has opened.
 */
async function AttachFileSources(FilesByMessageId) {
  const AllFiles = [];
  FilesByMessageId.forEach((Files) => Files.forEach((F) => AllFiles.push(F)));
  if (AllFiles.length === 0) return FilesByMessageId;

  const Images = AllFiles.filter((F) => {
    const Type = mime.contentType(F.ext);
    return Type && Type.toLowerCase().indexOf('image') > -1;
  });

  let ThumbById = new Map();
  if (Images.length > 0) {
    try {
      // The CACHED variant on purpose: GetFileSrcThumbnail runs sharp per image
      // per request (30-40ms each, per the comment at
      // BaseControllerHelper.js:898-915). GetChatRoomList used to call the
      // uncached one, once per member, per room.
      const Thumbs = await BaseControllerHelper.GetFileSrcThumbnailCached(Images, 40);
      Thumbs.forEach((T) => {
        if (T && T.FileInfo) ThumbById.set(T.FileInfo.id_data, T);
      });
    } catch (ex) {
      console.log('AttachFileSources thumbnail error:', ex.message);
      ThumbById = new Map();
    }
  }

  /*
   * Duration and transcode state for the audio and video among them, in ONE
   * query for the whole page rather than one per attachment.
   *
   * It travels with the message list on purpose: without it a client cannot
   * tell a voice note from a document until it has asked about each file
   * separately, which is a round trip per bubble just to decide which control
   * to draw. Empty Map when the columns are not there yet (MediaMeta), and
   * every field below degrades to null.
   */
  const Playable = AllFiles.filter((F) => {
    const K = MediaStream.Kind(F.ext);
    return K === 'audio' || K === 'video';
  });
  const MetaById = await MediaMeta.Read(Playable.map((F) => F.id_data));

  const Shaped = new Map();
  FilesByMessageId.forEach((Files, MessageId) => {
    Shaped.set(
      MessageId,
      Files.map((F) => {
        const T = ThumbById.get(F.id_data);
        const M = MetaById.get(F.id_data);
        return {
          FileSrc: T ? T.FileSrc : '',
          Type: T ? T.Type : '',
          FileInfo: {
            ...F,
            Name: F.original_name,
            Kind: MediaStream.Kind(F.ext),
            DurationMs: M ? M.DurationMs : null,
            MediaState: M ? M.MediaState : null,
          },
        };
      })
    );
  });

  return Shaped;
}

// ===========================================================================
// Rooms
// ===========================================================================

async function GetChatRoomList(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');

    // The caller's own chat identity travels with the list.
    //
    // The client cannot derive this. For staff it happens to equal
    // LogedUser.Id, but for a patient UserId is Patient.id_data while the
    // browser's LogedUser holds the PatientUsers row - different tables, and
    // under DAN there may be no PatientUsers row at all. Without this, "is this
    // message mine?" is a guess that is wrong for every patient.
    const Option = { Me };

    const Rooms = await ChatHelper.BuildRoomList(Me);
    if (Rooms.length === 0) return Ok(res, [], '', Option);

    const RoomIds = Rooms.map((R) => R.ChatRoomId);
    const Members = await ChatHelper.GetMembersForRooms(RoomIds);

    // One identity resolve for every participant across every room, instead of
    // the old one-query-per-member-per-room.
    const People = await ChatIdentity.ResolveMany(Members);

    const MembersByRoom = new Map();
    Members.forEach((M) => {
      if (!MembersByRoom.has(M.ChatRoomId)) MembersByRoom.set(M.ChatRoomId, []);
      const Person = People.get(ChatIdentity.Key(M));
      MembersByRoom.get(M.ChatRoomId).push({
        UserType: M.UserType,
        UserId: M.UserId,
        Name: Person ? Person.Name : '',
        ImageSrc: Person ? Person.ImageSrc : '',
        RoleId: Person ? Person.RoleId : null,
        OrganizationName: Person ? Person.OrganizationName : null,
        LastReadMessageId: M.LastReadMessageId,
        IsMe: ChatIdentity.Same(Me, M),
      });
    });

    const Data = Rooms.map((R) => {
      const All = MembersByRoom.get(R.ChatRoomId) || [];
      const Others = All.filter((M) => !M.IsMe);

      // A group keeps its own name. A 1:1 room is named after the other person.
      //
      // The old code did `L.Name = L.Name + FullName` with no separator, so a
      // three-person room rendered as one run-together string.
      let Name = R.RoomName;
      if (R.RoomType !== 'GR' || !Name) {
        Name = Others.map((M) => M.Name)
          .filter(Boolean)
          .join(', ');
      }

      return {
        ChatRoomId: R.ChatRoomId,
        RoomType: R.RoomType,
        Name: Name || '',
        // Kept for the existing frontend, which reads RoomImageSrc.
        RoomImageSrc: Others.length === 1 ? Others[0].ImageSrc : '',
        Members: All,
        IsMuted: !!R.IsMuted,
        LastReadMessageId: R.LastReadMessageId,
        UnreadCount: R.UnreadCount || 0,
        LastMessage: R.LastMessageId
          ? {
              Id: R.LastMessageId,
              MessageText: R.LastMessageText,
              CreateDate: R.LastMessageDate,
              UserId: R.LastMessageUserId,
              UserType: R.LastMessageUserType,
              AttachmentCount: R.LastMessageAttachmentCount || 0,
              IsMine: ChatIdentity.Same(Me, {
                UserType: R.LastMessageUserType,
                UserId: R.LastMessageUserId,
              }),
            }
          : null,
        LastActivityDate: R.LastMessageDate || R.RoomCreateDate,
      };
    });

    return Ok(res, Data, '', Option);
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function GetChatRoomUsers(req, res) {
  try {
    const Auth = await AssertMembership(req.LogedUser, req.body.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    // IncludeInactive so a group admin can see who was removed. The unique index
    // means the manual "remove duplicates based on UserId" pass this route used
    // to carry is no longer needed.
    const Members = await ChatHelper.GetRoomMembers(Auth.ChatRoomId, true);
    const People = await ChatIdentity.ResolveMany(Members);

    const Data = Members.map((M) => {
      const Person = People.get(ChatIdentity.Key(M));
      return {
        Id: M.Id,
        ChatRoomId: M.ChatRoomId,
        UserType: M.UserType,
        UserId: M.UserId,
        IsActive: M.IsActive,
        LastReadMessageId: M.LastReadMessageId,
        Name: Person ? Person.Name : '',
        ImageSrc: Person ? Person.ImageSrc : '',
        RoleId: Person ? Person.RoleId : null,
        profession: Person ? Person.profession : null,
        OrganizationName: Person ? Person.OrganizationName : null,
        IsMe: ChatIdentity.Same(Auth.Me, M),
      };
    });

    return Ok(res, Data);
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * Idempotent. Returns the existing 1:1 room or creates one.
 *
 * Also mounted as /StartChat, which is the name the new frontend uses.
 */
async function AddChatRoom(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');

    // UserType defaults to staff so an older client that sends a bare UserId
    // still opens a doctor-to-doctor room rather than failing.
    const Target = ChatIdentity.FromRequest(req.body.UserType || 'S', req.body.UserId);
    if (!Target) return Fail(res, 'Мэдээлэл дутуу байна');

    if (ChatIdentity.Same(Me, Target)) return Fail(res, 'Өөртэйгөө чат үүсгэх боломжгүй');

    // Patient<->patient chat does not exist.
    if (ChatIdentity.IsPatient(Me) && ChatIdentity.IsPatient(Target)) {
      return Fail(res, 'Хандах эрхгүй байна');
    }

    const Allowed = await CanReach(Me, Target);
    if (!Allowed.Ok) return Fail(res, Allowed.Reason);

    const Result = await ChatHelper.ResolveOrCreateDirectRoom(Me, Target);
    return Ok(res, Result, Result.Created ? 'Чат үүсгэлээ' : '');
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function CheckChatRoom(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');

    const Target = ChatIdentity.FromRequest(req.body.UserType || 'S', req.body.UserId);
    if (!Target) return Fail(res, 'Мэдээлэл дутуу байна');

    const ChatRoomId = await ChatHelper.FindDirectRoom(Me, Target);
    return Ok(res, { CheckData: !!ChatRoomId, ChatRoomId: ChatRoomId || null });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * Groups are doctors-only, and must be created as groups.
 *
 * A patient is never a member: adding someone to a room hands them the entire
 * prior history, and for a room containing a patient that is a disclosure of
 * clinical conversation nobody consented to.
 */
async function CreateGroupRoom(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');
    if (ChatIdentity.IsPatient(Me)) return Fail(res, 'Хандах эрхгүй байна');

    const RoomName = (req.body.RoomName || '').trim();
    if (!RoomName) return Fail(res, 'Бүлгийн нэрийг оруулна уу');

    const Raw = Array.isArray(req.body.Members) ? req.body.Members : [];
    const Targets = [];
    for (let i = 0; i < Raw.length; i++) {
      const T = ChatIdentity.FromRequest(Raw[i].UserType || 'S', Raw[i].UserId);
      if (!T) return Fail(res, 'Мэдээлэл дутуу байна');
      if (ChatIdentity.IsPatient(T)) return Fail(res, 'Бүлгийн чатад өвчтөн нэмэх боломжгүй');
      if (ChatIdentity.Same(Me, T)) continue;
      if (!Targets.some((X) => ChatIdentity.Same(X, T))) Targets.push(T);
    }

    if (Targets.length === 0) return Fail(res, 'Хамгийн багадаа нэг эмч сонгоно уу');

    const Found = await Models.Users.count({
      where: { Id: { [Op.in]: Targets.map((T) => T.UserId) }, RoleId: { [Op.ne]: 4 } },
    });
    if (Found !== Targets.length) return Fail(res, 'Хэрэглэгч олдсонгүй');

    const ChatRoomId = await sequelize.transaction(async (Tx) => {
      const Room = await Models.ChatRooms.create(
        {
          RoomName,
          RoomType: 'GR',
          CreateUserId: String(Me.UserId),
          CreateUserType: Me.UserType,
          CreateDate: ObjectHelper.getDateYMDHMS(),
          IsActive: '1',
        },
        { transaction: Tx }
      );

      await Models.ChatRoomTooUsers.bulkCreate(
        [Me].concat(Targets).map((P) => ({
          ChatRoomId: Room.Id,
          UserId: P.UserId,
          UserType: P.UserType,
          CreateUserId: Me.UserId,
          CreateDate: ObjectHelper.getDateYMDHMS(),
          IsActive: '1',
          IsMuted: false,
        })),
        { transaction: Tx }
      );

      return Room.Id;
    });

    return Ok(res, { ChatRoomId, Created: true }, 'Бүлгийн чат үүсгэлээ');
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

// ===========================================================================
// Messages
// ===========================================================================

/**
 * Room-scoped, membership-checked, and the predicate is written here rather
 * than taken from the request.
 *
 * The client cannot influence which table is read, which columns come back, or
 * what the WHERE says - which is the entire difference from the version this
 * replaced.
 */
async function GetMessages(req, res) {
  try {
    const Auth = await AssertMembership(req.LogedUser, req.body.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    const Me = Auth.Me;
    const PageSize = Math.min(parseInt(req.body.PageSize, 10) || 30, MAX_PAGE_SIZE);
    const PageNumber = Math.max(parseInt(req.body.PageNumber, 10) || 0, 0);
    const BeforeId = parseInt(req.body.BeforeId, 10);

    const Where = {
      ChatRoomId: Auth.ChatRoomId,
      [Op.and]: [
        { [Op.or]: [{ IsDelete: { [Op.ne]: '1' } }, { IsDelete: { [Op.is]: null } }] },
        {
          // A pending attachment row is visible to its author alone until
          // CommitMessage promotes it - so nobody else sees an empty bubble
          // while the bytes are still uploading.
          [Op.or]: [{ Status: 'S' }, { Status: 'P', UserId: Me.UserId, UserType: Me.UserType }],
        },
      ],
    };

    // Keyset paging: stable while new messages arrive, unlike OFFSET which
    // shifts every page down as the conversation grows.
    if (BeforeId && !Number.isNaN(BeforeId)) Where.Id = { [Op.lt]: BeforeId };

    const { rows, count } = await Models.ChatMessages.findAndCountAll({
      where: Where,
      order: [['Id', 'DESC']],
      limit: PageSize,
      offset: BeforeId ? 0 : PageNumber * PageSize,
      raw: true,
    });

    const People = await ChatIdentity.ResolveMany(
      rows.map((R) => ({ UserType: R.UserType, UserId: R.UserId }))
    );

    const WithFiles = rows.filter((R) => (R.AttachmentCount || 0) > 0).map((R) => R.Id);
    let FilesByMessageId = await ChatHelper.GetFilesForMessages(WithFiles);
    FilesByMessageId = await AttachFileSources(FilesByMessageId);

    const Data = rows.map((R) => ShapeMessage(R, People, FilesByMessageId, Me));

    return Ok(res, Data, '', { Total: count });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * The authoritative write path.
 *
 * HTTP, not the socket, because a socket emit has no response: the client could
 * never learn the row's Id or CreateDate, so an optimistic message could never
 * leave "sending". The socket now only fans out a row that is already committed,
 * which also means a message can no longer be broadcast that failed to save.
 */
async function SendMessage(req, res) {
  try {
    const Auth = await AssertMembership(req.LogedUser, req.body.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    const Me = Auth.Me;
    const HasAttachment = req.body.HasAttachment === true || req.body.HasAttachment === 'true';
    const MessageText = (req.body.MessageText || '').trim();

    if (!MessageText && !HasAttachment) return Fail(res, 'Мессеж хоосон байна');
    if (MessageText.length > MAX_MESSAGE_LENGTH) {
      return Fail(res, 'Мессеж хэт урт байна (дээд тал нь 2000 тэмдэгт)');
    }

    const Row = await ChatHelper.CreateMessage({
      ChatRoomId: Auth.ChatRoomId,
      Me,
      MessageText,
      Status: HasAttachment ? 'P' : 'S',
    });

    const People = await ChatIdentity.ResolveMany([Me]);
    const Payload = ShapeMessage(Row, People, null, Me);
    // Echoed so the client can replace its optimistic row rather than duplicate
    // it. The server never stores or interprets it.
    Payload.ClientMsgId = req.body.ClientMsgId || null;

    // A pending attachment row is NOT fanned out. CommitMessage does that once
    // the files are on disk.
    if (!HasAttachment) await FanOutMessage(Auth.ChatRoomId, Payload);

    return Ok(res, Payload);
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * Promote a pending attachment message to sent, and only then fan it out.
 */
async function CommitMessage(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');

    const MessageId = parseInt(req.body.MessageId, 10);
    if (!MessageId || Number.isNaN(MessageId)) return Fail(res, 'Мэдээлэл дутуу байна');

    const Row = await Models.ChatMessages.findByPk(MessageId, { raw: true });
    if (!Row) return Fail(res, 'Мессеж олдсонгүй');

    // Author only, and still a member.
    if (!ChatIdentity.Same(Me, { UserType: Row.UserType, UserId: Row.UserId })) {
      return Fail(res, 'Хандах эрхгүй байна');
    }
    const Auth = await AssertMembership(req.LogedUser, Row.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    if (Row.Status === 'S') {
      // Already committed - a retry, not an error.
      return Ok(res, await ReadOneMessage(MessageId, Me));
    }

    const Files = await Models.File.count({
      where: {
        LinkedObjectId: MessageId,
        LinkedObjectName: 'ChatMessages',
        rec_status: { [Op.in]: ['9', '1'] },
      },
    });

    if (Files === 0) {
      // Nothing landed. Retire the carrier row rather than leaving an empty
      // bubble in the sender's history.
      await Models.ChatMessages.update({ IsDelete: '1' }, { where: { Id: MessageId } });
      return Fail(res, 'Файл хадгалагдсангүй');
    }

    await Models.ChatMessages.update(
      { Status: 'S', AttachmentCount: Files },
      { where: { Id: MessageId } }
    );

    const Payload = await ReadOneMessage(MessageId, Me);
    Payload.ClientMsgId = req.body.ClientMsgId || null;
    await FanOutMessage(Row.ChatRoomId, Payload);

    /*
     * Queue any audio or video for normalisation - AFTER the message is
     * committed and fanned out, so nothing here can delay or fail delivery.
     *
     * A WebM voice note recorded in a browser does not play on iOS; this is
     * what turns it into M4A/AAC. It is fire-and-forget on purpose: the
     * original bytes are already being served, and the swap happens under the
     * same generated_name, so links handed out in the meantime stay valid.
     */
    try {
      const Playable = (Payload.Attachment || [])
        .filter((F) => {
          const K = F && F.FileInfo && F.FileInfo.Kind;
          return K === 'audio' || K === 'video';
        })
        .map((F) => F.FileInfo.id_data);
      if (Playable.length > 0) MediaTranscode.Enqueue(Playable);
    } catch (ex) {
      console.log('CommitMessage transcode enqueue failed:', ex.message);
    }

    return Ok(res, Payload);
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function ReadOneMessage(MessageId, Me) {
  const Row = await Models.ChatMessages.findByPk(MessageId, { raw: true });
  if (!Row) return null;

  const People = await ChatIdentity.ResolveMany([{ UserType: Row.UserType, UserId: Row.UserId }]);
  let FilesByMessageId = await ChatHelper.GetFilesForMessages([MessageId]);
  FilesByMessageId = await AttachFileSources(FilesByMessageId);

  return ShapeMessage(Row, People, FilesByMessageId, Me);
}

/**
 * Deliver a committed message to every active member's personal socket room.
 *
 * Personal rooms, not the conversation room, so a member whose chat window is
 * closed still gets the unread bump. The member list is read from the database,
 * never taken from the client payload.
 */
/**
 * What a push says when the message is not text.
 *
 * The body of a clinical message does not belong on a lock screen in any case,
 * but an attachment has no text to show at all - without this the notification
 * would be blank and tell the recipient nothing about whether to open it.
 */
function PushPreview(Payload) {
  const Text = String(Payload.MessageText || '').trim();
  if (Text) return Text.length > 120 ? Text.slice(0, 119) + '…' : Text;

  const Kinds = (Payload.Attachment || []).map(
    (F) => (F && F.FileInfo && F.FileInfo.Kind) || 'file'
  );
  if (Kinds.indexOf('audio') !== -1) return '🎤 Дуут мессеж';
  if (Kinds.indexOf('video') !== -1) return '🎬 Видео бичлэг';
  if (Kinds.indexOf('image') !== -1) return '📷 Зураг';
  if (Kinds.length > 0) return '📎 Файл';
  return 'Шинэ мессеж';
}

/**
 * Push to everyone in the room except the sender and anyone who muted it.
 *
 * WHY THIS EXISTS. Until now a new message produced a socket emit and nothing
 * else, so a phone with the app closed learned nothing - which makes a voice
 * note about as useful as not sending one. PushHelper and the device tables
 * were already built for reminders; chat simply never called them.
 *
 * Best-effort, like the socket emit above it: the message is already durable,
 * and a missing FCM key must not turn a saved message into an error the sender
 * sees. With no push driver configured this lands in the log driver.
 */
async function PushToMembers(Members, Payload) {
  const Sender = { UserType: Payload.UserType, UserId: Payload.UserId };
  const Body = PushPreview(Payload);

  const Targets = Members.filter(
    (M) => !ChatIdentity.Same(Sender, { UserType: M.UserType, UserId: M.UserId }) && !M.IsMuted
  );

  for (const M of Targets) {
    try {
      await PushHelper.Send({
        UserType: M.UserType,
        UserId: M.UserId,
        Title: Payload.SenderName || 'MnCardio',
        Body,
        Data: {
          Type: 'chat',
          ChatRoomId: String(Payload.ChatRoomId),
          MessageId: String(Payload.Id),
        },
      });
    } catch (ex) {
      console.log('PushToMembers error for ' + M.UserType + ':' + M.UserId + ' -', ex.message);
    }
  }
}

/**
 * Put a chat message in the recipients' notification bell.
 *
 * ONE row per person per room, not one per message: while the row is unseen,
 * each new message rewrites it and bumps CreateDate, so a busy conversation is
 * one line in the bell that always shows the latest message. MarkRead marks it
 * seen; the next message after that starts a fresh row.
 *
 * Same targets as PushToMembers (not the sender, not muted). No push here -
 * PushToMembers already sent the chat push, and a second one would buzz twice.
 * Best-effort like the rest of the fan-out.
 */
const CHAT_NOTIFICATION_LINK = 'ChatRoom';

function ChatNotificationRecipient(Member) {
  return Member.UserType === 'P' ? { ToPatientId: Member.UserId } : { ToUserId: Member.UserId };
}

async function NotifyMembersInBell(Members, Payload) {
  const Sender = { UserType: Payload.UserType, UserId: Payload.UserId };
  const Targets = Members.filter(
    (M) => !ChatIdentity.Same(Sender, { UserType: M.UserType, UserId: M.UserId }) && !M.IsMuted
  );
  if (Targets.length === 0) return;

  const Text = ((Payload.SenderName || 'MnCardio') + ': ' + PushPreview(Payload)).slice(0, 250);
  const Now = ObjectHelper.getDateYMDHMS();
  // Only a staff sender has a Users.Id; a patient's UserId is not one.
  const CreateUserId = Payload.UserType === 'S' ? Payload.UserId : null;

  for (const M of Targets) {
    try {
      const Recipient = ChatNotificationRecipient(M);
      const Existing = await Models.Notification.findOne({
        attributes: ['Id'],
        where: {
          ...Recipient,
          LinkObjectName: CHAT_NOTIFICATION_LINK,
          LinkObjectId: Payload.ChatRoomId,
          Seen: null,
        },
        order: [['Id', 'DESC']],
        raw: true,
      });

      let NotificationId = null;
      if (Existing) {
        await Models.Notification.update(
          { Notes: Text, NotesMn: Text, CreateDate: Now, CreateUserId },
          { where: { Id: Existing.Id } }
        );
        NotificationId = Existing.Id;
      } else {
        NotificationId = await NotificationHelper.SaveNotification({
          Data: {
            ...Recipient,
            Notes: Text,
            NotesMn: Text,
            Action: 'chat',
            LinkObjectName: CHAT_NOTIFICATION_LINK,
            LinkObjectId: Payload.ChatRoomId,
            CreateDate: Now,
            CreateUserId,
          },
          LogedUser: {},
          SendNotification: false,
        });
      }

      if (NotificationId) {
        NotificationSocket.SendNotification({
          UserType: M.UserType,
          UserId: M.UserId,
          Data: NotificationId,
        });
      }
    } catch (ex) {
      console.log('NotifyMembersInBell error for ' + M.UserType + ':' + M.UserId + ' -', ex.message);
    }
  }
}

async function FanOutMessage(ChatRoomId, Payload) {
  try {
    const Members = await ChatHelper.GetRoomMembers(ChatRoomId, false);
    // IsMine is per-recipient, so it must not travel in a broadcast payload.
    const Broadcast = { ...Payload };
    delete Broadcast.IsMine;
    delete Broadcast.ClientMsgId;
    ChatSocket.EmitToMembers(Members, 'newMessage', {
      ...Broadcast,
      ClientMsgId: Payload.ClientMsgId || null,
    });

    // Not awaited: a slow or unreachable FCM endpoint must not hold the HTTP
    // response the sender is waiting on.
    PushToMembers(Members, Payload).catch((ex) => console.log('PushToMembers failed:', ex.message));
    NotifyMembersInBell(Members, Payload).catch((ex) =>
      console.log('NotifyMembersInBell failed:', ex.message)
    );
  } catch (ex) {
    // Delivery is best-effort; the message is already durable. A socket failure
    // must never turn a saved message into an error the sender sees.
    console.log('FanOutMessage error:', ex.message);
  }
}

async function MarkRead(req, res) {
  try {
    const Auth = await AssertMembership(req.LogedUser, req.body.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    const LastReadMessageId = await ChatHelper.MarkRead(
      Auth.Me,
      Auth.ChatRoomId,
      req.body.LastMessageId
    );

    // Tell the room so the sender's ticks can turn to "read".
    try {
      ChatSocket.EmitToRoom(Auth.ChatRoomId, 'messageRead', {
        ChatRoomId: Auth.ChatRoomId,
        UserId: Auth.Me.UserId,
        UserType: Auth.Me.UserType,
        LastReadMessageId,
      });
    } catch (ex) {
      console.log('MarkRead emit error:', ex.message);
    }

    // Reading the room clears its bell row (see NotifyMembersInBell).
    try {
      await Models.Notification.update(
        { Seen: '1', SeenDate: ObjectHelper.getDateYMDHMS() },
        {
          where: {
            ...ChatNotificationRecipient(Auth.Me),
            LinkObjectName: CHAT_NOTIFICATION_LINK,
            LinkObjectId: Auth.ChatRoomId,
            Seen: null,
          },
        }
      );
    } catch (ex) {
      console.log('MarkRead notification error:', ex.message);
    }

    return Ok(res, { ChatRoomId: Auth.ChatRoomId, LastReadMessageId, UnreadCount: 0 });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function GetUnreadCount(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');
    return Ok(res, await ChatHelper.GetUnreadCount(Me));
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

// ===========================================================================
// Membership
// ===========================================================================

async function AddUserToChatRoom(req, res) {
  try {
    const Auth = await AssertMembership(req.LogedUser, req.body.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    // A patient must not be able to pull a third party into a conversation
    // about their own health.
    if (ChatIdentity.IsPatient(Auth.Me)) return Fail(res, 'Хандах эрхгүй байна');

    const Room = await Models.ChatRooms.findByPk(Auth.ChatRoomId, { raw: true });
    if (!Room) return Fail(res, 'Чат олдсонгүй');

    // Adding to an existing 1:1 room would retroactively grant the newcomer the
    // whole history. Groups must be created as groups.
    if (Room.RoomType !== 'GR') {
      return Fail(res, 'Ганцаарчилсан чатад хэрэглэгч нэмэх боломжгүй. Шинэ бүлэг үүсгэнэ үү');
    }

    const Target = ChatIdentity.FromRequest(req.body.UserType || 'S', req.body.UserId);
    if (!Target) return Fail(res, 'Мэдээлэл дутуу байна');
    if (ChatIdentity.IsPatient(Target)) return Fail(res, 'Бүлгийн чатад өвчтөн нэмэх боломжгүй');

    const Exists = await Models.Users.count({
      where: { Id: Target.UserId, RoleId: { [Op.ne]: 4 } },
    });
    if (!Exists) return Fail(res, 'Хэрэглэгч олдсонгүй');

    const Existing = await Models.ChatRoomTooUsers.findOne({
      where: { ChatRoomId: Auth.ChatRoomId, UserId: Target.UserId, UserType: Target.UserType },
    });

    if (Existing) {
      if (String(Existing.IsActive) === '1') return Fail(res, 'Хэрэглэгч аль хэдийн нэмэгдсэн');
      await Existing.update({ IsActive: '1' });
      return Ok(res, {}, 'Хэрэглэгчийг дахин нэмлээ');
    }

    await Models.ChatRoomTooUsers.create({
      ChatRoomId: Auth.ChatRoomId,
      UserId: Target.UserId,
      UserType: Target.UserType,
      CreateUserId: Auth.Me.UserId,
      CreateDate: ObjectHelper.getDateYMDHMS(),
      IsActive: '1',
      IsMuted: false,
    });

    return Ok(res, {}, 'Хэрэглэгчийг нэмлээ');
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

async function RemoveUserFromChatRoom(req, res) {
  try {
    const Auth = await AssertMembership(req.LogedUser, req.body.ChatRoomId);
    if (!Auth.Ok) return Fail(res, Auth.Reason);

    const Target = ChatIdentity.FromRequest(req.body.UserType || 'S', req.body.UserId);
    if (!Target) return Fail(res, 'Мэдээлэл дутуу байна');

    const Room = await Models.ChatRooms.findByPk(Auth.ChatRoomId, { raw: true });
    if (!Room) return Fail(res, 'Чат олдсонгүй');

    const IsSelf = ChatIdentity.Same(Auth.Me, Target);
    const IsCreator =
      String(Room.CreateUserId) === String(Auth.Me.UserId) &&
      Room.CreateUserType === Auth.Me.UserType;

    // You may always leave. Removing someone else is the room creator's right.
    if (!IsSelf && !IsCreator) return Fail(res, 'Хандах эрхгүй байна');
    if (!IsSelf && Room.RoomType !== 'GR') {
      return Fail(res, 'Ганцаарчилсан чатаас хэрэглэгч хасах боломжгүй');
    }

    const Member = await Models.ChatRoomTooUsers.findOne({
      where: {
        ChatRoomId: Auth.ChatRoomId,
        UserId: Target.UserId,
        UserType: Target.UserType,
        IsActive: '1',
      },
    });
    if (!Member) return Fail(res, 'Хэрэглэгч энэ чатад байхгүй байна');

    await Member.update({ IsActive: '0' });
    return Ok(res, {}, 'Хэрэглэгчийг хаслаа');
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

// ===========================================================================
// Directory
// ===========================================================================

/**
 * May Me open a conversation with Target at all?
 *
 * Doctors: anyone, nationwide.
 * Patients: governed by CHAT_PATIENT_DIRECTORY.
 */
async function CanReach(Me, Target) {
  if (ChatIdentity.IsStaff(Me)) {
    if (ChatIdentity.IsPatient(Target)) {
      const Exists = await Models.Patient.count({ where: { id_data: Target.UserId } });
      if (!Exists) return { Ok: false, Reason: 'Өвчтөн олдсонгүй' };
      return { Ok: true };
    }
    const Exists = await Models.Users.count({
      where: { Id: Target.UserId, RoleId: { [Op.ne]: 4 } },
    });
    if (!Exists) return { Ok: false, Reason: 'Хэрэглэгч олдсонгүй' };
    return { Ok: true };
  }

  // Patient caller.
  if (!ChatIdentity.IsStaff(Target)) return { Ok: false, Reason: 'Хандах эрхгүй байна' };

  const Exists = await Models.Users.count({
    where: { Id: Target.UserId, RoleId: { [Op.ne]: 4 } },
  });
  if (!Exists) return { Ok: false, Reason: 'Эмч олдсонгүй' };

  if (PatientDirectoryMode() === 'all') return { Ok: true };

  const TeamDoctorIds = await GetCareTeamUserIds(Me.UserId);
  if (TeamDoctorIds.indexOf(Target.UserId) === -1) {
    return { Ok: false, Reason: 'Зөвхөн өөрийн эмчтэй чатлах боломжтой' };
  }
  return { Ok: true };
}

/**
 * The Users.Id of every doctor with an existing clinical relationship to this
 * patient.
 *
 * Two relationships count:
 *
 *   - the care team: DoctorsTeamPatient(patient_id) -> team_id ->
 *     LookupDoctorTeam(doctor_id) -> DoctorsProfile.id_data ->
 *     DoctorsProfile.UserId (the DB column `id`);
 *   - a doctor who actively monitors the patient (PatientMonitoringDoctor,
 *     is_active '1') - the doctor app's "Миний хяналт". Care teams alone left
 *     a monitored patient unable to reach the doctor watching their journal.
 *
 * rec_status 2 is soft-deleted throughout the legacy generation.
 */
async function GetCareTeamUserIds(PatientId) {
  // Delegated to helper/CareTeam.js. The query is unchanged; it moved because
  // the rehabilitation write path, the e-visit triage queue and the access
  // audit all need the same answer, and a security boundary kept in two files
  // is one that will eventually disagree with itself.
  return CareTeam.GetCareTeamUserIds(PatientId);
}

/**
 * The people you can start a chat with.
 *
 * NATIONWIDE for doctors, deliberately. This route does not go through
 * BaseGetList, so AddOrgFilter (helper/BaseControllerHelper.js:305-372, which
 * pushes {Field:'OrganizationId', Op:'In'} for DoctorsProfile) is never reached.
 * Colleagues consulting colleagues across hospitals is the point of chat in a
 * national cardiology system, and the org filter was the thing preventing it.
 *
 * The exclusions that filter also carried are restated here explicitly rather
 * than inherited by accident.
 *
 * Accepts the envelope BaseCrudHelper.GetRequestData produces, so the app's one
 * typeahead (baseComponents/Controls/BaseLookUpGridLoad.jsx) works unmodified -
 * including its hardcoded Limit of 1000, which is why PageSize is capped here.
 */
async function SearchUsers(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');

    const IsPatientCaller = ChatIdentity.IsPatient(Me);

    if (IsPatientCaller && !AllowDirectoryHit(Me)) {
      return Fail(res, 'Хэт олон хайлт хийлээ. Түр хүлээнэ үү');
    }

    // Either a flat SearchText or the SearchField array the grid lookup sends.
    let SearchText = (req.body.SearchText || '').trim();
    if (!SearchText && Array.isArray(req.body.SearchField)) {
      const Entry = req.body.SearchField.find((F) => F && F.Value);
      if (Entry) SearchText = String(Entry.Value).trim();
    }

    const PageSize = Math.min(
      parseInt(req.body.PageSize, 10) || MAX_DIRECTORY_PAGE_SIZE,
      MAX_DIRECTORY_PAGE_SIZE
    );
    const PageNumber = Math.max(parseInt(req.body.PageNumber, 10) || 0, 0);

    const Where = {
      rec_status: { [Op.ne]: 2 },
      UserId: { [Op.ne]: null },
    };

    if (SearchText) {
      const Like = { [Op.like]: '%' + SearchText + '%' };
      // NOT FullName: it is a VIRTUAL and throws in a WHERE. Its dependency
      // columns are matched instead.
      Where[Op.or] = [
        { lastname: Like },
        { firstname: Like },
        { profession: Like },
        { organisation: Like },
        { position: Like },
        // The organisation's real name - see OrgNameById below for why the
        // organisation text column alone finds nothing on newer accounts.
        {
          OrganizationId: {
            [Op.in]: Sequelize.literal(
              `(SELECT o.Id FROM [Organization] o WHERE o.Name LIKE ${sequelize.escape(
                '%' + SearchText + '%'
              )})`
            ),
          },
        },
      ];
    }

    if (req.body.OrganizationId) {
      // A client-chosen narrowing, never a server-imposed one.
      Where.OrganizationId = parseInt(req.body.OrganizationId, 10);
    }

    // Aimag / soum narrowing, also client-chosen.
    //
    // BY NAME, not by addr_prov_city id, and that is deliberate. The id and the
    // denormalised name disagree on real rows: addr_prov_city = 10 is Дундговь
    // in DictProvinceCity, yet rows carry ProvCityName = 'Улаанбаатар'. Filtering
    // on the id therefore pulled Адаацаг doctors into a search for the capital.
    // ProvCityName is also the value shown in the list, so filtering on it means
    // what you see is exactly what you filtered by.
    //
    // SQL Server's = ignores trailing spaces, which these columns have.
    const ProvinceName = (req.body.ProvinceName || '').trim();
    if (ProvinceName) Where.ProvCityName = ProvinceName;

    const SoumName = (req.body.SoumName || '').trim();
    if (SoumName) Where.SoumDistName = SoumName;

    if (IsPatientCaller && PatientDirectoryMode() !== 'all') {
      const TeamUserIds = await GetCareTeamUserIds(Me.UserId);
      if (TeamUserIds.length === 0) return Ok(res, [], '', { Total: 0 });
      Where.UserId = { [Op.in]: TeamUserIds };
    } else if (ChatIdentity.IsStaff(Me)) {
      Where.UserId = { [Op.ne]: Me.UserId };
    }

    const { rows, count } = await Models.DoctorsProfile.findAndCountAll({
      attributes: [
        'id_data',
        'UserId',
        'lastname',
        'firstname',
        'profession',
        'position',
        'organisation',
        'OrganizationId',
        'ProvCityName',
        'SoumDistName',
        'email',
        'telephone',
      ],
      where: Where,
      // Complete names first.
      //
      // Plain `ORDER BY lastname ASC` sorts NULL and '' FIRST in SQL Server, so
      // the opening page of the directory was entirely profiles with no
      // surname - including ~115 where the username was typed into the
      // firstname field at account creation ("aldarhaan.za"). The 3146 doctors
      // with real names were buried behind them, which made the picker look
      // like it had no doctors in it.
      //
      // Incomplete profiles are ranked last rather than hidden: they are real
      // accounts, and a search for one still finds it.
      //
      // The second rank puts Mongolian names ahead of Latin ones. SQL Server's
      // collation sorts digits and Latin before Cyrillic, so without it the
      // first page opened on test and service accounts - "1.1", "a.admin",
      // "a.audit" - which is the same "there are no doctors" impression by a
      // different route.
      order: [
        [
          Sequelize.literal(
            "CASE WHEN NULLIF(LTRIM(RTRIM(ISNULL(lastname, ''))), '') IS NULL THEN 1 ELSE 0 END"
          ),
          'ASC',
        ],
        [Sequelize.literal("CASE WHEN lastname LIKE N'[А-ЯЁӨҮа-яёөү]%' THEN 0 ELSE 1 END"), 'ASC'],
        ['lastname', 'ASC'],
        ['firstname', 'ASC'],
      ],
      limit: PageSize,
      offset: PageNumber * PageSize,
      raw: true,
    });

    if (rows.length === 0) return Ok(res, [], '', { Total: count });

    // Only staff accounts that are still real and are not patients.
    const Accounts = await Models.Users.findAll({
      attributes: ['Id', 'UserName', 'RoleId'],
      where: { Id: { [Op.in]: rows.map((R) => R.UserId) }, RoleId: { [Op.ne]: 4 } },
      raw: true,
    });
    const AccountById = new Map(Accounts.map((A) => [A.Id, A]));

    // DoctorsProfile.organisation is a free-text column nothing writes any more;
    // accounts made from the admin form carry only OrganizationId. Fall back to
    // the organisation's own name so the list shows a workplace.
    const OrgIds = [...new Set(rows.map((R) => R.OrganizationId).filter(Boolean))];
    const Orgs = OrgIds.length
      ? await Models.Organization.findAll({
          attributes: ['Id', 'Name'],
          where: { Id: { [Op.in]: OrgIds } },
          raw: true,
        })
      : [];
    const OrgNameById = new Map(Orgs.map((O) => [O.Id, O.Name]));

    const People = await ChatIdentity.ResolveMany(
      rows
        .filter((R) => AccountById.has(R.UserId))
        .map((R) => ({ UserType: 'S', UserId: R.UserId }))
    );

    const Data = rows
      .filter((R) => AccountById.has(R.UserId))
      .map((R) => {
        const Person = People.get(ChatIdentity.Key({ UserType: 'S', UserId: R.UserId }));
        const Base = {
          UserType: 'S',
          UserId: R.UserId,
          ProfileId: R.id_data,
          // Both spellings: the grid lookup is configured on FullName, and the
          // rest of the app reads Name.
          Name: Person ? Person.Name : '',
          FullName: Person ? Person.Name : '',
          ImageSrc: Person ? Person.ImageSrc : '',
          profession: R.profession,
          position: R.position,
          OrganizationName:
            (R.organisation && R.organisation.trim()) || OrgNameById.get(R.OrganizationId) || '',
          OrganizationId: R.OrganizationId,
          ProvCityName: R.ProvCityName,
          SoumDistName: R.SoumDistName,
        };

        // A doctor's name and workplace is public-facing. Their direct contact
        // details are not, and DoctorsProfile holds both in the same row - so a
        // patient-facing projection drops them rather than relying on the client
        // not to render them.
        if (IsPatientCaller) return Base;

        return { ...Base, email: R.email, telephone: R.telephone };
      });

    return Ok(res, Data, '', { Total: count });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * The organisation (and legacy aimag / soum) lists for the directory's filters.
 *
 * Organizations is what the web picker uses: [{ Id, Name, Count }], and its Id
 * goes back to SearchUsers as OrganizationId.
 *
 * Built from the doctors who actually exist, not from DictProvinceCity /
 * DictSoumDistrict wholesale: offering all 22 provinces and 342 soums when only
 * some contain a doctor produces dropdowns full of dead ends. Counts come back
 * with each entry so the picker can show "Улаанбаатар (646)".
 *
 * Everything is keyed BY NAME rather than by addr_prov_city / addr_soum_dist,
 * because those ids and the denormalised names disagree on real rows -
 * addr_prov_city = 10 is Дундговь, but rows carry ProvCityName = 'Улаанбаатар'.
 * The name is what the list displays and what SearchUsers filters on, so the
 * two can never drift apart.
 *
 * Soums are returned with their province name so the client can offer only the
 * soums of the aimag already chosen - soum names repeat across provinces.
 */
async function GetDirectoryFilters(req, res) {
  try {
    const Me = ChatIdentity.Me(req.LogedUser);
    if (!Me) return Fail(res, 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна');

    // A patient's directory is their care team - a nationwide filter over a
    // handful of doctors is noise, so they get nothing to filter with.
    if (ChatIdentity.IsPatient(Me) && PatientDirectoryMode() !== 'all') {
      return Ok(res, { Organizations: [], Provinces: [], Soums: [] });
    }

    const Live = `JOIN [Users] u ON u.Id = d.id AND u.RoleId <> 4
                  WHERE ISNULL(d.rec_status, 0) <> 2`;

    // The picker's only filter. Doctors are created with an OrganizationId and
    // nothing else - the aimag / soum columns below are empty on every account
    // made from the admin form - so this is the one that actually narrows.
    // Keyed by id because Organization.Name is the canonical name; the
    // DoctorsProfile.organisation text column is never written.
    const Organizations = await sequelize.query(
      `SELECT o.Id AS Id, LTRIM(RTRIM(o.Name)) AS Name, COUNT(*) AS Cnt
         FROM [DoctorsProfile] d
         JOIN [Organization] o ON o.Id = d.OrganizationId
         ${Live}
          AND NULLIF(LTRIM(RTRIM(ISNULL(o.Name, ''))), '') IS NOT NULL
        GROUP BY o.Id, LTRIM(RTRIM(o.Name))
        ORDER BY LTRIM(RTRIM(o.Name))`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Provinces / Soums are kept for clients built against the older contract.
    const Provinces = await sequelize.query(
      `SELECT LTRIM(RTRIM(d.ProvCityName)) AS Name, COUNT(*) AS Cnt
         FROM [DoctorsProfile] d
         ${Live}
          AND NULLIF(LTRIM(RTRIM(ISNULL(d.ProvCityName, ''))), '') IS NOT NULL
        GROUP BY LTRIM(RTRIM(d.ProvCityName))
        ORDER BY COUNT(*) DESC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const Soums = await sequelize.query(
      `SELECT LTRIM(RTRIM(d.SoumDistName)) AS Name,
              LTRIM(RTRIM(d.ProvCityName)) AS ProvinceName,
              COUNT(*)                     AS Cnt
         FROM [DoctorsProfile] d
         ${Live}
          AND NULLIF(LTRIM(RTRIM(ISNULL(d.SoumDistName, ''))), '') IS NOT NULL
          AND NULLIF(LTRIM(RTRIM(ISNULL(d.ProvCityName, ''))), '') IS NOT NULL
        GROUP BY LTRIM(RTRIM(d.SoumDistName)), LTRIM(RTRIM(d.ProvCityName))
        ORDER BY LTRIM(RTRIM(d.SoumDistName))`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    return Ok(res, {
      Organizations: Organizations.map((o) => ({ Id: o.Id, Name: o.Name, Count: o.Cnt })),
      Provinces: Provinces.map((p) => ({ Name: p.Name, Count: p.Cnt })),
      Soums: Soums.map((s) => ({
        Name: s.Name,
        ProvinceName: s.ProvinceName,
        Count: s.Cnt,
      })),
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

function AllowDirectoryHit(Me) {
  const Key = ChatIdentity.Key(Me);
  const Now = Date.now();
  const Entry = DirectoryHits.get(Key);

  if (!Entry || Now - Entry.Start > DIRECTORY_WINDOW_MS) {
    DirectoryHits.set(Key, { Start: Now, Count: 1 });
    return true;
  }
  if (Entry.Count >= DIRECTORY_MAX_PER_WINDOW) return false;

  Entry.Count += 1;
  return true;
}

// ===========================================================================
// Attachments
// ===========================================================================

/**
 * Membership-checked download.
 *
 * NOT /BaseObject/downloadFile: that route takes `generated_name` straight from
 * the request body with no ownership check at all
 * (BaseControllerHelper.BaseDownloadFile), so once chat attachments live in the
 * File table, any authenticated user who learned a filename could download any
 * chat attachment.
 *
 * Here the client supplies only a FileId. The server reads the path from the
 * row, walks File -> message -> room, and proves membership before streaming.
 * BaseDownloadFile still does its own ValidateFilePath traversal check - only
 * the authorization in front of it is new.
 */
/**
 * File -> message -> room, proving membership. Shared by DownloadAttachment and
 * GetAttachmentLink so the two cannot drift: one of them handing out a playable
 * URL under a weaker rule than the other downloads under would be a hole that
 * looks like a refactor.
 */
async function ResolveChatFile(req) {
  const Me = ChatIdentity.Me(req.LogedUser);
  if (!Me) return { Ok: false, Reason: 'Хэрэглэгчийн мэдээлэл тодорхойгүй байна' };

  const FileId = parseInt(req.body.FileId, 10);
  if (!FileId || Number.isNaN(FileId)) return { Ok: false, Reason: 'Мэдээлэл дутуу байна' };

  const FileRow = await Models.File.findByPk(FileId, { raw: true });
  if (!FileRow) return { Ok: false, Reason: 'Файл олдсонгүй' };
  if (FileRow.LinkedObjectName !== 'ChatMessages')
    return { Ok: false, Reason: 'Хандах эрхгүй байна' };
  if (String(FileRow.rec_status) === '2') return { Ok: false, Reason: 'Файл олдсонгүй' };

  const Message = await Models.ChatMessages.findByPk(FileRow.LinkedObjectId, { raw: true });
  if (!Message) return { Ok: false, Reason: 'Файл олдсонгүй' };

  const Auth = await AssertMembership(req.LogedUser, Message.ChatRoomId);
  if (!Auth.Ok) return { Ok: false, Reason: Auth.Reason };

  return { Ok: true, FileRow, Message, Me };
}

async function DownloadAttachment(req, res) {
  try {
    const Resolved = await ResolveChatFile(req);
    if (!Resolved.Ok) return Fail(res, Resolved.Reason);

    const FileRow = Resolved.FileRow;

    // BaseDownloadFile returns {Path, ContentType} - it does not write the
    // response itself. Same two-step controllers/system/BaseController.js:494
    // uses.
    const Download = await BaseControllerHelper.BaseDownloadFile(FileRow);
    if (!Download) return Fail(res, 'Файл олдсонгүй');

    res.set('Content-Type', Download.ContentType);
    return res.download(Download.Path, FileRow.original_name || undefined);
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

/**
 * A URL a player can actually open.
 *
 * WHY THIS IS NOT JUST DownloadAttachment. That route is a POST that answers
 * with Content-Disposition: attachment. An <audio> or <video> element can issue
 * neither the POST nor the Authorization header it needs, and would not render
 * an attachment if it could. So the browser gets a GET URL instead, carrying a
 * ticket scoped to this one file and this one caller - see helper/MediaTicket.js.
 *
 * THE MOBILE CLIENT SHOULD NOT CALL THIS. Flutter sets httpHeaders, so it reads
 * /api/Media/stream/<generated_name> with the bearer token directly and skips
 * the extra round trip. Documented in mobile/API.md §5.
 */
async function GetAttachmentLink(req, res) {
  try {
    const Resolved = await ResolveChatFile(req);
    if (!Resolved.Ok) return Fail(res, Resolved.Reason);

    const FileRow = Resolved.FileRow;

    if (!FileRow.generated_name) return Fail(res, 'Файл олдсонгүй');

    const Minted = MediaTicket.Mint({
      generatedName: FileRow.generated_name,
      LogedUser: req.LogedUser,
    });
    if (!Minted) return Fail(res, 'Файл олдсонгүй');

    const Meta = await MediaMeta.ReadOne(FileRow.id_data);

    return Ok(res, {
      FileId: FileRow.id_data,
      Url: '/api/Media/t/' + Minted.Ticket,
      ExpiresAt: Minted.ExpiresAt,
      ExpiresInSeconds: Minted.ExpiresInSeconds,
      Kind: MediaStream.Kind(FileRow.ext),
      ContentType: MediaStream.Disposition(FileRow.ext).ContentType,
      DurationMs: Meta.DurationMs,
      MediaState: Meta.MediaState,
      Name: FileRow.original_name || '',
      Ext: FileRow.ext || '',
      Size: FileRow.size || 0,
    });
  } catch (ex) {
    console.log(ex);
    return Fail(res);
  }
}

module.exports = router;
