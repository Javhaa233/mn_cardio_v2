const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * Operational configuration the mobile apps read at launch.
 *
 * Created by scripts/add_mobile_settings.sql. See that file for why this is a
 * key-value table rather than a column per setting.
 *
 * `Key` is a reserved word in T-SQL. Sequelize quotes identifiers, so the
 * attribute can carry the same name as the column and `[Key]` is emitted
 * correctly - but anything writing raw SQL against this table must bracket it.
 */
class MobileSetting extends Sequelize.Model {}

MobileSetting.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Key: { type: Sequelize.STRING },
    Value: { type: Sequelize.TEXT },
    Description: { type: Sequelize.STRING },
    UpdateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'MobileSetting',
    modelName: 'MobileSetting',
    timestamps: false,
  }
);

MobileSetting.SearchField = ['Id', 'Key', 'Value', 'Description'];

module.exports = MobileSetting;
