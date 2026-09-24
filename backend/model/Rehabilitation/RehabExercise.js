const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// The exercise catalogue behind patient module 2.7 (the 39 instruction
// videos). Content rows are the customer's to seed; MediaRef stays a loose
// reference because the videos have no delivery path yet.
class RehabExercise extends Sequelize.Model {}
RehabExercise.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    Code: { type: Sequelize.STRING },
    Name: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
    CategoryCode: { type: Sequelize.STRING },
    DurationSec: { type: Sequelize.INTEGER },
    OrderNo: { type: Sequelize.INTEGER },
    MediaRef: { type: Sequelize.STRING },
    // Shown once before the exercise's first movement (add_rehab_movement_cues.sql).
    WarningText: { type: Sequelize.STRING },
    IsActive: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RehabExercise',
    modelName: 'RehabExercise',
    timestamps: false,
  }
);

module.exports = RehabExercise;
