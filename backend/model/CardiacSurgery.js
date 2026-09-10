const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CardiacSurgery extends Sequelize.Model {}
CardiacSurgery.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    date_operation: { type: Sequelize.DATE },
    number_anastomosis: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CardiacSurgery',
    modelName: 'CardiacSurgery',
    timestamps: false,
  }
);
CardiacSurgery.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'date_operation',
  'number_anastomosis',
];

module.exports = CardiacSurgery;
