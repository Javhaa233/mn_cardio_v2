const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class vwVisitComments extends Sequelize.Model {}
vwVisitComments.init(
  {
    PatientId: { type: Sequelize.INTEGER, primaryKey: true },
    CommentQty: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'vwVisitComments',
    modelName: 'vwVisitComments',
    timestamps: false,
  }
);

module.exports = vwVisitComments;
