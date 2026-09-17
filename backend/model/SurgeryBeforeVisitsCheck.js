const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class SurgeryBeforeVisitsCheck extends Sequelize.Model {}
SurgeryBeforeVisitsCheck.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Tsus: { type: Sequelize.STRING },
    BioHimi: { type: Sequelize.STRING },
    TsusBvlegneltINR: { type: Sequelize.STRING },
    VirusMarker: { type: Sequelize.STRING },
    ZvrhTsahBichleg: { type: Sequelize.STRING },
    ZvrhEho: { type: Sequelize.STRING },
    Spirometr: { type: Sequelize.STRING },
    TseejRentgen: { type: Sequelize.STRING },
    HevlinEho: { type: Sequelize.STRING },
    TitemSudasDoturh: { type: Sequelize.STRING },
    GolSudasTomo: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    UpdateDate: { type: Sequelize.DATE },
    PatientId: { type: Sequelize.STRING },
    TeamId: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.STRING },
    DoctorId: { type: Sequelize.STRING },
    DoctorsTeamPatientId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'SurgeryBeforeVisitsCheck',
    modelName: 'SurgeryBeforeVisitsCheck',
    timestamps: false,
  }
);
SurgeryBeforeVisitsCheck.SearchField = [
  'Id',
  'Tsus',
  'BioHimi',
  'TsusBvlegneltINR',
  'VirusMarker',
  'ZvrhTsahBichleg',
  'ZvrhEho',
  'Spirometr',
  'TseejRentgen',
  'HevlinEho',
  'TitemSudasDoturh',
  'GolSudasTomo',
  'CreateDate',
  'UpdateDate',
  'PatientId',
  'TeamId',
  'CreateUserId',
  'DoctorId',
  'DoctorsTeamPatientId',
];

SurgeryBeforeVisitsCheck.SetFunctions = (Models) => {
  SurgeryBeforeVisitsCheck.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [SurgeryBeforeVisitsCheck] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await SurgeryBeforeVisitsCheck.create(Data);

    return Created[ReturnIdField];
  };
};

module.exports = SurgeryBeforeVisitsCheck;
