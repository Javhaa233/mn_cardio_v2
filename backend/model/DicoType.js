const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DicoType extends Sequelize.Model {}
DicoType.init(
  {
    dico: { type: Sequelize.STRING, primaryKey: true },
    Name: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'DicoType',
    modelName: 'DicoType',
    timestamps: false,
  }
);

DicoType.SearchField = ['dico', 'Name', 'Description'];

DicoType.SetAssocations = (Models) => {
  DicoType.hasMany(Models.OptionTypes, {
    as: 'OptionTypes',
    foreignKey: 'dico',
  });
};

DicoType.SetFunctions = (Models) => {
  DicoType.findAllNew = async function (Option) {
    const result = await DicoType.findAll({
      ...Option,
      // include: [
      //   {
      //     model: OptionTypes,
      //     as: "OptionTypes"
      //   }
      // ]
    });
    return result;
  };
};
module.exports = DicoType;
