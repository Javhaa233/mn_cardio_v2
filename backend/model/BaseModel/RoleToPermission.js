const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class RoleToPermission extends Sequelize.Model {}
RoleToPermission.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    RoleId: { type: Sequelize.INTEGER },
    PermissionId: { type: Sequelize.INTEGER },
    Create: { type: Sequelize.INTEGER },
    Update: { type: Sequelize.INTEGER },
    Read: { type: Sequelize.INTEGER },
    Delete: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RoleToPermission',
    modelName: 'RoleToPermission',
    timestamps: false,
  }
);

RoleToPermission.SetAssocations = (Models) => {
  RoleToPermission.belongsTo(Models.Roles, {
    as: 'Roles',
    foreignKey: 'RoleId',
  });

  RoleToPermission.belongsTo(Models.Permissions, {
    as: 'Permissions',
    foreignKey: 'PermissionId',
  });
};

RoleToPermission.SetFunctions = (Models) => {
  RoleToPermission.findAllNew = async function (Option) {
    const result = await RoleToPermission.findAll({
      ...Option,
      include: [
        { model: Models.Roles, as: 'Roles' },
        { model: Models.Permissions, as: 'Permissions' },
      ],
    });
    return result;
  };
};

module.exports = RoleToPermission;
