const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class LaboratoryTest extends Sequelize.Model {}

LaboratoryTest.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    LaboratoryTestDate: { type: Sequelize.DATE },
    complaint: { type: Sequelize.STRING },
    disorders: { type: Sequelize.STRING },
    regular_medication: { type: Sequelize.STRING },
    diagnosis: { type: Sequelize.STRING },
    blood_test_date: { type: Sequelize.DATE },
    wbc: { type: Sequelize.STRING },
    rbc: { type: Sequelize.STRING },
    hb: { type: Sequelize.STRING },
    hct: { type: Sequelize.STRING },
    platelet: { type: Sequelize.STRING },
    coe: { type: Sequelize.STRING },
    euro_score_2: { type: Sequelize.STRING },
    logistic_euroscore: { type: Sequelize.STRING },
    sts: { type: Sequelize.STRING },
    nyha: { type: Sequelize.STRING },
    liver_test_date: { type: Sequelize.DATE },
    total_proteoin: { type: Sequelize.STRING },
    albumin: { type: Sequelize.STRING },
    asat: { type: Sequelize.STRING },
    alat: { type: Sequelize.STRING },
    total_bilirubin: { type: Sequelize.STRING },
    ggt: { type: Sequelize.STRING },
    glucose: { type: Sequelize.STRING },
    kidney_test_date: { type: Sequelize.DATE },
    mochevin: { type: Sequelize.STRING },
    creatinine: { type: Sequelize.STRING },
    hbs_ag: { type: Sequelize.STRING },
    hcv: { type: Sequelize.STRING },
    syphilis: { type: Sequelize.STRING },
    hiv: { type: Sequelize.STRING },
    tsusnii_bulegnelt_date: { type: Sequelize.DATE },
    pt: { type: Sequelize.STRING },
    inr: { type: Sequelize.STRING },
    fibrinogen: { type: Sequelize.STRING },
    tt: { type: Sequelize.STRING },
    aptt: { type: Sequelize.STRING },
    chest_ktg: { type: Sequelize.STRING },
    chest_xray: { type: Sequelize.STRING },
    abdomen_echo: { type: Sequelize.STRING },
    spirometry: { type: Sequelize.STRING },
    chatlab: { type: Sequelize.STRING },
    surgical_plan: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'LaboratoryTest',
    modelName: 'LaboratoryTest',
    timestamps: false,
  }
);

LaboratoryTest.SearchField = [
  'Id',
  'complaint',
  'disorders',
  'regular_medication',
  'diagnosis',
  'blood_test_date',
  'wbc',
  'rbc',
  'hb',
  'hct',
  'platelet',
  'coe',
  'euro_score_2',
  'logistic_euroscore',
  'sts',
  'nyha',
  'total_proteoin',
  'albumin',
  'asat',
  'alat',
  'total_bilirubin',
  'ggt',
  'glucose',
  'kidney_test_date',
  'mochevin',
  'creatinine',
  'hbs_ag',
  'hcv',
  'syphilis',
  'hiv',
  'tsusnii_bulegnelt_date',
  'pt',
  'inr',
  'fibrinogen',
  'tt',
  'aptt',
  'chest_ktg',
  'spirometry',
  'chatlab',
  'abdomen_echo',
  'surgical_plan',
];

LaboratoryTest.SetAssocations = (Models) => {
  LaboratoryTest.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });
  LaboratoryTest.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  LaboratoryTest.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
};

LaboratoryTest.SetFunctions = (Models) => {
  LaboratoryTest.findAllNew = async function (Option) {
    const result = await LaboratoryTest.findAll({
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
      ],
    });
    return result;
  };
};

module.exports = LaboratoryTest;
