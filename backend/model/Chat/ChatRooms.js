const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ChatRooms extends Sequelize.Model {}
ChatRooms.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    RoomName: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    // int in the database. The model used to say STRING, so every insert sent a
    // string parameter into an int column and relied on implicit conversion.
    CreateUserId: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.STRING },

    // 'DD' doctor<->doctor 1:1 | 'DP' doctor<->patient 1:1 | 'GR' group.
    //
    // This is what makes "you cannot add a third person to an existing
    // conversation" enforceable: doing so would retroactively hand them the
    // whole history, which for a DP room is a disclosure of clinical
    // conversation about a patient who never consented to it. Groups have to be
    // created as groups.
    RoomType: { type: Sequelize.STRING(2) },

    // Qualifies CreateUserId the same way ChatRoomTooUsers.UserType qualifies
    // UserId - see helper/ChatIdentity.js.
    CreateUserType: { type: Sequelize.STRING(1) },
  },
  {
    sequelize,
    tableName: 'ChatRooms',
    modelName: 'ChatRooms',
    timestamps: false,
  }
);

// Was ['AdviceId', 'Body'] - a copy-paste from an Advice model. Neither column
// exists on ChatRooms, and ModelHelper.GetFindOption feeds SearchField straight
// into a WHERE, so any SearchText against this model produced SQL referencing
// non-existent columns. It was latent only because no ModelConfig registered
// this model.
ChatRooms.SearchField = ['RoomName'];

ChatRooms.SetAssocations = (Models) => {
  ChatRooms.hasMany(Models.ChatRoomTooUsers, {
    as: 'ChatRoomTooUsers',
    foreignKey: 'ChatRoomId',
  });
};

module.exports = ChatRooms;
