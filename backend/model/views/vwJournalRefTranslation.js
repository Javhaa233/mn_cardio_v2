const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwJournalRefTranslation extends Sequelize.Model {}

vwJournalRefTranslation.init(
  {
    JournalRefId: { type: Sequelize.INTEGER, primaryKey: true },
    jr_label: { type: Sequelize.STRING },
    Eng: { type: Sequelize.STRING },
    Mon: { type: Sequelize.STRING },
    Rus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'vwJournalRefTranslation',
    modelName: 'vwJournalRefTranslation',
    timestamps: false,
  }
);

module.exports = vwJournalRefTranslation;
