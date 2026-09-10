const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ExaminationEchoTooExaminationEchoNotation extends Sequelize.Model {}

ExaminationEchoTooExaminationEchoNotation.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ExaminationEchoId: { type: Sequelize.INTEGER },
    ExaminationEchoNotationId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ExaminationEchoTooExaminationEchoNotation',
    modelName: 'ExaminationEchoTooExaminationEchoNotation',
    timestamps: false,
  }
);
ExaminationEchoTooExaminationEchoNotation.SearchField = [
  'id',
  'ExaminationEchoId',
  'ExaminationEchoNotationId',
  'ChildRecStatus',
];

module.exports = ExaminationEchoTooExaminationEchoNotation;
