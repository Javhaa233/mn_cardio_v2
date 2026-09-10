const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

class ExaminationEchoNotation extends Sequelize.Model {}

ExaminationEchoNotation.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    section_name: { type: Sequelize.STRING },
    tags: { type: Sequelize.STRING },
    EchoId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'ExaminationEchoNotation',
    modelName: 'ExaminationEchoNotation',
    timestamps: false,
  }
);

ExaminationEchoNotation.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'comment',
  'section_name',
  'tags',
  'EchoId',
];

ExaminationEchoNotation.SetAssocations = (Models) => {
  ExaminationEchoNotation.belongsTo(Models.vwEchoSectionName, {
    as: 'vwEchoSectionName',
    foreignKey: 'section_name',
    targetKey: 'value',
  });

  ExaminationEchoNotation.belongsTo(Models.ExaminationEcho, {
    as: 'ExaminationEcho',
    foreignKey: 'EchoId',
  });

  ExaminationEchoNotation.hasMany(Models.ExaminationEchoNotationLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

ExaminationEchoNotation.SetFunctions = (Models) => {
  ExaminationEchoNotation.findAllNew = async function (Option) {
    const result = await ExaminationEchoNotation.findAll({
      ...Option,
      include: [
        { model: Models.vwEchoSectionName, as: 'vwEchoSectionName' },
        {
          model: Models.ExaminationEcho,
          as: 'ExaminationEcho',
          attributes: ['id_data', 'PatientId'],
        },
        // {
        //   model: Models.ExaminationEchoNotationLookUp,
        //   as: "LookUpData",
        //   include: [{ model: Models.vwEchoElementTag, as: "vwEchoElementTag" }],
        // },
      ],
    });
    return result;
  };

  ExaminationEchoNotation.findAllDetail = async function (Option) {
    const result = await ExaminationEchoNotation.findAll({
      ...Option,
      include: [
        { model: Models.vwEchoSectionName, as: 'vwEchoSectionName' },
        {
          model: Models.ExaminationEcho,
          as: 'ExaminationEcho',
          attributes: ['id_data', 'PatientId'],
        },
        {
          model: Models.ExaminationEchoNotationLookUp,
          as: 'LookUpData',
          include: [{ model: Models.vwEchoElementTag, as: 'vwEchoElementTag' }],
        },
      ],
    });
    return result;
  };

  ExaminationEchoNotation.createNew = async function (Data, ReturnIdField) {
    await ExaminationEchoNotation.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [ExaminationEchoNotation] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};
module.exports = ExaminationEchoNotation;
