const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientOwnHistory extends Sequelize.Model {}
PatientOwnHistory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    PatRegNo: { type: Sequelize.STRING },
    BuurniiArhagUwchin: { type: Sequelize.STRING },
    Holestrin: { type: Sequelize.STRING },
    TsusniiSahar: { type: Sequelize.STRING },
    ZurkhShigdees: { type: Sequelize.STRING },
    TarkhiHarvalt: { type: Sequelize.STRING },
    Stenokardi: { type: Sequelize.STRING },
    TsusHomsroh: { type: Sequelize.STRING },
    ZahiinSudas: { type: Sequelize.STRING },
    GerbulNasbaralt: { type: Sequelize.STRING },
    TamkhiTatdag: { type: Sequelize.STRING },
    GerbulNasbaralt: { type: Sequelize.STRING },
    IsDaraltEm: { type: Sequelize.STRING },
    IsDiabeticEm: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientOwnHistory',
    modelName: 'PatientOwnHistory',
    timestamps: false,
  }
);

module.exports = PatientOwnHistory;
