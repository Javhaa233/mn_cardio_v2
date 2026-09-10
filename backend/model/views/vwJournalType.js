const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwJournalType extends Sequelize.Model {}

vwJournalType.init(
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
    tableName: 'vwJournalType',
    modelName: 'vwJournalType',
    timestamps: false,
  }
);

module.exports = vwJournalType;
