const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * One row per reminder occurrence, written BEFORE the notification is sent.
 *
 * (ReminderId, DueAt) carries a UNIQUE index, and that is the whole point: the
 * dispatcher claims a minute by inserting, and a duplicate-key error is how it
 * learns the occurrence has already gone out. A restart mid-tick, a clock
 * adjustment or an overlapping tick therefore cannot deliver the same 08:00
 * medication reminder twice.
 *
 * Written first and updated with SentAt afterwards - not the other way round.
 * Sending and then recording would double-notify on a crash in between, which
 * is the failure that matters here; recording and then failing to send merely
 * misses one, which the patient can see in the app.
 */
class PatientReminderLog extends Sequelize.Model {}

PatientReminderLog.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ReminderId: { type: Sequelize.INTEGER },
    DueAt: { type: Sequelize.DATE },
    SentAt: { type: Sequelize.DATE },
    Channel: { type: Sequelize.STRING },
    Status: { type: Sequelize.STRING },
    NotificationId: { type: Sequelize.INTEGER },
    Detail: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientReminderLog',
    modelName: 'PatientReminderLog',
    timestamps: false,
  }
);

PatientReminderLog.SearchField = ['ReminderId', 'Status'];

module.exports = PatientReminderLog;
