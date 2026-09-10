const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwOrganizationLevel extends Sequelize.Model {}

vwOrganizationLevel.init(
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
    tableName: 'vwOrganizationLevel',
    modelName: 'vwOrganizationLevel',
    timestamps: false,
  }
);

vwOrganizationLevel.primaryKeyAttribute = 'value';

module.exports = vwOrganizationLevel;
