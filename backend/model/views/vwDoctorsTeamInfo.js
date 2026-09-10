const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwDoctorsTeamInfo extends Sequelize.Model {}

vwDoctorsTeamInfo.init(
  {
    DoctorTeamId: { type: Sequelize.INTEGER, primaryKey: true },
    DoctorCount: { type: Sequelize.INTEGER },
    PatientCount: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwDoctorsTeamInfo',
    modelName: 'vwDoctorsTeamInfo',
    timestamps: false,
  }
);

module.exports = vwDoctorsTeamInfo;
