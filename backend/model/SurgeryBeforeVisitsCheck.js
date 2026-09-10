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
    await SurgeryBeforeVisitsCheck.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [SurgeryBeforeVisitsCheck] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};

module.exports = SurgeryBeforeVisitsCheck;
