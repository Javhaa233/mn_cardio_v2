const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class StayVisitTooStayVisitOrder extends Sequelize.Model {}
StayVisitTooStayVisitOrder.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    StayVisitId: { type: Sequelize.INTEGER },
    StayVisitOrderId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'StayVisitTooStayVisitOrder',
    modelName: 'StayVisitTooStayVisitOrder',
    timestamps: false,
  }
);
StayVisitTooStayVisitOrder.SearchField = [
  'id',
  'StayVisitId',
  'StayVisitOrderId',
  'ChildRecStatus',
];

module.exports = StayVisitTooStayVisitOrder;
