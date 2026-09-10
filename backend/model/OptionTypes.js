const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OptionTypes extends Sequelize.Model {}
OptionTypes.init(
  {
    id_dico: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    dico: { type: Sequelize.STRING },
    label: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING },
    pos: { type: Sequelize.INTEGER },
    translate_flag: { type: Sequelize.SMALLINT },
  },
  {
    sequelize,
    tableName: 'OptionTypes',
    modelName: 'OptionTypes',
    timestamps: false,
  }
);

OptionTypes.SearchField = ['id_dico', 'dico', 'label', 'value', 'pos', 'translate_flag'];

OptionTypes.SetAssocations = (Models) => {
  OptionTypes.belongsTo(Models.DicoType, {
    as: 'DicoType',
    foreignKey: 'dico',
    targetKey: 'dico',
  });
};

OptionTypes.SetFunctions = (Models) => {
  OptionTypes.findAllNew = async function (Option) {
    const result = await OptionTypes.findAll({
      ...Option,
      include: [{ model: Models.DicoType, as: 'DicoType' }],
    });
    return result;
  };
};

// OptionTypes.primaryKeyAttribute = "value";

module.exports = OptionTypes;
