const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class VascularDiseaseTreatment extends Sequelize.Model {}
VascularDiseaseTreatment.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DiseaseId: { type: Sequelize.STRING },

    emchilgee_check: { type: Sequelize.STRING },
    axpc_nershil: { type: Sequelize.INTEGER },
    axpc_other: { type: Sequelize.STRING },
    axpc_tun: { type: Sequelize.FLOAT },
    apc_nershil: { type: Sequelize.INTEGER },
    apc_other: { type: Sequelize.STRING },
    apc_tun: { type: Sequelize.FLOAT },
    aphc_tun: { type: Sequelize.FLOAT },
    emchilgee_notcheck: { type: Sequelize.INTEGER },
    emchilgee_other: { type: Sequelize.STRING },
    is_beta_horiglogch: { type: Sequelize.STRING },
    beta_horiglogch_nershil: { type: Sequelize.INTEGER },
    beta_horiglogch_other: { type: Sequelize.STRING },
    beta_horiglogch_tun: { type: Sequelize.FLOAT },
    not_beta_shaltgaan: { type: Sequelize.INTEGER },
    not_beta_other: { type: Sequelize.STRING },
    is_mra: { type: Sequelize.STRING },
    mra_check: { type: Sequelize.INTEGER },
    mra_tun: { type: Sequelize.FLOAT },
    mra_notcheck: { type: Sequelize.INTEGER },
    mra_notcheck_other: { type: Sequelize.STRING },
    is_sglt2: { type: Sequelize.STRING },
    sglt2_check: { type: Sequelize.INTEGER },
    sglt2_tun: { type: Sequelize.FLOAT },
    sglt2_notcheck: { type: Sequelize.INTEGER },
    sglt2_notcheck_other: { type: Sequelize.STRING },

    is_antiagregant: { type: Sequelize.STRING },
    vd_antiagregant_check: { type: Sequelize.STRING },
    vd_antiagregant_em_ner: { type: Sequelize.STRING },
    vd_antiagregant_tun: { type: Sequelize.FLOAT },
    vd_antiagregant_em_ner1: { type: Sequelize.STRING },
    vd_antiagregant_tun1: { type: Sequelize.FLOAT },
    vd_antiagregant_em_ner2: { type: Sequelize.STRING },
    vd_antiagregant_tun2: { type: Sequelize.FLOAT },

    is_antikoagulyant: { type: Sequelize.STRING },
    vd_antikoagulyant_check: { type: Sequelize.STRING },
    vd_antikoagulyant_other: { type: Sequelize.STRING },
    vd_antikoagulyant_em_ner: { type: Sequelize.STRING },
    vd_antikoagulyant_tun: { type: Sequelize.FLOAT },
    vd_antikoagulyant_em_ner1: { type: Sequelize.STRING },
    vd_antikoagulyant_tun1: { type: Sequelize.FLOAT },
    vd_antikoagulyant_em_ner2: { type: Sequelize.STRING },
    vd_antikoagulyant_tun2: { type: Sequelize.FLOAT },

    is_shees_huuh_em: { type: Sequelize.STRING },
    shees_huuh_em_check: { type: Sequelize.INTEGER },
    shees_huuh_em_other: { type: Sequelize.STRING },
    shees_huuh_em_tun: { type: Sequelize.FLOAT },
    is_lipid_buuruulah: { type: Sequelize.STRING },
    lipid_buuruulah_em_check: { type: Sequelize.INTEGER },
    lipid_buuruulah_em_other: { type: Sequelize.STRING },
    lipid_buuruulah_em_tun: { type: Sequelize.FLOAT },
    is_sudas_telegch: { type: Sequelize.STRING },
    sudas_telegch_em_check: { type: Sequelize.INTEGER },
    sudas_telegch_em_tun1: { type: Sequelize.FLOAT },
    sudas_telegch_em_tun2: { type: Sequelize.FLOAT },
    sudas_telegch_em_tun3: { type: Sequelize.FLOAT },
    hyanalt: { type: Sequelize.STRING },
    notes: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'VascularDiseaseTreatment',
    modelName: 'VascularDiseaseTreatment',
    timestamps: false,
  }
);

VascularDiseaseTreatment.SetAssocations = (Models) => {
  VascularDiseaseTreatment.belongsTo(Models.VascularDisease, {
    as: 'VascularDisease',
    foreignKey: 'DiseaseId',
  });
  VascularDiseaseTreatment.hasMany(Models.VascularDiseaseTreatmentLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

VascularDiseaseTreatment.SetFunctions = (Models) => {
  VascularDiseaseTreatment.findAllDetail = async function (Option) {
    const result = await VascularDiseaseTreatment.findAll({
      ...Option,
      include: [{ model: Models.VascularDiseaseTreatmentLookUp, as: 'LookUpData' }],
    });
    return result;
  };
};

module.exports = VascularDiseaseTreatment;
