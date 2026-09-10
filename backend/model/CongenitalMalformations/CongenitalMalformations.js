const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CongenitalMalformations extends Sequelize.Model {}

CongenitalMalformations.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    is_confirm: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    ConfirmUserId: { type: Sequelize.INTEGER },
    ConfirmedDate: { type: Sequelize.DATE },

    // organization
    organization_id: { type: Sequelize.INTEGER },
    organization_other: { type: Sequelize.STRING },

    n_type: { type: Sequelize.STRING },
    n_category: { type: Sequelize.STRING },
    ognoo: { type: Sequelize.STRING },
    type_exam: { type: Sequelize.STRING },
    risk_factors: { type: Sequelize.STRING },
    heartache: { type: Sequelize.STRING },

    p_address: { type: Sequelize.STRING },
    onosh: { type: Sequelize.STRING },
    hawsarsan_onosh: { type: Sequelize.STRING },
    DiagnosedDate: { type: Sequelize.DATE },
    StartedDate: { type: Sequelize.DATE },
    is_udamshil: { type: Sequelize.STRING },
    udamshil: { type: Sequelize.STRING },
    odoogiin_zowiur: { type: Sequelize.INTEGER },
    em_taria_hereglej_bga: { type: Sequelize.STRING },
    is_harvalt: { type: Sequelize.STRING },

    // Бодит үзлэг
    jin: { type: Sequelize.FLOAT },
    undur: { type: Sequelize.FLOAT },
    ad_deed: { type: Sequelize.FLOAT },
    ad_dood: { type: Sequelize.FLOAT },
    ztst: { type: Sequelize.FLOAT },
    at: { type: Sequelize.FLOAT },
    saturatsi: { type: Sequelize.FLOAT },

    //  ШИНЖ ТЭМДЭГ
    zahiin_shinj: { type: Sequelize.INTEGER },
    uushginii_shinj: { type: Sequelize.INTEGER },
    zurhnii_shinj: { type: Sequelize.INTEGER },
    hevliin_shinj: { type: Sequelize.INTEGER },

    shuugian_shinj_chanar: { type: Sequelize.INTEGER },
    shuugian_systol: { type: Sequelize.FLOAT },
    shuugian_diastol: { type: Sequelize.FLOAT },
    shuugian_bairlal: { type: Sequelize.INTEGER },
    shuugian_damjilt: { type: Sequelize.STRING },

    shuugian_tod: { type: Sequelize.STRING },
    shuugian_sulavtar: { type: Sequelize.STRING },
    shuugian_sul: { type: Sequelize.STRING },

    // ОНОШИЛГОО, ШИНЖИЛГЭЭ

    // Лабораторийн шинжилгээ
    lab_test_date: { type: Sequelize.DATE },
    ulaan_es: { type: Sequelize.FLOAT },
    tsagaan_es: { type: Sequelize.FLOAT },
    yaltas_es: { type: Sequelize.FLOAT },
    gemoglobin: { type: Sequelize.FLOAT },
    kali: { type: Sequelize.FLOAT },
    natri: { type: Sequelize.FLOAT },
    creatinin: { type: Sequelize.FLOAT },
    creatinin_type: { type: Sequelize.INTEGER },
    mochevin: { type: Sequelize.FLOAT },
    alibumin: { type: Sequelize.FLOAT },
    egfr: { type: Sequelize.FLOAT },
    alat: { type: Sequelize.FLOAT },
    crb: { type: Sequelize.FLOAT },
    asat: { type: Sequelize.FLOAT },
    ggt: { type: Sequelize.FLOAT },
    aslo: { type: Sequelize.FLOAT },
    rf: { type: Sequelize.FLOAT },
    niit_uurag: { type: Sequelize.FLOAT },
    niit_bilirubin: { type: Sequelize.FLOAT },
    glukoz: { type: Sequelize.FLOAT },

    is_hbs_ag: { type: Sequelize.STRING },
    is_hcv: { type: Sequelize.STRING },
    is_tembvv: { type: Sequelize.STRING },
    is_hiv: { type: Sequelize.STRING },

    ShinjilgeeDate: { type: Sequelize.DATE },

    // tsusnii delgerengui shinjilgee
    wbc: { type: Sequelize.FLOAT },
    rbc: { type: Sequelize.FLOAT },
    hb: { type: Sequelize.FLOAT },
    hct: { type: Sequelize.FLOAT },
    plt: { type: Sequelize.FLOAT },
    coe: { type: Sequelize.FLOAT },
    pt: { type: Sequelize.FLOAT },
    inr: { type: Sequelize.FLOAT },
    fibrinogen: { type: Sequelize.FLOAT },
    tt: { type: Sequelize.FLOAT },
    aptt: { type: Sequelize.FLOAT },

    // Зүрхний цахилгаан бичлэг
    tsa_date: { type: Sequelize.DATE },
    qrs_burdel: { type: Sequelize.FLOAT },
    zurhnii_hem: { type: Sequelize.INTEGER },
    zurhnii_hem_other: { type: Sequelize.STRING },
    zurhnii_horig: { type: Sequelize.INTEGER },
    zurhnii_horig_other: { type: Sequelize.STRING },

    ztsb_date: { type: Sequelize.DATE },
    rhythm: { type: Sequelize.INTEGER },
    rhythm_other: { type: Sequelize.STRING },

    // Sudas - ЦЭЭЖНИЙ РЕНТГЕН ХАРАЛТ
    tseej_rentgen: { type: Sequelize.STRING },

    // Зүрхний хэт авиан оношилгоо
    het_awia_date: { type: Sequelize.DATE },
    qp_qs: { type: Sequelize.FLOAT },
    lvdd: { type: Sequelize.FLOAT },
    lvds: { type: Sequelize.FLOAT },
    ivsd: { type: Sequelize.FLOAT },
    pwd: { type: Sequelize.FLOAT },
    lv_massi: { type: Sequelize.FLOAT }, // calculate
    ee_med: { type: Sequelize.FLOAT },
    ee_lat: { type: Sequelize.FLOAT },
    dundaj_ee: { type: Sequelize.FLOAT }, // calculate
    taslawch_e: { type: Sequelize.FLOAT },
    hajuu_hana_e: { type: Sequelize.FLOAT },
    lvef: { type: Sequelize.FLOAT },
    lv_gls: { type: Sequelize.FLOAT },
    la_volume: { type: Sequelize.FLOAT },

    uushig_systol_daralt: { type: Sequelize.FLOAT },
    tapse: { type: Sequelize.FLOAT },
    rv_fac: { type: Sequelize.FLOAT },

    //
    bh_basal: { type: Sequelize.FLOAT },
    bh_mid: { type: Sequelize.FLOAT },
    bh_longitudinal: { type: Sequelize.FLOAT },

    // ТЕЕ (ТХТЦ-н хэмжээ)
    txt_tso: { type: Sequelize.STRING },
    txt_tso_helber: { type: Sequelize.FLOAT },
    txt_tso_hemjee: { type: Sequelize.FLOAT },
    txt_shunt_chiglel: { type: Sequelize.INTEGER },
    txt_shunt_urs_hurd: { type: Sequelize.FLOAT },

    xxt_tso: { type: Sequelize.STRING },
    xxt_tso_helber: { type: Sequelize.FLOAT },
    xxt_tso_hemjee: { type: Sequelize.FLOAT },
    xxt_shunt_chiglel: { type: Sequelize.INTEGER },
    xxt_shunt_urs_hurd: { type: Sequelize.FLOAT },

    abts: { type: Sequelize.STRING },
    abts_helber: { type: Sequelize.FLOAT },
    abts_hemjee: { type: Sequelize.FLOAT },
    abts_urs_hurd: { type: Sequelize.FLOAT },

    uldets: { type: Sequelize.STRING },
    uldets_helber: { type: Sequelize.FLOAT },
    uldets_hemjee: { type: Sequelize.FLOAT },
    uldets_urs_hurd: { type: Sequelize.FLOAT },

    rvot: { type: Sequelize.FLOAT },
    rvot_gipertrofi: { type: Sequelize.STRING },
    rv: { type: Sequelize.FLOAT },
    rv_zuzaan: { type: Sequelize.FLOAT },
    ra: { type: Sequelize.FLOAT },
    ra_zuzaan: { type: Sequelize.FLOAT },
    tapse: { type: Sequelize.FLOAT },
    rv_fac: { type: Sequelize.FLOAT },
    rv_strain: { type: Sequelize.FLOAT },
    lvot: { type: Sequelize.FLOAT },
    lvot_gipertrofi: { type: Sequelize.STRING },

    lv: { type: Sequelize.FLOAT },
    lv_zuzaan: { type: Sequelize.FLOAT },
    la: { type: Sequelize.FLOAT },
    la_zuzaan: { type: Sequelize.FLOAT },
    pa_mpa: { type: Sequelize.FLOAT },
    rb: { type: Sequelize.FLOAT },
    lb: { type: Sequelize.FLOAT },
    ph_spap: { type: Sequelize.FLOAT },

    gxx_ursgaliin_hurd: { type: Sequelize.FLOAT },
    gol_sudas_ursgaliin_hurd: { type: Sequelize.FLOAT },
    uushig_ursgaliin_hurd: { type: Sequelize.FLOAT },

    // Хавхлагын эмгэг
    is_havhlaga: { type: Sequelize.STRING },

    //
    katetr_date: { type: Sequelize.DATE },
    qp_qs: { type: Sequelize.FLOAT },
    pvr: { type: Sequelize.FLOAT },

    mes_umnuh_onosh: { type: Sequelize.STRING },
    tuluv_mes: { type: Sequelize.STRING },
    hiigdsen_mes: { type: Sequelize.STRING },
    nemelt_ajilbar: { type: Sequelize.STRING },
    is_now_hundrel: { type: Sequelize.STRING },
    now_hundrel: { type: Sequelize.STRING },
    is_next_ert_hundrel: { type: Sequelize.STRING },
    next_ert_hundrel: { type: Sequelize.STRING },
    is_next_hojuu_hundrel: { type: Sequelize.STRING },
    next_hojuu_hundrel: { type: Sequelize.STRING },
    going_time: { type: Sequelize.STRING },
    u_tasagt_hevtsen_hugatsaa: { type: Sequelize.STRING },

    // Мэс заслын хугацаа
    ms_full_time: { type: Sequelize.STRING },
    ms_perfuz_time: { type: Sequelize.STRING },
    ms_aort_time: { type: Sequelize.STRING },
    ms_anes_time: { type: Sequelize.STRING },

    ekstubatsi_hugatsaa: { type: Sequelize.STRING },
    erchimt_hugatsaa: { type: Sequelize.STRING },
    tasagt_hevtsen_hugatsaa: { type: Sequelize.STRING },
    niit_hevtsen_hugatsaa: { type: Sequelize.STRING },

    // НЭЭЛТТЭЙ МЭС ЗАСАЛ ЭМЧИЛГЭЭ ОНОШ
    neelttei_mes_onosh: { type: Sequelize.INTEGER },
    neelttei_mes_onosh_other: { type: Sequelize.STRING },

    // СУДСАН ДОТУУРХ МЭС ЗАСАЛ ХИЙГДСЭН ОНОШ
    hatgalt_sudas: { type: Sequelize.STRING },
    fluroscopi_full_time: { type: Sequelize.STRING },
    shuher_zagvar: { type: Sequelize.STRING },
    shuher_hemjee: { type: Sequelize.STRING },
    balloon_hemjee: { type: Sequelize.STRING },

    //
    // Тосгуур хоорондын таславчийн цоорхой

    //  Зүрхний хэт авиан шинжилгээгээр
    ha_txt_tso_helber: { type: Sequelize.STRING },
    ha_txt_tso_hemjee: { type: Sequelize.FLOAT },
    ha_txt_shunt_chiglel: { type: Sequelize.INTEGER },

    // Улаан хоолойн зүрхний хэт авиан шинжилгээгээр
    uh_txt_tso_helber: { type: Sequelize.STRING },
    uh_txt_tso_hemjee: { type: Sequelize.FLOAT },
    uh_txt_shunt_chiglel: { type: Sequelize.INTEGER },

    // Katetr

    // КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ӨМНӨХ ОНОШ
    katetr_b_onosh: { type: Sequelize.INTEGER },

    // КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРААХ ОНОШ
    // Онош
    katetr_n_onosh: { type: Sequelize.INTEGER },

    shinjilgee_notes: { type: Sequelize.STRING },
    niit_shinjilgee_urgeljilsen: { type: Sequelize.STRING },
    k_hatgalt_sudas: { type: Sequelize.STRING },
    k_fluroscopi_full_time: { type: Sequelize.STRING },
    k_tod_bodis_hemjee: { type: Sequelize.FLOAT },

    // КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРАА
    n_qp_qs: { type: Sequelize.FLOAT },
    n_pvr: { type: Sequelize.FLOAT },

    // МЭС ЗАСЛЫН ДАРААХ ХЯНАЛТ
    bh_hemjee_1d: { type: Sequelize.FLOAT },
    bh_hemjee_7d: { type: Sequelize.FLOAT },
    bh_hemjee_1m: { type: Sequelize.FLOAT },
    bh_hemjee_3m: { type: Sequelize.FLOAT },
    bh_hemjee_6m: { type: Sequelize.FLOAT },

    bt_hemjee_1d: { type: Sequelize.FLOAT },
    bt_hemjee_7d: { type: Sequelize.FLOAT },
    bt_hemjee_1m: { type: Sequelize.FLOAT },
    bt_hemjee_3m: { type: Sequelize.FLOAT },
    bt_hemjee_6m: { type: Sequelize.FLOAT },

    lvdd_1d: { type: Sequelize.FLOAT },
    lvdd_7d: { type: Sequelize.FLOAT },
    lvdd_1m: { type: Sequelize.FLOAT },
    lvdd_3m: { type: Sequelize.FLOAT },
    lvdd_6m: { type: Sequelize.FLOAT },

    ef_1d: { type: Sequelize.FLOAT },
    ef_7d: { type: Sequelize.FLOAT },
    ef_1m: { type: Sequelize.FLOAT },
    ef_3m: { type: Sequelize.FLOAT },
    ef_6m: { type: Sequelize.FLOAT },

    uushig_arteri_daralt_1d: { type: Sequelize.FLOAT },
    uushig_arteri_daralt_7d: { type: Sequelize.FLOAT },
    uushig_arteri_daralt_1m: { type: Sequelize.FLOAT },
    uushig_arteri_daralt_3m: { type: Sequelize.FLOAT },
    uushig_arteri_daralt_6m: { type: Sequelize.FLOAT },

    uldegdel_shunt_1d: { type: Sequelize.STRING },
    uldegdel_shunt_7d: { type: Sequelize.STRING },
    uldegdel_shunt_1m: { type: Sequelize.STRING },
    uldegdel_shunt_3m: { type: Sequelize.STRING },
    uldegdel_shunt_6m: { type: Sequelize.STRING },

    shuher_bairlal_1d: { type: Sequelize.STRING },
    shuher_bairlal_7d: { type: Sequelize.STRING },
    shuher_bairlal_1m: { type: Sequelize.STRING },
    shuher_bairlal_3m: { type: Sequelize.STRING },
    shuher_bairlal_6m: { type: Sequelize.STRING },

    unheltseg_shingen_1d: { type: Sequelize.STRING },
    unheltseg_shingen_7d: { type: Sequelize.STRING },
    unheltseg_shingen_1m: { type: Sequelize.STRING },
    unheltseg_shingen_3m: { type: Sequelize.STRING },
    unheltseg_shingen_6m: { type: Sequelize.STRING },

    hem_aldagdal_1d: { type: Sequelize.STRING },
    hem_aldagdal_7d: { type: Sequelize.STRING },
    hem_aldagdal_1m: { type: Sequelize.STRING },
    hem_aldagdal_3m: { type: Sequelize.STRING },
    hem_aldagdal_6m: { type: Sequelize.STRING },

    // ЭМЧИЛГЭЭ
    antiagregant_name: { type: Sequelize.STRING },
    antiagregant_tun: { type: Sequelize.FLOAT },

    antikoagulyant_name: { type: Sequelize.STRING },
    antikoagulyant_tun: { type: Sequelize.FLOAT },

    era_name: { type: Sequelize.STRING },
    era_tun: { type: Sequelize.FLOAT },

    pde_name: { type: Sequelize.STRING },
    pde_tun: { type: Sequelize.FLOAT },

    shees_huuh_name: { type: Sequelize.STRING },
    shees_huuh_tun: { type: Sequelize.FLOAT },

    beta_name: { type: Sequelize.STRING },
    beta_tun: { type: Sequelize.FLOAT },

    aphc_arni_name: { type: Sequelize.STRING },
    aphc_arni_tun: { type: Sequelize.FLOAT },

    ahfs_name: { type: Sequelize.STRING },
    ahfs_tun: { type: Sequelize.FLOAT },

    //
    aort_vel: { type: Sequelize.FLOAT }, //float
    aort_pg_mean: { type: Sequelize.FLOAT }, //float
    aort_pg_max: { type: Sequelize.FLOAT }, //float
    aort_as: { type: Sequelize.INTEGER }, //int
    aort_ar: { type: Sequelize.INTEGER }, //int
    he_2xx_vel: { type: Sequelize.FLOAT }, //float
    he_2xx_pg_mean: { type: Sequelize.FLOAT }, //float
    he_2xx_pg_max: { type: Sequelize.FLOAT }, //float
    he_2xx_ms: { type: Sequelize.INTEGER }, //int
    he_2xx_mr: { type: Sequelize.INTEGER }, //int
    he_3xx_vel: { type: Sequelize.FLOAT }, //float
    he_3xx_pg_max: { type: Sequelize.FLOAT }, //float
    he_3xx_ts: { type: Sequelize.INTEGER }, //int
    he_3xx_tr: { type: Sequelize.INTEGER }, //int
    uushig_vel: { type: Sequelize.FLOAT }, //float
    uushig_pg_max: { type: Sequelize.FLOAT }, //float
    uushig_ps: { type: Sequelize.INTEGER }, //int
    uushig_pr: { type: Sequelize.INTEGER }, //int

    havhlaga_dugnelt: { type: Sequelize.INTEGER }, //int
    havhlaga_dugnelt_other: { type: Sequelize.STRING }, //nvarchar

    u_h_date: { type: Sequelize.DATE }, //nvarchar
    u_h_tte: { type: Sequelize.FLOAT }, //float
    u_h_tee: { type: Sequelize.FLOAT }, //float
    u_h_anteroinferor: { type: Sequelize.INTEGER }, //int
    u_h_posterosuperior: { type: Sequelize.INTEGER }, //int
    u_h_aortic: { type: Sequelize.INTEGER }, //int
    u_h_posterior: { type: Sequelize.INTEGER }, //int
    u_h_inferior: { type: Sequelize.INTEGER }, //int
    u_h_superior: { type: Sequelize.INTEGER }, //int
    u_h_la_size: { type: Sequelize.FLOAT }, //float
    u_h_mv: { type: Sequelize.INTEGER }, //int
    u_h_ven_orolt: { type: Sequelize.STRING }, //int
    u_h_uad: { type: Sequelize.FLOAT }, //float
    u_h_bx_size: { type: Sequelize.FLOAT }, //float
    u_h_bt_size: { type: Sequelize.FLOAT }, //float
    u_h_tapse: { type: Sequelize.FLOAT }, //float
    u_h_arter: { type: Sequelize.FLOAT }, //float
    u_h_shunt: { type: Sequelize.STRING }, //int
    u_h_bt_dd: { type: Sequelize.FLOAT }, //float
    u_h_zt_dd: { type: Sequelize.FLOAT }, //float
    u_h_ua_dd: { type: Sequelize.FLOAT }, //float
    u_h_balloon_size: { type: Sequelize.FLOAT }, //float
    u_h_asd: { type: Sequelize.FLOAT }, //float
    u_h_fluoroscopy_hour: { type: Sequelize.FLOAT }, //float
    u_h_emboli: { type: Sequelize.FLOAT }, //float
  },
  {
    sequelize,
    tableName: 'CongenitalMalformations',
    modelName: 'CongenitalMalformations',
    timestamps: false,
  }
);

CongenitalMalformations.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

CongenitalMalformations.SetAssocations = (Models) => {
  CongenitalMalformations.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  CongenitalMalformations.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  CongenitalMalformations.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  CongenitalMalformations.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  CongenitalMalformations.hasMany(Models.CongenitalMalformationsLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

CongenitalMalformations.SetFunctions = (Models) => {
  CongenitalMalformations.findAllNew = async function (Option) {
    const result = await CongenitalMalformations.findAll({
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
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
      ],
    });
    return result;
  };

  CongenitalMalformations.findAllDetail = async function (Option) {
    const result = await CongenitalMalformations.findAll({
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
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
          ],
        },
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
        { model: Models.CongenitalMalformationsLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = CongenitalMalformations;
