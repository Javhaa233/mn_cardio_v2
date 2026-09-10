const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Medications extends Sequelize.Model {}
Medications.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
    CreatedDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Medications',
    modelName: 'Medications',
    timestamps: false,
  }
);

Medications.SetAssocations = (Models) => {
  Medications.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
};

module.exports = Medications;
