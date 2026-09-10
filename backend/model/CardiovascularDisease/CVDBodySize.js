const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDBodySize extends Sequelize.Model {}
CVDBodySize.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    MonitoringId: { type: Sequelize.INTEGER },
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
    tableName: 'CVDBodySize',
    modelName: 'CVDBodySize',
    timestamps: false,
  }
);

module.exports = CVDBodySize;
