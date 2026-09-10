const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ValveDiseasesEndo extends Sequelize.Model {}

ValveDiseasesEndo.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    is_confirm: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    organization_id: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
    UpdatedDate: { type: Sequelize.DATE },
    ConfirmUserId: { type: Sequelize.INTEGER },
    ConfirmedDate: { type: Sequelize.DATE },

    StartedDate: { type: Sequelize.DATE },
    undur: { type: Sequelize.INTEGER },
    jin: { type: Sequelize.INTEGER },
    p_address: { type: Sequelize.STRING },
    onosh: { type: Sequelize.STRING },
    hawsarsan_onosh: { type: Sequelize.STRING },
    DiagnosedDate: { type: Sequelize.DATE },
    udamshil: { type: Sequelize.STRING },
    odoogiin_zowiur: { type: Sequelize.INTEGER },
    em_taria_hereglej_bga: { type: Sequelize.STRING },
    is_harvalt: { type: Sequelize.STRING },
    harvalt_zowiur: { type: Sequelize.INTEGER },
    harvalt_zowiur_other: { type: Sequelize.STRING },
    nyha: { type: Sequelize.INTEGER },

    zurhnii_uwchnii_tuuh: { type: Sequelize.INTEGER },
    suulgats_tuhuurumj: { type: Sequelize.INTEGER },
    zurhnii_uwchnii_tuuh_other: { type: Sequelize.STRING },

    ersdeluud: { type: Sequelize.INTEGER },

    // Эндокардитын вегитаци
    uuriin_havhlaga: { type: Sequelize.STRING },
    hiimel_havhlaga: { type: Sequelize.STRING },
    vegitasi_bairlal: { type: Sequelize.INTEGER },
    vegitasi_hemjee: { type: Sequelize.FLOAT },

    //

    // ОНОШИЛГОО, ШИНЖИЛГЭЭ

    // Лабораторийн шинжилгээ
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

    // biohimi
    mochevin: { type: Sequelize.FLOAT },
    creatinin: { type: Sequelize.FLOAT },
    creatinin_type: { type: Sequelize.INTEGER },
    aslo: { type: Sequelize.FLOAT },
    crb: { type: Sequelize.FLOAT },
    rf: { type: Sequelize.FLOAT },
    niit_uurag: { type: Sequelize.FLOAT },
    alibumin: { type: Sequelize.FLOAT },
    asat: { type: Sequelize.FLOAT },
    alat: { type: Sequelize.FLOAT },
    niit_bilirubin: { type: Sequelize.FLOAT },
    ggt: { type: Sequelize.FLOAT },
    glukoz: { type: Sequelize.FLOAT },

    is_hbs_ag: { type: Sequelize.STRING },
    is_hcv: { type: Sequelize.STRING },
    is_tembvv: { type: Sequelize.STRING },
    is_hiv: { type: Sequelize.STRING },

    ztsb_date: { type: Sequelize.DATE },
    rhythm: { type: Sequelize.INTEGER },
    rhythm_other: { type: Sequelize.STRING },

    is_ct_mri: { type: Sequelize.STRING },
    ct_mri_garsan_uurchlult: { type: Sequelize.STRING },

    ih_shalguur: { type: Sequelize.INTEGER },
    endo_hundrel: { type: Sequelize.INTEGER },
    antibiotic_name: { type: Sequelize.STRING },
    antibiotic_days: { type: Sequelize.INTEGER },

    // Nas baralt
    is_nas_baralt: { type: Sequelize.STRING },
    vvd_nas_baralt: { type: Sequelize.INTEGER },
    nas_baralt_shaltgaan: { type: Sequelize.INTEGER },

    is_mes_zasald_orson: { type: Sequelize.STRING },
    havhlaga_bairlal: { type: Sequelize.STRING },
    havhlaga_turul: { type: Sequelize.STRING },
    davtan_mes_zasal_date: { type: Sequelize.DATE },
    hoish_days: { type: Sequelize.FLOAT },

    is_davtan_mes_zasal: { type: Sequelize.STRING },
    is_haldvart_dahisan: { type: Sequelize.STRING },

    het_awia_date: { type: Sequelize.DATE },
    lvdd: { type: Sequelize.STRING },
    lvds: { type: Sequelize.STRING },
    ivsd: { type: Sequelize.STRING },
    pwd: { type: Sequelize.STRING },
    lv_massi: { type: Sequelize.STRING },
    lvef: { type: Sequelize.STRING },
    lv_cls: { type: Sequelize.STRING },
    la_volume: { type: Sequelize.STRING },
    ee_med: { type: Sequelize.STRING },
    ee_lat: { type: Sequelize.STRING },
    dundaj_ee: { type: Sequelize.STRING },
    taslawch_e: { type: Sequelize.STRING },
    hajuu_hana_e: { type: Sequelize.STRING },
    uushig_systol_daralt: { type: Sequelize.STRING },
    tapse: { type: Sequelize.STRING },
    rv_fac: { type: Sequelize.STRING },
    is_2xx_nar: { type: Sequelize.STRING },
    vvd2xx_nar_shaltgaan: { type: Sequelize.STRING },
    vvd2xx_nar_shaltgaan_other: { type: Sequelize.STRING },
    vvd2xx_nar_zereg: { type: Sequelize.STRING },
    planometry: { type: Sequelize.STRING },
    pht: { type: Sequelize.STRING },
    mv_mean_pg: { type: Sequelize.STRING },
    mv_pht: { type: Sequelize.STRING },
    vilkinsiin_shal_onoo: { type: Sequelize.STRING },
    is_2xx_dut: { type: Sequelize.STRING },
    vvd2xx_dut_shaltgaan: { type: Sequelize.STRING },
    vvd2xx_dut_shaltgaan_other: { type: Sequelize.STRING },
    vvd2xx_dut_zereg: { type: Sequelize.STRING },
    mr_eroa: { type: Sequelize.STRING },
    mr_vena_contract: { type: Sequelize.STRING },
    mr_volume: { type: Sequelize.STRING },
    mr_fraction_rate: { type: Sequelize.STRING },
    mr_zuun_tosguur_hubi: { type: Sequelize.STRING },

    is_gol_sudas_nar: { type: Sequelize.STRING },
    gol_sudas_nar_shaltgaan: { type: Sequelize.INTEGER },
    gol_sudas_nar_shaltgaan_other: { type: Sequelize.STRING },
    gol_sudas_nar_zereg: { type: Sequelize.INTEGER },
    gol_sudas_planometry: { type: Sequelize.FLOAT },
    aov_mean_pg: { type: Sequelize.FLOAT },
    aov_v_max: { type: Sequelize.FLOAT },
    aov_pg_max: { type: Sequelize.FLOAT },

    is_gol_sudas_dut: { type: Sequelize.STRING },
    gol_sudas_dut_shaltgaan: { type: Sequelize.INTEGER },
    gol_sudas_dut_shaltgaan_other: { type: Sequelize.STRING },
    gol_sudas_dut_zereg: { type: Sequelize.INTEGER },
    ao_reg_pht: { type: Sequelize.FLOAT },
    aor_vol: { type: Sequelize.FLOAT },
    aor_eroa: { type: Sequelize.FLOAT },

    titem_date: { type: Sequelize.DATE },
    dvgnelt: { type: Sequelize.INTEGER },
    rentgen_kti: { type: Sequelize.FLOAT },
    agatsonii_onoo: { type: Sequelize.FLOAT },
    kaltsiin_onoo: { type: Sequelize.FLOAT },

    is_nyan: { type: Sequelize.STRING },
    nyan: { type: Sequelize.STRING },
    euro_score_logistic: { type: Sequelize.STRING },
    jin_mes_umnu: { type: Sequelize.STRING },
    undur_mes_umnu: { type: Sequelize.STRING },
    tamhi: { type: Sequelize.STRING },
    chihriin_shijin: { type: Sequelize.STRING },

    ad_ihselt: { type: Sequelize.STRING },
    is_uuh_tos_soliltsoo_uurchlult: { type: Sequelize.STRING },
    vvd_buurnii_emgeg: { type: Sequelize.STRING },
    vvd_uushig_arhag_emgeg: { type: Sequelize.STRING },
    vvd_busad_sudasnii_emgeg: { type: Sequelize.STRING },
    vvd_tarhi_sudasnii_emgeg: { type: Sequelize.STRING },

    is_medrel_v_a_a: { type: Sequelize.STRING },
    gvree_arter_shum: { type: Sequelize.STRING },
    mes_umnu_z_rhythm: { type: Sequelize.STRING },
    mes_umnu_z_rhythm_other: { type: Sequelize.STRING },

    a_gol_sud_nar: { type: Sequelize.INTEGER },
    a_gol_sud_dut: { type: Sequelize.INTEGER },
    a_gol_sud_mes_ajil: { type: Sequelize.INTEGER },
    a_gol_sud_imp_type: { type: Sequelize.INTEGER },
    a_mit_nar: { type: Sequelize.INTEGER },
    a_mit_dut: { type: Sequelize.INTEGER },
    a_mit_mes_ajil: { type: Sequelize.INTEGER },
    a_mit_imp_type: { type: Sequelize.INTEGER },
    a_vvd3xx_nar: { type: Sequelize.INTEGER },
    a_vvd3xx_dut: { type: Sequelize.INTEGER },
    a_vvd3xx_mes_ajil: { type: Sequelize.INTEGER },
    a_vvd3xx_imp_type: { type: Sequelize.INTEGER },
    a_ua_nar: { type: Sequelize.INTEGER },
    a_ua_dut: { type: Sequelize.INTEGER },
    a_ua_mes_ajil: { type: Sequelize.INTEGER },
    a_ua_imp_type: { type: Sequelize.INTEGER },

    implant_kod1: { type: Sequelize.STRING },
    implant_kod2: { type: Sequelize.STRING },
    implant_kod3: { type: Sequelize.STRING },
    implant_kod4: { type: Sequelize.STRING },
    st_jude_medical_hemjee: { type: Sequelize.STRING },
    medtronic_hemjee: { type: Sequelize.STRING },
    is_bental_mes: { type: Sequelize.STRING },
    is_devid_mes: { type: Sequelize.STRING },
    is_tsus_aldagdal: { type: Sequelize.STRING },
    is_hem_aldagdal: { type: Sequelize.STRING },
    is_tarhinii_tsus_harwalt: { type: Sequelize.STRING },
    is_olon_erhtnii_dutagdal: { type: Sequelize.STRING },
    is_vjil: { type: Sequelize.STRING },
    vvd_mes_daraah_ehokg: { type: Sequelize.STRING },
    hiimel_hawh_hemjee: { type: Sequelize.STRING },
    hiimel_hawh_turul: { type: Sequelize.STRING },

    mes_zasal_date: { type: Sequelize.DATE },
    ad_deed: { type: Sequelize.STRING },
    ad_dood: { type: Sequelize.STRING },
    pulse: { type: Sequelize.STRING },
    undur_mes_daraa: { type: Sequelize.STRING },
    jin_mes_daraa: { type: Sequelize.STRING },
    bmi: { type: Sequelize.STRING },

    hiimel_date: { type: Sequelize.DATE },
    is_gaduur_ursgal: { type: Sequelize.STRING },
    vvd_hiimel_bvtets_hud: { type: Sequelize.STRING },
    hiimel_dundaj_daralt: { type: Sequelize.STRING },
    reg_hundiin_zereg: { type: Sequelize.STRING },
    zvvn_tosguur: { type: Sequelize.STRING },
    zvvn_howdol: { type: Sequelize.STRING },
    zvvn_howdol_agshih_chadwar: { type: Sequelize.STRING },
    is_uad_ihselt: { type: Sequelize.STRING },
    spap: { type: Sequelize.STRING },

    inr_date: { type: Sequelize.DATE },
    mes_daraa_inr: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ValveDiseasesEndo',
    modelName: 'ValveDiseasesEndo',
    timestamps: false,
  }
);

ValveDiseasesEndo.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

ValveDiseasesEndo.SetAssocations = (Models) => {
  ValveDiseasesEndo.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  ValveDiseasesEndo.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  ValveDiseasesEndo.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  ValveDiseasesEndo.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  ValveDiseasesEndo.hasMany(Models.ValveDiseasesEndoLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

ValveDiseasesEndo.SetFunctions = (Models) => {
  ValveDiseasesEndo.findAllNew = async function (Option) {
    const result = await ValveDiseasesEndo.findAll({
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
          include: [{ model: Models.vwGender, as: 'Gender' }],
        },
      ],
    });
    return result;
  };

  ValveDiseasesEndo.findAllDetail = async function (Option) {
    const result = await ValveDiseasesEndo.findAll({
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
        { model: Models.ValveDiseasesEndoLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };

  ValveDiseasesEndo.GetLookUpData = async function (DataId) {
    const result = await Models.ValveDiseasesEndoLookUp.findAll({
      where: { id_data: DataId },
    });
    return result;
  };
};

module.exports = ValveDiseasesEndo;
