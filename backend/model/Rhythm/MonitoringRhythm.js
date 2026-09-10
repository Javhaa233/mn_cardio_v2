const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class MonitoringRhythm extends Sequelize.Model {}

MonitoringRhythm.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    is_confirm: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
    UpdatedDate: { type: Sequelize.DATE },
    ConfirmUserId: { type: Sequelize.INTEGER },
    ConfirmedDate: { type: Sequelize.DATE },

    // II. Эмнэлэгт хэвтэх үеийн бүртгэл
    organization_id: { type: Sequelize.INTEGER },
    organization_other: { type: Sequelize.STRING },
    suulgasan_ognoo: { type: Sequelize.STRING },
    hevtsen_ognoo: { type: Sequelize.STRING },
    garsan_ognoo: { type: Sequelize.STRING },
    code: { type: Sequelize.STRING },

    // III.Хяналтын бүртгэл
    hyanalt: { type: Sequelize.INTEGER },
    hyanalt_type: { type: Sequelize.INTEGER },
    hyanalt_arga: { type: Sequelize.INTEGER },
    hyanalt_arga_other: { type: Sequelize.STRING },
    is_hugatsaa: { type: Sequelize.STRING },
    y_hugatsaa: { type: Sequelize.STRING },
    n_hugatsaa: { type: Sequelize.INTEGER },
    n_hugatsaa_other: { type: Sequelize.STRING },
    baidal: { type: Sequelize.INTEGER },
    idevhi_baidal: { type: Sequelize.INTEGER },
    nyha: { type: Sequelize.INTEGER },
    hyanalt_baidal: { type: Sequelize.INTEGER },
    orhison_shaltgaan: { type: Sequelize.INTEGER },
    orhison_shaltgaan_other: { type: Sequelize.STRING },

    // IV. Нас баралтын бүртгэл
    nas_baralt_shaltgaan: { type: Sequelize.INTEGER },
    nas_baralt_shaltgaan_other: { type: Sequelize.STRING },
    is_hevtelt: { type: Sequelize.STRING },
    nas_barsan_ognoo: { type: Sequelize.STRING },
    is_zadlan: { type: Sequelize.STRING },

    // V. Эмнэлзүйн байдал ( одоогийн байдал )
    is_dahilt: { type: Sequelize.STRING },
    if_shinj_turul: { type: Sequelize.INTEGER },
    shinj_turul_other: { type: Sequelize.STRING },
    hovdliin_horig: { type: Sequelize.INTEGER },
    is_uurchlult: { type: Sequelize.STRING },
    if_uurchlult_hemnel: { type: Sequelize.INTEGER },
    uurchlult_hemnel_other: { type: Sequelize.STRING },

    // VI. Үр дүнгийн байдал
    is_emiin_hyanalt: { type: Sequelize.STRING },
    if_yamar_em: { type: Sequelize.INTEGER },
    em_other: { type: Sequelize.STRING },
    is_ablation_dahilt: { type: Sequelize.STRING },
    if_ablation_dahilt: { type: Sequelize.INTEGER },
    is_bainga_pm: { type: Sequelize.STRING },
    if_pm: { type: Sequelize.INTEGER },
    pm_other: { type: Sequelize.STRING },
    is_icd: { type: Sequelize.STRING },
    if_icd: { type: Sequelize.INTEGER },
    icd_other: { type: Sequelize.STRING },
    m_notes: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'MonitoringRhythm',
    modelName: 'MonitoringRhythm',
    timestamps: false,
  }
);

MonitoringRhythm.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

MonitoringRhythm.SetAssocations = (Models) => {
  MonitoringRhythm.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  MonitoringRhythm.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  MonitoringRhythm.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  MonitoringRhythm.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  MonitoringRhythm.hasMany(Models.MonitoringRhythmLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

MonitoringRhythm.SetFunctions = (Models) => {
  MonitoringRhythm.findAllNew = async function (Option) {
    const result = await MonitoringRhythm.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
      ],
    });
    return result;
  };

  MonitoringRhythm.findAllDetail = async function (Option) {
    const result = await MonitoringRhythm.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
        { model: Models.MonitoringRhythmLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = MonitoringRhythm;
