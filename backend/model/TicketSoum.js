const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class TicketSoum extends Sequelize.Model {}
TicketSoum.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    ticket_soum_details_id: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    ticket_closed: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'TicketSoum',
    modelName: 'TicketSoum',
    timestamps: false,
  }
);
TicketSoum.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'ticket_soum_details_id',
  'patient_id',
  'ticket_closed',
];

module.exports = TicketSoum;
