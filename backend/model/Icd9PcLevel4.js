const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Icd9PcLevel4 extends Sequelize.Model {}
Icd9PcLevel4.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    id_parent: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    name_mgl: { type: Sequelize.STRING },
    number: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Icd9PcLevel4',
    modelName: 'Icd9PcLevel4',
    timestamps: false,
  }
);
Icd9PcLevel4.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'id_parent',
  'name',
  'name_mgl',
  'number',
];

module.exports = Icd9PcLevel4;
