const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class UserToRole extends Sequelize.Model {}

UserToRole.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    RoleId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'UserToRole',
    modelName: 'UserToRole',
    timestamps: false,
  }
);

UserToRole.SetAssocations = (Models) => {
  UserToRole.belongsTo(Models.Roles, { as: 'Roles', foreignKey: 'RoleId' });
  UserToRole.belongsTo(Models.Users, { as: 'Users', foreignKey: 'UserId' });
};

module.exports = UserToRole;
