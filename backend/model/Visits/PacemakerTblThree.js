const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PacemakerTblThree extends Sequelize.Model {}
PacemakerTblThree.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    pat_id_data: { type: Sequelize.STRING },
    stay_id_data: { type: Sequelize.STRING },
    user_mod: { type: Sequelize.STRING },
    date_created: { type: Sequelize.DATE },
    tbl_two_id: { type: Sequelize.STRING },
    treatment_name: { type: Sequelize.STRING },
    clinical_diagnosis: { type: Sequelize.STRING },
    started_date: { type: Sequelize.DATE },
    started_hour: { type: Sequelize.STRING },
    started_min: { type: Sequelize.STRING },
    dur_hour: { type: Sequelize.STRING },
    dur_min: { type: Sequelize.STRING },
    scriptum: { type: Sequelize.STRING },
    xray_dose: { type: Sequelize.STRING },
    xray_time: { type: Sequelize.STRING },
    pm_model: { type: Sequelize.STRING },
    pm_serial: { type: Sequelize.STRING },
    pm_pos: { type: Sequelize.STRING },
    bt_model: { type: Sequelize.STRING },
    bt_serial: { type: Sequelize.STRING },
    bt_pos: { type: Sequelize.STRING },
    bt_sens: { type: Sequelize.STRING },
    bt_pow: { type: Sequelize.STRING },
    bt_res: { type: Sequelize.STRING },
    bh_model: { type: Sequelize.STRING },
    bh_serial: { type: Sequelize.STRING },
    bh_pos: { type: Sequelize.STRING },
    bh_sens: { type: Sequelize.STRING },
    bh_pow: { type: Sequelize.STRING },
    bh_res: { type: Sequelize.STRING },
    biopsy_and_other: { type: Sequelize.STRING },
    about_wound: { type: Sequelize.STRING },
    after_diagnosis: { type: Sequelize.STRING },
    anes_type: { type: Sequelize.STRING },
    pm_cond: { type: Sequelize.STRING },
    wire_fix: { type: Sequelize.STRING },
    wire_under: { type: Sequelize.STRING },
    wire_skin: { type: Sequelize.STRING },
    ab_before: { type: Sequelize.STRING },
    ab_during: { type: Sequelize.STRING },
    ab_after: { type: Sequelize.STRING },
    operating_emch: { type: Sequelize.STRING },
    support_emch: { type: Sequelize.STRING },
    surg_nurse: { type: Sequelize.STRING },
    engineer: { type: Sequelize.STRING },
    technician: { type: Sequelize.STRING },
    anes_emch: { type: Sequelize.STRING },
    anes_nurse: { type: Sequelize.STRING },
    emch: { type: Sequelize.STRING },
    InPatientId: { type: Sequelize.INTEGER },
    pat_history_id: { type: Sequelize.STRING },
    department: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PacemakerTblThree',
    modelName: 'PacemakerTblThree',
    timestamps: false,
  }
);

PacemakerTblThree.SearchField = ['Id'];

PacemakerTblThree.SetAssocations = (Models) => {
  PacemakerTblThree.hasMany(Models.PacemakerTblThreeLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
  PacemakerTblThree.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'pat_id_data',
  });

  PacemakerTblThree.belongsTo(Models.Stay, {
    as: 'Stay',
    foreignKey: 'stay_id_data',
  });

  PacemakerTblThree.belongsTo(Models.PacemakerTblTwo, {
    as: 'PacemakerTwo',
    foreignKey: 'tbl_two_id',
  });
};

PacemakerTblThree.SetFunctions = (Models) => {
  PacemakerTblThree.findAllNew = async function (Option) {
    const result = await PacemakerTblThree.findAll({ ...Option });
    return result;
  };

  PacemakerTblThree.createNew = async function (Data, ReturnIdField) {
    await PacemakerTblThree.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [PacemakerTblThree] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  PacemakerTblThree.findAllDetail = async function (Option) {
    const result = await PacemakerTblThree.findAll({
      ...Option,
      include: [
        { model: Models.PacemakerTblThreeLookUp, as: 'LookUpData' },
        { model: Models.Stay, as: 'Stay' },
        { model: Models.PacemakerTblTwo, as: 'PacemakerTwo' },
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

  PacemakerTblThree.GetLookUpData = async function (DataId) {
    const result = await Models.PacemakerTblThreeLookUp.findAll({
      where: { id_data: DataId },
    });
    return result;
  };
};
module.exports = PacemakerTblThree;
