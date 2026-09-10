const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfStay extends Sequelize.Model {}
HfStay.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    StayId: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    StartedDate: { type: Sequelize.DATE },
    DiagnosedDate: { type: Sequelize.DATE },
    DurationOfHf: { type: Sequelize.STRING },
    StayReason: { type: Sequelize.STRING },
    OutDate: { type: Sequelize.DATE },
    OutCondition: { type: Sequelize.STRING },
    IsGuardianGivenInfo: { type: Sequelize.STRING },
    MonitoringLevel: { type: Sequelize.STRING },
    IsMonitoringAmbulatory: { type: Sequelize.STRING },
    IsGivenInfo: { type: Sequelize.STRING },
    IsFamilyGivenInfo: { type: Sequelize.STRING },
    IsGivenDestinyInfo: { type: Sequelize.STRING },
    IsNeededPalliative: { type: Sequelize.STRING },
    PalliativeType: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfStay',
    modelName: 'HfStay',
    timestamps: false,
  }
);

HfStay.SearchField = [
  'Id',
  'PatientId',
  'StayId',
  'CreateUserId',
  'CreatedDate',
  'StartedDate',
  'DiagnosedDate',
  'StayReason',
  'DurationOfHf',
  'OutDate',
  'OutCondition',
  'IsGuardianGivenInfo',
  'MonitoringLevel',
  'IsMonitoringAmbulatory',
  'IsGivenInfo',
  'IsFamilyGivenInfo',
  'IsGivenDestinyInfo',
  'IsNeededPalliative',
  'PalliativeType',
];

HfStay.SetAssocations = (Models) => {
  HfStay.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });
  HfStay.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  HfStay.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  HfStay.belongsTo(Models.HfLifeStory, {
    as: 'HfLifeStory',
    foreignKey: 'Id',
    targetKey: 'HfStayId',
  });

  HfStay.belongsTo(Models.HfLabTreatment, {
    as: 'HfLabTreatment',
    foreignKey: 'Id',
    targetKey: 'HfStayId',
  });

  HfStay.belongsTo(Models.HfTreatmentDischarge, {
    as: 'HfTreatmentDischarge',
    foreignKey: 'Id',
    targetKey: 'HfStayId',
  });
};

HfStay.SetFunctions = (Models) => {
  HfStay.findAllNew = async function (Option) {
    const result = await HfStay.findAll({
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
      ],
    });
    return result;
  };
};

module.exports = HfStay;
