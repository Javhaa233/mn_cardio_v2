const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ExaminationEchoNotationLookUp extends Sequelize.Model {}

ExaminationEchoNotationLookUp.init(
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
    tableName: 'ExaminationEchoNotationLookUp',
    modelName: 'ExaminationEchoNotationLookUp',
    timestamps: false,
  }
);
ExaminationEchoNotationLookUp.SearchField = ['id_lookup', 'id_data', 'id_question', 'value'];

ExaminationEchoNotationLookUp.SetAssocations = (Models) => {
  ExaminationEchoNotationLookUp.belongsTo(Models.vwEchoElementTag, {
    as: 'vwEchoElementTag',
    foreignKey: 'value',
    targetKey: 'value',
  });
};

module.exports = ExaminationEchoNotationLookUp;
