const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientLogin extends Sequelize.Model {}
PatientLogin.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    expire_date: { type: Sequelize.DATE },
    last_access_date: { type: Sequelize.DATE },
    patient_id: { type: Sequelize.INTEGER },
    uid: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientLogin',
    modelName: 'PatientLogin',
    timestamps: false,
  }
);
PatientLogin.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'expire_date',
  'last_access_date',
  'patient_id',
  'uid',
];

module.exports = PatientLogin;
