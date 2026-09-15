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
    /*
     * STRING, not DATE. It was declared Sequelize.DATE while every sibling -
     * CreateUrl, DeleteUrl, ReadUrl - is a STRING and the column holds a URL.
     *
     * This is the adv_ticket_closed bug again (CLAUDE.md §10): Sequelize
     * date-parses whatever the column contains on every read, so a URL came
     * back as the string "Invalid date" and a write of a real URL would be
     * mangled on the way in. Nothing depended on the broken behaviour because
     * nothing read this table at all until now.
     *
     * The database column is nvarchar; this corrects the model to match it. No
     * DDL.
     */
    UpdateUrl: { type: Sequelize.STRING },
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
