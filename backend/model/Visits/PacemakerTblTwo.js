const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PacemakerTblTwo extends Sequelize.Model {}
PacemakerTblTwo.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_mod: { type: Sequelize.STRING },
    date_created: { type: Sequelize.DATE },
    tbl_one_id: { type: Sequelize.STRING },
    stay_id_data: { type: Sequelize.STRING },
    pat_id_data: { type: Sequelize.STRING },
    treatment_name: { type: Sequelize.STRING },
    treatment_result: { type: Sequelize.STRING },
    risks: { type: Sequelize.STRING },
    diffs: { type: Sequelize.STRING },
    possible_adds: { type: Sequelize.STRING },
    possible_other: { type: Sequelize.STRING },
    advantage: { type: Sequelize.STRING },
    anesthesia: { type: Sequelize.STRING },
    qfrom_pat: { type: Sequelize.STRING },
    afrom_pat: { type: Sequelize.STRING },
    doc_phone: { type: Sequelize.STRING },
    doc_name: { type: Sequelize.STRING },
    pat_name: { type: Sequelize.STRING },
    guardian_name: { type: Sequelize.STRING },
    guardian_rel: { type: Sequelize.STRING },
    outlawed_reason: { type: Sequelize.STRING },
    husband_name: { type: Sequelize.STRING },
    reject_reason: { type: Sequelize.STRING },
    print_date: { type: Sequelize.DATE },
    InPatientId: { type: Sequelize.STRING },
    otherOutlawedReason: { type: Sequelize.STRING },
    pat_history_id: { type: Sequelize.STRING },
    department: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PacemakerTblTwo',
    modelName: 'PacemakerTblTwo',
    timestamps: false,
  }
);

PacemakerTblTwo.SearchField = ['Id'];

PacemakerTblTwo.SetAssocations = (Models) => {
  PacemakerTblTwo.hasMany(Models.PacemakerTblTwoLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  PacemakerTblTwo.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'pat_id_data',
  });

  PacemakerTblTwo.belongsTo(Models.Stay, {
    as: 'Stay',
    foreignKey: 'stay_id_data',
  });

  PacemakerTblTwo.belongsTo(Models.PacemakerTblOne, {
    as: 'PacemakerOne',
    foreignKey: 'tbl_one_id',
  });
};

PacemakerTblTwo.SetFunctions = (Models) => {
  PacemakerTblTwo.createNew = async function (Data, ReturnIdField) {
    await PacemakerTblTwo.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [PacemakerTblTwo] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  PacemakerTblTwo.findAllNew = async function (Option) {
    const result = await PacemakerTblTwo.findAll({
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

  PacemakerTblTwo.findAllDetail = async function (Option) {
    const result = await PacemakerTblTwo.findAll({
      ...Option,
      include: [
        { model: Models.PacemakerTblTwoLookUp, as: 'LookUpData' },
        { model: Models.Stay, as: 'Stay' },
        { model: Models.PacemakerTblOne, as: 'PacemakerOne' },
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

  PacemakerTblTwo.GetLookUpData = async function (DataId) {
    const result = await Models.PacemakerTblTwoLookUp.findAll({
      where: { id_data: DataId },
    });
    return result;
  };
};
module.exports = PacemakerTblTwo;
