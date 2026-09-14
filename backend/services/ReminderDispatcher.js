/**
 * Fires patient reminders: medication, exercise, follow-up appointments.
 *
 * THE TIMEZONE IS THE WHOLE PROBLEM, SO READ THIS FIRST.
 *
 * MEASURED 2026-09-14: the application server runs UTC (`timedatectl` reports
 * UTC, and `date` agrees), while Mongolia is UTC+8 with no DST. A reminder is
 * stored as a LOCAL WALL-CLOCK string - "08:00" means eight in the morning
 * where the patient is - so a dispatcher that compared it against
 * `new Date().getHours()` on this host would fire every 08:00 medication
 * reminder at 16:00 Ulaanbaatar time. Eight hours late, silently, for everyone.
 *
 * So the current local time is derived with Intl and an explicit
 * `timeZone: 'Asia/Ulaanbaatar'`. Not by adding 8 hours: a fixed offset is a
 * guess that outlives the reason for it, and Mongolia has both introduced and
 * abolished DST within living memory (last abolished 2017). Intl follows the
 * tz database; an offset follows nothing.
 *
 * RE-ENTRANCY. node-schedule will happily start a second invocation while the
 * first is still running - a slow database, a long fan-out - and two concurrent
 * ticks would both see the same due reminders. AppController's three existing
 * jobs get away without a guard because they are nightly and the window is
 * hours wide. A per-minute job cannot. Hence IsRunning.
 *
 * IDEMPOTENCY. Even with that guard, a restart mid-tick would re-fire whatever
 * had not finished. The log row is inserted BEFORE sending, and its UNIQUE
 * (ReminderId, DueAt) index makes the second attempt throw - which is how the
 * dispatcher knows an occurrence has already gone out. Ordering matters: send
 * then record would double-notify on a crash in between, and double-notifying
 * somebody about their medication is the failure worth designing against.
 */

const schedule = require('node-schedule');

const { Models, Op } = require('../config/DB');
const SchemaProbe = require('../helper/SchemaProbe');
const NotificationHelper = require('../helper/NotificationHelper');
const ObjectHelper = require('../helper/ObjectHelper');

const TIMEZONE = 'Asia/Ulaanbaatar';

let IsRunning = false;

/**
 * The current wall-clock moment in Mongolia, as plain parts.
 *
 * en-CA gives ISO-ordered date parts, which is the one locale trick worth
 * knowing here - it avoids parsing a localised string back apart.
 */
function LocalNow() {
  const now = new Date();

  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // YYYY-MM-DD

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now); // HH:mm

  // ISO weekday, 1 = Monday, matching what DaysOfWeek stores.
  const weekdayName = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'short',
  }).format(now);
  const ISO = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

  return { date, time, weekday: ISO[weekdayName] || null };
}

/** '08:00,20:00' -> ['08:00','20:00'] */
const SplitTimes = (csv) =>
  String(csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** '1,3,5' -> [1,3,5]; empty/null means every day. */
const SplitDays = (csv) =>
  String(csv || '')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);

/** Is this reminder due at this local date/time? */
function IsDue(r, Local) {
  if (!SplitTimes(r.TimesOfDay).includes(Local.time)) return false;

  const days = SplitDays(r.DaysOfWeek);
  if (days.length && !days.includes(Local.weekday)) return false;

  // 'once' fires on its StartDate only. Without this it would repeat daily
  // forever, which is the opposite of what the patient asked for.
  if (String(r.Frequency) === 'once') {
    const start = r.StartDate ? String(r.StartDate).slice(0, 10) : null;
    if (start && start !== Local.date) return false;
  }

  return true;
}

async function Tick() {
  if (IsRunning) {
    console.error('[ReminderDispatcher] previous tick still running, skipping this minute');
    return;
  }
  IsRunning = true;

  try {
    if (!SchemaProbe.HasTable('PatientReminder') || !Models.PatientReminder) return;

    const Local = LocalNow();

    // Indexed, and narrow: only active reminders whose date window covers
    // today. The HH:mm and weekday filtering happens in JS because neither is
    // expressible against a CSV column in SQL.
    const rows = await Models.PatientReminder.findAll({
      where: {
        IsActive: true,
        [Op.and]: [
          { [Op.or]: [{ StartDate: null }, { StartDate: { [Op.lte]: Local.date } }] },
          { [Op.or]: [{ EndDate: null }, { EndDate: { [Op.gte]: Local.date } }] },
        ],
      },
      raw: true,
    });

    const due = rows.filter((r) => IsDue(r, Local));
    if (!due.length) return;

    // The minute this occurrence belongs to, in local wall-clock terms. It is
    // the second half of the idempotency key, so it must be stable for the
    // whole minute - seconds are deliberately zeroed.
    const DueAt = Local.date + ' ' + Local.time + ':00';

    for (const r of due) {
      let logRow;
      try {
        // CLAIM FIRST. A duplicate key here means another tick, or this process
        // before a restart, already handled this occurrence.
        logRow = await Models.PatientReminderLog.create({
          ReminderId: r.Id,
          DueAt,
          Channel: 'notification',
          Status: 'pending',
        });
      } catch (ex) {
        // A unique violation is the EXPECTED, healthy case - it means this
        // occurrence has already gone out - so it must not be logged, or the
        // log fills with one error a minute per already-fired reminder and the
        // real failures are buried in it.
        //
        // Detected by ex.name, not by the message. Sequelize surfaces this as
        // SequelizeUniqueConstraintError whose message is the unhelpful
        // "Validation error" - matching on /unique|duplicate/ looks right and
        // silently fails, which is exactly what the first version of this did.
        const Duplicate =
          ex.name === 'SequelizeUniqueConstraintError' ||
          (ex.parent && (ex.parent.number === 2601 || ex.parent.number === 2627));

        if (!Duplicate) {
          console.error('[ReminderDispatcher] claim failed for ' + r.Id + ': ' + ex.message);
        }
        continue;
      }

      try {
        const NotificationId = await NotificationHelper.NotifyPatient({
          PatientId: r.PatientId,
          Action: 'Reminder',
          LinkObjectName: r.LinkObjectName || 'PatientReminder',
          LinkObjectId: r.LinkObjectId || r.Id,
          NotesMn: r.Title || 'Сануулга',
          Notes: r.Body || 'Reminder',
          // NotifyPatient pushes as well; a reminder nobody sees on a locked
          // phone is not a reminder.
          LogedUser: { Id: r.CreateUserId || null },
        });

        await Models.PatientReminderLog.update(
          {
            SentAt: ObjectHelper.getDateYMDHMS(),
            Status: NotificationId ? 'sent' : 'failed',
            NotificationId: NotificationId || null,
          },
          { where: { Id: logRow.Id } }
        );

        // A one-off has done its job; deactivating stops it being re-evaluated
        // every minute for the rest of time.
        if (String(r.Frequency) === 'once') {
          await Models.PatientReminder.update(
            { IsActive: false, UpdateDate: ObjectHelper.getDateYMDHMS() },
            { where: { Id: r.Id } }
          );
        }
      } catch (ex) {
        console.error('[ReminderDispatcher] send failed for ' + r.Id + ': ' + ex.message);
        await Models.PatientReminderLog.update(
          { Status: 'failed', Detail: String(ex.message).slice(0, 500) },
          { where: { Id: logRow.Id } }
        );
      }
    }
  } catch (ex) {
    console.error('[ReminderDispatcher] tick failed: ' + ex.message);
  } finally {
    IsRunning = false;
  }
}

/**
 * Every minute, on the zero second.
 *
 * Registered from AppController.runService alongside the three existing jobs.
 * ecosystem.config.js pins instances to 1, so this fires exactly once - if that
 * is ever raised, this needs a distributed lock and so does the Socket.IO layer.
 */
function Start() {
  schedule.scheduleJob('0 * * * * *', Tick);
  console.error('[ReminderDispatcher] started, timezone ' + TIMEZONE);
}

module.exports = { Start, Tick, LocalNow, IsDue };
