const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ObjectNameDic extends Sequelize.Model {}
ObjectNameDic.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    CreateUserId: { type: Sequelize.INTEGER },
    ObjectName: { type: Sequelize.STRING },
    ObjectNameMn: { type: Sequelize.STRING },

    CreateDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'ObjectNameDic',
    modelName: 'ObjectNameDic',
    timestamps: false,
  }
);
ObjectNameDic.SearchField = ['Id', 'ObjectName', 'ObjectNameMn', 'CreateUserId'];

module.exports = ObjectNameDic;
