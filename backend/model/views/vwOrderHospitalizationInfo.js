const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwOrderHospitalizationInfo extends Sequelize.Model {}

vwOrderHospitalizationInfo.init(
  {
    OrderHospitalizationId: { type: Sequelize.INTEGER, primaryKey: true },
    WaitDay: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwOrderHospitalizationInfo',
    modelName: 'vwOrderHospitalizationInfo',
    timestamps: false,
  }
);

module.exports = vwOrderHospitalizationInfo;
