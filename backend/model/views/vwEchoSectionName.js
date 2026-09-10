const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwEchoSectionName extends Sequelize.Model {}

vwEchoSectionName.init(
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
    tableName: 'vwEchoSectionName',
    modelName: 'vwEchoSectionName',
    timestamps: false,
  }
);

module.exports = vwEchoSectionName;
