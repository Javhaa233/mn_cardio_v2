const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

/**
 * A reminder the patient set for themselves.
 *
 * TimesOfDay is a CSV of 'HH:mm' LOCAL WALL-CLOCK strings, not datetimes.
 * "08:00" means eight in the morning where the patient is, every day, which is
 * not a point in time - storing a datetime would bind it to whichever timezone
 * happened to be in effect when the row was written. The application server
 * runs UTC and Mongolia is UTC+8, so this distinction is not academic:
 * services/ReminderDispatcher.js converts explicitly and never reads the host
 * clock's hours.
 *
 * DaysOfWeek is '1,3,5' with 1 = Monday (ISO), or NULL for every day.
 *
 * Not registered in ModelConfigs/mainConfig.js: these are the patient's own
 * settings, reached only through /api/patient/reminders. There is no reason for
 * staff to edit somebody's medication reminders through a generic CRUD screen.
 */
class PatientReminder extends Sequelize.Model {}

PatientReminder.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatRegNo: { type: Sequelize.STRING },
    PatientId: { type: Sequelize.INTEGER },
    ReminderType: { type: Sequelize.STRING },
    Title: { type: Sequelize.STRING },
    Body: { type: Sequelize.STRING },
    Frequency: { type: Sequelize.STRING },
    TimesOfDay: { type: Sequelize.STRING },
    DaysOfWeek: { type: Sequelize.STRING },
    StartDate: { type: Sequelize.DATEONLY },
    EndDate: { type: Sequelize.DATEONLY },
    LinkObjectName: { type: Sequelize.STRING },
    LinkObjectId: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.BOOLEAN },
    CreateDate: { type: Sequelize.DATE },
    UpdateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PatientReminder',
    modelName: 'PatientReminder',
    timestamps: false,
  }
);

PatientReminder.SearchField = ['Title', 'ReminderType'];

module.exports = PatientReminder;
