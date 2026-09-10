const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfLifeStory extends Sequelize.Model {}
HfLifeStory.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    HfStayId: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    AskedLife: { type: Sequelize.STRING },
    Marriage: { type: Sequelize.STRING },
    WorkCondition: { type: Sequelize.STRING },
    PhysicalTherapy: { type: Sequelize.STRING },
    HfEducation: { type: Sequelize.STRING },
    Smoking: { type: Sequelize.STRING },
    DrinkingWeekly: { type: Sequelize.STRING },
    DrinkingLoop: { type: Sequelize.STRING },
    Fatigue: { type: Sequelize.STRING },
    Dyspnea: { type: Sequelize.STRING },
    PhysicalActivity: { type: Sequelize.STRING },
    SelfService: { type: Sequelize.STRING },
    DailyActivity: { type: Sequelize.STRING },
    PainDiscomfort: { type: Sequelize.STRING },
    Anxiety: { type: Sequelize.STRING },
    LifeQuality: { type: Sequelize.STRING },
    hist_hf: { type: Sequelize.STRING },
    hist_revasc: { type: Sequelize.STRING },
    hist_hypertension: { type: Sequelize.STRING },
    hist_attrfib: { type: Sequelize.STRING },
    hist_diabetes: { type: Sequelize.STRING },
    hist_copd: { type: Sequelize.STRING },
    hist_valvedisease: { type: Sequelize.STRING },
    hist_valvesurgery: { type: Sequelize.STRING },
    hist_dcm: { type: Sequelize.STRING },
    hist_primary: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfLifeStory',
    modelName: 'HfLifeStory',
    timestamps: false,
  }
);

HfLifeStory.SearchField = [
  'Id',
  'HfStayId',
  'CreateUserId',
  'PatientId',
  'AskedLife',
  'Marriage',
  'WorkCondition',
  'PhysicalTherapy',
  'HfEducation',
  'Smoking',
  'DrinkingWeekly',
  'DrinkingLoop',
  'Fatigue',
  'Dyspnea',
  'PhysicalActivity',
  'SelfService',
  'DailyActivity',
  'PainDiscomfort',
  'Anxiety',
  'LifeQuality',
  'hist_hf',
  'hist_revasc',
  'hist_hypertension',
  'hist_attrfib',
  'hist_diabetes',
  'hist_copd',
  'hist_valvedisease',
  'hist_valvesurgery',
  'hist_dcm',
  'hist_primary',
];

HfLifeStory.SetAssocations = (Models) => {
  HfLifeStory.belongsTo(Models.HfStay, {
    as: 'HfStay',
    foreignKey: 'HfStayId',
  });
};

module.exports = HfLifeStory;
