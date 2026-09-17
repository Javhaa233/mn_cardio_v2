const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Stay extends Sequelize.Model {}
Stay.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    date_discharge: { type: Sequelize.DATE },
    department_id: { type: Sequelize.INTEGER },
    diagnose_admission: { type: Sequelize.INTEGER },
    diagnose_discharge: { type: Sequelize.INTEGER },
    doctor_discharge: { type: Sequelize.INTEGER },
    mode_admission: { type: Sequelize.STRING },
    mode_discharge: { type: Sequelize.STRING },
    inpatient_p_notes: { type: Sequelize.STRING },
    p_id: { type: Sequelize.INTEGER },
    patient_register: { type: Sequelize.STRING },
    current_room_id: { type: Sequelize.INTEGER },
    from_department: { type: Sequelize.INTEGER },
    from_where: { type: Sequelize.STRING },
    to_department: { type: Sequelize.INTEGER },
    to_where: { type: Sequelize.INTEGER },
    severity_admission: { type: Sequelize.STRING },
    p_status: { type: Sequelize.STRING },
    date_archive: { type: Sequelize.DATE },
    date_admission: { type: Sequelize.DATE },
    date_waiting: { type: Sequelize.DATE },
    doctor_waiting: { type: Sequelize.INTEGER },
    doctor_admission: { type: Sequelize.INTEGER },
    doctor_archive: { type: Sequelize.INTEGER },
    OrderHospitalizationId: { type: Sequelize.INTEGER },
    RefferalTo: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Stay',
    modelName: 'Stay',
    timestamps: false,
  }
);
Stay.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'date_discharge',
  'department_id',
  'diagnose_admission',
  'diagnose_discharge',
  'doctor_discharge',
  'mode_admission',
  'mode_discharge',
  'inpatient_p_notes',
  'p_id',
  'patient_register',
  'current_room_id',
  'from_department',
  'from_where',
  'to_department',
  'to_where',
  'severity_admission',
  'p_status',
  'date_archive',
  'date_admission',
  'date_waiting',
  'doctor_waiting',
  'doctor_admission',
  'doctor_archive',
  'OrderHospitalizationId',
];

Stay.SetAssocations = (Models) => {
  Stay.belongsTo(Models.vwPStatusOfInpatien, {
    as: 'vwPStatusOfInpatien',
    foreignKey: 'p_status',
    targetKey: 'value',
  });

  Stay.belongsTo(Models.vwSeverity, {
    as: 'vwSeverity',
    foreignKey: 'severity_admission',
    targetKey: 'value',
  });

  Stay.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'p_id',
    targetKey: 'id_data',
  });

  Stay.belongsTo(Models.vwModeDischarge, {
    as: 'vwModeDischarge',
    foreignKey: 'mode_discharge',
    targetKey: 'value',
  });

  Stay.belongsTo(Models.vwModeAdmission, {
    as: 'vwModeAdmission',
    foreignKey: 'mode_admission',
    targetKey: 'value',
  });

  Stay.belongsTo(Models.DrgroupDepartments, {
    as: 'DrgroupDepartments',
    foreignKey: 'department_id',
    targetKey: 'id_data',
  });

  Stay.belongsTo(Models.JournalRef, {
    as: 'DiagnoseAdmission',
    foreignKey: 'diagnose_admission',
    targetKey: 'id_data',
  });

  Stay.belongsTo(Models.JournalRef, {
    as: 'DiagnoseDischarge',
    foreignKey: 'diagnose_discharge',
    targetKey: 'id_data',
  });

  //users
  Stay.belongsTo(Models.Users, {
    as: 'AdmissionUsers',
    foreignKey: 'doctor_admission',
    targetKey: 'Id',
  });

  Stay.belongsTo(Models.Users, {
    as: 'DischargeUsers',
    foreignKey: 'doctor_discharge',
    targetKey: 'Id',
  });

  Stay.belongsTo(Models.Users, {
    as: 'ArchiveUsers',
    foreignKey: 'doctor_archive',
    targetKey: 'Id',
  });

  Stay.belongsTo(Models.Users, {
    as: 'WaitingUsers',
    foreignKey: 'doctor_waiting',
    targetKey: 'Id',
  });
  Stay.belongsTo(Models.OutPatientInfo, {
    as: 'OutPatientInfo',
    foreignKey: 'id_data',
    targetKey: 'StayId',
  });

  //info
  Stay.belongsTo(Models.vwStayInfo, {
    as: 'vwStayInfo',
    foreignKey: 'id_data',
    targetKey: 'StayId',
  });
};

Stay.SetFunctions = (Models) => {
  Stay.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [Stay] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await Stay.create(Data);

    return Created[ReturnIdField];
  };

  Stay.findAllNew = async function (Option) {
    const result = await Stay.findAll({
      ...Option,
      include: [
        {
          model: Models.vwPStatusOfInpatien,
          as: 'vwPStatusOfInpatien',
          attributes: ['value', 'label'],
        },
        { model: Models.vwStayInfo, as: 'vwStayInfo' },
        {
          model: Models.Users,
          as: 'ArchiveUsers',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.Users,
          as: 'AdmissionUsers',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.Users,
          as: 'DischargeUsers',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.Users,
          as: 'WaitingUsers',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.vwSeverity,
          as: 'vwSeverity',
          attributes: ['value', 'label'],
        },
        {
          model: Models.JournalRef,
          as: 'DiagnoseAdmission',
          attributes: ['id_data', 'jr_label'],
        },
        {
          model: Models.JournalRef,
          as: 'DiagnoseDischarge',
          attributes: ['id_data', 'jr_label'],
        },
        {
          model: Models.vwModeAdmission,
          as: 'vwModeAdmission',
          attributes: ['value', 'label'],
        },
        {
          model: Models.vwModeDischarge,
          as: 'vwModeDischarge',
          attributes: ['value', 'label'],
        },
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
            'p_telephone',
            'Age',
          ],
          include: [
            { model: Models.vwGender, as: 'Gender' },
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
          ],
        },
        {
          model: Models.OutPatientInfo,
          as: 'OutPatientInfo',
          attributes: ['Id'],
        },
      ],
    });
    return result;
  };
};

module.exports = Stay;
