const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class InpatientDepsPatientsArchive extends Sequelize.Model {}
InpatientDepsPatientsArchive.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    date_archive: { type: Sequelize.DATE },
    date_inpatient_list: { type: Sequelize.DATE },
    date_waiting_list: { type: Sequelize.DATE },
    department_id: { type: Sequelize.INTEGER },
    p_diagnosis: { type: Sequelize.STRING },
    doctor_id_archive: { type: Sequelize.INTEGER },
    doctor_id_inpatient_list: { type: Sequelize.INTEGER },
    doctor_id_waiting_list: { type: Sequelize.INTEGER },
    p_id: { type: Sequelize.INTEGER },
    p_severity: { type: Sequelize.STRING },
    p_status: { type: Sequelize.STRING },
    p_telephone: { type: Sequelize.STRING },
    inpatient_p_notes: { type: Sequelize.STRING },

    InPatientId: { type: Sequelize.INTEGER },
    OrderHospitalizationId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'InpatientDepsPatientsArchive',
    modelName: 'InpatientDepsPatientsArchive',
    timestamps: false,
  }
);
InpatientDepsPatientsArchive.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'date_archive',
  'date_inpatient_list',
  'date_waiting_list',
  'department_id',
  'p_diagnosis',
  'doctor_id_archive',
  'doctor_id_inpatient_list',
  'doctor_id_waiting_list',
  'p_id',
  'p_severity',
  'p_status',
  'p_telephone',
  'inpatient_p_notes',
  'InPatientId',
  'OrderHospitalizationId',
];

InpatientDepsPatientsArchive.SetAssocations = (Models) => {
  InpatientDepsPatientsArchive.belongsTo(Models.vwPStatusOfInpatien, {
    as: 'vwPStatusOfInpatien',
    foreignKey: 'p_status',
    targetKey: 'value',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.DrgroupDepartments, {
    as: 'DrgroupDepartments',
    foreignKey: 'department_id',
    targetKey: 'id_data',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'p_id',
    targetKey: 'id_data',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.vwSeverity, {
    as: 'vwSeverity',
    foreignKey: 'p_severity',
    targetKey: 'value',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.DoctorsProfile, {
    as: 'InDoctorsProfile',
    foreignKey: 'doctor_id_inpatient_list',
    targetKey: 'UserId',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.DoctorsProfile, {
    as: 'WaitDoctorsProfile',
    foreignKey: 'doctor_id_waiting_list',
    targetKey: 'UserId',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.DoctorsProfile, {
    as: 'ArchDoctorsProfile',
    foreignKey: 'doctor_id_archive',
    targetKey: 'UserId',
  });

  InpatientDepsPatientsArchive.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });
};

InpatientDepsPatientsArchive.SetFunctions = (Models) => {
  InpatientDepsPatientsArchive.createNew = async function (Data, ReturnIdField) {
    await InpatientDepsPatientsArchive.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [InpatientDepsPatientsArchive] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  InpatientDepsPatientsArchive.findAllNew = async function (Option) {
    const result = await InpatientDepsPatientsArchive.findAll({
      ...Option,
      attributes: [
        'id_data',
        'id',
        'date_creation',
        'date_modif',
        'date_archive',
        'date_inpatient_list',
        'date_waiting_list',
        'department_id',
        'p_diagnosis',
        'doctor_id_archive',
        'doctor_id_inpatient_list',
        'doctor_id_waiting_list',
        'p_id',
        'p_severity',
        'p_status',
        'p_telephone',
        'inpatient_p_notes',
        'InPatientId',
        'OrderHospitalizationId',
      ],
      include: [
        {
          model: Models.DrgroupDepartments,
          as: 'DrgroupDepartments',
          attributes: ['name', 'id_data'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: [
            'p_familyname',
            'p_lastname',
            'p_firstname',
            'p_gender',
            'p_birthday',
            'p_registration',
          ],
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
        {
          model: Models.vwPStatusOfInpatien,
          as: 'vwPStatusOfInpatien',
          attributes: ['value', 'label'],
        },
        {
          model: Models.vwSeverity,
          as: 'vwSeverity',
          attributes: ['value', 'label'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'InDoctorsProfile',
          attributes: ['lastname', 'firstname', 'id_data', 'id'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'WaitDoctorsProfile',
          attributes: ['lastname', 'firstname', 'id_data', 'id'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'ArchDoctorsProfile',
          attributes: ['lastname', 'firstname', 'id_data', 'id'],
        },
        { model: Models.Users, as: 'Users', attributes: ['UserName'] },
      ],
    });
    return result;
  };
};
module.exports = InpatientDepsPatientsArchive;
