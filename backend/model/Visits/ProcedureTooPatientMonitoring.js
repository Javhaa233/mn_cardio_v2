const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ProcedureTooPatientMonitoring extends Sequelize.Model {}
ProcedureTooPatientMonitoring.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    ProcedureId: { type: Sequelize.INTEGER },
    PatientMonitoringId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ProcedureTooPatientMonitoring',
    modelName: 'ProcedureTooPatientMonitoring',
    timestamps: false,
  }
);

ProcedureTooPatientMonitoring.SearchField = [
  'id',
  'ProcedureId',
  'PatientMonitoringId',
  'ChildRecStatus',
];

module.exports = ProcedureTooPatientMonitoring;
