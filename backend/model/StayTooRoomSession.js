const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');
class StayTooRoomSession extends Sequelize.Model {}
StayTooRoomSession.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    StayId: { type: Sequelize.INTEGER },
    RoomSessionId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'StayTooRoomSession',
    modelName: 'StayTooRoomSession',
    timestamps: false,
  }
);
StayTooRoomSession.SearchField = ['id', 'StayId', 'RoomSessionId', 'ChildRecStatus'];

module.exports = StayTooRoomSession;
