const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class JournalRef extends Sequelize.Model {}
JournalRef.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    jr_type: { type: Sequelize.STRING },
    jr_label: { type: Sequelize.STRING },
    jr_help: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'JournalRef',
    modelName: 'JournalRef',
    timestamps: false,
  }
);
JournalRef.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'jr_type',
  'jr_label',
  'jr_help',
];

JournalRef.SetAssocations = (Models) => {
  JournalRef.belongsTo(Models.vwJournalType, {
    as: 'JournalType',
    foreignKey: 'jr_type',
    targetKey: 'value',
  });

  JournalRef.belongsTo(Models.vwJournalRefTranslation, {
    as: 'JournalRefTranslation',
    foreignKey: 'id_data',
    targetKey: 'JournalRefId',
  });
};

JournalRef.SetFunctions = (Models) => {
  JournalRef.findAllNew = async function (Option) {
    const result = await JournalRef.findAll({
      ...Option,
      include: [
        {
          model: Models.vwJournalType,
          as: 'JournalType',
        },
        {
          model: Models.vwJournalRefTranslation,
          as: 'JournalRefTranslation',
        },
      ],
    });
    return result;
  };
};
module.exports = JournalRef;
