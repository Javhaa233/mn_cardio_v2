const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class InpatientDepsPatients extends Sequelize.Model {}
InpatientDepsPatients.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    date_inpatient_list: { type: Sequelize.DATE },
    date_waiting_list: { type: Sequelize.DATE },
    department_id: { type: Sequelize.INTEGER },
    p_diagnosis: { type: Sequelize.STRING },
    doctor_id_inpatient_list: { type: Sequelize.INTEGER },
    doctor_id_waiting_list: { type: Sequelize.INTEGER },
    p_id: { type: Sequelize.INTEGER },
    p_severity: { type: Sequelize.STRING },
    p_telephone: { type: Sequelize.STRING },
    p_status: { type: Sequelize.STRING },
    inpatient_p_notes: { type: Sequelize.STRING },
    date_leave: { type: Sequelize.DATE },
    leave_user_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'InpatientDepsPatients',
    modelName: 'InpatientDepsPatients',
    timestamps: false,
  }
);

InpatientDepsPatients.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'date_inpatient_list',
  'date_waiting_list',
  'department_id',
  'p_diagnosis',
  'doctor_id_inpatient_list',
  'doctor_id_waiting_list',
  'p_id',
  'p_severity',
  'p_telephone',
  'p_status',
  'inpatient_p_notes',
];

InpatientDepsPatients.SetAssocations = (Models) => {
  InpatientDepsPatients.belongsTo(Models.vwPStatusOfInpatien, {
    as: 'vwPStatusOfInpatien',
    foreignKey: 'p_status',
    targetKey: 'value',
  });

  InpatientDepsPatients.belongsTo(Models.DrgroupDepartments, {
    as: 'DrgroupDepartments',
    foreignKey: 'department_id',
    targetKey: 'id_data',
  });

  InpatientDepsPatients.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'p_id',
    targetKey: 'id_data',
  });

  InpatientDepsPatients.belongsTo(Models.vwInpatientDepsPatientsInfo, {
    as: 'vwInpatientDepsPatientsInfo',
    foreignKey: 'id_data',
    targetKey: 'InpatientDepsPatientsId',
  });

  InpatientDepsPatients.belongsTo(Models.vwSeverity, {
    as: 'vwSeverity',
    foreignKey: 'p_severity',
    targetKey: 'value',
  });

  InpatientDepsPatients.belongsTo(Models.DoctorsProfile, {
    as: 'InDoctorsProfile',
    foreignKey: 'doctor_id_inpatient_list',
    targetKey: 'UserId',
  });

  InpatientDepsPatients.belongsTo(Models.DoctorsProfile, {
    as: 'WaitDoctorsProfile',
    foreignKey: 'doctor_id_waiting_list',
    targetKey: 'UserId',
  });

  InpatientDepsPatients.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });
};

InpatientDepsPatients.SetFunctions = (Models) => {
  InpatientDepsPatients.createNew = async function (Data, ReturnIdField) {
    await InpatientDepsPatients.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [InpatientDepsPatients] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  InpatientDepsPatients.findAllNew = async function (Option) {
    const result = await InpatientDepsPatients.findAll({
      ...Option,
      attributes: [
        'id_data',
        'id',
        'date_creation',
        'date_inpatient_list',
        'date_waiting_list',
        'department_id',
        'p_diagnosis',
        'doctor_id_inpatient_list',
        'doctor_id_waiting_list',
        'p_id',
        'p_severity',
        'p_telephone',
        'p_status',
        'inpatient_p_notes',
        'date_leave',
        'leave_user_id',
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
          include: [{ model: Models.vwGender, as: 'Gender' }],
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
        { model: Models.Users, as: 'Users', attributes: ['UserName'] },
        {
          model: Models.vwInpatientDepsPatientsInfo,
          as: 'vwInpatientDepsPatientsInfo',
        },
      ],
    });
    return result;
  };
};
module.exports = InpatientDepsPatients;
