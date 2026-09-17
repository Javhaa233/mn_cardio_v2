const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// One looping clip inside an exercise. An exercise is a playlist of these.
class RehabMovement extends Sequelize.Model {}
RehabMovement.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ExerciseId: { type: Sequelize.INTEGER },
    OrderNo: { type: Sequelize.INTEGER },
    Name: { type: Sequelize.STRING },
    GuideText: { type: Sequelize.STRING },
    MediaRef: { type: Sequelize.STRING },
    ThumbRef: { type: Sequelize.STRING },
    WorkSec: { type: Sequelize.INTEGER },
    Reps: { type: Sequelize.INTEGER },
    PrepSec: { type: Sequelize.INTEGER },
    RestSec: { type: Sequelize.INTEGER },
    LoopStartMs: { type: Sequelize.INTEGER },
    LoopEndMs: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  { sequelize, tableName: 'RehabMovement', modelName: 'RehabMovement', timestamps: false }
);

module.exports = RehabMovement;
