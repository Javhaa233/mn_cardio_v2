const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDManagement extends Sequelize.Model {}
CVDManagement.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    MonitoringId: { type: Sequelize.INTEGER },
    DiagnosedArterHypertension: { type: Sequelize.STRING },
    DiagnosedDiabetes: { type: Sequelize.STRING },
    PreventiveTreatment: { type: Sequelize.STRING },
    IsSentLavlagaa: { type: Sequelize.STRING },
    IsAdviceFromLavlagaa: { type: Sequelize.STRING },
    FutureAdvice: { type: Sequelize.TEXT },
    CreatedDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDManagement',
    modelName: 'CVDManagement',
    timestamps: false,
  }
);

module.exports = CVDManagement;
