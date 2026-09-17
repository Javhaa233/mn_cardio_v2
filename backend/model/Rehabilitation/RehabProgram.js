const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// One rehabilitation programme per disease group (scripts/add_rehab_program_tables.sql).
class RehabProgram extends Sequelize.Model {}
RehabProgram.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Code: { type: Sequelize.STRING },
    Name: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
    HasHrTarget: { type: Sequelize.BOOLEAN },
    DefaultIntensityPct: { type: Sequelize.DECIMAL(5, 2) },
    WarningTemplate: { type: Sequelize.STRING },
    OrderNo: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  { sequelize, tableName: 'RehabProgram', modelName: 'RehabProgram', timestamps: false }
);

module.exports = RehabProgram;
