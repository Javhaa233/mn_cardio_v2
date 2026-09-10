const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ICDRhythm extends Sequelize.Model {}

ICDRhythm.init(
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

    organization_id: { type: Sequelize.INTEGER },
    organization_other: { type: Sequelize.STRING },

    // II. Эмнэлэгт хэвтэх үеийн бүртгэл
    suulgasan_ognoo: { type: Sequelize.STRING },
    now_age: { type: Sequelize.FLOAT },
    suulgasan_baidal: { type: Sequelize.INTEGER },
    suulgasan_baidal_other: { type: Sequelize.STRING },
    hevtsen_ognoo: { type: Sequelize.STRING },
    garsan_ognoo: { type: Sequelize.STRING },
    monitoring_hostpital_name: { type: Sequelize.STRING },
    code: { type: Sequelize.STRING },

    // III. Өвчний түүх болон эрсдэлт хүчин зүйлс
    anhdagch: { type: Sequelize.INTEGER },
    anhdagch_other: { type: Sequelize.STRING },
    hoyordogch: { type: Sequelize.INTEGER },
    hoyordogch_other: { type: Sequelize.STRING },

    hem_aldagdal_helber: { type: Sequelize.INTEGER },
    hem_aldagdal_helber_other: { type: Sequelize.STRING },

    zurh_suuri_emgeg: { type: Sequelize.INTEGER },
    zurh_suuri_emgeg_other: { type: Sequelize.INTEGER },
    // Зүүн ховдлын EF (%)
    zuun_hovdol_ef: { type: Sequelize.FLOAT },

    // IV. Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс
    daralt_ihselt: { type: Sequelize.INTEGER },
    uuh_tos_uurchlult: { type: Sequelize.INTEGER },
    chihriin_shijin: { type: Sequelize.INTEGER },
    ishemi_urid: { type: Sequelize.STRING },
    zurh_genet_uhel: { type: Sequelize.STRING },
    tamhidalt: { type: Sequelize.INTEGER },
    tamhinaas_garsan_hugatsaa: { type: Sequelize.STRING },
    dundaj_tamhinii_too: { type: Sequelize.STRING },
    // arhi_hereglee: { type: Sequelize.INTEGER },
    // arhinaas_garsan_hugatsaa: { type: Sequelize.STRING },

    // V. Бусад онцлох өвчний түүх
    hereg_emgeg: { type: Sequelize.STRING },
    havhlaga_gajig_mes: { type: Sequelize.STRING },
    y_havhlaga_gajig_mes: { type: Sequelize.STRING },
    cardiomiopati: { type: Sequelize.STRING },
    arhag_dutagdal: { type: Sequelize.STRING },
    miokardit: { type: Sequelize.STRING },
    haldvart_endokardit: { type: Sequelize.STRING },
    y_haldvart_endokardit: { type: Sequelize.INTEGER },
    y_uusgech: { type: Sequelize.STRING },
    buur_dutagdal: { type: Sequelize.INTEGER },
    umnu_tarhi_sudas: { type: Sequelize.STRING },
    y_umnu_tarhi_sudass: { type: Sequelize.INTEGER },
    is_tisde: { type: Sequelize.STRING },
    tisde_date: { type: Sequelize.DATE },
    is_gabg: { type: Sequelize.STRING },
    gabg_date: { type: Sequelize.DATE },
    is_other_uvchin: { type: Sequelize.STRING },
    y_other_uvchin: { type: Sequelize.STRING },

    // VI. ICD суулгах ажилбар
    helber: { type: Sequelize.INTEGER },
    zuun_hovdol: { type: Sequelize.INTEGER },

    electrid_behelgee_bt: { type: Sequelize.INTEGER },
    electrid_behelgee_bh: { type: Sequelize.INTEGER },
    electrid_behelgee_zh: { type: Sequelize.INTEGER },
    hatgalt_sudas_bt: { type: Sequelize.INTEGER },
    hatgalt_sudas_bh: { type: Sequelize.INTEGER },
    hatgalt_sudas_zh: { type: Sequelize.INTEGER },
    electrod_zagvar_bt: { type: Sequelize.INTEGER },
    electrod_zagvar_bt_other: { type: Sequelize.STRING },
    electrod_zagvar_bh: { type: Sequelize.INTEGER },
    electrod_zagvar_bh_other: { type: Sequelize.STRING },
    electrod_zagvar_zh: { type: Sequelize.INTEGER },
    electrod_zagvar_zh_other: { type: Sequelize.STRING },

    electrod_bairlal_bt: { type: Sequelize.INTEGER },
    electrod_bairlal_bh: { type: Sequelize.INTEGER },
    electrod_bairlal_zh: { type: Sequelize.STRING },
    electrod_bairlal_zh_bhajuu: { type: Sequelize.INTEGER },
    electrod_bairlal_zh_zhajuu: { type: Sequelize.INTEGER },

    electrod_zagvar_no: { type: Sequelize.STRING },
    electrod_zagvar_no_bt: { type: Sequelize.STRING },
    electrod_zagvar_no_bh: { type: Sequelize.STRING },
    electrod_zagvar_no_zh: { type: Sequelize.STRING },

    electrod_serial_no: { type: Sequelize.STRING },
    electrod_serial_no_bt: { type: Sequelize.STRING },
    electrod_serial_no_bh: { type: Sequelize.STRING },
    electrod_serial_no_zh: { type: Sequelize.STRING },

    pr_amp: { type: Sequelize.STRING },
    pr_amp_bt: { type: Sequelize.STRING },
    pr_amp_bh: { type: Sequelize.STRING },
    pr_amp_zh: { type: Sequelize.STRING },

    slew_rate: { type: Sequelize.STRING },
    slew_rate_bt: { type: Sequelize.STRING },
    slew_rate_bh: { type: Sequelize.STRING },
    slew_rate_zh: { type: Sequelize.STRING },

    pacing_thres: { type: Sequelize.STRING },
    pacing_thres_bt: { type: Sequelize.STRING },
    pacing_thres_bh: { type: Sequelize.STRING },
    pacing_thres_zh: { type: Sequelize.STRING },

    resistance: { type: Sequelize.STRING },
    resistance_bt: { type: Sequelize.STRING },
    resistance_bh: { type: Sequelize.STRING },
    resistance_zh: { type: Sequelize.STRING },

    // Төхөөрөмжийн пейсмейкерийн үзүүлэлтүүд
    tuh_electrod_helber: { type: Sequelize.INTEGER },
    tuh_slew_rate: { type: Sequelize.STRING },
    tuh_pacing_thres: { type: Sequelize.STRING },
    tuh_pacing_impa: { type: Sequelize.STRING },

    // Pulse Generator
    pulse_zagvar: { type: Sequelize.INTEGER },
    pulse_zagvar_other: { type: Sequelize.STRING },
    pulse_model_no: { type: Sequelize.STRING },
    pulse_serial_no: { type: Sequelize.STRING },
    pulse_bairlal: { type: Sequelize.INTEGER },
    pulse_bairlal_other: { type: Sequelize.STRING },

    // Дефибрилляторийн зааг тест (DFT testing)
    is_dft_testing: { type: Sequelize.INTEGER },
    y_dft_testing: { type: Sequelize.INTEGER },

    ajilbar_full_time: { type: Sequelize.STRING },
    fulu_full_time: { type: Sequelize.STRING },
    gadar_tun: { type: Sequelize.STRING },
    aris_tun: { type: Sequelize.STRING },

    // VII. Хүндрэл (эмнэлэгт байх үеийн)
    is_hundrel: { type: Sequelize.INTEGER },
    hevteh_hundrel_other: { type: Sequelize.STRING },

    // VIII. Багажийг дахин суулгах болон эргүүлж авах
    is_bagaj_dahin: { type: Sequelize.STRING },
    s_first_date: { type: Sequelize.DATE },
    s_solison_date: { type: Sequelize.DATE },

    // Үүсгүүрийг эргүүлж авах:
    uus_zagvar: { type: Sequelize.INTEGER },
    uus_model_no: { type: Sequelize.STRING },
    uus_serial_no: { type: Sequelize.STRING },
    uus_bairlal: { type: Sequelize.STRING },
    uus_shaltgaan: { type: Sequelize.INTEGER },
    uus_shaltgaan_other: { type: Sequelize.STRING },

    // Электродийг эргүүлж авах:
    is_electrod_awsan: { type: Sequelize.STRING },
    electrod_bair_date: { type: Sequelize.DATE },

    e_electrod_bairlal: { type: Sequelize.INTEGER },
    e_electrod_zagvar: { type: Sequelize.INTEGER },
    e_electrod_model_no: { type: Sequelize.STRING },
    e_electrod_serial_no: { type: Sequelize.STRING },
    e_electrod_shaltgaan: { type: Sequelize.INTEGER },
    e_electrod_shaltgaan_other: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ICDRhythm',
    modelName: 'ICDRhythm',
    timestamps: false,
  }
);

ICDRhythm.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

ICDRhythm.SetAssocations = (Models) => {
  ICDRhythm.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  ICDRhythm.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  ICDRhythm.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  ICDRhythm.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  ICDRhythm.hasMany(Models.ICDRhythmLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

ICDRhythm.SetFunctions = (Models) => {
  ICDRhythm.findAllNew = async function (Option) {
    const result = await ICDRhythm.findAll({
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
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
      ],
    });
    return result;
  };

  ICDRhythm.findAllDetail = async function (Option) {
    const result = await ICDRhythm.findAll({
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
        {
          model: Models.Organization,
          as: 'Organization',
          attributes: ['Id', 'Name'],
        },
        { model: Models.ICDRhythmLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = ICDRhythm;
