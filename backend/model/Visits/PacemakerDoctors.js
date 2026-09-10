const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PacemakerDoctors extends Sequelize.Model {}
PacemakerDoctors.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DoctorName: { type: Sequelize.STRING },
    DepartmentId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PacemakerDoctors',
    modelName: 'PacemakerDoctors',
    timestamps: false,
  }
);

PacemakerDoctors.findAllNew = async function (Option) {
  const result = await PacemakerDoctors.findAll({ ...Option });
  return result;
};

module.exports = PacemakerDoctors;
