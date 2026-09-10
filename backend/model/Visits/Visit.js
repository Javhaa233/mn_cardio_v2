const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Visit extends Sequelize.Model {}

Visit.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    visit_date: { type: Sequelize.DATE },
    chief_complaint: { type: Sequelize.STRING },
    major_findings: { type: Sequelize.STRING },
    other_chief_complaint: { type: Sequelize.STRING },
    other_major_finding: { type: Sequelize.STRING },
    icd10: { type: Sequelize.STRING },
    surgery_test: { type: Sequelize.STRING },
    cathlab_test: { type: Sequelize.STRING },
    s_operation_name: { type: Sequelize.STRING },
    s_operation_duration: { type: Sequelize.INTEGER },
    s_operation_author: { type: Sequelize.STRING },
    s_operation_condition: { type: Sequelize.STRING },
    s_operation_complication: { type: Sequelize.STRING },
    s_operation_finding: { type: Sequelize.STRING },
    c_procedure: { type: Sequelize.STRING },
    c_result: { type: Sequelize.STRING },
    c_treatment: { type: Sequelize.STRING },
    c_doctor: { type: Sequelize.STRING },
    type_exam1: { type: Sequelize.STRING },
    type_exam2: { type: Sequelize.STRING },
    disease: { type: Sequelize.STRING },
    d_bp: { type: Sequelize.INTEGER },
    s_bp: { type: Sequelize.INTEGER },
    pe_vs_heart: { type: Sequelize.INTEGER },
    referred_by_13a: { type: Sequelize.STRING },
    paralysis: { type: Sequelize.STRING },
    inr: { type: Sequelize.DECIMAL },
    weight: { type: Sequelize.DECIMAL },
    Notes: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
    PatRegNo: { type: Sequelize.STRING },
    stroke_chief_complaint: { type: Sequelize.STRING },
    main_diagnosis: { type: Sequelize.STRING },
    main_diagnosis_ru: { type: Sequelize.STRING },
    main_diagnosis_mn: { type: Sequelize.STRING },
    main_diagnosis_notes: { type: Sequelize.STRING },

    // Form АМ-1Б (А/611, appendix 11) — the register columns this table did
    // not have. See scripts/add_visit_am1b_columns.sql.
    exam_type_icd: { type: Sequelize.STRING },    // 14 Үзлэгийн төрөл /Z00-Z40/
    cause_icd10: { type: Sequelize.STRING },      // 16 Өвчний шалтгаан /ӨОУА-10/
    procedure_icd9: { type: Sequelize.STRING },   // 20 Хийгдсэн ажилбар /ҮОУА-9/
    has_complication: { type: Sequelize.STRING }, // 21 Хүндрэлтэй эсэх
    incapacity_days: { type: Sequelize.INTEGER }, // 22 Хөдөлмөрийн чадвар алдалт
  },
  {
    sequelize,
    tableName: 'Visit',
    modelName: 'Visit',
    timestamps: false,
  }
);

Visit.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'visit_date',
  'chief_complaint',
  'major_findings',
  'other_chief_complaint',
  'other_major_finding',
  'icd10',
  'surgery_test',
  'cathlab_test',
  's_operation_name',
  's_operation_duration',
  's_operation_author',
  's_operation_condition',
  's_operation_complication',
  's_operation_finding',
  'c_procedure',
  'c_result',
  'c_treatment',
  'c_doctor',
  'type_exam1',
  'type_exam2',
  'disease',
  'd_bp',
  's_bp',
  'pe_vs_heart',
  'referred_by_13a',
  'paralysis',
  'inr',
  'weight',
  'Notes',
  'OrganizationId',
  'PatientId',
  'main_diagnosis',
  'main_diagnosis_ru',
  'main_diagnosis_mn',
  'main_diagnosis_notes',
  // A column added to `init` above but forgotten here is invisible to the
  // generic list search. `PatRegNo` and `stroke_chief_complaint` are the
  // existing evidence of that mistake - both are real columns and neither is
  // searchable.
  'exam_type_icd',
  'cause_icd10',
  'procedure_icd9',
  'has_complication',
  'incapacity_days',
];

Visit.SetAssocations = (Models) => {
  Visit.hasMany(Models.VisitLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  Visit.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  Visit.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });

  Visit.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });

  Visit.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });
};

Visit.SetFunctions = (Models) => {
  Visit.findAllAmbulatori = async function (Option) {
    const result = await Visit.findAll({
      ...Option,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: [
            ...Models.Patient.DefaultFields,
            'p_address',
            'p_health_insurance',
            'p_occupation',
            'p_education',
          ],
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
      ],
    });
    return result;
  };
  Visit.findAllNew = async function (Option) {
    var Option = Option;
    // Option.where = { ...Option.where, "$Users.AppId$": 1 };

    const result = await Visit.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.Organization,
          as: 'Organization',
          include: [
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name', 'date_creation'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictBagKhoroo,
              as: 'DictBagKhoroo',
              attributes: ['id_data', 'name'],
            },
          ],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: [...Models.Patient.DefaultFields],
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
      ],
    });
    return result;
  };

  Visit.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'Visit',
        rec_status: { [Op.in]: ['9', '1'] },
      },
      attributes: [
        'id_data',
        'id',
        'ext',
        'hash',
        'original_name',
        'generated_name',
        'linked_q',
        'linked_id_data',
        'size',
        'patient_id',
        'LinkedObjectName',
        'LinkedObjectId',
        'FieldName',
      ],
    });

    return Files;
  };

  Visit.GetLookUpData = async function (DataId) {
    const result = await Models.VisitLookUp.findAll({
      where: { id_data: DataId },
    });
    return result;
  };

  Visit.createNew = async function (Data, ReturnIdField) {
    await Visit.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [Visit] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};
module.exports = Visit;
