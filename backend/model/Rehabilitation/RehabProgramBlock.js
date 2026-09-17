const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// An ordered part of a programme day: video, timed, vitals or image.
class RehabProgramBlock extends Sequelize.Model {}
RehabProgramBlock.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ProgramId: { type: Sequelize.INTEGER },
    OrderNo: { type: Sequelize.INTEGER },
    Title: { type: Sequelize.STRING },
    Kind: { type: Sequelize.STRING },
    ExerciseId: { type: Sequelize.INTEGER },
    DurationSec: { type: Sequelize.INTEGER },
    DurationSteps: { type: Sequelize.STRING },
    ShowFromDay: { type: Sequelize.INTEGER },
    CheckInEverySec: { type: Sequelize.INTEGER },
    GuideText: { type: Sequelize.STRING },
    ThumbRef: { type: Sequelize.STRING },
    IsActive: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  { sequelize, tableName: 'RehabProgramBlock', modelName: 'RehabProgramBlock', timestamps: false }
);

module.exports = RehabProgramBlock;
