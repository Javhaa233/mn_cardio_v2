const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class EchoExamination extends Sequelize.Model {}

EchoExamination.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    test: { type: Sequelize.STRING },
    var_text: { type: Sequelize.STRING },
    var_int: { type: Sequelize.INTEGER },
    var_foat: { type: Sequelize.DECIMAL },
    var_date: { type: Sequelize.DATE },
    var_text_mult: { type: Sequelize.STRING },
    var_dico: { type: Sequelize.STRING },
    var_dico_mult: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'EchoExamination',
    modelName: 'EchoExamination',
    timestamps: false,
  }
);
EchoExamination.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'test',
  'var_text',
  'var_int',
  'var_foat',
  'var_date',
  'var_text_mult',
  'var_dico',
  'var_dico_mult',
];

module.exports = EchoExamination;
