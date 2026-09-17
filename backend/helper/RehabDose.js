/**
 * The rehabilitation dosing rules, in one place.
 *
 * Source: "SergeenZasah app.xlsx" from the rehab team (2026-09-17), for the four
 * cardiac programmes:
 *
 *   ЗЦТ max = 220 - нас
 *   ЗЦТ бай = ((ЗЦТ max - ЗЦТ тайван) × % эрчим) + ЗЦТ тайван
 *
 * and minutes that step up with the programme day. The xlsx writes the bands as
 * "1-7, 7-14, 14-21, 21+", which puts days 7, 14 and 21 in two bands; the user
 * chose 1-7 / 8-14 / 15-21 / 22+ on the options page. That lives in the DATA
 * (RehabProgramBlock.DurationSteps), not here, so a clinical correction is a row
 * edit, not a release.
 *
 * Everything here is pure: no database, no clock except where a `now` is passed.
 * The server computes the target once, at session start, and stores it on
 * RehabSession, so the app never disagrees with what the doctor sees.
 *
 * NOT DECIDED (ЗСҮТ): the beta-blocker override rule, whether intensity rises
 * over the weeks, stop thresholds, and any role for body weight. Nothing here
 * guesses at those.
 */

const MIN_PREP_SEC = 10;
const DEFAULT_CHECKIN_SEC = 120;

/** Whole years between a birth date and `now`. Null when unknown. */
function AgeOn(birthday, now = new Date()) {
  if (!birthday) return null;
  const b = new Date(birthday);
  if (isNaN(b.getTime())) return null;
  let age = now.getFullYear() - b.getFullYear();
  const beforeBirthday =
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

/** 220 - age, unless the doctor set an override. */
function MaxHr({ age, override }) {
  const o = parseInt(override, 10);
  if (o > 0) return o;
  if (age === null || age === undefined) return null;
  return 220 - age;
}

/**
 * The target heart rate. Null when any input is missing - the app then shows
 * no band rather than a made-up one.
 */
function TargetHr({ maxHr, restingHr, intensityPct }) {
  const max = Number(maxHr);
  const rest = Number(restingHr);
  const pct = Number(intensityPct);
  if (!(max > 0) || !(rest > 0) || !(pct > 0)) return null;
  if (rest >= max) return null;
  return Math.round((max - rest) * (pct / 100) + rest);
}

/**
 * 'above' | 'in' | 'below' for a check-in against the target.
 *
 * The xlsx gives only "above the target → slow down" and "below → speed up",
 * with no tolerance band. 'in' is used for within 5 beats below, so a pulse a
 * couple of beats under target does not nag the patient to go faster. The 5 is
 * ours, not clinical - flagged to ЗСҮТ with the other stop thresholds.
 */
const BELOW_TOLERANCE = 5;
function Zone(pulse, targetHr) {
  const p = Number(pulse);
  const t = Number(targetHr);
  if (!(p > 0) || !(t > 0)) return null;
  if (p > t) return 'above';
  if (p < t - BELOW_TOLERANCE) return 'below';
  return 'in';
}

/** Programme day, 1-based, from the plan's start date (a calendar date). */
function DayNo(startDate, now = new Date()) {
  if (!startDate) return null;
  const s = String(startDate).slice(0, 10).split('-').map(Number);
  if (s.length !== 3 || s.some(isNaN)) return null;
  const start = Date.UTC(s[0], s[1] - 1, s[2]);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - start) / 86400000) + 1;
}

/** Parse DurationSteps JSON. Invalid JSON is treated as absent, never thrown. */
function ParseSteps(raw) {
  if (!raw) return [];
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

/**
 * Seconds this block lasts on `dayNo`.
 *   DurationSteps band that contains the day  → its minutes
 *   otherwise DurationSec                     → as set
 *   otherwise null                            → as long as its movements take
 */
function DurationFor(block, dayNo) {
  const steps = ParseSteps(block.DurationSteps);
  if (steps.length && dayNo > 0) {
    const hit = steps.find((s) => {
      const from = Number(s.fromDay) || 1;
      const to = s.toDay === undefined || s.toDay === null ? Infinity : Number(s.toDay);
      return dayNo >= from && dayNo <= to;
    });
    if (hit && Number(hit.min) > 0) return Math.round(Number(hit.min) * 60);
  }
  const fixed = parseInt(block.DurationSec, 10);
  return fixed > 0 ? fixed : null;
}

/** Whether the block is part of `dayNo` (stairs from day 22, say). */
function IsUnlocked(block, dayNo) {
  const from = parseInt(block.ShowFromDay, 10);
  return !(from > 0) || (dayNo > 0 && dayNo >= from);
}

/** Seconds a playlist of movements takes, preview included; reps count as unknown. */
function MovementsSec(movements) {
  let total = 0;
  for (const m of movements) {
    total += Math.max(MIN_PREP_SEC, parseInt(m.PrepSec, 10) || 0);
    total += parseInt(m.WorkSec, 10) || 0;
    total += parseInt(m.RestSec, 10) || 0;
  }
  return total;
}

/** Fill the programme's warning sentence with the patient's number. */
function Warning(template, targetHr) {
  if (!template || !targetHr) return null;
  return String(template).split('{target}').join(String(targetHr));
}

/**
 * Consecutive days, ending today or yesterday, with a completed session.
 * `days` is a list of 'YYYY-MM-DD' strings (any order, duplicates fine).
 * A streak survives until the end of the day after the last session, so the
 * morning before today's workout does not show zero.
 */
function Streak(days, now = new Date()) {
  const set = new Set(days.map((d) => String(d).slice(0, 10)));
  const fmt = (dt) =>
    dt.getFullYear() +
    '-' +
    String(dt.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(dt.getDate()).padStart(2, '0');
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!set.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (set.has(fmt(cursor))) {
    n += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

module.exports = {
  MIN_PREP_SEC,
  DEFAULT_CHECKIN_SEC,
  AgeOn,
  MaxHr,
  TargetHr,
  Zone,
  DayNo,
  ParseSteps,
  DurationFor,
  IsUnlocked,
  MovementsSec,
  Warning,
  Streak,
};
