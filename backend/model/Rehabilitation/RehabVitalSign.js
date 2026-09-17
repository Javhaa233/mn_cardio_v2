const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// Vital signs recorded around an exercise session (tracker #51), distinct
// from PatientMonitoring, which is the patient's own daily log.
class RehabVitalSign extends Sequelize.Model {}
RehabVitalSign.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    PatRegNo: { type: Sequelize.STRING },
    ExerciseId: { type: Sequelize.INTEGER },
    MeasuredAt: { type: Sequelize.DATE },
    Phase: { type: Sequelize.STRING },
    Pulse: { type: Sequelize.INTEGER },
    BloodPressure: { type: Sequelize.STRING },
    Spo2: { type: Sequelize.INTEGER },
    Borg: { type: Sequelize.INTEGER },
    // '6-20' or 'CR10'. NULL on rows from before the player: those were 6-20.
    BorgScale: { type: Sequelize.STRING },
    SessionId: { type: Sequelize.INTEGER },
    AtSec: { type: Sequelize.INTEGER },
    Notes: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RehabVitalSign',
    modelName: 'RehabVitalSign',
    timestamps: false,
  }
);

module.exports = RehabVitalSign;
