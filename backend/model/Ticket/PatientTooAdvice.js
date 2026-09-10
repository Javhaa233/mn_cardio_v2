const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientTooAdvice extends Sequelize.Model {}
PatientTooAdvice.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    AdviceId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientTooAdvice',
    modelName: 'PatientTooAdvice',
    timestamps: false,
  }
);
PatientTooAdvice.SearchField = ['id', 'PatientId', 'AdviceId', 'ChildRecStatus'];

module.exports = PatientTooAdvice;
