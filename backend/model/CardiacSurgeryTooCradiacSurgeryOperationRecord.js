const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CardiacSurgeryTooCradiacSurgeryOperationRecord extends Sequelize.Model {}
CardiacSurgeryTooCradiacSurgeryOperationRecord.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    CardiacSurgeryId: { type: Sequelize.INTEGER },
    CradiacSurgeryOperationRecordId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'CardiacSurgeryTooCradiacSurgeryOperationRecord',
    modelName: 'CardiacSurgeryTooCradiacSurgeryOperationRecord',
    timestamps: false,
  }
);
CardiacSurgeryTooCradiacSurgeryOperationRecord.SearchField = [
  'id',
  'CardiacSurgeryId',
  'CradiacSurgeryOperationRecordId',
  'ChildRecStatus',
];

module.exports = CardiacSurgeryTooCradiacSurgeryOperationRecord;
