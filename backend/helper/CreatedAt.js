/**
 * When a legacy row was really created - to the minute.
 *
 * date_creation is SQL `date` on 91 of the 92 legacy tables that have it
 * (measured 2026-09-15), so the server drops the time on write and every
 * question, reply and advice comment of a day read back as 00:00. Stamping the
 * time in ModelHelper cannot fix that; only DDL could, and DDL on those tables
 * is the customer's call.
 *
 * date_modif is `datetime`, and ModelHelper stamps it with the time on create.
 * For a message row it is the creation moment unless the row was edited later,
 * which is rare. So: use date_modif when it falls within the creation day
 * (with a day of slack either side for timezone rendering), else fall back to
 * the date. The web thread (MonitorQuestion) already displays date_modif; this
 * brings the app endpoints level with it.
 *
 * Output field names stay as they were - callers put the result back into
 * date_creation / date, so no client has to change.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

const CreatedAt = (row) => {
  if (!row) return null;
  const created = row.date_creation;
  const modif = row.date_modif;
  if (!modif) return created || null;
  if (!created) return modif;

  const c = new Date(created).getTime();
  const m = new Date(modif).getTime();
  if (Number.isNaN(c) || Number.isNaN(m)) return created;
  return m >= c - DAY_MS && m < c + 2 * DAY_MS ? modif : created;
};

module.exports = CreatedAt;
