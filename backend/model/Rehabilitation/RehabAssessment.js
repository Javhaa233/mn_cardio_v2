const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

// Risk and exercise-tolerance assessment (tracker #50). RiskLevel and
// ToleranceScore are free-form on purpose: the tender names no instrument and
// the methodology is a ЗСҮТ deliverable.
class RehabAssessment extends Sequelize.Model {}
RehabAssessment.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    PatRegNo: { type: Sequelize.STRING },
    AssessmentDate: { type: Sequelize.DATE },
    RiskLevel: { type: Sequelize.STRING },
    ToleranceScore: { type: Sequelize.FLOAT },
    ToleranceUnit: { type: Sequelize.STRING },
    Notes: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RehabAssessment',
    modelName: 'RehabAssessment',
    timestamps: false,
  }
);

module.exports = RehabAssessment;
