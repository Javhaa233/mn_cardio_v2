const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

class Backup extends Sequelize.Model {}
Backup.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Status: { type: Sequelize.STRING },
    FileName: { type: Sequelize.STRING },
    ExpiredDate: { type: Sequelize.DATE },
    CreatedDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'Backup',
    modelName: 'Backup',
    timestamps: false,
  }
);

module.exports = Backup;
