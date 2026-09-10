const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class Permissions extends Sequelize.Model {}
Permissions.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    Name: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
    ObjectName: { type: Sequelize.STRING },
    CreateUrl: { type: Sequelize.STRING },
    UpdateUrl: { type: Sequelize.DATE },
    DeleteUrl: { type: Sequelize.STRING },
    ReadUrl: { type: Sequelize.STRING },
  },

  {
    sequelize,
    tableName: 'Permissions',
    modelName: 'Permissions',
    timestamps: false,
  }
);

module.exports = Permissions;
