const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDDiagnosis extends Sequelize.Model {}
CVDDiagnosis.init(
  {
    Id: { type: Sequelize.INTEGER },

    MonitoringId: { type: Sequelize.INTEGER },
    MainDiagnosis: { type: Sequelize.TEXT },
    Comment: { type: Sequelize.TEXT },

    CreatedDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDDiagnosis',
    modelName: 'CVDDiagnosis',
    timestamps: false,
  }
);

module.exports = CVDDiagnosis;
