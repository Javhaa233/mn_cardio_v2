const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PaceMakerRhythm extends Sequelize.Model {}

PaceMakerRhythm.init(
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

    // III. Пейсмейкер эмчилгээний заалт (нэгийг нь сонгох)
    emchilgee_zaalt: { type: Sequelize.INTEGER },
    emchilgee_zaalt_other: { type: Sequelize.STRING },
    suulgah_ablation: { type: Sequelize.STRING },

    // IV. Шинж тэмдэг (хэд хэдийг сонгож болно)
    shinj_temdeg: { type: Sequelize.STRING },
    shinj_temdeg_other: { type: Sequelize.STRING },

    // V. Зүрхний үндсэн өвчин (нэгийг нь сонгох)
    undsen_uvchin: { type: Sequelize.STRING },
    undsen_uvchin_other: { type: Sequelize.STRING },

    // VI. Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс
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

    // VII. Бусад онцлох өвчний түүх
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

    // VIII. Пейсмейкер суулгах ажилбар
    hiigdsen_ajilbar: { type: Sequelize.INTEGER },
    hiigdsen_ajilbar_other: { type: Sequelize.STRING },
    uus_tuluv: { type: Sequelize.INTEGER },
    uus_tuluv_other: { type: Sequelize.STRING },
    ajil_elect_helber: { type: Sequelize.INTEGER },
    ajil_elect_tuil: { type: Sequelize.INTEGER },

    //
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

    // Pulse Generator
    pulse_zagvar: { type: Sequelize.INTEGER },
    pulse_zagvar_other: { type: Sequelize.STRING },
    pulse_model_no: { type: Sequelize.STRING },
    pulse_serial_no: { type: Sequelize.STRING },
    pulse_bairlal: { type: Sequelize.INTEGER },
    pulse_bairlal_other: { type: Sequelize.STRING },

    // IX. Хүндрэл (эмнэлэгт байх үеийн)
    is_hundrel: { type: Sequelize.INTEGER },
    hevteh_hundrel_other: { type: Sequelize.STRING },

    // X. Пейсмейкерийг эргүүлж авах ажилбар (зөвхөн хуучин үүсгүүр болон электродийг авч буй үед бөглөнө)
    ea_pulse_zagvar: { type: Sequelize.INTEGER },
    ea_pulse_zagvar_other: { type: Sequelize.STRING },
    ea_pulse_model_no: { type: Sequelize.STRING },
    ea_pulse_serial_no: { type: Sequelize.STRING },
    ea_pulse_shaltgaan: { type: Sequelize.INTEGER },
    ea_pulse_shaltgaan_other: { type: Sequelize.STRING },
    ea_elect_bairlal: { type: Sequelize.INTEGER },
    ea_elect_zagvar: { type: Sequelize.INTEGER },
    ea_elect_zagvar_other: { type: Sequelize.STRING },
    ea_elect_model_no: { type: Sequelize.STRING },
    ea_elect_serial_no: { type: Sequelize.STRING },
    ea_elect_shaltgaan: { type: Sequelize.INTEGER },
    ea_elect_shaltgaan_other: { type: Sequelize.STRING },
    ea_elect_2_bairlal: { type: Sequelize.INTEGER },
    ea_elect_2_zagvar: { type: Sequelize.INTEGER },
    ea_elect_2_zagvar_other: { type: Sequelize.STRING },
    ea_elect_2_model_no: { type: Sequelize.STRING },
    ea_elect_2_serial_no: { type: Sequelize.STRING },
    ea_elect_2_shaltgaan: { type: Sequelize.INTEGER },
    ea_elect_2_shaltgaan_other: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PaceMakerRhythm',
    modelName: 'PaceMakerRhythm',
    timestamps: false,
  }
);

PaceMakerRhythm.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

PaceMakerRhythm.SetAssocations = (Models) => {
  PaceMakerRhythm.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  PaceMakerRhythm.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  PaceMakerRhythm.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  PaceMakerRhythm.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  PaceMakerRhythm.hasMany(Models.PaceMakerRhythmLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

PaceMakerRhythm.SetFunctions = (Models) => {
  PaceMakerRhythm.findAllNew = async function (Option) {
    const result = await PaceMakerRhythm.findAll({
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

  PaceMakerRhythm.findAllDetail = async function (Option) {
    const result = await PaceMakerRhythm.findAll({
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
        { model: Models.PaceMakerRhythmLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = PaceMakerRhythm;
