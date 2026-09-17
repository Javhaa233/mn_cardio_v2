const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// One workout the patient did, stopped or abandoned.
class RehabSession extends Sequelize.Model {}
RehabSession.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatRegNo: { type: Sequelize.STRING },
    PlanId: { type: Sequelize.INTEGER },
    DayNo: { type: Sequelize.INTEGER },
    StartedAt: { type: Sequelize.DATE },
    EndedAt: { type: Sequelize.DATE },
    RestingHr: { type: Sequelize.INTEGER },
    MaxHr: { type: Sequelize.INTEGER },
    TargetHr: { type: Sequelize.INTEGER },
    Status: { type: Sequelize.STRING },
    StopReason: { type: Sequelize.STRING },
    DurationSec: { type: Sequelize.INTEGER },
    CompletedBlocks: { type: Sequelize.INTEGER },
    SkippedMovements: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
  },
  { sequelize, tableName: 'RehabSession', modelName: 'RehabSession', timestamps: false }
);

module.exports = RehabSession;
