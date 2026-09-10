const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class AdviceCommentLike extends Sequelize.Model {}
AdviceCommentLike.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    AdviceCommentId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    LikeDate: { type: Sequelize.DATE },
    UnLikeDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'AdviceCommentLike',
    modelName: 'AdviceCommentLike',
    timestamps: false,
  }
);

AdviceCommentLike.SetAssocations = (Models) => {
  AdviceCommentLike.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });
};

AdviceCommentLike.SearchField = ['Id', 'AdviceCommentId', 'UserId', 'LikeDate'];

module.exports = AdviceCommentLike;
