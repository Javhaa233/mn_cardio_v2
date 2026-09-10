const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HospitalizationTooStay extends Sequelize.Model {}

HospitalizationTooStay.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    HospitalizationId: { type: Sequelize.INTEGER },
    StayId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'HospitalizationTooStay',
    modelName: 'HospitalizationTooStay',
    timestamps: false,
  }
);

HospitalizationTooStay.SearchField = ['id', 'HospitalizationId', 'StayId', 'ChildRecStatus'];

module.exports = HospitalizationTooStay;
