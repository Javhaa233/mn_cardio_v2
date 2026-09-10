const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class VascularDisease extends Sequelize.Model {}
VascularDisease.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    is_confirm: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    organization_id: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    CreatedDate: { type: Sequelize.DATE },
    UpdatedDate: { type: Sequelize.DATE },
    ConfirmUserId: { type: Sequelize.INTEGER },
    ConfirmedDate: { type: Sequelize.DATE },

    started_date: { type: Sequelize.DATE },
    diagnosed_date: { type: Sequelize.DATE },
    ad: { type: Sequelize.FLOAT },
    ad_deed: { type: Sequelize.FLOAT },
    ad_dood: { type: Sequelize.FLOAT },
    ztst: { type: Sequelize.INTEGER },
    undur: { type: Sequelize.FLOAT },
    jin: { type: Sequelize.FLOAT },
    bji: { type: Sequelize.FLOAT },
    bgt: { type: Sequelize.FLOAT },
    heartache: { type: Sequelize.INTEGER },
    heartache_other: { type: Sequelize.STRING },
    vd_ccs_angilal: { type: Sequelize.INTEGER },
    wbc: { type: Sequelize.FLOAT },
    rbc: { type: Sequelize.FLOAT },
    hgb: { type: Sequelize.FLOAT },
    hct: { type: Sequelize.FLOAT },
    plt: { type: Sequelize.FLOAT },

    // Холестеролын үзүүлэлтүүд
    ldl: { type: Sequelize.FLOAT },
    hdl: { type: Sequelize.FLOAT },
    cholesterine: { type: Sequelize.FLOAT },
    triglyceride: { type: Sequelize.FLOAT },
    non_cholesterine: { type: Sequelize.FLOAT },
    uldets_cholesterine: { type: Sequelize.FLOAT },

    kali: { type: Sequelize.FLOAT },
    creatinin: { type: Sequelize.FLOAT },
    creatinin_type: { type: Sequelize.INTEGER },
    mochevin: { type: Sequelize.FLOAT },
    egfr: { type: Sequelize.FLOAT },
    asat: { type: Sequelize.FLOAT },
    alam: { type: Sequelize.FLOAT },
    ferritin: { type: Sequelize.FLOAT },
    sensitive_crp: { type: Sequelize.FLOAT },
    nt_pro_np: { type: Sequelize.FLOAT },
    sanamsargui_glukoz: { type: Sequelize.FLOAT },
    hba_1_c: { type: Sequelize.FLOAT },
    troponin: { type: Sequelize.FLOAT },

    tsa_bichleg_date: { type: Sequelize.DATE },
    qrs_burdel: { type: Sequelize.INTEGER },
    rhythm: { type: Sequelize.INTEGER },
    rhythm_other: { type: Sequelize.STRING },
    zurh_horig: { type: Sequelize.INTEGER },
    zurh_horig_other: { type: Sequelize.STRING },
    giss_horig: { type: Sequelize.INTEGER },
    giss_horig_other: { type: Sequelize.STRING },
    vd_surug_t_shvd: { type: Sequelize.INTEGER },
    vd_st_buult: { type: Sequelize.INTEGER },
    vd_st_urgugdul: { type: Sequelize.INTEGER },
    vd_emgeg_q_shud: { type: Sequelize.INTEGER },
    vd_wellness: { type: Sequelize.INTEGER },

    het_avia_date: { type: Sequelize.DATE },
    lvdd: { type: Sequelize.INTEGER },
    lvds: { type: Sequelize.INTEGER },
    ivsd: { type: Sequelize.INTEGER },
    pwd: { type: Sequelize.INTEGER },
    lv_mass: { type: Sequelize.INTEGER },
    lvef_teicholz: { type: Sequelize.INTEGER },
    lvef_simpson_method: { type: Sequelize.INTEGER },
    lv_gls: { type: Sequelize.INTEGER },
    la_volume: { type: Sequelize.INTEGER },
    ee_med: { type: Sequelize.INTEGER },
    ee_lat: { type: Sequelize.INTEGER },
    dundaj_ee: { type: Sequelize.INTEGER },
    taslavch_e: { type: Sequelize.INTEGER },
    hajuu_hana_e: { type: Sequelize.INTEGER },
    uushig_systol_daralt: { type: Sequelize.INTEGER },
    tapse: { type: Sequelize.INTEGER },
    rv_fac: { type: Sequelize.INTEGER },

    // Ханын хөдөлгөөний алдагдал: хөдөлгөөний алдагдалтай сегментийг зурна уу
    segment1: { type: Sequelize.INTEGER },
    segment2: { type: Sequelize.INTEGER },
    segment3: { type: Sequelize.INTEGER },
    segment4: { type: Sequelize.INTEGER },
    segment5: { type: Sequelize.INTEGER },
    segment6: { type: Sequelize.INTEGER },
    segment7: { type: Sequelize.INTEGER },
    segment8: { type: Sequelize.INTEGER },
    segment9: { type: Sequelize.INTEGER },
    segment10: { type: Sequelize.INTEGER },
    segment11: { type: Sequelize.INTEGER },
    segment12: { type: Sequelize.INTEGER },
    segment13: { type: Sequelize.INTEGER },
    segment14: { type: Sequelize.INTEGER },
    segment15: { type: Sequelize.INTEGER },
    segment16: { type: Sequelize.INTEGER },
    segment17: { type: Sequelize.INTEGER },

    is_havhlaga_emgeg: { type: Sequelize.STRING },
    havhlaga_emgeg_shaltgaan: { type: Sequelize.INTEGER },
    havhlaga_emgeg_shaltgaan_other: { type: Sequelize.STRING },
    h_e_2xx_nar: { type: Sequelize.STRING },
    h_e_2xx_dut: { type: Sequelize.STRING },
    h_e_3xx_nar: { type: Sequelize.STRING },
    h_e_3xx_dut: { type: Sequelize.STRING },
    h_e_gol_sudas_nar: { type: Sequelize.STRING },
    h_e_gol_sudas_dut: { type: Sequelize.STRING },
    h_e_ua_nar: { type: Sequelize.STRING },
    h_e_ua_dut: { type: Sequelize.STRING },
    is_ach_tsa_bichleg: { type: Sequelize.STRING },
    vd_ach_tsa_bichleg: { type: Sequelize.INTEGER },
    bichleg_hariu_uye: { type: Sequelize.INTEGER },
    is_ach_zhash: { type: Sequelize.STRING },
    vd_ach_zhash: { type: Sequelize.INTEGER },
    is_zvrh_tsum_shinjilgee: { type: Sequelize.STRING },
    vd_zvrh_tsum_shinjilgee: { type: Sequelize.INTEGER },
    is_holter_ekg: { type: Sequelize.STRING },
    vd_holter_ekg: { type: Sequelize.INTEGER },

    // Титэм судасны компьютерт томографи
    is_titem_ktg: { type: Sequelize.STRING },
    vd_titem_ktg_dvgnelt: { type: Sequelize.INTEGER },
    vd_titem_ktg1: { type: Sequelize.INTEGER },
    vd_titem_ktg2: { type: Sequelize.INTEGER },
    vd_titem_ktg3: { type: Sequelize.INTEGER },
    vd_titem_ktg4: { type: Sequelize.INTEGER },
    vd_titem_ktg5: { type: Sequelize.INTEGER },
    vd_titem_ktg6: { type: Sequelize.INTEGER },
    vd_titem_ktg7: { type: Sequelize.INTEGER },
    vd_titem_ktg8: { type: Sequelize.INTEGER },
    vd_titem_ktg9: { type: Sequelize.INTEGER },
    vd_titem_ktg10: { type: Sequelize.INTEGER },
    vd_titem_ktg11: { type: Sequelize.INTEGER },
    vd_titem_ktg12: { type: Sequelize.INTEGER },
    vd_titem_ktg13: { type: Sequelize.INTEGER },
    vd_titem_ktg14: { type: Sequelize.INTEGER },
    vd_titem_ktg15: { type: Sequelize.INTEGER },

    titem_helber: { type: Sequelize.INTEGER },

    is_titem_dotuurh_onshilgoo: { type: Sequelize.STRING },
    titem_dotuurh_date: { type: Sequelize.DATE },
    vd_titem_dotuurh_dugnelt: { type: Sequelize.INTEGER },
    vd_titem_dotuurh_onshilgoo: { type: Sequelize.INTEGER },
    vd_titem_onshilgoond_nar_shalt: { type: Sequelize.INTEGER },
    vd_titem_onsh_nar_shalt_other: { type: Sequelize.STRING },
    titem_dotuurh_emchil_date: { type: Sequelize.DATE },

    vd_titem_dotuurh_emchilgee: { type: Sequelize.INTEGER },
    angio: { type: Sequelize.STRING },
    timi_lmca: { type: Sequelize.STRING },
    timi_lad: { type: Sequelize.STRING },
    timi_lcx: { type: Sequelize.STRING },
    timi_rca: { type: Sequelize.STRING },
    des_lmca: { type: Sequelize.STRING },
    des_lad: { type: Sequelize.STRING },
    des_lcx: { type: Sequelize.STRING },
    des_rca: { type: Sequelize.STRING },
    des_ramus: { type: Sequelize.STRING },
    vd_kag_hundrel: { type: Sequelize.INTEGER },
    vd_kag_hundrel_other: { type: Sequelize.STRING },

    vd_kag_hurts: { type: Sequelize.STRING },
    tugsgul: { type: Sequelize.STRING },
    cardiacarrest_admission: { type: Sequelize.STRING },
    grace_score: { type: Sequelize.STRING },
    time_riskscore: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'VascularDisease',
    modelName: 'VascularDisease',
    timestamps: false,
  }
);

VascularDisease.SearchField = [
  'Id',
  'PatRegNo',
  'StayId',
  'CreateUserId',
  'CreatedDate',
  'started_date',
  'diagnosed_date',
];

VascularDisease.SetAssocations = (Models) => {
  VascularDisease.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  VascularDisease.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  VascularDisease.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  VascularDisease.hasMany(Models.VascularDiseaseLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

VascularDisease.SetFunctions = (Models) => {
  VascularDisease.findAllNew = async function (Option) {
    const result = await VascularDisease.findAll({
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

  VascularDisease.findAllDetail = async function (Option) {
    const result = await VascularDisease.findAll({
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
        { model: Models.VascularDiseaseLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = VascularDisease;
