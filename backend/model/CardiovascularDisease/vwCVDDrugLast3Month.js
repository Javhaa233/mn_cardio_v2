const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class vwCVDDrugLast3Month extends Sequelize.Model {}
vwCVDDrugLast3Month.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true },

    Year: { type: Sequelize.STRING },
    Month: { type: Sequelize.STRING },
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

    FullDate: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.Year + '-' + this.Month + '-01';
      },
    },
  },
  {
    sequelize,
    tableName: 'vwCVDDrugLast3Month',
    modelName: 'vwCVDDrugLast3Month',
    timestamps: false,
  }
);

module.exports = vwCVDDrugLast3Month;
