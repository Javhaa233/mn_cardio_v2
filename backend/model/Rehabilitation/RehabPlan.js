const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// A programme assigned to a patient by a doctor.
class RehabPlan extends Sequelize.Model {}
RehabPlan.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatRegNo: { type: Sequelize.STRING },
    ProgramId: { type: Sequelize.INTEGER },
    // DATEONLY: a programme day is a calendar day, never shifted by a timezone.
    StartDate: { type: Sequelize.DATEONLY },
    IntensityPct: { type: Sequelize.DECIMAL(5, 2) },
    MaxHrOverride: { type: Sequelize.INTEGER },
    Status: { type: Sequelize.STRING },
    Notes: { type: Sequelize.STRING },
    EndedAt: { type: Sequelize.DATE },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  { sequelize, tableName: 'RehabPlan', modelName: 'RehabPlan', timestamps: false }
);

module.exports = RehabPlan;
