const Sequelize = require('sequelize');
const sequelize = require('../../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OptionValues extends Sequelize.Model {}
OptionValues.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    label: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'OptionValues',
    modelName: 'OptionValues',
    timestamps: false,
  }
);

module.exports = OptionValues;
