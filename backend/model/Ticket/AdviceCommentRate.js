const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

class AdviceCommentRate extends Sequelize.Model {}
AdviceCommentRate.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    AdviceCommentId: { type: Sequelize.INTEGER },
    UserId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    Point: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'AdviceCommentRate',
    modelName: 'AdviceCommentRate',
    timestamps: false,
  }
);

AdviceCommentRate.SetAssocations = (Models) => {
  AdviceCommentRate.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
    targetKey: 'Id',
  });
  AdviceCommentRate.belongsTo(Models.AdviceComment, {
    as: 'AdviceComment',
    foreignKey: 'AdviceCommentId',
    targetKey: 'id_data',
  });
};

AdviceCommentRate.SearchField = ['Id', 'AdviceCommentId', 'UserId', 'Point'];

module.exports = AdviceCommentRate;
