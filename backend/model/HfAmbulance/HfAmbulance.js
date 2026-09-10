const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfAmbulance extends Sequelize.Model {}
HfAmbulance.init(
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

    diagnosed_year: { type: Sequelize.STRING },
    ambulance_date: { type: Sequelize.DATE },
    ambulance_type: { type: Sequelize.STRING },
    organization_id: { type: Sequelize.INTEGER },
    organization_other: { type: Sequelize.STRING },

    ad: { type: Sequelize.STRING },
    ad_deed: { type: Sequelize.INTEGER },
    ad_dood: { type: Sequelize.INTEGER },
    zts: { type: Sequelize.INTEGER },
    jin: { type: Sequelize.INTEGER },

    nyha: { type: Sequelize.STRING },

    heartache: { type: Sequelize.STRING },
    heartache_other: { type: Sequelize.STRING },

    hf_zahiin_shinj: { type: Sequelize.STRING },
    hf_zahiin_shinj_code: { type: Sequelize.STRING },
    hf_uushig_shinj: { type: Sequelize.STRING },
    hf_uushig_shinj_code: { type: Sequelize.STRING },
    hf_zurh_shinj: { type: Sequelize.STRING },
    hf_zurh_shinj_code: { type: Sequelize.STRING },
    hf_hevliin_shinj: { type: Sequelize.STRING },
    hf_hevliin_shinj_code: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfAmbulance',
    modelName: 'HfAmbulance',
    timestamps: false,
  }
);

HfAmbulance.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

HfAmbulance.SetAssocations = (Models) => {
  HfAmbulance.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  HfAmbulance.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  HfAmbulance.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  HfAmbulance.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  HfAmbulance.hasMany(Models.HfAmbulanceLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

HfAmbulance.SetFunctions = (Models) => {
  HfAmbulance.findAllNew = async function (Option) {
    const result = await HfAmbulance.findAll({
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
          include: [{ model: Models.vwGender, as: 'Gender' }],
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

  HfAmbulance.findAllDetail = async function (Option) {
    const result = await HfAmbulance.findAll({
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
          include: [{ model: Models.vwGender, as: 'Gender' }],
        },
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
        { model: Models.HfAmbulanceLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = HfAmbulance;
