const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Substance extends Sequelize.Model {}
Substance.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    daily_max_value: { type: Sequelize.DECIMAL },
    name: { type: Sequelize.STRING },
    unit: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Substance',
    modelName: 'Substance',
    timestamps: false,
  }
);
Substance.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'daily_max_value',
  'name',
  'unit',
];

module.exports = Substance;
