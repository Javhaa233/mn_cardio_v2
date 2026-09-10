const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class IcdTranslation extends Sequelize.Model {}
IcdTranslation.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    code: { type: Sequelize.STRING },
    eng: { type: Sequelize.STRING },
    mon: { type: Sequelize.STRING },
    rus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'IcdTranslation',
    modelName: 'IcdTranslation',
    timestamps: false,
  }
);
IcdTranslation.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'code',
  'eng',
  'mon',
  'rus',
];

module.exports = IcdTranslation;
