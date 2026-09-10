const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class vwAdviceInfo extends Sequelize.Model {}

vwAdviceInfo.init(
  {
    AdviceId: { type: Sequelize.INTEGER, primaryKey: true },
    CommentQty: { type: Sequelize.INTEGER },
    BodyCommId: { type: Sequelize.INTEGER },
    Body: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'vwAdviceInfo',
    modelName: 'vwAdviceInfo',
    timestamps: false,
  }
);

vwAdviceInfo.SearchField = ['AdviceId', 'Body'];

module.exports = vwAdviceInfo;
