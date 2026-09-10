const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class LookupDepartmentOperation extends Sequelize.Model {}
LookupDepartmentOperation.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    id_department: { type: Sequelize.INTEGER },
    id_operation: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'LookupDepartmentOperation',
    modelName: 'LookupDepartmentOperation',
    timestamps: false,
  }
);
LookupDepartmentOperation.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'id_department',
  'id_operation',
];

module.exports = LookupDepartmentOperation;
