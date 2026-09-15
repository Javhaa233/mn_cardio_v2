const schedule = require('node-schedule');

const { Models, sequelize } = require('../../config/DB');
const ReminderDispatcher = require('../../services/ReminderDispatcher');
const NotificationHelper = require('../../helper/NotificationHelper');

/**
 * Tell the administrators a backup failed.
 *
 * Roles 1 and 6 are the admin and settings tiers (CLAUDE.md §3). Notified
 * individually rather than through a group, because Notification is addressed
 * by ToUserId and there is no group recipient in this schema.
 *
 * Best-effort by construction: this runs inside the backup job's catch block,
 * and a notification failure must not mask the backup failure that caused it.
 */
async function NotifyBackupFailure(BackupId, err) {
  const admins = await Models.Users.findAll({
    where: { RoleId: [1, 6] },
    attributes: ['Id'],
    raw: true,
  });
  if (!admins.length) {
    console.error('[Backup] no admin users to notify');
    return;
  }

  const detail = err && err.message ? String(err.message).slice(0, 200) : '';
  for (const a of admins) {
    await NotificationHelper.NotifyUser({
      UserId: a.Id,
      Action: 'BackupFailed',
      LinkObjectName: 'Backup',
      LinkObjectId: BackupId,
      NotesMn: 'Өгөгдлийн сангийн нөөцлөлт амжилтгүй боллоо' + (detail ? ': ' + detail : ''),
      Notes: 'Database backup failed' + (detail ? ': ' + detail : ''),
      // A system job has no logged-in user. SaveNotification stamps
      // CreateUserId from LogedUser.Id, which is correctly null here.
      LogedUser: {},
    });
  }
}

class AppController {
  /**
   * Nightly full backup at 23:00 — tender §1.3.
   *
   * WHAT WAS WRONG WITH IT. The JS never recorded an outcome it could see. It
   * fired spFullBackup WITHOUT AWAITING IT and returned; the promise settled
   * unobserved, and the only thing the catch did was set Status = 0 and discard
   * the error object. So when a backup failed, the reason was gone - and
   * nothing in the process could tell anybody it had happened.
   *
   * WHAT WAS ALREADY RIGHT, and must not be broken: spFullBackup writes Status
   * and FileName ITSELF. Measured on 2026-09-14 the table holds 1,792 rows with
   * Status '1' and 339 with '0', going back to 2021. So this is not a column
   * nobody was filling - it is a column nobody was WATCHING.
   *
   * Now: the call is awaited, failures are logged with their message, and an
   * administrator is notified. The row is reloaded before Status is set so the
   * procedure's own FileName is kept rather than overwritten.
   *
   * Status is a STRING in the model and the column is nvarchar, so '1' / '0'
   * are written rather than 1 / 0 - matching what is already in the table.
   */
  ScheduleBackUp = () => {
    schedule.scheduleJob('0 0 23 * * *', async function () {
      let data = null;
      const startedAt = Date.now();
      try {
        data = await Models.Backup.create({ CreatedDate: new Date() });

        // Awaited, unlike before. The previous version returned immediately and
        // let the promise settle unobserved, which is why nothing could report
        // on the outcome.
        await sequelize.query('EXEC spFullBackup @BackUpId=:BackUpId', {
          replacements: { BackUpId: data.Id },
        });

        // spFullBackup writes FileName itself, so it is re-read rather than
        // overwritten here - guessing the name would replace a true value with
        // a plausible one.
        await data.reload();
        data.Status = '1';
        if (!data.CreatedDate) data.CreatedDate = new Date();
        await data.save();

        console.error(
          '[Backup] completed id=' +
            data.Id +
            ' in ' +
            Math.round((Date.now() - startedAt) / 1000) +
            's file=' +
            (data.FileName || '(name not set by spFullBackup)')
        );
      } catch (err) {
        // console.error, not console.log: server.js silences console.log in
        // production, which is the only place this matters.
        console.error('[Backup] FAILED: ' + (err && err.message ? err.message : String(err)));

        try {
          if (data) {
            data.Status = '0';
            data.CreatedDate = data.CreatedDate || new Date();
            await data.save();
          }
        } catch (saveEx) {
          console.error('[Backup] could not record failure: ' + saveEx.message);
        }

        // Tell somebody. A failed backup nobody hears about is indistinguishable
        // from no backup system at all.
        try {
          await NotifyBackupFailure(data ? data.Id : null, err);
        } catch (notifyEx) {
          console.error('[Backup] could not notify admins: ' + notifyEx.message);
        }
      }
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
