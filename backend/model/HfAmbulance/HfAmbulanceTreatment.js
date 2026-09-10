const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HfAmbulanceTreatment extends Sequelize.Model {}
HfAmbulanceTreatment.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    AmbulanceId: { type: Sequelize.INTEGER },

    // Эмчилгээ
    hf_emchilgee_check: { type: Sequelize.INTEGER },
    hf_axpc_nershil: { type: Sequelize.INTEGER },
    hf_axpc_other: { type: Sequelize.STRING },
    hf_axpc_tun: { type: Sequelize.FLOAT },
    hf_apc_nershil: { type: Sequelize.INTEGER },
    hf_apc_other: { type: Sequelize.STRING },
    hf_apc_tun: { type: Sequelize.FLOAT },
    aphc_tun: { type: Sequelize.FLOAT },
    hf_emchilgee_notcheck: { type: Sequelize.INTEGER },
    hf_emchilgee_other: { type: Sequelize.STRING },
    is_beta_horiglogch: { type: Sequelize.STRING },
    hf_beta_horiglogch_nershil: { type: Sequelize.STRING },
    hf_beta_horiglogch_other: { type: Sequelize.STRING },
    hf_beta_horiglogch_tun: { type: Sequelize.FLOAT },
    is_mra: { type: Sequelize.STRING },
    hf_mra_check: { type: Sequelize.INTEGER },
    hf_mra_tun: { type: Sequelize.FLOAT },
    hf_mra_notcheck: { type: Sequelize.INTEGER },
    hf_mra_notcheck_other: { type: Sequelize.STRING },
    is_sglt2: { type: Sequelize.STRING },
    hf_sglt2_check: { type: Sequelize.STRING },
    hf_sglt2_tun: { type: Sequelize.FLOAT },
    hf_sglt2_notcheck: { type: Sequelize.STRING },
    hf_sglt2_notcheck_other: { type: Sequelize.STRING },
    is_ibabradin: { type: Sequelize.STRING },
    ibabradin_tun: { type: Sequelize.FLOAT },
    is_antitrombotic: { type: Sequelize.STRING },
    hf_antitrombotic_check: { type: Sequelize.INTEGER },
    hf_antitrombotic_other: { type: Sequelize.STRING },
    hf_antitrombotic_tun: { type: Sequelize.FLOAT },
    is_digoksin: { type: Sequelize.STRING },
    digoksin_tun: { type: Sequelize.FLOAT },
    is_shees_huuh_em: { type: Sequelize.STRING },
    hf_shees_huuh_em_check: { type: Sequelize.INTEGER },
    hf_shees_huuh_em_other: { type: Sequelize.STRING },
    hf_shees_huuh_em_tun: { type: Sequelize.FLOAT },

    is_lipid_buuruulah: { type: Sequelize.STRING },
    hf_lipid_buuruulah_em_check: { type: Sequelize.INTEGER },
    hf_lipid_buuruulah_em_other: { type: Sequelize.STRING },
    hf_lipid_buuruulah_em_tun: { type: Sequelize.FLOAT },

    is_sudas_telegch: { type: Sequelize.STRING },
    hf_sudas_telegch_em_check: { type: Sequelize.INTEGER },
    hf_sudas_telegch_em_tun: { type: Sequelize.FLOAT },

    hf_tuhuurumj_zowloson: { type: Sequelize.INTEGER },
    hf_tuhuurumj_zowloson_check: { type: Sequelize.INTEGER },

    // Сэргээн засах эмчилгээ
    sergen_zasah: { type: Sequelize.STRING },
    hf_sergeen_zasah_emchilgee_notcheck: { type: Sequelize.INTEGER },
    sergen_zasah_not_other: { type: Sequelize.STRING },

    // Цаашид
    davtan_date: { type: Sequelize.DATE },
    is_hevtuuleh: { type: Sequelize.STRING },
    is_shiljuuleh: { type: Sequelize.STRING },
    notes: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HfAmbulanceTreatment',
    modelName: 'HfAmbulanceTreatment',
    timestamps: false,
  }
);

HfAmbulanceTreatment.SetAssocations = (Models) => {
  HfAmbulanceTreatment.belongsTo(Models.HfAmbulance, {
    as: 'HfAmbulance',
    foreignKey: 'AmbulanceId',
  });
  HfAmbulanceTreatment.hasMany(Models.HfAmbulanceTreatmentLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

HfAmbulanceTreatment.SetFunctions = (Models) => {
  HfAmbulanceTreatment.findAllDetail = async function (Option) {
    const result = await HfAmbulanceTreatment.findAll({
      ...Option,
      include: [{ model: Models.HfAmbulanceTreatmentLookUp, as: 'LookUpData' }],
    });
    return result;
  };
};

module.exports = HfAmbulanceTreatment;
