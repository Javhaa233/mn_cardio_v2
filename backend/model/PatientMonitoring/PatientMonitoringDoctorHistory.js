const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientMonitoringDoctorHistory extends Sequelize.Model {}

PatientMonitoringDoctorHistory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DoctorId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
    Date: { type: Sequelize.DATE },
    IsStart: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientMonitoringDoctorHistory',
    modelName: 'PatientMonitoringDoctorHistory',
    timestamps: false,
  }
);

PatientMonitoringDoctorHistory.SetAssocations = (Models) => {
  PatientMonitoringDoctorHistory.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });

  PatientMonitoringDoctorHistory.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });
};

PatientMonitoringDoctorHistory.SearchField = ['Id', 'DoctorId', 'UserId', 'PatientId', 'Date'];

module.exports = PatientMonitoringDoctorHistory;
