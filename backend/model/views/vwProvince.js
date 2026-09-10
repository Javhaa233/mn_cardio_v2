const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwProvince extends Sequelize.Model {}

vwProvince.init(
  {
    id_dico: { type: Sequelize.INTEGER, primaryKey: true },
    dico: { type: Sequelize.STRING },
    label: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING },
    pos: { type: Sequelize.INTEGER },
    translate_flag: { type: Sequelize.SMALLINT },
  },
  {
    sequelize,
    tableName: 'vwProvince',
    modelName: 'vwProvince',
    timestamps: false,
  }
);

module.exports = vwProvince;
