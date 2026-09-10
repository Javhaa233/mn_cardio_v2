const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class sysdiagrams extends Sequelize.Model {}
sysdiagrams.init(
  {
    name: { type: Sequelize.STRING },
    principal_id: { type: Sequelize.INTEGER },
    diagram_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    version: { type: Sequelize.INTEGER },
    definition: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'sysdiagrams',
    modelName: 'sysdiagrams',
    timestamps: false,
  }
);
sysdiagrams.SearchField = ['name', 'principal_id', 'diagram_id', 'version', 'definition'];

module.exports = sysdiagrams;
