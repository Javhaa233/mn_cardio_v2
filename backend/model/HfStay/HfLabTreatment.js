const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfLabTreatment extends Sequelize.Model {}
HfLabTreatment.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    HfStayId: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    Killip: { type: Sequelize.STRING },
    Height: { type: Sequelize.NUMBER },
    a_weight: { type: Sequelize.NUMBER },
    a_sys: { type: Sequelize.NUMBER },
    a_dias: { type: Sequelize.NUMBER },
    a_hrate: { type: Sequelize.NUMBER },
    a_hb: { type: Sequelize.NUMBER },
    a_creat: { type: Sequelize.NUMBER },
    a_kali: { type: Sequelize.NUMBER },
    a_natri: { type: Sequelize.NUMBER },
    a_ntprobnp: { type: Sequelize.NUMBER },
    a_bnp: { type: Sequelize.NUMBER },
    b_weight: { type: Sequelize.NUMBER },
    b_sys: { type: Sequelize.NUMBER },
    b_dias: { type: Sequelize.NUMBER },
    b_hrate: { type: Sequelize.NUMBER },
    b_hb: { type: Sequelize.NUMBER },
    b_creat: { type: Sequelize.NUMBER },
    b_kali: { type: Sequelize.NUMBER },
    b_natri: { type: Sequelize.NUMBER },
    b_ntprobnp: { type: Sequelize.NUMBER },
    b_bnp: { type: Sequelize.NUMBER },
    b_ferrit: { type: Sequelize.NUMBER },
    b_transferrin: { type: Sequelize.STRING },
    Nyha: { type: Sequelize.STRING },
    EcgRhythm: { type: Sequelize.STRING },
    Lbbb: { type: Sequelize.STRING },
    Qrs: { type: Sequelize.STRING },
    LvefMethod: { type: Sequelize.STRING },
    LvefDate: { type: Sequelize.DATE },
    Lvef: { type: Sequelize.STRING },
    ChestXray: { type: Sequelize.STRING },
    Spirometry: { type: Sequelize.STRING },
    DiuerticDone: { type: Sequelize.STRING },
    DiureticDate: { type: Sequelize.DATE },
    Inotropic: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfLabTreatment',
    modelName: 'HfLabTreatment',
    timestamps: false,
  }
);

HfLabTreatment.SearchField = [
  'Id',
  'HfStayId',
  'CreateUserId',
  'CreateDate',
  'Killip',
  'Height',
  'a_weight',
  'a_sys',
  'a_dias',
  'a_hrate',
  'a_hb',
  'a_creat',
  'a_kali',
  'a_natri',
  'a_ntprobnp',
  'a_bnp',
  'b_weight',
  'b_sys',
  'b_dias',
  'b_hrate',
  'b_hb',
  'b_creat',
  'b_kali',
  'b_natri',
  'b_ntprobnp',
  'b_bnp',
  'b_ferrit',
  'b_transferrin',
  'Nyha',
  'EcgRhythm',
  'Lbbb',
  'Qrs',
  'LvefMethod',
  'LvefDate',
  'Lvef',
  'ChestXray',
  'Spirometry',
  'DiuerticDone',
  'DiureticDate',
  'Inotropic',
];

HfLabTreatment.SetAssocations = (Models) => {
  HfLabTreatment.belongsTo(Models.HfStay, {
    as: 'HfStay',
    foreignKey: 'HfStayId',
  });
};

module.exports = HfLabTreatment;
