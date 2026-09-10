const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ExaminationEcho extends Sequelize.Model {}
ExaminationEcho.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    echo_date: { type: Sequelize.DATE },
    doctor_name: { type: Sequelize.STRING },

    rec_status: { type: Sequelize.INTEGER },
    a: { type: Sequelize.DECIMAL },
    aopg: { type: Sequelize.DECIMAL },
    aorta: { type: Sequelize.DECIMAL },
    aortic_regurgitation: { type: Sequelize.STRING },
    aortic_stenosis: { type: Sequelize.STRING },
    comment: { type: Sequelize.STRING },
    e: { type: Sequelize.DECIMAL },
    e_div_a: { type: Sequelize.DECIMAL },
    ef: { type: Sequelize.DECIMAL },
    fs: { type: Sequelize.DECIMAL },
    ivc: { type: Sequelize.DECIMAL },
    ivsd: { type: Sequelize.DECIMAL },
    ivss: { type: Sequelize.DECIMAL },
    left_atrium: { type: Sequelize.DECIMAL },
    lv_mass: { type: Sequelize.DECIMAL },
    lvdd: { type: Sequelize.DECIMAL },
    lvds: { type: Sequelize.DECIMAL },
    lvvold: { type: Sequelize.DECIMAL },
    lvvols: { type: Sequelize.DECIMAL },
    mitral_regurgitation: { type: Sequelize.STRING },
    mitral_stenosis: { type: Sequelize.STRING },
    pulmonary_regurgitation: { type: Sequelize.STRING },
    pulmonary_stenosis: { type: Sequelize.STRING },
    pvpg: { type: Sequelize.DECIMAL },
    pwd: { type: Sequelize.DECIMAL },
    pws: { type: Sequelize.DECIMAL },
    rvd: { type: Sequelize.DECIMAL },
    spap: { type: Sequelize.DECIMAL },
    sv: { type: Sequelize.DECIMAL },
    tricuspid_regurgitation: { type: Sequelize.STRING },
    tricuspid_stenosis: { type: Sequelize.STRING },
    annulus_size_morph: { type: Sequelize.STRING },
    leaflet_mobility: { type: Sequelize.STRING },
    leaf_mob_flail: { type: Sequelize.STRING },
    leaf_mob_prolapse: { type: Sequelize.STRING },
    res_tet_leaflets: { type: Sequelize.STRING },
    carpentier_class: { type: Sequelize.STRING },
    submitral_morph: { type: Sequelize.STRING },
    mr_mrchanism: { type: Sequelize.STRING },
    mr_jets: { type: Sequelize.STRING },
    mr_jet_dur: { type: Sequelize.STRING },
    mr_jet_dir: { type: Sequelize.STRING },
    pul_vein_flow_pro: { type: Sequelize.STRING },
    mitral_inflow_pro: { type: Sequelize.STRING },
    vena_contrata_width: { type: Sequelize.REAL },
    vena_contrata_area: { type: Sequelize.REAL },
    threshold_vals_mr: { type: Sequelize.STRING },
    left_atrial_size: { type: Sequelize.STRING },
    left_vent_size: { type: Sequelize.STRING },
    right_vent_size: { type: Sequelize.STRING },
    right_vent_sys_fun: { type: Sequelize.STRING },
    tricus_annulus: { type: Sequelize.STRING },
    tricus_valv_reg: { type: Sequelize.STRING },
    pa_sys_pressure: { type: Sequelize.REAL },
    est_ra_pressure: { type: Sequelize.REAL },
    OrganizationId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
    rwt: { type: Sequelize.DECIMAL },
  },
  {
    sequelize,
    tableName: 'ExaminationEcho',
    modelName: 'ExaminationEcho',
    timestamps: false,
  }
);

ExaminationEcho.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'a',
  'aopg',
  'aorta',
  'aortic_regurgitation',
  'aortic_stenosis',
  'comment',
  'e',
  'e_div_a',
  'ef',
  'fs',
  'ivc',
  'ivsd',
  'ivss',
  'left_atrium',
  'lv_mass',
  'lvdd',
  'lvds',
  'lvvold',
  'lvvols',
  'mitral_regurgitation',
  'mitral_stenosis',
  'pulmonary_regurgitation',
  'pulmonary_stenosis',
  'pvpg',
  'pwd',
  'pws',
  'rvd',
  'spap',
  'sv',
  'tricuspid_regurgitation',
  'tricuspid_stenosis',
  'annulus_size_morph',
  'leaflet_mobility',
  'leaf_mob_flail',
  'leaf_mob_prolapse',
  'res_tet_leaflets',
  'carpentier_class',
  'submitral_morph',
  'mr_mrchanism',
  'mr_jets',
  'mr_jet_dur',
  'mr_jet_dir',
  'pul_vein_flow_pro',
  'mitral_inflow_pro',
  'vena_contrata_width',
  'vena_contrata_area',
  'threshold_vals_mr',
  'left_atrial_size',
  'left_vent_size',
  'right_vent_size',
  'right_vent_sys_fun',
  'tricus_annulus',
  'tricus_valv_reg',
  'pa_sys_pressure',
  'est_ra_pressure',
  'rwt',
];

ExaminationEcho.SetAssocations = (Models) => {
  ExaminationEcho.hasMany(Models.ExaminationEchoLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  ExaminationEcho.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  ExaminationEcho.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });

  ExaminationEcho.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });

  ExaminationEcho.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });

  ExaminationEcho.hasMany(Models.ExaminationEchoNotation, {
    as: 'ExaminationEchoNotation',
    foreignKey: 'EchoId',
    targetKey: 'id_data',
  });
};

ExaminationEcho.SetFunctions = (Models) => {
  ExaminationEcho.createNew = async function (Data, ReturnIdField) {
    await ExaminationEcho.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1 ' +
        ReturnIdField +
        ' FROM [ExaminationEcho] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  ExaminationEcho.GetLookUpData = async function (EchoId) {
    const result = await Models.ExaminationEchoLookUp.findAll({
      where: { id_data: EchoId },
    });
    return result;
  };

  ExaminationEcho.findAllDetail = async function (Option) {
    var Result = await ExaminationEcho.findAll({
      ...Option,

      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['UserName', 'Id'],
        },
        {
          model: Models.ExaminationEchoNotation,
          attributes: ['id_data', 'comment', 'EchoId'],
          as: 'ExaminationEchoNotation',
          include: [
            {
              model: Models.vwEchoSectionName,
              as: 'vwEchoSectionName',
              attributes: ['value', 'label'],
            },

            {
              model: Models.ExaminationEchoNotationLookUp,
              as: 'LookUpData',
              attributes: ['id_question', 'value'],
              include: [
                {
                  model: Models.vwEchoElementTag,
                  as: 'vwEchoElementTag',
                  attributes: ['value', 'label'],
                },
              ],
            },
          ],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['p_lastname', 'p_firstname', 'p_gender', 'Age'],
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

    return Result;
  };

  ExaminationEcho.findAllNew = async function (Option) {
    var Result = await ExaminationEcho.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['UserName', 'Id'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },

        {
          model: Models.Organization,
          as: 'Organization',
          include: [
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name', 'date_creation'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictBagKhoroo,
              as: 'DictBagKhoroo',
              attributes: ['id_data', 'name'],
            },
          ],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
      ],
    });
    return Result;
  };

  ExaminationEcho.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'ExaminationEcho',
        rec_status: { [Op.in]: ['9', '1'] },
      },
      attributes: [
        'id_data',
        'id',
        'ext',
        'hash',
        'original_name',
        'generated_name',
        'linked_q',
        'linked_id_data',
        'size',
        'patient_id',
        'LinkedObjectName',
        'LinkedObjectId',
        'FieldName',
      ],
    });
    return Files;
  };
};

module.exports = ExaminationEcho;
