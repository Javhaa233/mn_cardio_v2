const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwICD10 extends Sequelize.Model {}

vwICD10.init(
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
    tableName: 'vwICD10',
    modelName: 'vwICD10',
    timestamps: false,
  }
);

vwICD10.SearchField = ['id_dico', 'dico', 'label', 'value', 'pos', 'translate_flag'];

vwICD10.findAllNew = async function (Option) {
  const result = await vwICD10.findAll({
    ...Option,
    attributes: [
      [
        Sequelize.literal(
          `(SELECT TOP 1 mon FROM IcdTranslation t WHERE '*'+t.code+' '+t.eng=label)`
        ),
        'Mon',
      ],
      [
        Sequelize.literal(
          `(SELECT TOP 1 rus FROM IcdTranslation t WHERE '*'+t.code+' '+t.eng=label)`
        ),
        'Rus',
      ],
      'id_dico',
      'dico',
      'label',
      'value',
      'pos',
      'translate_flag',
    ],
    logging: (sql) => console.log({ sql }),
  });
  return result;
};

module.exports = vwICD10;
