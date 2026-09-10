const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

class vwAdviceViews extends Sequelize.Model {}

vwAdviceViews.init(
  {
    AdviceId: { type: Sequelize.INTEGER, primaryKey: true },
    ViewQty: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'vwAdviceViews',
    modelName: 'vwAdviceViews',
    timestamps: false,
  }
);

vwAdviceViews.SearchField = ['AdviceId', 'ViewQty'];

module.exports = vwAdviceViews;
