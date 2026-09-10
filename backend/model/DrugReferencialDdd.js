const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

// const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DrugReferencialDdd extends Sequelize.Model {}
DrugReferencialDdd.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    admcode: { type: Sequelize.STRING },
    atc_code: { type: Sequelize.STRING },
    comment: { type: Sequelize.STRING },
    ddd: { type: Sequelize.DECIMAL },
    unit: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'DrugReferencialDdd',
    modelName: 'DrugReferencialDdd',
    timestamps: false,
  }
);
DrugReferencialDdd.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'admcode',
  'atc_code',
  'comment',
  'ddd',
  'unit',
];

module.exports = DrugReferencialDdd;
