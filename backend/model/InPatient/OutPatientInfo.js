const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OutPatientInfo extends Sequelize.Model {}
OutPatientInfo.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    InPatientId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
    patientRegister: { type: Sequelize.STRING },

    Diagnosis: { type: Sequelize.TEXT },
    HiigdsenShinjilgee: { type: Sequelize.TEXT },
    HiigdsenEmchilgee: { type: Sequelize.TEXT },

    SergeenZasah: { type: Sequelize.TEXT },
    No135: { type: Sequelize.TEXT },

    Tsaashid: { type: Sequelize.TEXT },
    LifeAdvice: { type: Sequelize.TEXT },
    LifeAdviceSelect: { type: Sequelize.INTEGER },
    LifeAdviceOther: { type: Sequelize.TEXT },
    Monitoring: { type: Sequelize.TEXT },
    MonitoringSelect: { type: Sequelize.INTEGER },
    MonitoringOther: { type: Sequelize.TEXT },
    UuhEmSelect: { type: Sequelize.INTEGER },
    UuhEm: { type: Sequelize.TEXT },
    DoctorId: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    UpdateDate: { type: Sequelize.DATE },
    StayId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'OutPatientInfo',
    modelName: 'OutPatientInfo',
    timestamps: false,
  }
);

OutPatientInfo.SearchField = [
  'Id',
  'PatientId',
  'patientRegister',
  'Diagnosis',
  'HiigdsenShinjilgee',
  'HiigdsenEmchilgee',
  'Tsaashid',
  'UuhEm',
  'DoctorId',
  'CreateUserId',
  'CreateDate',
  'UpdateDate',
  'StayId',
];
OutPatientInfo.SetAssocations = (Models) => {
  OutPatientInfo.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
  });

  OutPatientInfo.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  OutPatientInfo.belongsTo(Models.Users, {
    as: 'CreateUser',
    foreignKey: 'CreateUserId',
  });
  OutPatientInfo.hasMany(Models.OutPatientInfoLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

OutPatientInfo.SetFunctions = (Models) => {
  OutPatientInfo.findAllNew = async function (Option) {
    var Result = await OutPatientInfo.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'CreateUser',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname', 'FullName'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
        },
      ],
    });
    return Result;
  };

  OutPatientInfo.findAllDetail = async function (Option) {
    const result = await OutPatientInfo.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'CreateUser',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
        },
        { model: Models.OutPatientInfoLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };

  OutPatientInfo.createNew = async function (Data, ReturnIdField) {
    await OutPatientInfo.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [OutPatientInfo] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );

    return ReturnData[0][ReturnIdField];
  };
};

module.exports = OutPatientInfo;
