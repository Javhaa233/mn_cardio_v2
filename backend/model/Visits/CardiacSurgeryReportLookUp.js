const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CardiacSurgeryReportLookUp extends Sequelize.Model {}

CardiacSurgeryReportLookUp.init(
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
    tableName: 'CardiacSurgeryReportLookUp',
    modelName: 'CardiacSurgeryReportLookUp',
    timestamps: false,
  }
);
CardiacSurgeryReportLookUp.SearchField = ['id_lookup', 'id_data', 'id_question', 'value'];

module.exports = CardiacSurgeryReportLookUp;
