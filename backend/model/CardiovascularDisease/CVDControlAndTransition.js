const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDControlAndTransition extends Sequelize.Model {}
CVDControlAndTransition.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    MonitoringId: { type: Sequelize.INTEGER },
    HynaltandOrson: { type: Sequelize.STRING },
    HynaltandOrsonTorol: { type: Sequelize.STRING },
    HynaltandDahihHugatsaa: { type: Sequelize.STRING },
    Lavlagaa: { type: Sequelize.STRING },
    HynaltiinUzleg: { type: Sequelize.STRING },
    HynaltaasGarsan: { type: Sequelize.STRING },
    Tamhi: { type: Sequelize.STRING },
    EmiinTorol: { type: Sequelize.STRING },
    EmiinNer: { type: Sequelize.STRING },
    Glucose: { type: Sequelize.STRING },
    CreatedDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDControlAndTransition',
    modelName: 'CVDControlAndTransition',
    timestamps: false,
  }
);

module.exports = CVDControlAndTransition;
