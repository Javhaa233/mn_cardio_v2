const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HospitalSumKhoroo extends Sequelize.Model {}

HospitalSumKhoroo.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    hospitalid: { type: Sequelize.INTEGER },
    khorooid: { type: Sequelize.INTEGER },
    soumid: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'HospitalSumKhoroo',
    modelName: 'HospitalSumKhoroo',
    timestamps: false,
  }
);
HospitalSumKhoroo.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'hospitalid',
  'khorooid',
  'soumid',
];

module.exports = HospitalSumKhoroo;
