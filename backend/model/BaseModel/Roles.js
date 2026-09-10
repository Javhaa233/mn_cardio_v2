const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class Roles extends Sequelize.Model {}
Roles.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    Name: { type: Sequelize.STRING },
    Code: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Roles',
    modelName: 'Roles',
    timestamps: false,
  }
);

//Assocations
Roles.SetAssocations = (Models) => {
  Roles.hasMany(Models.RoleToPermission, {
    as: 'RoleToPermission',
    foreignKey: 'RoleId',
  });
  Roles.hasMany(Models.UserToRole, { as: 'UserToRole', foreignKey: 'RoleId' });
};

Roles.SetFunctions = (Models) => {
  Roles.findAllNew = async function (Option) {
    const result = await Roles.findAll({ ...Option });
    return result;
  };

  Roles.findAllDetail = async function (Option) {
    const result = await Roles.findAll({
      ...Option,
      include: [{ model: Models.RoleToPermission, as: 'RoleToPermission' }],
    });
    return result;
  };
};

module.exports = Roles;
