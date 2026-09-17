const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CardiacSurgeryReport extends Sequelize.Model {}
CardiacSurgeryReport.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    angina: { type: Sequelize.STRING },
    aortic_proc: { type: Sequelize.STRING },
    art_used_grafts: { type: Sequelize.STRING },
    av_gradient: { type: Sequelize.DECIMAL },
    bypass_time: { type: Sequelize.INTEGER },
    cardio_shock: { type: Sequelize.STRING },
    cardiopulmonary_bypass: { type: Sequelize.STRING },
    carotid_bruits: { type: Sequelize.STRING },
    cerebvas_disease_type: { type: Sequelize.STRING },
    chr_lung_disease: { type: Sequelize.STRING },
    congestive_heart_failure: { type: Sequelize.STRING },
    cumulative_cross_clamp_time: { type: Sequelize.INTEGER },
    date_last_sur: { type: Sequelize.DATE },
    date_last_cath: { type: Sequelize.DATE },
    date_last_pci: { type: Sequelize.DATE },
    date_of_admission: { type: Sequelize.DATE },
    date_of_discharge_death: { type: Sequelize.DATE },
    date_of_operation: { type: Sequelize.DATE },
    dca_art_conduit: { type: Sequelize.STRING },
    dca_ven_conduit: { type: Sequelize.STRING },
    destination_on_discharge: { type: Sequelize.STRING },
    diab_treatment: { type: Sequelize.STRING },
    dyspnoea: { type: Sequelize.STRING },
    ef_category: { type: Sequelize.STRING },
    ef_value: { type: Sequelize.DECIMAL },
    explant_type_av: { type: Sequelize.STRING },
    explant_type_mv: { type: Sequelize.STRING },
    explant_type_pv: { type: Sequelize.STRING },
    explant_type_tv: { type: Sequelize.STRING },
    ext_card_arteriopathy: { type: Sequelize.STRING },
    height: { type: Sequelize.DECIMAL },
    hypercholesterolaemia: { type: Sequelize.STRING },
    hypertension: { type: Sequelize.STRING },
    implant_code_av: { type: Sequelize.STRING },
    implant_code_mv: { type: Sequelize.STRING },
    implant_code_pv: { type: Sequelize.STRING },
    implant_code_tv: { type: Sequelize.STRING },
    implant_type_av: { type: Sequelize.STRING },
    implant_type_mv: { type: Sequelize.STRING },
    implant_type_pv: { type: Sequelize.STRING },
    implant_type_tv: { type: Sequelize.STRING },
    insufficiency_av: { type: Sequelize.STRING },
    insufficiency_mv: { type: Sequelize.STRING },
    insufficiency_pv: { type: Sequelize.STRING },
    insufficiency_tv: { type: Sequelize.STRING },
    iv_inotropes: { type: Sequelize.STRING },
    iv_nit_hep_any_kind: { type: Sequelize.STRING },
    last_preo_creatine: { type: Sequelize.DECIMAL },
    lms_disease: { type: Sequelize.STRING },
    left_right_heart_cath: { type: Sequelize.STRING },
    lvedp: { type: Sequelize.DECIMAL },
    mean_pawp_la: { type: Sequelize.DECIMAL },
    most_rcnt_myo_infarction: { type: Sequelize.STRING },
    multi_system_failure: { type: Sequelize.STRING },
    nat_val_path_av: { type: Sequelize.STRING },
    nat_val_path_mv: { type: Sequelize.STRING },
    nat_val_path_pv: { type: Sequelize.STRING },
    nat_val_path_tv: { type: Sequelize.STRING },
    neuro_dysfunction: { type: Sequelize.STRING },
    new_post_operative_dialysis: { type: Sequelize.STRING },
    new_post_operative_stroke: { type: Sequelize.STRING },
    nb_dis_cor_vess: { type: Sequelize.STRING },
    nb_prev_myo_infarction: { type: Sequelize.STRING },
    oth_car_proc_det: { type: Sequelize.STRING },
    oth_non_car_proc_det: { type: Sequelize.STRING },
    pa_systolic: { type: Sequelize.DECIMAL },
    patient_status_discharge: { type: Sequelize.STRING },
    preo_heart_rhythm: { type: Sequelize.STRING },
    prev_surgery: { type: Sequelize.STRING },
    prev_pci: { type: Sequelize.STRING },
    primary_cause_death: { type: Sequelize.STRING },
    procedure_group: { type: Sequelize.STRING },
    re_operation: { type: Sequelize.STRING },
    rsn_rpt_vlv_sur_av: { type: Sequelize.STRING },
    rsn_rpt_vlv_sur_mv: { type: Sequelize.STRING },
    rsn_rpt_vlv_sur_pv: { type: Sequelize.STRING },
    rsn_rpt_vlv_sur_tv: { type: Sequelize.STRING },
    renal: { type: Sequelize.STRING },
    seg_aorta: { type: Sequelize.STRING },
    smoking_history: { type: Sequelize.STRING },
    stenosis_av: { type: Sequelize.STRING },
    stenosis_mv: { type: Sequelize.STRING },
    stenosis_pv: { type: Sequelize.STRING },
    stenosis_tv: { type: Sequelize.STRING },
    total_circulatory_arrest_time: { type: Sequelize.INTEGER },
    valve_ring_size_av: { type: Sequelize.DECIMAL },
    valve_ring_size_mv: { type: Sequelize.DECIMAL },
    valve_ring_size_pv: { type: Sequelize.DECIMAL },
    valve_ring_size_tv: { type: Sequelize.DECIMAL },
    valve_proc_av: { type: Sequelize.STRING },
    valve_proc_mv: { type: Sequelize.STRING },
    valve_proc_pv: { type: Sequelize.STRING },
    valve_proc_tv: { type: Sequelize.STRING },
    ventilated: { type: Sequelize.STRING },
    weight: { type: Sequelize.DECIMAL },
    OrganizationId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CardiacSurgeryReport',
    modelName: 'CardiacSurgeryReport',
    timestamps: false,
  }
);
CardiacSurgeryReport.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'angina',
  'aortic_proc',
  'art_used_grafts',
  'av_gradient',
  'bypass_time',
  'cardio_shock',
  'cardiopulmonary_bypass',
  'carotid_bruits',
  'cerebvas_disease_type',
  'chr_lung_disease',
  'congestive_heart_failure',
  'cumulative_cross_clamp_time',
  'date_last_sur',
  'date_last_cath',
  'date_last_pci',
  'date_of_admission',
  'date_of_discharge_death',
  'date_of_operation',
  'dca_art_conduit',
  'dca_ven_conduit',
  'destination_on_discharge',
  'diab_treatment',
  'dyspnoea',
  'ef_category',
  'ef_value',
  'explant_type_av',
  'explant_type_mv',
  'explant_type_pv',
  'explant_type_tv',
  'ext_card_arteriopathy',
  'height',
  'hypercholesterolaemia',
  'hypertension',
  'implant_code_av',
  'implant_code_mv',
  'implant_code_pv',
  'implant_code_tv',
  'implant_type_av',
  'implant_type_mv',
  'implant_type_pv',
  'implant_type_tv',
  'insufficiency_av',
  'insufficiency_mv',
  'insufficiency_pv',
  'insufficiency_tv',
  'iv_inotropes',
  'iv_nit_hep_any_kind',
  'last_preo_creatine',
  'lms_disease',
  'left_right_heart_cath',
  'lvedp',
  'mean_pawp_la',
  'most_rcnt_myo_infarction',
  'multi_system_failure',
  'nat_val_path_av',
  'nat_val_path_mv',
  'nat_val_path_pv',
  'nat_val_path_tv',
  'neuro_dysfunction',
  'new_post_operative_dialysis',
  'new_post_operative_stroke',
  'nb_dis_cor_vess',
  'nb_prev_myo_infarction',
  'oth_car_proc_det',
  'oth_non_car_proc_det',
  'pa_systolic',
  'patient_status_discharge',
  'preo_heart_rhythm',
  'prev_surgery',
  'prev_pci',
  'primary_cause_death',
  'procedure_group',
  're_operation',
  'rsn_rpt_vlv_sur_av',
  'rsn_rpt_vlv_sur_mv',
  'rsn_rpt_vlv_sur_pv',
  'rsn_rpt_vlv_sur_tv',
  'renal',
  'seg_aorta',
  'smoking_history',
  'stenosis_av',
  'stenosis_mv',
  'stenosis_pv',
  'stenosis_tv',
  'total_circulatory_arrest_time',
  'valve_ring_size_av',
  'valve_ring_size_mv',
  'valve_ring_size_pv',
  'valve_ring_size_tv',
  'valve_proc_av',
  'valve_proc_mv',
  'valve_proc_pv',
  'valve_proc_tv',
  'ventilated',
  'weight',
  'OrganizationId',
  'PatientId',
];

CardiacSurgeryReport.SetAssocations = (Models) => {
  CardiacSurgeryReport.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  CardiacSurgeryReport.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });

  CardiacSurgeryReport.hasMany(Models.CardiacSurgeryReportLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  CardiacSurgeryReport.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });
};

CardiacSurgeryReport.SetFunctions = (Models) => {
  CardiacSurgeryReport.findAllDetail = async function (Option) {
    const result = await CardiacSurgeryReport.findAll({
      ...Option,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
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
          model: Models.CardiacSurgeryReportLookUp,
          as: 'LookUpData',
        },
      ],
    });

    return result;
  };

  CardiacSurgeryReport.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [CardiacSurgeryReport] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await CardiacSurgeryReport.create(Data);

    return Created[ReturnIdField];
  };

  CardiacSurgeryReport.findAllNew = async function (Option) {
    var Result = await CardiacSurgeryReport.findAll({
      ...Option,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
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
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
      ],
    });
    return Result;
  };
};

module.exports = CardiacSurgeryReport;
