const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfTreatmentDischarge extends Sequelize.Model {}
HfTreatmentDischarge.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    HfStayId: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    inhibitor: { type: Sequelize.STRING },
    inhibitor_tablet: { type: Sequelize.STRING },
    inhibitor_dose: { type: Sequelize.STRING },
    arb: { type: Sequelize.STRING },
    arb_tablet: { type: Sequelize.STRING },
    arb_dose: { type: Sequelize.STRING },
    beta: { type: Sequelize.STRING },
    beta_tablet: { type: Sequelize.STRING },
    beta_dose: { type: Sequelize.STRING },
    mra: { type: Sequelize.STRING },
    mra_tablet: { type: Sequelize.STRING },
    mra_dose: { type: Sequelize.STRING },
    arni: { type: Sequelize.STRING },
    arni_tablet: { type: Sequelize.STRING },
    arni_tablet_number: { type: Sequelize.STRING },
    sinus_inhibitor: { type: Sequelize.STRING },
    sinus_tablet: { type: Sequelize.STRING },
    sinus_dose: { type: Sequelize.STRING },
    loop_diuretics: { type: Sequelize.STRING },
    loop_diuretics_cycle: { type: Sequelize.STRING },
    loop_diuretics_tablet: { type: Sequelize.STRING },
    loop_diuretics_dose: { type: Sequelize.STRING },
    OtherDiuretic: { type: Sequelize.STRING },
    Digitalis: { type: Sequelize.STRING },
    Statin: { type: Sequelize.STRING },
    Nitrat: { type: Sequelize.STRING },
    OralAnticoagulant: { type: Sequelize.STRING },
    Antiagregant: { type: Sequelize.STRING },
    DeviceTherapy: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfTreatmentDischarge',
    modelName: 'HfTreatmentDischarge',
    timestamps: false,
  }
);

HfTreatmentDischarge.SearchField = [
  'Id',
  'HfStayId',
  'CreateUserId',
  'CreatedDate',
  'inhibitor',
  'inhibitor_tablet',
  'inhibitor_dose',
  'arb',
  'arb_tablet',
  'arb_dose',
  'beta',
  'beta_tablet',
  'beta_dose',
  'mra',
  'mra_tablet',
  'mra_dose',
  'arni',
  'arni_tablet',
  'arni_tablet_number',
  'sinus_inhibitor',
  'sinus_tablet',
  'sinus_dose',
  'loop_diuretics',
  'loop_diuretics_cycle',
  'loop_diuretics_tablet',
  'loop_diuretics_dose',
  'OtherDiuretic',
  'Digitalis',
  'Statin',
  'Nitrat',
  'OralAnticoagulant',
  'Antiagregant',
  'DeviceTherapy',
];

HfTreatmentDischarge.SetAssocations = (Models) => {
  HfTreatmentDischarge.belongsTo(Models.HfStay, {
    as: 'HfStay',
    foreignKey: 'HfStayId',
  });
};

module.exports = HfTreatmentDischarge;
