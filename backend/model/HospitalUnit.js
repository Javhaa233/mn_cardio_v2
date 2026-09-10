const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class HospitalUnit extends Sequelize.Model {}

HospitalUnit.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    capacity: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    price: { type: Sequelize.DECIMAL },
    branch_id: { type: Sequelize.INTEGER },
    department_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'HospitalUnit',
    modelName: 'HospitalUnit',
    timestamps: false,
  }
);
HospitalUnit.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'capacity',
  'name',
  'price',
  'branch_id',
  'department_id',
];

module.exports = HospitalUnit;
