const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class AtrialRhythmNew extends Sequelize.Model {}

AtrialRhythmNew.init(
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

    // Эмчид үзүүлэх үеийн бүртгэл
    visit_date: { type: Sequelize.DATE },

    type: { type: Sequelize.INTEGER }, // int
    advice_type: { type: Sequelize.INTEGER }, // int
    emch_type: { type: Sequelize.INTEGER }, // int
    hamrah_negj: { type: Sequelize.INTEGER }, // int
    hamrah_negj_other: { type: Sequelize.STRING }, // nvarchar
    doctor_name: { type: Sequelize.STRING }, // nvarchar
    out_score: { type: Sequelize.FLOAT }, // float
    monitoring_hostpital_name: { type: Sequelize.STRING }, // nvarchar
    gender: { type: Sequelize.STRING }, // nvarchar
    is_tsevershilt: { type: Sequelize.STRING }, // nvarchar
    birthdate: { type: Sequelize.DATE }, // nvarchar
    living: { type: Sequelize.INTEGER }, // int
    ger_bul: { type: Sequelize.INTEGER }, // int
    main_shaltgaan: { type: Sequelize.INTEGER }, // int
    main_shaltgaan_other: { type: Sequelize.STRING }, // nvarchar
    shinj_start_date: { type: Sequelize.DATE }, // nvarchar
    shinj_daraa_date: { type: Sequelize.DATE }, // nvarchar
    shinj_daraa_first_where: { type: Sequelize.STRING }, // nvarchar
    hevtsen_ognoo: { type: Sequelize.STRING }, // nvarchar
    onosh_ognoo: { type: Sequelize.STRING }, // nvarchar
    undur: { type: Sequelize.FLOAT }, // float
    jin: { type: Sequelize.FLOAT }, // float
    bji: { type: Sequelize.FLOAT }, // float
    bsa: { type: Sequelize.FLOAT }, // float
    ad_deed: { type: Sequelize.FLOAT }, // float
    ad_dood: { type: Sequelize.FLOAT }, // float
    z_ts_t: { type: Sequelize.FLOAT }, // float
    synus_hemnel: { type: Sequelize.STRING }, // nvarchar
    zurh_chagnalt: { type: Sequelize.STRING }, // nvarchar
    zurh_chagnalt_yes: { type: Sequelize.STRING }, // nvarchar
    aort_nar: { type: Sequelize.STRING }, // nvarchar
    aort_reg: { type: Sequelize.STRING }, // nvarchar
    mitral_nar: { type: Sequelize.STRING }, // nvarchar
    mitral_reg: { type: Sequelize.STRING }, // nvarchar
    gurvan_havtast_nar: { type: Sequelize.STRING }, // nvarchar
    gurvan_havtast_reg: { type: Sequelize.STRING }, // nvarchar
    uushig_nar: { type: Sequelize.STRING }, // nvarchar
    uushig_reg: { type: Sequelize.STRING }, // nvarchar
    uushig_herjig: { type: Sequelize.STRING }, // nvarchar
    s3_morin: { type: Sequelize.STRING }, // nvarchar
    amisgaadalt: { type: Sequelize.STRING }, // nvarchar
    nyha: { type: Sequelize.STRING }, // nvarchar
    tseejeer_uvduh: { type: Sequelize.STRING }, // nvarchar
    tseejeer_uvduh_yes: { type: Sequelize.STRING }, // nvarchar
    tur_uhaan_aldah: { type: Sequelize.STRING }, // nvarchar
    uhaan_balartah: { type: Sequelize.STRING }, // nvarchar
    zahiin_havan: { type: Sequelize.STRING }, // nvarchar

    // 2
    zurh_ersdelt_huchin: { type: Sequelize.STRING }, // nvarchar
    zurh_ersdelt_huchin_yes: { type: Sequelize.STRING }, // nvarchar
    daralt_ihselt: { type: Sequelize.STRING }, // nvarchar
    daralt_ihselt_yes: { type: Sequelize.STRING }, // nvarchar
    daralt_ihselt_hugatsaa: { type: Sequelize.STRING }, // nvarchar
    tamhi_hereglee: { type: Sequelize.STRING }, // nvarchar
    tamhi_hereglee_yes: { type: Sequelize.STRING }, // nvarchar
    tamhi_hereglee_box: { type: Sequelize.STRING }, // nvarchar
    arhinii_hereglee: { type: Sequelize.STRING }, // nvarchar
    arhinii_hereglee_yes: { type: Sequelize.STRING }, // nvarchar
    emiin_hereglee: { type: Sequelize.STRING }, // nvarchar
    emiin_hereglee_yes: { type: Sequelize.STRING }, // nvarchar
    idevhitei_hudul: { type: Sequelize.STRING }, // nvarchar
    chihriin_shijin: { type: Sequelize.STRING }, // nvarchar
    chihriin_shijin_yes: { type: Sequelize.STRING }, // nvarchar
    chihriin_shijin_hugatsaa: { type: Sequelize.STRING }, // nvarchar
    chihriin_shijin_odoo_emchilgee: { type: Sequelize.STRING }, // nvarchar
    dislipidemi: { type: Sequelize.STRING }, // nvarchar
    dislipidemi_yes: { type: Sequelize.STRING }, // nvarchar
    dislipidemi_yes_other: { type: Sequelize.STRING }, // nvarchar
    dislipidemi_udamshil: { type: Sequelize.STRING }, // nvarchar
    dislipidemi_hugatsaa: { type: Sequelize.STRING }, // nvarchar
    dislipidemi_emchilgee: { type: Sequelize.STRING }, // nvarchar
    zurh_udamshliin_oguul: { type: Sequelize.STRING }, // nvarchar
    genet_nas_barah_udam: { type: Sequelize.STRING }, // nvarchar
    titem_emgeg_udamshil: { type: Sequelize.STRING }, // nvarchar
    zurh_sudas_oguulemj: { type: Sequelize.STRING }, // nvarchar
    zurh_sudas_oguulemj_yes: { type: Sequelize.STRING }, // nvarchar

    // Зүрх судасны өвчний өгүүлэмжтэй эсэх?
    z_s_tosguur: { type: Sequelize.STRING }, // nvarchar
    z_s_tosguur_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_dutagdal: { type: Sequelize.STRING }, // nvarchar
    z_s_dutagdal_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_dutagdal_frakts: { type: Sequelize.STRING }, // nvarchar
    z_s_dutagdal_hugatsaa: { type: Sequelize.STRING }, // nvarchar
    z_s_umnuh_harvalt: { type: Sequelize.STRING }, // nvarchar
    z_s_umnuh_harvalt_suuliin: { type: Sequelize.STRING }, // nvarchar
    z_s_umnuh_harvalt_suuliin_tohioldol: { type: Sequelize.STRING }, // nvarchar
    z_s_umnuh_tsus_aldalt: { type: Sequelize.STRING }, // nvarchar
    z_s_uvchin: { type: Sequelize.STRING }, // nvarchar
    z_s_uvchin_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_kardiomiopati: { type: Sequelize.STRING }, // nvarchar
    z_s_kardiomiopati_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_guree: { type: Sequelize.STRING }, // nvarchar
    z_s_dood_much: { type: Sequelize.STRING }, // nvarchar
    z_s_genet_zogsoh: { type: Sequelize.STRING }, // nvarchar
    z_s_pacemaker: { type: Sequelize.STRING }, // nvarchar
    z_s_pacemaker_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_intervention: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_intervention_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_intervention: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_intervention_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_3havtast_intervention: { type: Sequelize.STRING }, // nvarchar
    z_s_3havtast_intervention_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_odoo: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_turul: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_nar: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_reg: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_morfologi: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_talbai: { type: Sequelize.STRING }, // nvarchar
    z_s_aort_emgeg_dun_zoruu: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_odoo: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_turul: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_nar: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_reg: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_talbai: { type: Sequelize.STRING }, // nvarchar
    z_s_mitral_emgeg_dun_zoruu: { type: Sequelize.STRING }, // nvarchar
    z_s_3havtast_emgeg: { type: Sequelize.STRING }, // nvarchar
    z_s_3havtast_emgeg_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_3havtast_emgeg_odoo: { type: Sequelize.STRING }, // nvarchar
    z_s_3havtast_emgeg_regur: { type: Sequelize.STRING }, // nvarchar
    z_s_turulh_emgeg: { type: Sequelize.STRING }, // nvarchar
    z_s_turulh_emgeg_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_turulh_emgeg_yes_other: { type: Sequelize.STRING }, // nvarchar
    z_s_aldagdal: { type: Sequelize.STRING }, // nvarchar
    z_s_busad: { type: Sequelize.STRING }, // nvarchar
    z_s_busad_yes: { type: Sequelize.STRING }, // nvarchar
    z_s_busad_yes_other: { type: Sequelize.STRING }, // nvarchar

    // Зүрх судасны бус өвчний түүх
    zs_busad: { type: Sequelize.STRING }, // nvarchar
    zs_busad_yes: { type: Sequelize.STRING }, // nvarchar
    zs_busad_bambai: { type: Sequelize.STRING }, // nvarchar
    zs_busad_bambai_yes: { type: Sequelize.STRING }, // nvarchar
    zs_busad_buur: { type: Sequelize.STRING }, // nvarchar
    zs_busad_buur_yes: { type: Sequelize.STRING }, // nvarchar
    zs_busad_eleg: { type: Sequelize.STRING }, // nvarchar
    zs_busad_uushig: { type: Sequelize.STRING }, // nvarchar
    zs_busad_amisgal_tasaldah: { type: Sequelize.STRING }, // nvarchar
    zs_busad_amisgal_tasaldah_yes: { type: Sequelize.STRING }, // nvarchar
    zs_busad_hort_havdar: { type: Sequelize.STRING }, // nvarchar
    zs_busad_hort_havdar_yes: { type: Sequelize.STRING }, // nvarchar
    zs_busad_artrit: { type: Sequelize.STRING }, // nvarchar
    zs_busad_gutral: { type: Sequelize.STRING }, // nvarchar
    zs_busad_tanin: { type: Sequelize.STRING }, // nvarchar
    zs_busad_pregnant: { type: Sequelize.STRING }, // nvarchar
    zs_busad_hdhv: { type: Sequelize.STRING }, // nvarchar
    zs_busad_covid: { type: Sequelize.STRING }, // nvarchar
    zs_busad_autimun: { type: Sequelize.STRING }, // nvarchar
    zs_busad_aspirin_ul: { type: Sequelize.STRING }, // nvarchar
    zs_busad_antikogulyant: { type: Sequelize.STRING }, // nvarchar
    zs_busad_antikogulyant_yes: { type: Sequelize.STRING }, // nvarchar
    zs_busad_tsus_aldah: { type: Sequelize.STRING }, // nvarchar
  },

  {
    sequelize,
    tableName: 'AtrialRhythmNew',
    modelName: 'AtrialRhythmNew',
    timestamps: false,
  }
);

AtrialRhythmNew.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

AtrialRhythmNew.SetAssocations = (Models) => {
  AtrialRhythmNew.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  AtrialRhythmNew.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  AtrialRhythmNew.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  AtrialRhythmNew.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  AtrialRhythmNew.hasMany(Models.AtrialRhythmLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

AtrialRhythmNew.SetFunctions = (Models) => {
  AtrialRhythmNew.findAllNew = async function (Option) {
    const result = await AtrialRhythmNew.findAll({
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

  AtrialRhythmNew.findAllDetail = async function (Option) {
    const result = await AtrialRhythmNew.findAll({
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
        { model: Models.AtrialRhythmLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = AtrialRhythmNew;
