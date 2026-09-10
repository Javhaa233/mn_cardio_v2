const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CathlabElementLookUp extends Sequelize.Model {}
CathlabElementLookUp.init(
  {
    id_lookup: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_data: { type: Sequelize.INTEGER },
    id_question: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'CathlabElementLookUp',
    modelName: 'CathlabElementLookUp',
    timestamps: false,
  }
);
CathlabElementLookUp.SearchField = ['id_lookup', 'id_data', 'id_question', 'value'];

CathlabElementLookUp.SetAssocations = (Models) => {
  CathlabElementLookUp.belongsTo(Models.vwCathLabElementTags, {
    as: 'vwCathLabElementTags',
    foreignKey: 'value',
    targetKey: 'value',
  });
};

module.exports = CathlabElementLookUp;
