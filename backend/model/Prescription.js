const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Prescription extends Sequelize.Model {}
Prescription.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    duration: { type: Sequelize.INTEGER },
    times: { type: Sequelize.STRING },
    mode: { type: Sequelize.STRING },
    id_origin: { type: Sequelize.INTEGER },
    start_date: { type: Sequelize.DATE },
    status: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Prescription',
    modelName: 'Prescription',
    timestamps: false,
  }
);
Prescription.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'comment',
  'duration',
  'times',
  'mode',
  'id_origin',
  'start_date',
  'status',
];

module.exports = Prescription;
