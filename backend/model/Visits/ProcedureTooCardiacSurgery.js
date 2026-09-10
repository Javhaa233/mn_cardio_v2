const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ProcedureTooCardiacSurgery extends Sequelize.Model {}
ProcedureTooCardiacSurgery.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ProcedureId: { type: Sequelize.INTEGER },
    CardiacSurgeryId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ProcedureTooCardiacSurgery',
    modelName: 'ProcedureTooCardiacSurgery',
    timestamps: false,
  }
);

ProcedureTooCardiacSurgery.SearchField = [
  'id',
  'ProcedureId',
  'CardiacSurgeryId',
  'ChildRecStatus',
];

module.exports = ProcedureTooCardiacSurgery;
