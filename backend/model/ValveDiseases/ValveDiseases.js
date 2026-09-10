const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ValveDiseases extends Sequelize.Model {}

ValveDiseases.init(
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

    vzlegiin_zowiur: { type: Sequelize.INTEGER },
    vzlegiin_zowiur_other: { type: Sequelize.STRING },
    nyha: { type: Sequelize.INTEGER },

    ShinjilgeeDate: { type: Sequelize.DATE },
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

    het_awia_date: { type: Sequelize.DATE },
    lvdd: { type: Sequelize.FLOAT },
    lvds: { type: Sequelize.FLOAT },
    ivsd: { type: Sequelize.FLOAT },
    pwd: { type: Sequelize.FLOAT },
    lv_massi: { type: Sequelize.FLOAT },
    lvef: { type: Sequelize.FLOAT },
    lv_cls: { type: Sequelize.FLOAT },
    la_volume: { type: Sequelize.FLOAT },
    ee_med: { type: Sequelize.FLOAT },
    ee_lat: { type: Sequelize.FLOAT },
    dundaj_ee: { type: Sequelize.FLOAT },
    taslawch_e: { type: Sequelize.FLOAT },
    hajuu_hana_e: { type: Sequelize.FLOAT },
    uushig_systol_daralt: { type: Sequelize.FLOAT },
    tapse: { type: Sequelize.FLOAT },
    rv_fac: { type: Sequelize.FLOAT },
    is_2xx_nar: { type: Sequelize.STRING },
    vvd2xx_nar_shaltgaan: { type: Sequelize.INTEGER },
    vvd2xx_nar_shaltgaan_other: { type: Sequelize.STRING },
    vvd2xx_nar_zereg: { type: Sequelize.INTEGER },
    planometry: { type: Sequelize.FLOAT },
    pht: { type: Sequelize.FLOAT },
    mv_mean_pg: { type: Sequelize.FLOAT },
    mv_pht: { type: Sequelize.FLOAT },
    vilkinsiin_shal_onoo: { type: Sequelize.FLOAT },

    is_2xx_dut: { type: Sequelize.STRING },
    vvd2xx_dut_shaltgaan: { type: Sequelize.INTEGER },
    vvd2xx_dut_shaltgaan_other: { type: Sequelize.STRING },
    vvd2xx_dut_zereg: { type: Sequelize.INTEGER },

    mr_eroa: { type: Sequelize.FLOAT },
    mr_vena_contract: { type: Sequelize.FLOAT },
    mr_volume: { type: Sequelize.FLOAT },
    mr_fraction_rate: { type: Sequelize.FLOAT },
    mr_zuun_tosguur_hubi: { type: Sequelize.FLOAT },

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
    euro_score_logistic: { type: Sequelize.FLOAT },
    jin_mes_umnu: { type: Sequelize.FLOAT },
    undur_mes_umnu: { type: Sequelize.FLOAT },
    tamhi: { type: Sequelize.INTEGER },
    chihriin_shijin: { type: Sequelize.INTEGER },
    ad_ihselt: { type: Sequelize.INTEGER },

    is_uuh_tos_soliltsoo_uurchlult: { type: Sequelize.STRING },
    vvd_buurnii_emgeg: { type: Sequelize.INTEGER },
    vvd_uushig_arhag_emgeg: { type: Sequelize.INTEGER },
    vvd_busad_sudasnii_emgeg: { type: Sequelize.INTEGER },
    vvd_tarhi_sudasnii_emgeg: { type: Sequelize.INTEGER },

    is_medrel_v_a_a: { type: Sequelize.STRING },
    gvree_arter_shum: { type: Sequelize.STRING },
    mes_umnu_z_rhythm: { type: Sequelize.INTEGER },
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

    implant_kod1: { type: Sequelize.FLOAT },
    implant_kod2: { type: Sequelize.FLOAT },
    implant_kod3: { type: Sequelize.FLOAT },
    implant_kod4: { type: Sequelize.FLOAT },
    st_jude_medical_hemjee: { type: Sequelize.INTEGER },
    medtronic_hemjee: { type: Sequelize.INTEGER },
    is_bental_mes: { type: Sequelize.STRING },
    is_devid_mes: { type: Sequelize.STRING },
    is_tsus_aldagdal: { type: Sequelize.STRING },
    is_hem_aldagdal: { type: Sequelize.STRING },
    is_tarhinii_tsus_harwalt: { type: Sequelize.STRING },
    is_olon_erhtnii_dutagdal: { type: Sequelize.STRING },
    is_vjil: { type: Sequelize.STRING },
    vvd_mes_daraah_ehokg: { type: Sequelize.INTEGER },
    hiimel_hawh_hemjee: { type: Sequelize.STRING },
    hiimel_hawh_turul: { type: Sequelize.STRING },

    mes_zasal_date: { type: Sequelize.DATE },
    ad_deed: { type: Sequelize.FLOAT },
    ad_dood: { type: Sequelize.FLOAT },
    pulse: { type: Sequelize.FLOAT },
    undur_mes_daraa: { type: Sequelize.FLOAT },
    jin_mes_daraa: { type: Sequelize.FLOAT },
    bmi: { type: Sequelize.FLOAT },

    hiimel_date: { type: Sequelize.DATE },
    is_gaduur_ursgal: { type: Sequelize.STRING },
    vvd_hiimel_bvtets_hud: { type: Sequelize.FLOAT },
    hiimel_dundaj_daralt: { type: Sequelize.FLOAT },
    reg_hundiin_zereg: { type: Sequelize.FLOAT },
    zvvn_tosguur: { type: Sequelize.FLOAT },
    zvvn_howdol: { type: Sequelize.FLOAT },
    zvvn_howdol_agshih_chadwar: { type: Sequelize.FLOAT },
    is_uad_ihselt: { type: Sequelize.STRING },
    spap: { type: Sequelize.FLOAT },

    inr_date: { type: Sequelize.DATE },
    mes_daraa_inr: { type: Sequelize.FLOAT },
  },
  {
    sequelize,
    tableName: 'ValveDiseases',
    modelName: 'ValveDiseases',
    timestamps: false,
  }
);

ValveDiseases.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

ValveDiseases.SetAssocations = (Models) => {
  ValveDiseases.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  ValveDiseases.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  ValveDiseases.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  ValveDiseases.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  ValveDiseases.hasMany(Models.ValveDiseasesLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

ValveDiseases.SetFunctions = (Models) => {
  ValveDiseases.findAllNew = async function (Option) {
    const result = await ValveDiseases.findAll({
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

  ValveDiseases.findAllDetail = async function (Option) {
    const result = await ValveDiseases.findAll({
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
        { model: Models.ValveDiseasesLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };

  ValveDiseases.GetLookUpData = async function (DataId) {
    const result = await Models.ValveDiseasesLookUp.findAll({
      where: { id_data: DataId },
    });
    return result;
  };
};

module.exports = ValveDiseases;
