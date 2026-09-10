const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Surgerybackgroundimage extends Sequelize.Model {}
Surgerybackgroundimage.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    ext: { type: Sequelize.STRING },
    generated_name: { type: Sequelize.STRING },
    hash: { type: Sequelize.STRING },
    original_name: { type: Sequelize.STRING },
    patient_id: { type: Sequelize.INTEGER },
    size: { type: Sequelize.INTEGER },
    type: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Surgerybackgroundimage',
    modelName: 'Surgerybackgroundimage',
    timestamps: false,
  }
);
Surgerybackgroundimage.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'ext',
  'generated_name',
  'hash',
  'original_name',
  'patient_id',
  'size',
  'type',
];

module.exports = Surgerybackgroundimage;
