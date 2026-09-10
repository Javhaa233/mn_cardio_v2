const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DrgroupDepartments extends Sequelize.Model {}
DrgroupDepartments.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    id: { type: Sequelize.INTEGER },
    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },
    rec_status: { type: Sequelize.INTEGER },
    branch_id: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
    AppId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DrgroupDepartments',
    modelName: 'DrgroupDepartments',
    timestamps: false,
  }
);

DrgroupDepartments.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'branch_id',
  'name',
  'OrganizationId',
  'AppId',
];

DrgroupDepartments.SetAssocations = (Models) => {
  DrgroupDepartments.belongsTo(Models.Apps, {
    as: 'Apps',
    foreignKey: 'AppId',
  });

  DrgroupDepartments.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
  });
};

DrgroupDepartments.SetFunctions = (Models) => {
  DrgroupDepartments.findAllNew = async function (Option) {
    const result = await DrgroupDepartments.findAll({
      ...Option,
      include: [{ model: Models.Organization, as: 'Organization' }],
    });
    return result;
  };
};

module.exports = DrgroupDepartments;
