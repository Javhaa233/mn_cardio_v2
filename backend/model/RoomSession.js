const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class RoomSession extends Sequelize.Model {}
RoomSession.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    date_leave: { type: Sequelize.DATE },
    room_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RoomSession',
    modelName: 'RoomSession',
    timestamps: false,
  }
);
RoomSession.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'date_leave',
  'room_id',
];

module.exports = RoomSession;
