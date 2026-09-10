const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class MedicineForm extends Sequelize.Model {}
MedicineForm.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    label: { type: Sequelize.STRING },
    medicine_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'MedicineForm',
    modelName: 'MedicineForm',
    timestamps: false,
  }
);
MedicineForm.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'label',
  'medicine_id',
];

module.exports = MedicineForm;
