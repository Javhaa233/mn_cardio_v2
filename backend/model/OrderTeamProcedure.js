const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OrderTeamProcedure extends Sequelize.Model {}
OrderTeamProcedure.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    note: { type: Sequelize.STRING },
    order_id: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    priority: { type: Sequelize.INTEGER },
    procedure_type: { type: Sequelize.STRING },
    processed: { type: Sequelize.STRING },
    team_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'OrderTeamProcedure',
    modelName: 'OrderTeamProcedure',
    timestamps: false,
  }
);
OrderTeamProcedure.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'note',
  'order_id',
  'patient_id',
  'priority',
  'procedure_type',
  'processed',
  'team_id',
];

module.exports = OrderTeamProcedure;
