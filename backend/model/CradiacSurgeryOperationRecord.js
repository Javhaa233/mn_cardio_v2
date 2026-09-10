const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CradiacSurgeryOperationRecord extends Sequelize.Model {}
CradiacSurgeryOperationRecord.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    image_name: { type: Sequelize.STRING },
    json_image: { type: Sequelize.STRING },
    page_number: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CradiacSurgeryOperationRecord',
    modelName: 'CradiacSurgeryOperationRecord',
    timestamps: false,
  }
);
CradiacSurgeryOperationRecord.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'image_name',
  'json_image',
  'page_number',
];

module.exports = CradiacSurgeryOperationRecord;
