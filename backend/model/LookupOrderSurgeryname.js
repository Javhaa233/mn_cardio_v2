const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class LookupOrderSurgeryname extends Sequelize.Model {}
LookupOrderSurgeryname.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    id_order_surgery: { type: Sequelize.INTEGER },
    id_icd9: { type: Sequelize.INTEGER },
    icd9_level: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'LookupOrderSurgeryname',
    modelName: 'LookupOrderSurgeryname',
    timestamps: false,
  }
);
LookupOrderSurgeryname.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'id_order_surgery',
  'id_icd9',
  'icd9_level',
];

module.exports = LookupOrderSurgeryname;
