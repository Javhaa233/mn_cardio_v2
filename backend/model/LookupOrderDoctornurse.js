const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class LookupOrderDoctornurse extends Sequelize.Model {}
LookupOrderDoctornurse.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    id_doctornurse: { type: Sequelize.INTEGER },
    id_order_surgery: { type: Sequelize.INTEGER },
    priority: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'LookupOrderDoctornurse',
    modelName: 'LookupOrderDoctornurse',
    timestamps: false,
  }
);
LookupOrderDoctornurse.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'id_doctornurse',
  'id_order_surgery',
  'priority',
];

module.exports = LookupOrderDoctornurse;
