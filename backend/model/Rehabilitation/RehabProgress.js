const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// The patient marking an exercise complete (tracker #56).
class RehabProgress extends Sequelize.Model {}
RehabProgress.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    PatRegNo: { type: Sequelize.STRING },
    ExerciseId: { type: Sequelize.INTEGER },
    CompletedAt: { type: Sequelize.DATE },
    DurationSec: { type: Sequelize.INTEGER },
    Notes: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RehabProgress',
    modelName: 'RehabProgress',
    timestamps: false,
  }
);

module.exports = RehabProgress;
