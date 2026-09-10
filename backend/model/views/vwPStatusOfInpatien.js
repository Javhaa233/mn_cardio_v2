const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwPStatusOfInpatien extends Sequelize.Model {}
vwPStatusOfInpatien.init(
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
    tableName: 'vwPStatusOfInpatien',
    modelName: 'vwPStatusOfInpatien',
    timestamps: false,
  }
);

vwPStatusOfInpatien.SearchField = ['id_dico', 'dico', 'label', 'value', 'pos', 'translate_flag'];

module.exports = vwPStatusOfInpatien;
