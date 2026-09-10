const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwModeDischarge extends Sequelize.Model {}

vwModeDischarge.init(
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
    tableName: 'vwModeDischarge',
    modelName: 'vwModeDischarge',
    timestamps: false,
  }
);

module.exports = vwModeDischarge;
