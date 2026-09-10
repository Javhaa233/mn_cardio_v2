const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDHunAm extends Sequelize.Model {}
CVDHunAm.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    Year: { type: Sequelize.INTEGER },
    Er0to17Age: { type: Sequelize.INTEGER },
    Em0to17Age: { type: Sequelize.INTEGER },
    Er18to39Age: { type: Sequelize.INTEGER },
    Em18to39Age: { type: Sequelize.INTEGER },
    Er40upAge: { type: Sequelize.INTEGER },
    Em40upAge: { type: Sequelize.INTEGER },
    ProvinceCityId: { type: Sequelize.INTEGER },
    SoumDistrictId: { type: Sequelize.INTEGER },
    BagKhorooId: { type: Sequelize.INTEGER },
    OrganizationId: { type: Sequelize.INTEGER },
    Type: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    UpdateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDHunAm',
    modelName: 'CVDHunAm',
    timestamps: false,
  }
);

module.exports = CVDHunAm;
