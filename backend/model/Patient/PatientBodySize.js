const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientBodySize extends Sequelize.Model {}
PatientBodySize.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    PatRegNo: { type: Sequelize.STRING },
    Height: { type: Sequelize.STRING },
    Weigth: { type: Sequelize.STRING },
    Buselkhii: { type: Sequelize.STRING },
    BJI: { type: Sequelize.FLOAT },
    Tailbar: { type: Sequelize.STRING },
    HeartRate: { type: Sequelize.STRING },
    RespiratoryRate: { type: Sequelize.STRING },
    Temperature: { type: Sequelize.STRING },
    Saturatsi: { type: Sequelize.STRING },
    Sahar: { type: Sequelize.STRING },
    Cholesterol: { type: Sequelize.STRING },
    DaraltDeed: { type: Sequelize.STRING },
    DaraltDood: { type: Sequelize.STRING },
    UlunGlucose: { type: Sequelize.STRING },
    SanamsarguiGlucose: { type: Sequelize.STRING },
    CreatedDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientBodySize',
    modelName: 'PatientBodySize',
    timestamps: false,
  }
);

module.exports = PatientBodySize;
