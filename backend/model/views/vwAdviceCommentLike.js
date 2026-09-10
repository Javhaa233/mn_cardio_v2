const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class vwAdviceCommentLike extends Sequelize.Model {}

vwAdviceCommentLike.init(
  {
    AdviceCommentId: { type: Sequelize.INTEGER, primaryKey: true },
    LikeQty: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwAdviceCommentLike',
    modelName: 'vwAdviceCommentLike',
    timestamps: false,
  }
);

vwAdviceCommentLike.SearchField = ['AdviceCommentId', 'LikeQty'];

module.exports = vwAdviceCommentLike;
