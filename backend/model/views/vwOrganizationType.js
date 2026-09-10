const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwOrganizationType extends Sequelize.Model {}

vwOrganizationType.init(
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
    tableName: 'vwOrganizationType',
    modelName: 'vwOrganizationType',
    timestamps: false,
  }
);

vwOrganizationType.primaryKeyAttribute = 'value';

module.exports = vwOrganizationType;
