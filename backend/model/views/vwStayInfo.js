const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwStayInfo extends Sequelize.Model {}
vwStayInfo.init(
  {
    StayId: { type: Sequelize.INTEGER, primaryKey: true },
    TotalDay: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwStayInfo',
    modelName: 'vwStayInfo',
    timestamps: false,
  }
);

module.exports = vwStayInfo;
