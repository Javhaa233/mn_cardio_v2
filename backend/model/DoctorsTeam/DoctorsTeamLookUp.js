const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorsTeamLookUp extends Sequelize.Model {}

DoctorsTeamLookUp.init(
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
    tableName: 'DoctorsTeamLookUp',
    modelName: 'DoctorsTeamLookUp',
    timestamps: false,
  }
);
DoctorsTeamLookUp.SearchField = ['id_lookup', 'id_data', 'id_question', 'value'];

module.exports = DoctorsTeamLookUp;
