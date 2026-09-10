const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfAmbulanceTest extends Sequelize.Model {}
HfAmbulanceTest.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    AmbulanceId: { type: Sequelize.INTEGER },
    test_date: { type: Sequelize.DATE },

    tsagaan_es: { type: Sequelize.FLOAT },
    yaltas_es: { type: Sequelize.FLOAT },
    gemoglobin: { type: Sequelize.FLOAT },
    natri: { type: Sequelize.FLOAT },
    kali: { type: Sequelize.FLOAT },
    sheesnii_huchil: { type: Sequelize.FLOAT },
    creatinin: { type: Sequelize.FLOAT },
    mochevin: { type: Sequelize.FLOAT },
    albumin: { type: Sequelize.FLOAT },
    t_sh_h: { type: Sequelize.FLOAT },
    alat: { type: Sequelize.FLOAT },
    s_r_b: { type: Sequelize.FLOAT },
    asat: { type: Sequelize.FLOAT },
    g_g_t: { type: Sequelize.FLOAT },
    digoksin_level: { type: Sequelize.FLOAT },
    tumur: { type: Sequelize.FLOAT },
    ferritin: { type: Sequelize.FLOAT },
    ferritin_type: { type: Sequelize.INTEGER },
    n_t_pro_b_n_p: { type: Sequelize.FLOAT },
    b_n_p: { type: Sequelize.FLOAT },
    hb_a1c: { type: Sequelize.FLOAT },
    sanamsargui_glukoz: { type: Sequelize.FLOAT },

    tsa_bichleg_date: { type: Sequelize.DATE },
    qrs_burdel: { type: Sequelize.FLOAT },

    hf_rhythm: { type: Sequelize.INTEGER },
    hf_rhythm_other: { type: Sequelize.STRING },
    hf_zurh_horig: { type: Sequelize.INTEGER },
    hf_zurh_horig_other: { type: Sequelize.STRING },

    het_avia_date: { type: Sequelize.DATE },
    lvdd: { type: Sequelize.FLOAT },
    lvds: { type: Sequelize.FLOAT },
    ivss: { type: Sequelize.FLOAT },
    pwd: { type: Sequelize.FLOAT },
    lvmass: { type: Sequelize.FLOAT },
    lvef: { type: Sequelize.FLOAT },
    lv_strain: { type: Sequelize.FLOAT },
    la_volume: { type: Sequelize.FLOAT },
    e_e_med: { type: Sequelize.FLOAT },
    e_e_lat: { type: Sequelize.FLOAT },
    e_med: { type: Sequelize.FLOAT },
    e_lat: { type: Sequelize.FLOAT },
    uushig_systol_daralt: { type: Sequelize.FLOAT },
    tapse: { type: Sequelize.FLOAT },
    rvw_d: { type: Sequelize.FLOAT },
    rv_fac: { type: Sequelize.FLOAT },

    havhlaga_emgeg: { type: Sequelize.STRING },
    h_e_2xx_nar: { type: Sequelize.INTEGER },
    h_e_2xx_dut: { type: Sequelize.INTEGER },
    h_e_3xx_nar: { type: Sequelize.INTEGER },
    h_e_3xx_dut: { type: Sequelize.INTEGER },
    h_e_gol_nar: { type: Sequelize.INTEGER },
    h_e_gol_dut: { type: Sequelize.INTEGER },
    h_e_ua_nar: { type: Sequelize.INTEGER },
    h_e_ua_dut: { type: Sequelize.INTEGER },

    mibi_date: { type: Sequelize.DATE },
    mri_date: { type: Sequelize.DATE },
    mibi_lvef: { type: Sequelize.FLOAT },
    mibi_rvef: { type: Sequelize.FLOAT },
    mri_lvef: { type: Sequelize.FLOAT },
    mri_rvef: { type: Sequelize.FLOAT },

    titem_date: { type: Sequelize.DATE },
    hf_titem_dvgnelt: { type: Sequelize.INTEGER },
    other_test_code: { type: Sequelize.STRING },
    is_biopsi_uurchlult: { type: Sequelize.STRING },
    biopsi_uurchlult: { type: Sequelize.STRING },
    is_cardio_pul_vo_max: { type: Sequelize.STRING },
    cardio_pul_vo_max: { type: Sequelize.FLOAT },
  },
  {
    sequelize,
    tableName: 'HfAmbulanceTest',
    modelName: 'HfAmbulanceTest',
    timestamps: false,
  }
);

HfAmbulanceTest.SetAssocations = (Models) => {
  HfAmbulanceTest.belongsTo(Models.HfAmbulanceTest, {
    as: 'HfAmbulanceTest',
    foreignKey: 'AmbulanceId',
  });
  HfAmbulanceTest.hasMany(Models.HfAmbulanceTestLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

HfAmbulanceTest.SetFunctions = (Models) => {
  HfAmbulanceTest.findAllDetail = async function (Option) {
    const result = await HfAmbulanceTest.findAll({
      ...Option,
      include: [{ model: Models.HfAmbulanceTestLookUp, as: 'LookUpData' }],
    });
    return result;
  };
};

module.exports = HfAmbulanceTest;
