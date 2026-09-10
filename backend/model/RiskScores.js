const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class RiskScores extends Sequelize.Model {}
RiskScores.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    CreatedDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.STRING },

    gender: { type: Sequelize.STRING },
    isCholestrol: { type: Sequelize.STRING },
    isDiabetes: { type: Sequelize.STRING },
    isSmoker: { type: Sequelize.STRING },
    minAge: { type: Sequelize.INTEGER },
    maxAge: { type: Sequelize.INTEGER },
    minCholestrol: { type: Sequelize.FLOAT },
    maxCholestrol: { type: Sequelize.FLOAT },
    minPressure: { type: Sequelize.FLOAT },
    maxPressure: { type: Sequelize.FLOAT },
    minBMI: { type: Sequelize.FLOAT },
    maxBMI: { type: Sequelize.FLOAT },
    risk: { type: Sequelize.INTEGER },
    score: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RiskScores',
    modelName: 'RiskScores',
    timestamps: false,
  }
);

RiskScores.SetAssocations = (Models) => {
  RiskScores.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
};

module.exports = RiskScores;
