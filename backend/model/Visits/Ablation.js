const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Ablation extends Sequelize.Model {}
Ablation.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    HospitalId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.STRING },
    NurseId: { type: Sequelize.STRING },
    TechnicianId: { type: Sequelize.STRING },

    InDate: { type: Sequelize.DATE },
    OutDate: { type: Sequelize.DATE },
    SendDoctorId: { type: Sequelize.STRING },
    SendDate: { type: Sequelize.DATE },
    ArteriDaraltIhsdeg: { type: Sequelize.STRING },
    ArteriDaraltIhsdegDetail: { type: Sequelize.STRING },
    Giperlipidemi: { type: Sequelize.STRING },
    GiperlipidemiDetail: { type: Sequelize.STRING },
    ChihriinShijin: { type: Sequelize.STRING },
    ChihriinShijinDetail: { type: Sequelize.STRING },
    ZvrhniiDutagdal: { type: Sequelize.STRING },
    Harvalt: { type: Sequelize.STRING },
    ZahSudasniUwchin: { type: Sequelize.STRING },
    ZvrhniBvtetsEmgeg: { type: Sequelize.STRING },
    Ziu: { type: Sequelize.STRING },
    Cardiomiopati: { type: Sequelize.STRING },
    ZvrhniTurulhGajig: { type: Sequelize.STRING },
    MitralHavhlagProlaps: { type: Sequelize.STRING },
    HavhlagaGajig: { type: Sequelize.STRING },
    ZvrhniShigdees: { type: Sequelize.STRING },
    BHDisplazi: { type: Sequelize.STRING },
    Other: { type: Sequelize.STRING },
    OtherDetail: { type: Sequelize.STRING },
    Ajilbar: { type: Sequelize.STRING },
    Zaalt: { type: Sequelize.STRING },
    HemAldaltEmenEmchilge: { type: Sequelize.STRING },
    HemAldaltEmenEmchilgeDetail: { type: Sequelize.STRING },
    HemAldaltEmenEmchilgeOther: { type: Sequelize.STRING },
    LVEF: { type: Sequelize.STRING },
    HemAldaltMesZasal: { type: Sequelize.STRING },
    PacemakerSuulgats: { type: Sequelize.STRING },
    PacemakerSuulgatsYes: { type: Sequelize.STRING },
    PacemakerSuulgatsYesDate: { type: Sequelize.DATE },
    ICDSuulgats: { type: Sequelize.STRING },
    ICDSuulgatsYesDate: { type: Sequelize.DATE },
    UmnuhKatetrAblatsi: { type: Sequelize.STRING },
    UmnuhKatetrAblatsiYesHaan: { type: Sequelize.STRING },
    UmnuhAblatsiHiilgesen: { type: Sequelize.STRING },
    UmnuhAjilbarOther: { type: Sequelize.STRING },
    UmnuhAjilbarOtherYesDate: { type: Sequelize.DATE },
    EFShOnosh: { type: Sequelize.STRING },
    EFShOnoshOther: { type: Sequelize.STRING },
    IncArrhythLab: { type: Sequelize.STRING },
    IncArrhythLabOther: { type: Sequelize.STRING },
    AblatsiHiigdsen: { type: Sequelize.STRING },
    StayId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Ablation',
    modelName: 'Ablation',
    timestamps: false,
  }
);

Ablation.SearchField = [];

module.exports = Ablation;
