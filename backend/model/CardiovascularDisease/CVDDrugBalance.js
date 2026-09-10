const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDDrugBalance extends Sequelize.Model {}
CVDDrugBalance.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    Year: { type: Sequelize.STRING },
    Month: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
    ProvinceCityId: { type: Sequelize.INTEGER },
    SoumDistrictId: { type: Sequelize.INTEGER },
    BagKhorooId: { type: Sequelize.INTEGER },
    Em1: { type: Sequelize.STRING },
    Em2: { type: Sequelize.STRING },
    Em3: { type: Sequelize.STRING },
    Em4: { type: Sequelize.STRING },
    Em5: { type: Sequelize.STRING },
    Em6: { type: Sequelize.STRING },
    Em7: { type: Sequelize.STRING },
    Em8: { type: Sequelize.STRING },
    Em9: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    UpdateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CVDDrugBalance',
    modelName: 'CVDDrugBalance',
    timestamps: false,
  }
);

module.exports = CVDDrugBalance;
