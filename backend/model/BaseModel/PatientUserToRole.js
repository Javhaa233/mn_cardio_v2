const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientUserToRole extends Sequelize.Model {}
PatientUserToRole.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    RoleId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientUserToRole',
    modelName: 'PatientUserToRole',
    timestamps: false,
  }
);

PatientUserToRole.SetAssocations = (Models) => {
  PatientUserToRole.belongsTo(Models.Roles, {
    as: 'Roles',
    foreignKey: 'RoleId',
  });

  PatientUserToRole.belongsTo(Models.PatientUsers, {
    as: 'PatientUsers',
    foreignKey: 'UserId',
  });
};

module.exports = PatientUserToRole;
