const Sequelize = require('sequelize');
const sequelize = require('../../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OptionOpValues extends Sequelize.Model {}
OptionOpValues.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    optionId: { type: Sequelize.INTEGER },
    optionValueId: { type: Sequelize.INTEGER },
    orderNum: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'OptionOpValues',
    modelName: 'OptionOpValues',
    timestamps: false,
  }
);

OptionOpValues.SetAssocations = (Models) => {
  OptionOpValues.belongsTo(Models.Options, {
    as: 'option',
    foreignKey: 'optionId',
  });
  OptionOpValues.belongsTo(Models.OptionValues, {
    as: 'optionValue',
    foreignKey: 'optionValueId',
  });
};

module.exports = OptionOpValues;
