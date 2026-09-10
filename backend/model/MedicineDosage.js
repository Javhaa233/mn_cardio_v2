const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class MedicineDosage extends Sequelize.Model {}
MedicineDosage.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    description: { type: Sequelize.STRING },
    form_id: { type: Sequelize.INTEGER },
    package: { type: Sequelize.INTEGER },
    unit: { type: Sequelize.STRING },
    value: { type: Sequelize.DECIMAL },
  },
  {
    sequelize,
    tableName: 'MedicineDosage',
    modelName: 'MedicineDosage',
    timestamps: false,
  }
);
MedicineDosage.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'description',
  'form_id',
  'package',
  'unit',
  'value',
];

module.exports = MedicineDosage;
