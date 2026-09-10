const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwGender extends Sequelize.Model {}

vwGender.init(
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
    tableName: 'vwGender',
    modelName: 'vwGender',
    timestamps: false,
  }
);

module.exports = vwGender;
