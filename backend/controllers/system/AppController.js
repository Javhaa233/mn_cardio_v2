const schedule = require('node-schedule');

const { Models, sequelize } = require('../../config/DB');
const ReminderDispatcher = require('../../services/ReminderDispatcher');

class AppController {
  ScheduleBackUp = () => {
    // save backup
    schedule.scheduleJob('0 0 23 * * *', async function () {
      const data = await Models.Backup.create({});
      sequelize
        .query('EXEC spFullBackup @BackUpId=' + data.Id)
        .then((el) => {
          //
        })
        .catch((err) => {
          data.Status = 0;
          data.CreatedDate = new Date();
          data.save();
        });
    });
  };

  // Close Advice
  ScheduleUpdateAdvice = () => {
    schedule.scheduleJob('0 0 2 * * *', async function () {
      sequelize
        .query('EXEC spUpdateAdvice')
        .then(() => {})
        .catch((err) => {});
    });
  };

  // Notifications Read
  ScheduleUpdateNotification = () => {
    schedule.scheduleJob('0 0 2 * * *', async function () {
      sequelize
        .query('EXEC spUpdateNotification')
        .then(() => {})
        .catch((err) => {});
    });
  };

  runService() {
    this.ScheduleBackUp();
    this.ScheduleUpdateAdvice();
    this.ScheduleUpdateNotification();
    // Patient reminders - medication, exercise, follow-up. Unlike the three
    // above this runs every minute, which is why it carries its own
    // re-entrancy guard; see services/ReminderDispatcher.js.
    ReminderDispatcher.Start();
  }
}

// express.ScheduleBackUp();

module.exports = new AppController();
