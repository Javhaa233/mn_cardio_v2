const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwInpatientDepsPatientsInfo extends Sequelize.Model {}

vwInpatientDepsPatientsInfo.init(
  {
    InpatientDepsPatientsId: { type: Sequelize.INTEGER, primaryKey: true },
    TotalDay: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwInpatientDepsPatientsInfo',
    modelName: 'vwInpatientDepsPatientsInfo',
    timestamps: false,
  }
);

module.exports = vwInpatientDepsPatientsInfo;
