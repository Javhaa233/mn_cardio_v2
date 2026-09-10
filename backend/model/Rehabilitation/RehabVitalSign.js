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
