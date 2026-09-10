const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PacemakerTblOne extends Sequelize.Model {}
PacemakerTblOne.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    pat_id_data: { type: Sequelize.STRING },
    stay_id_data: { type: Sequelize.STRING },
    user_mod: { type: Sequelize.STRING },
    date_created: { type: Sequelize.DATE },
    pat_history_id: { type: Sequelize.STRING },
    department: { type: Sequelize.STRING },
    diag_decision: { type: Sequelize.STRING },
    zuvlukh_emch: { type: Sequelize.STRING },
    emchlegch_emch: { type: Sequelize.STRING },
    emch: { type: Sequelize.STRING },
    risks: { type: Sequelize.STRING },
    diffs: { type: Sequelize.STRING },
    device_model: { type: Sequelize.STRING },
    prev_diagnosis: { type: Sequelize.STRING },
    planned_date: { type: Sequelize.DATE },
    operating_emch: { type: Sequelize.STRING },
    tuslakh_emch: { type: Sequelize.STRING },
    surgery_nurse: { type: Sequelize.STRING },
    engineer: { type: Sequelize.STRING },
    technician: { type: Sequelize.STRING },
    anasthesia_emch: { type: Sequelize.STRING },
    anasthesia_nurse: { type: Sequelize.STRING },
    InPatientId: { type: Sequelize.STRING },
    diagnostic_change: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PacemakerTblOne',
    modelName: 'PacemakerTblOne',
    timestamps: false,
  }
);

PacemakerTblOne.SearchField = [
  'Id',
  'pat_id_data',
  'stay_id_data',
  'user_mod',
  'date_created',
  'pat_history_id',
  'department',
  'diag_decision',
  'zuvlukh_emch',
  'emchlegch_emch',
  'emch',
  'risks',
  'device_model',
  'prev_diagnosis',
  'planned_date',
  'operating_emch',
  'tuslakh_emch',
  'surgery_nurse',
  'engineer',
  'technician',
  'anasthesia_emch',
  'anasthesia_nurse',
  'InPatientId',
];

PacemakerTblOne.SetAssocations = (Models) => {
  PacemakerTblOne.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'pat_id_data',
  });

  PacemakerTblOne.hasMany(Models.PacemakerTblOneLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  PacemakerTblOne.belongsTo(Models.Stay, {
    as: 'Stay',
    foreignKey: 'stay_id_data',
  });
};

PacemakerTblOne.SetFunctions = (Models) => {
  PacemakerTblOne.findAllNew = async function (Option) {
    const result = await PacemakerTblOne.findAll({
      ...Option,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: [
            'p_lastname',
            'p_firstname',
            'p_gender',
            'p_registration',
            'p_birthday',
            'id_data',
            'Age',
            'FullName',
          ],
        },
      ],
    });
    return result;
  };

  PacemakerTblOne.createNew = async function (Data, ReturnIdField) {
    await PacemakerTblOne.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [PacemakerTblOne] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  PacemakerTblOne.findAllDetail = async function (Option) {
    const result = await PacemakerTblOne.findAll({
      ...Option,
      include: [
        { model: Models.PacemakerTblOneLookUp, as: 'LookUpData' },
        { model: Models.Stay, as: 'Stay' },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
      ],
    });
    return result;
  };
};
module.exports = PacemakerTblOne;
