const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class MedicineDosageExample extends Sequelize.Model {}
MedicineDosageExample.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    dosage_id: { type: Sequelize.INTEGER },
    value: { type: Sequelize.DECIMAL },
  },
  {
    sequelize,
    tableName: 'MedicineDosageExample',
    modelName: 'MedicineDosageExample',
    timestamps: false,
  }
);
MedicineDosageExample.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'dosage_id',
  'value',
];

module.exports = MedicineDosageExample;
