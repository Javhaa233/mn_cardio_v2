const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfHospitalization extends Sequelize.Model {}
HfHospitalization.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    is_confirm: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
    UpdatedDate: { type: Sequelize.DATE },
    ConfirmUserId: { type: Sequelize.INTEGER },
    ConfirmedDate: { type: Sequelize.DATE },

    hospitalized_date: { type: Sequelize.DATE },

    history_no: { type: Sequelize.STRING },
    hf_hevtelt: { type: Sequelize.STRING },
    or_honog: { type: Sequelize.FLOAT },
    tasag: { type: Sequelize.STRING },
    tasag_other: { type: Sequelize.STRING },
    or_honog_tulbur: { type: Sequelize.FLOAT },
    organization_id: { type: Sequelize.INTEGER },
    organization_other: { type: Sequelize.STRING },
    hf_hawsarsan_emgeg: { type: Sequelize.INTEGER },
    hort_havdar_notes: { type: Sequelize.STRING },
    other_notes: { type: Sequelize.STRING },
    hf_uwchinii_tvvh: { type: Sequelize.INTEGER },
    hf_uwchinii_tvvh_other: { type: Sequelize.STRING },
    hf_himiin_emchilgee_turul: { type: Sequelize.INTEGER },
    hf_himiin_emchilgee_other: { type: Sequelize.STRING },
    hf_suulgats_emchilgee_turul: { type: Sequelize.STRING },
    hf_pacemaker_turul: { type: Sequelize.STRING },
    hf_icd_turul: { type: Sequelize.STRING },
    hf_cardiomiopati_turul: { type: Sequelize.STRING },
    hf_asran_hamgaalagch: { type: Sequelize.STRING },
    hf_asran_hamgaalagch_other: { type: Sequelize.STRING },
    hf_tamhi: { type: Sequelize.INTEGER },
    hf_arhi: { type: Sequelize.INTEGER },

    b_ad: { type: Sequelize.STRING },
    b_ad_deed: { type: Sequelize.FLOAT },
    b_ad_dood: { type: Sequelize.FLOAT },
    b_dd: { type: Sequelize.STRING },
    b_dd_deed: { type: Sequelize.FLOAT },
    b_dd_dood: { type: Sequelize.FLOAT },
    b_ztst: { type: Sequelize.FLOAT },
    b_at: { type: Sequelize.FLOAT },
    b_undur: { type: Sequelize.FLOAT },
    b_jin: { type: Sequelize.FLOAT },
    b_bji: { type: Sequelize.FLOAT },
    b_bgt: { type: Sequelize.FLOAT },

    heartache: { type: Sequelize.INTEGER },
    heartache_other: { type: Sequelize.STRING },
    hf_zahiin_shinj: { type: Sequelize.STRING },
    hf_zahiin_shinj_code: { type: Sequelize.INTEGER },
    hf_uushig_shinj: { type: Sequelize.STRING },
    hf_uushig_shinj_code: { type: Sequelize.INTEGER },
    hf_zurh_shinj: { type: Sequelize.STRING },
    hf_zurh_shinj_code: { type: Sequelize.INTEGER },
    hf_hevliin_shinj: { type: Sequelize.STRING },
    hf_hevliin_shinj_code: { type: Sequelize.INTEGER },

    laboratory_test_date: { type: Sequelize.DATE },
    tsagaan_es: { type: Sequelize.FLOAT },
    ulaan_es: { type: Sequelize.FLOAT },
    yaltas_es: { type: Sequelize.FLOAT },
    niit_uurag: { type: Sequelize.FLOAT },
    gemoglobin: { type: Sequelize.FLOAT },
    natri: { type: Sequelize.FLOAT },
    kali: { type: Sequelize.FLOAT },
    sheesnii_huchil: { type: Sequelize.FLOAT },
    creatinin: { type: Sequelize.FLOAT },
    creatinin_type: { type: Sequelize.INTEGER },
    mochevin: { type: Sequelize.FLOAT },
    albumin: { type: Sequelize.FLOAT },
    t_sh_h: { type: Sequelize.FLOAT },
    alat: { type: Sequelize.FLOAT },
    asat: { type: Sequelize.FLOAT },
    g_g_t: { type: Sequelize.FLOAT },
    digoksin_level: { type: Sequelize.FLOAT },
    n_t_pro_b_n_p: { type: Sequelize.FLOAT },
    b_n_p: { type: Sequelize.FLOAT },
    saturatsi: { type: Sequelize.FLOAT },
    tumur: { type: Sequelize.FLOAT },
    ferritin: { type: Sequelize.FLOAT },
    ferritin_type: { type: Sequelize.FLOAT },
    sanamsargui_glukoz: { type: Sequelize.FLOAT },
    hb_a1c: { type: Sequelize.FLOAT },
    s_r_b: { type: Sequelize.FLOAT },

    // Зүрхний цахилгаан бичлэг
    tsa_bichleg_date: { type: Sequelize.DATE },
    qrs_burdel: { type: Sequelize.FLOAT },
    hf_rhythm: { type: Sequelize.INTEGER },
    hf_rhythm_other: { type: Sequelize.STRING },
    hf_zurh_horig: { type: Sequelize.INTEGER },
    hf_zurh_horig_other: { type: Sequelize.STRING },

    tseej_rent_date: { type: Sequelize.DATE },
    hf_tseej_rentgen_uurchlut: { type: Sequelize.INTEGER },
    hf_tseej_rentgen_uurchlut_other: { type: Sequelize.STRING },

    het_avia_date: { type: Sequelize.DATE },
    lvdd: { type: Sequelize.FLOAT },
    lvds: { type: Sequelize.FLOAT },
    ivss: { type: Sequelize.FLOAT },
    pwd: { type: Sequelize.FLOAT },
    lvmass: { type: Sequelize.FLOAT },
    lvef: { type: Sequelize.FLOAT },
    lv_strain: { type: Sequelize.FLOAT },
    la_volume: { type: Sequelize.FLOAT },
    la_area: { type: Sequelize.FLOAT },
    e_e_med: { type: Sequelize.FLOAT },
    e_e_lat: { type: Sequelize.FLOAT },
    e_med: { type: Sequelize.FLOAT },
    e_lat: { type: Sequelize.FLOAT },
    uushig_systol_daralt: { type: Sequelize.FLOAT },
    tapse: { type: Sequelize.FLOAT },
    rv_fac: { type: Sequelize.FLOAT },
    rvw_d: { type: Sequelize.FLOAT },
    havhlaga_emgeg: { type: Sequelize.STRING },
    h_e_2xx_nar: { type: Sequelize.STRING },
    h_e_2xx_dut: { type: Sequelize.STRING },
    h_e_3xx_nar: { type: Sequelize.STRING },
    h_e_3xx_dut: { type: Sequelize.STRING },
    h_e_gol_nar: { type: Sequelize.STRING },
    h_e_gol_dut: { type: Sequelize.STRING },
    h_e_ua_nar: { type: Sequelize.STRING },
    h_e_ua_dut: { type: Sequelize.STRING },
    mibi_date: { type: Sequelize.DATE },
    mri_date: { type: Sequelize.DATE },
    mibi_lvef: { type: Sequelize.FLOAT },
    mibi_rvef: { type: Sequelize.FLOAT },
    mri_lvef: { type: Sequelize.FLOAT },
    mri_rvef: { type: Sequelize.FLOAT },

    // Титэм
    titem_date: { type: Sequelize.DATE },
    hf_titem_dvgnelt: { type: Sequelize.STRING },
    hf_emlegt_hiigdsen_shinjilgee: { type: Sequelize.INTEGER },
    hya_biopsi_uurchlult: { type: Sequelize.STRING },
    hya_cardio_pul_vo_max: { type: Sequelize.STRING },
    hf_hewteh_uyd_hiigdsen_emchilgee: { type: Sequelize.INTEGER },
    hf_hevteh_uyed_suulgats_emchilgee_turul: { type: Sequelize.INTEGER },

    //
    hf_zvrh_dutagdal_shaltgaan: { type: Sequelize.INTEGER },
    hf_zvrh_dutagdal_shaltgaan_other: { type: Sequelize.STRING },
    hf_hewtehed_nuluuluh_huchin_zuils: { type: Sequelize.INTEGER },
    hf_emchilgee_dagaagui: { type: Sequelize.INTEGER },
    hf_hewtehed_nuluuluh_huchin_zuils_other: { type: Sequelize.STRING },

    is_life_quality: { type: Sequelize.STRING },
    life_minnesota: { type: Sequelize.FLOAT },
    kccq: { type: Sequelize.FLOAT },
    life_quality_other: { type: Sequelize.STRING },
    hf_nyha: { type: Sequelize.INTEGER },
    hf_hudulguun_chadvhi: { type: Sequelize.INTEGER },
    hf_amidraliin_idewhi: { type: Sequelize.INTEGER },
    hyanasan_eseh: { type: Sequelize.STRING },
    is_tamhinaas_garah: { type: Sequelize.STRING },
    is_bolovsrol: { type: Sequelize.STRING },
    is_hutulbur: { type: Sequelize.STRING },
    is_hevten_emchluuleh: { type: Sequelize.STRING },
    is_inotrop: { type: Sequelize.STRING },
    is_suulgats: { type: Sequelize.STRING },
    hf_suulgats_turul: { type: Sequelize.INTEGER },

    // Эмнэлгээс гарсан байдал
    hf_emnlegees_garah_uyiin_zowlomj: { type: Sequelize.INTEGER },
    hf_emnlegees_garah_uyiin_zowlomj_other: { type: Sequelize.STRING },

    is_hunguwchluh_emchilgee: { type: Sequelize.STRING },
    hf_hunguwchluh_emchilgee: { type: Sequelize.INTEGER },
    hf_hewteh_uyd_sanal_tuslamj_uilchilgee: { type: Sequelize.INTEGER },
    hf_hewteh_uyd_sanal_tuslamj_uilchilgee_other: { type: Sequelize.STRING },
    hf_emnlegees_garsan_baidal: { type: Sequelize.INTEGER },
    hf_hevteh_uyd_garsan_hvndrel: { type: Sequelize.INTEGER },
    hf_hem_aldagdal: { type: Sequelize.INTEGER },
    hf_hevteh_uyd_garsan_hvndrel_other: { type: Sequelize.STRING },

    is_hyanalt: { type: Sequelize.STRING },
    hf_ambultoriin_hynalt_sanal_bolgoogvi: { type: Sequelize.INTEGER },

    sergen_zasah: { type: Sequelize.STRING },
    hf_sergeen_zasah_emchilgee_notcheck: { type: Sequelize.INTEGER },
    sergen_zasah_not_other: { type: Sequelize.STRING },

    g_ad: { type: Sequelize.FLOAT },
    g_ad_deed: { type: Sequelize.FLOAT },
    g_ad_dood: { type: Sequelize.FLOAT },
    g_ztst: { type: Sequelize.FLOAT },
    g_jin: { type: Sequelize.FLOAT },

    // Эмнэлгээс гарах үеийн лабораторын шинжилгээ
    discharge_date: { type: Sequelize.DATE },
    g_tsagaan_es: { type: Sequelize.FLOAT },
    g_yaltas_es: { type: Sequelize.FLOAT },
    g_gemoglobin: { type: Sequelize.FLOAT },
    g_natri: { type: Sequelize.FLOAT },
    g_kali: { type: Sequelize.FLOAT },
    g_sheesnii_huchil: { type: Sequelize.FLOAT },
    g_creatinin: { type: Sequelize.FLOAT },
    g_creatinin_type: { type: Sequelize.INTEGER },
    g_mochevin: { type: Sequelize.FLOAT },
    g_alibumin: { type: Sequelize.FLOAT },
    g_t_sh_h: { type: Sequelize.FLOAT },
    g_alat: { type: Sequelize.FLOAT },
    g_asat: { type: Sequelize.FLOAT },
    g_g_g_t: { type: Sequelize.FLOAT },
    g_digoksin_level: { type: Sequelize.FLOAT },
    g_tumur: { type: Sequelize.FLOAT },
    g_ferritin: { type: Sequelize.FLOAT },
    g_ferritin_type: { type: Sequelize.FLOAT },
    g_n_t_pro_b_n_p: { type: Sequelize.FLOAT },
    g_b_n_p: { type: Sequelize.FLOAT },
    g_s_r_b: { type: Sequelize.FLOAT },
    g_hb_a1c: { type: Sequelize.FLOAT },
    g_sanamsargui_glukoz: { type: Sequelize.FLOAT },

    // Эмнэлгээс гарах үеийн эмийн эмчилгээний зөвлөмж
    g_hf_emchilgee_check: { type: Sequelize.INTEGER },
    g_hf_axpc_nershil: { type: Sequelize.INTEGER },
    g_hf_axpc_other: { type: Sequelize.STRING },
    g_hf_axpc_tun: { type: Sequelize.FLOAT },
    g_hf_apc_nershil: { type: Sequelize.INTEGER },
    g_hf_apc_other: { type: Sequelize.STRING },
    g_hf_apc_tun: { type: Sequelize.FLOAT },
    g_aphc_tun: { type: Sequelize.FLOAT },
    g_hf_emchilgee_notcheck: { type: Sequelize.INTEGER },
    g_hf_emchilgee_other: { type: Sequelize.STRING },

    g_is_beta_horiglogch: { type: Sequelize.STRING },
    g_hf_beta_horiglogch_nershil: { type: Sequelize.INTEGER },
    g_hf_beta_horiglogch_other: { type: Sequelize.STRING },
    g_hf_beta_horiglogch_tun: { type: Sequelize.FLOAT },

    g_is_mra: { type: Sequelize.STRING },
    g_hf_mra_check: { type: Sequelize.INTEGER },
    g_hf_mra_tun: { type: Sequelize.FLOAT },
    g_hf_mra_notcheck: { type: Sequelize.INTEGER },
    g_hf_mra_notcheck_other: { type: Sequelize.STRING },

    g_is_sglt2: { type: Sequelize.STRING },
    g_hf_sglt2_check: { type: Sequelize.INTEGER },
    g_hf_sglt2_tun: { type: Sequelize.FLOAT },
    g_hf_sglt2_notcheck: { type: Sequelize.INTEGER },
    g_hf_sglt2_notcheck_other: { type: Sequelize.STRING },

    g_is_ibabradin: { type: Sequelize.STRING },
    g_ibabradin_tun: { type: Sequelize.FLOAT },
    g_is_antitrombotic: { type: Sequelize.STRING },
    g_hf_antitrombotic_check: { type: Sequelize.INTEGER },
    g_hf_antitrombotic_other: { type: Sequelize.STRING },
    g_hf_antitrombotic_tun: { type: Sequelize.FLOAT },

    g_is_digoksin: { type: Sequelize.STRING },

    g_is_shees_huuh_em: { type: Sequelize.STRING },
    g_hf_shees_huuh_em_check: { type: Sequelize.INTEGER },
    g_hf_shees_huuh_em_other: { type: Sequelize.STRING },
    g_hf_shees_huuh_em_tun: { type: Sequelize.FLOAT },

    g_is_lipid_buuruulah: { type: Sequelize.STRING },
    g_hf_lipid_buuruulah_em_check: { type: Sequelize.INTEGER },
    g_hf_lipid_buuruulah_em_other: { type: Sequelize.STRING },
    g_hf_lipid_buuruulah_em_tun: { type: Sequelize.INTEGER },

    g_is_sudas_telegch: { type: Sequelize.STRING },
    g_hf_sudas_telegch_em_check: { type: Sequelize.STRING },
    g_hf_sudas_telegch_em_tun: { type: Sequelize.FLOAT },

    // Нас баралт
    nb_date: { type: Sequelize.DATE },
    hf_nas_baralt_shaltgaan: { type: Sequelize.STRING },
    hf_nas_baralt_shaltgaan_other: { type: Sequelize.STRING },
    hf_zurhnii_shaltgaant_nas_baralt: { type: Sequelize.STRING },
    hf_zurhnii_shaltgaant_nas_baralt_other: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfHospitalization',
    modelName: 'HfHospitalization',
    timestamps: false,
  }
);

HfHospitalization.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate', 'StartedDate'];

HfHospitalization.SetAssocations = (Models) => {
  HfHospitalization.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  HfHospitalization.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  HfHospitalization.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  HfHospitalization.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  HfHospitalization.hasMany(Models.HfHospitalizationLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

HfHospitalization.SetFunctions = (Models) => {
  HfHospitalization.findAllNew = async function (Option) {
    const result = await HfHospitalization.findAll({
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
      ],
    });
    return result;
  };

  HfHospitalization.findAllDetail = async function (Option) {
    const result = await HfHospitalization.findAll({
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
        { model: Models.HfHospitalizationLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = HfHospitalization;
