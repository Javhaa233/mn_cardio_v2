const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Journal extends Sequelize.Model {}
Journal.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    j_begin_vid: { type: Sequelize.INTEGER },
    j_end_vid: { type: Sequelize.INTEGER },
    j_begin_date: { type: Sequelize.DATE },
    j_end_date: { type: Sequelize.DATE },
    j_ref: { type: Sequelize.INTEGER },
    j_label: { type: Sequelize.STRING },

    PatientId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Journal',
    modelName: 'Journal',
    timestamps: false,
  }
);

Journal.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'j_begin_vid',
  'j_end_vid',
  'j_begin_date',
  'j_end_date',
  'j_ref',
  'j_label',
];

Journal.SetAssocations = (Models) => {
  Journal.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  Journal.belongsTo(Models.JournalRef, {
    as: 'JournalRef',
    foreignKey: 'j_ref',
    targetKey: 'id_data',
  });

  Journal.belongsTo(Models.vwJournalRefTranslation, {
    as: 'JournalRefTranslation',
    foreignKey: 'id_data',
    targetKey: 'JournalRefId',
  });
};

Journal.SetFunctions = (Models) => {
  Journal.createNew = async function (Data, ReturnIdField) {
    await Journal.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [Journal] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  Journal.GetJournalData = async (PatientId, VisitId, VisitDate) => {
    var Result = await Journal.findAll({
      attributes: [
        'id_data',
        'id',
        'id_group',
        'date_creation',
        'user_mod',
        'date_modif',
        'rec_status',
        'j_begin_vid',
        'j_end_vid',
        'j_begin_date',
        'j_end_date',
        'j_ref',
        'j_label',
        'PatientId',
        [Sequelize.literal(`CASE WHEN j_end_vid=` + VisitId + ` THEN 1 ELSE 0 END `), 'IsDelete'],
        [Sequelize.literal(`CASE WHEN j_begin_vid=` + VisitId + ` THEN 1 ELSE 0 END `), 'IsNew'],
      ],
      where: {
        j_begin_date: { [Op.lte]: VisitDate },
        PatientId,
        [Op.or]: [
          { j_end_vid: VisitId },
          { j_end_vid: { [Op.is]: null } },
          { j_begin_vid: VisitId },
        ],
      },
      include: [
        {
          model: Models.JournalRef,
          as: 'JournalRef',
          attributes: ['jr_label', 'jr_type'],
          include: [
            {
              model: Models.vwJournalType,
              as: 'JournalType',
              attributes: ['dico', 'label', 'value'],
            },
            {
              model: Models.vwJournalRefTranslation,
              as: 'JournalRefTranslation',
            },
          ],
        },
      ],
    });
    return Result;
  };

  Journal.GetRealJournalData = async (PatientId) => {
    var Result = [];
    Result = await Journal.findAll({
      where: {
        PatientId,
        [Op.or]: [{ j_end_vid: { [Op.is]: null } }],
      },
      include: [
        {
          model: Models.JournalRef,
          as: 'JournalRef',
          include: [
            {
              model: Models.vwJournalType,
              as: 'JournalType',
              attributes: ['dico', 'label', 'value'],
            },
            {
              model: Models.vwJournalRefTranslation,
              as: 'JournalRefTranslation',
            },
          ],
        },
      ],
    });
    return Result;
  };

  Journal.GetRealJournalDataForPatients = async (PatientIds) => {
    if (!PatientIds || PatientIds.length === 0) return [];
    return await Journal.findAll({
      where: {
        PatientId: { [Op.in]: PatientIds },
        [Op.or]: [{ j_end_vid: { [Op.is]: null } }],
      },
      include: [
        {
          model: Models.JournalRef,
          as: 'JournalRef',
          include: [
            {
              model: Models.vwJournalType,
              as: 'JournalType',
              attributes: ['dico', 'label', 'value'],
            },
            {
              model: Models.vwJournalRefTranslation,
              as: 'JournalRefTranslation',
            },
          ],
        },
      ],
    });
  };
};
module.exports = Journal;
