const Sequelize = require('sequelize');
const sequelize = require('../../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Options extends Sequelize.Model {}
Options.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.TINYINT },
  },
  {
    sequelize,
    tableName: 'Options',
    modelName: 'Options',
    timestamps: false,
  }
);

module.exports = Options;
