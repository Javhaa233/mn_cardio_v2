const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ChatRoomTooUsers extends Sequelize.Model {}
ChatRoomTooUsers.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ChatRoomId: { type: Sequelize.INTEGER },

    // UserId is meaningless on its own - it is only an identity when paired
    // with UserType. See helper/ChatIdentity.js.
    //   'S' -> Users.Id
    //   'P' -> Patient.id_data   (NOT PatientUsers.Id)
    UserId: { type: Sequelize.INTEGER },
    UserType: { type: Sequelize.STRING(1) },

    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.STRING },

    // Unread high-water mark. ChatMessages.Id is an IDENTITY column, so
    // "Id > LastReadMessageId" is an exact, index-seekable definition of unread.
    // CreateDate would not be - it is written by the app at 1-second resolution
    // (ObjectHelper.getDateYMDHMS), not by the server clock, so it ties.
    //
    // Comparing the OTHER member's LastReadMessageId also gives 1:1 read
    // receipts without a receipt table.
    LastReadMessageId: { type: Sequelize.INTEGER },
    LastReadDate: { type: Sequelize.DATE },
    IsMuted: { type: Sequelize.BOOLEAN },
  },
  {
    sequelize,
    tableName: 'ChatRoomTooUsers',
    modelName: 'ChatRoomTooUsers',
    timestamps: false,
  }
);

ChatRoomTooUsers.SearchField = ['ChatRoomId', 'UserId'];

// DELIBERATELY NO ASSOCIATIONS AND NO findAllNew.
//
// This model used to declare three belongsTo against the same bare integer:
//
//     belongsTo(Users,          { foreignKey: 'UserId', targetKey: 'Id' })
//     belongsTo(DoctorsProfile, { foreignKey: 'UserId', targetKey: 'UserId' })
//     belongsTo(Patient,        { foreignKey: 'UserId', targetKey: 'user_id' })
//
// and findAllNew eager-loaded all three at once, leaving the caller to pick
// whichever came back non-null. That IS the identity collision helper/Auth.js
// warns about: Users.Id and PatientUsers.Id are both IDENTITY columns starting
// at 1, so staff #5 and patient #5 both matched, and the winner was whichever
// branch the caller tested first.
//
// Sequelize cannot fix this in an association. A scope applies to the TARGET
// model's WHERE and cannot reference the source row's UserType, and a
// polymorphic include with constraints:false still joins on `UserId = Id`
// alone - there is no supported way to add `AND source.UserType = 'S'` to an
// association's ON clause in Sequelize 6.
//
// So participant names are resolved explicitly, in batches, by
// helper/ChatIdentity.ResolveMany - three queries regardless of how many
// participants are involved.

module.exports = ChatRoomTooUsers;
