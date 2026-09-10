const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OrderSurgery extends Sequelize.Model {}
OrderSurgery.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    b_virus: { type: Sequelize.INTEGER },
    c_virus: { type: Sequelize.INTEGER },
    hiv_virus: { type: Sequelize.INTEGER },
    order_id: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    date_planned: { type: Sequelize.DATE },
    processed: { type: Sequelize.STRING },
    surgery_condition: { type: Sequelize.INTEGER },
    room: { type: Sequelize.INTEGER },
    priority: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'OrderSurgery',
    modelName: 'OrderSurgery',
    timestamps: false,
  }
);

OrderSurgery.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'b_virus',
  'c_virus',
  'hiv_virus',
  'order_id',
  'patient_id',
  'date_planned',
  'processed',
  'surgery_condition',
  'room',
  'priority',
];

module.exports = OrderSurgery;
