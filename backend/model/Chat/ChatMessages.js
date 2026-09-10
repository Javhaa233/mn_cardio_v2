const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ChatMessages extends Sequelize.Model {}
ChatMessages.init(
  {
    // The `set(value)` hook that used to live here mirrored every Id into a
    // `Number` column. `Number` was a vestigial duplicate of the primary key
    // that nothing read, so both are gone.
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    ChatRoomId: { type: Sequelize.INTEGER },

    // Only an identity when paired with UserType - see helper/ChatIdentity.js.
    //   'S' -> Users.Id
    //   'P' -> Patient.id_data
    UserId: { type: Sequelize.INTEGER },
    UserType: { type: Sequelize.STRING(1) },

    // TEXT, because the live column is already NVARCHAR(MAX) and nullable -
    // verified against MnCardio_restored. The model previously declared
    // Sequelize.STRING, which is NVARCHAR(255); that mismatch was harmless
    // (Sequelize does not enforce STRING length on write and never generates
    // DDL here) but it made the model lie about the schema.
    //
    // The real cap is applied in the controller (MAX_MESSAGE_LENGTH = 2000), so
    // a chat turn cannot grow without bound while the column stays permissive.
    MessageText: { type: Sequelize.TEXT },

    CreateDate: { type: Sequelize.DATE },
    IsDelete: { type: Sequelize.STRING },

    // 'S' = sent    - visible to the room, already fanned out.
    // 'P' = pending - a carrier row for an attachment whose bytes are not on
    //                 disk yet. Visible to its author only, and never fanned
    //                 out until /Chat/CommitMessage promotes it to 'S'. This is
    //                 what stops a recipient seeing an empty bubble a second
    //                 before the image arrives.
    Status: { type: Sequelize.STRING(1) },
    AttachmentCount: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'ChatMessages',
    modelName: 'ChatMessages',
    timestamps: false,
  }
);

ChatMessages.SearchField = ['ChatRoomId', 'MessageText'];

// DELIBERATELY NO ASSOCIATIONS AND NO findAllNew - same reason as
// model/Chat/ChatRoomTooUsers.js. belongsTo(Users) and belongsTo(DoctorsProfile)
// both joined on the bare UserId, so a patient-authored message resolved to
// whichever staff account shared that id. Sender names come from
// helper/ChatIdentity.ResolveMany, batched once per page.
//
// ChatMessages.createNew is gone too: it did
//   INSERT ... ; SELECT TOP 1 Id FROM ChatMessages ORDER BY Id DESC
// which returns another session's row under any concurrency. Sequelize's
// create() already returns the identity value on the instance for MSSQL.

ChatMessages.SetFunctions = (Models) => {
  const { Op } = Sequelize;

  /**
   * Attachments for one message. Shape copied from
   * model/Ticket/AdviceComment.js:70 so the File rows chat produces are
   * indistinguishable from the ones the Advice feed produces - which is what
   * lets the frontend reuse PostMedia, mediaUtils and Lightbox unchanged.
   *
   * rec_status: '9' live, '1' also live, '2' soft-deleted.
   */
  ChatMessages.GetFiles = async function (Id) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: Id,
        LinkedObjectName: 'ChatMessages',
        rec_status: { [Op.in]: ['9', '1'] },
      },
      attributes: [
        'id_data',
        'id',
        'ext',
        'hash',
        'original_name',
        'generated_name',
        'linked_q',
        'linked_id_data',
        'size',
        'patient_id',
        'LinkedObjectName',
        'LinkedObjectId',
        'FieldName',
      ],
    });
    return Files;
  };
};

module.exports = ChatMessages;
