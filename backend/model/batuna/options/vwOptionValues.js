const Sequelize = require('sequelize');
const sequelize = require('../../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class vwOptionValues extends Sequelize.Model {}
vwOptionValues.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    label: { type: Sequelize.STRING },
    optionId: { type: Sequelize.INTEGER },
    optionName: { type: Sequelize.STRING },
    orderNum: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwOptionValues',
    modelName: 'vwOptionValues',
    timestamps: false,
  }
);

module.exports = vwOptionValues;
