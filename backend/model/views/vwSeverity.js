const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwSeverity extends Sequelize.Model {}
vwSeverity.init(
  {
    id_dico: { type: Sequelize.INTEGER, primaryKey: true },
    dico: { type: Sequelize.STRING },
    label: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING },
    pos: { type: Sequelize.INTEGER },
    translate_flag: { type: Sequelize.SMALLINT },
  },
  {
    sequelize,
    tableName: 'vwSeverity',
    modelName: 'vwSeverity',
    timestamps: false,
  }
);

vwSeverity.SearchField = ['id_dico', 'dico', 'label', 'value', 'pos', 'translate_flag'];

module.exports = vwSeverity;
