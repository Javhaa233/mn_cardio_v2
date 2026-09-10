const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class AtrialRhythm extends Sequelize.Model {}

AtrialRhythm.init(
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
    doctor_name: { type: Sequelize.STRING },
    out_score: { type: Sequelize.FLOAT },
    monitoring_hostpital_name: { type: Sequelize.STRING },
    undur: { type: Sequelize.FLOAT },
    jin: { type: Sequelize.FLOAT },
    bji: { type: Sequelize.FLOAT },
    ad_deed: { type: Sequelize.FLOAT },
    ad_dood: { type: Sequelize.FLOAT },
    r_symptoms: { type: Sequelize.INTEGER },
    r_symptoms_other: { type: Sequelize.STRING },

    // Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс
    daralt_ihselt: { type: Sequelize.INTEGER },
    uuh_tos_uurchlult: { type: Sequelize.INTEGER },
    chihriin_shijin: { type: Sequelize.INTEGER },
    ishemi_urid: { type: Sequelize.STRING },
    zurh_genet_uhel: { type: Sequelize.STRING },
    tamhidalt: { type: Sequelize.INTEGER },
    tamhinaas_garsan_hugatsaa: { type: Sequelize.STRING },
    dundaj_tamhinii_too: { type: Sequelize.STRING },
    arhi_hereglee: { type: Sequelize.INTEGER },
    arhinaas_garsan_hugatsaa: { type: Sequelize.STRING },

    //  Бусад онцлох өвчний түүх
    hereg_emgeg: { type: Sequelize.STRING },
    havhlaga_gajig_mes: { type: Sequelize.STRING },
    cardiomiopati: { type: Sequelize.STRING },
    arhag_dutagdal: { type: Sequelize.STRING },
    miokardit: { type: Sequelize.STRING },
    haldvart_endokardit: { type: Sequelize.STRING },
    buur_dutagdal: { type: Sequelize.INTEGER },
    umnu_tarhi_sudas: { type: Sequelize.STRING },
    y_umnu_tarhi_sudass: { type: Sequelize.INTEGER },
    is_tisde: { type: Sequelize.STRING },
    is_gabg: { type: Sequelize.STRING },

    uushig_arhag: { type: Sequelize.STRING },
    giperti: { type: Sequelize.STRING },
    gipoti: { type: Sequelize.STRING },
    zahiin_sudas_emgeg: { type: Sequelize.STRING },
    amisgal_noir_tasaldah: { type: Sequelize.STRING },
    other_uwchin: { type: Sequelize.STRING },
    tosguur_tohioldol: { type: Sequelize.STRING },
    // Тосгуурын жирвэгнээгийн тохиолдлын давтамж
    suuliin_48_tsag: { type: Sequelize.STRING },
    ehnii_udaa: { type: Sequelize.STRING },

    // Зүрхний цахилгаан бичлэг
    qrs_duration: { type: Sequelize.FLOAT },
    left_bbb: { type: Sequelize.STRING },
    right_bbb: { type: Sequelize.STRING },
    ztst: { type: Sequelize.FLOAT },
    zuun_hovdol_gipertrofi: { type: Sequelize.STRING },

    zuun_tosguur_hemjee: { type: Sequelize.INTEGER },
    zuun_tsatsalt_frakts: { type: Sequelize.INTEGER },
    hem_aldagdal_esreg: { type: Sequelize.INTEGER },
    umnuh_emchilgee: { type: Sequelize.INTEGER },
    togtmol_uudag_em: { type: Sequelize.INTEGER },

    // Эрсдлийн үнэлгээ
    chads2_score: { type: Sequelize.FLOAT },
    chads2_vasc_score: { type: Sequelize.FLOAT },
    has_bled_score: { type: Sequelize.FLOAT },
    c2hest_score: { type: Sequelize.FLOAT },
  },

  {
    sequelize,
    tableName: 'AtrialRhythm',
    modelName: 'AtrialRhythm',
    timestamps: false,
  }
);

AtrialRhythm.SearchField = ['Id', 'PatRegNo', 'CreateUserId', 'CreatedDate'];

AtrialRhythm.SetAssocations = (Models) => {
  AtrialRhythm.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  AtrialRhythm.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  AtrialRhythm.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  AtrialRhythm.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  AtrialRhythm.hasMany(Models.AtrialRhythmLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

AtrialRhythm.SetFunctions = (Models) => {
  AtrialRhythm.findAllNew = async function (Option) {
    const result = await AtrialRhythm.findAll({
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

  AtrialRhythm.findAllDetail = async function (Option) {
    const result = await AtrialRhythm.findAll({
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

module.exports = AtrialRhythm;
