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
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [Journal] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await Journal.create(Data);

    return Created[ReturnIdField];
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
