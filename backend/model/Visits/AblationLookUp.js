const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class AblationLookUp extends Sequelize.Model {}

AblationLookUp.init(
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
    tableName: 'AblationLookUp',
    modelName: 'AblationLookUp',
    timestamps: false,
  }
);
AblationLookUp.SearchField = ['id_lookup', 'id_data', 'id_question', 'value'];

module.exports = AblationLookUp;
