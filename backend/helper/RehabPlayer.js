/**
 * Builds what the rehabilitation player needs, shared by /api/patient and
 * /api/doctor so the two apps cannot disagree about a patient's day.
 *
 * The rules (target HR, day bands, unlock days) are in helper/RehabDose.js; this
 * file only reads rows and shapes them. Tables: scripts/add_rehab_program_tables.sql.
 */

const { Models, Op } = require('../config/DB');
const MediaRef = require('./MediaRef');
const Dose = require('./RehabDose');

/** Symptom codes the stop checklist may send. Labels live in the app. */
const STOP_SYMPTOMS = ['chest_pain', 'dizzy', 'breathless', 'palpitations', 'nausea', 'other'];

const FINISH_STATUSES = ['completed', 'stopped', 'abandoned'];

/** A movement as the player consumes it. The client never parses MediaRef. */
function ShapeMovement(m) {
  return {
    Id: m.Id,
    ExerciseId: m.ExerciseId,
    OrderNo: m.OrderNo,
    Name: m.Name,
    // One step per line in the database; an array for the client.
    Steps: String(m.GuideText || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    WorkSec: m.WorkSec || null,
    Reps: m.Reps || null,
    PrepSec: Math.max(Dose.MIN_PREP_SEC, parseInt(m.PrepSec, 10) || 0),
    RestSec: m.RestSec || null,
    loop:
      m.LoopStartMs !== null && m.LoopStartMs !== undefined && m.LoopEndMs > m.LoopStartMs
        ? { startMs: m.LoopStartMs, endMs: m.LoopEndMs }
        : null,
    media: MediaRef.Describe(m.MediaRef, '/api/Media/movement/' + m.Id),
    thumb: MediaRef.Describe(m.ThumbRef, '/api/Media/movement/' + m.Id + '/thumb'),
  };
}

/** Active movements for these exercises, grouped by ExerciseId, in order. */
async function MovementsByExercise(exerciseIds) {
  const ids = [...new Set(exerciseIds.filter(Boolean))];
  const map = new Map();
  if (!ids.length) return map;
  const rows = await Models.RehabMovement.findAll({
    where: { ExerciseId: { [Op.in]: ids }, IsActive: true },
    order: [
      ['ExerciseId', 'ASC'],
      ['OrderNo', 'ASC'],
      ['Id', 'ASC'],
    ],
    raw: true,
  });
  for (const r of rows) {
    if (!map.has(r.ExerciseId)) map.set(r.ExerciseId, []);
    map.get(r.ExerciseId).push(ShapeMovement(r));
  }
  return map;
}

/** The patient's current plan (newest active), with its programme. */
async function ActivePlan(PatRegNo) {
  if (!PatRegNo) return null;
  const plan = await Models.RehabPlan.findOne({
    where: { PatRegNo, Status: 'active' },
    order: [
      ['StartDate', 'DESC'],
      ['Id', 'DESC'],
    ],
    raw: true,
  });
  if (!plan) return null;
  const program = await Models.RehabProgram.findByPk(plan.ProgramId, { raw: true });
  return program ? { plan, program } : null;
}

/**
 * One programme day: every active block, resolved for `dayNo`.
 * Locked blocks are included (the home tab shows them greyed out with the day
 * they open) but carry no movements, so nothing is downloaded for them.
 */
async function BuildDay(program, dayNo) {
  const blocks = await Models.RehabProgramBlock.findAll({
    where: { ProgramId: program.Id, IsActive: true },
    order: [
      ['OrderNo', 'ASC'],
      ['Id', 'ASC'],
    ],
    raw: true,
  });

  const exerciseIds = blocks.map((b) => b.ExerciseId);
  const [movements, exercises] = await Promise.all([
    MovementsByExercise(exerciseIds),
    exerciseIds.filter(Boolean).length
      ? Models.RehabExercise.findAll({
          where: { Id: { [Op.in]: exerciseIds.filter(Boolean) } },
          attributes: ['Id', 'Code', 'Name', 'Description'],
          raw: true,
        })
      : [],
  ]);
  const exerciseById = new Map(exercises.map((e) => [e.Id, e]));

  return blocks.map((b) => {
    const unlocked = Dose.IsUnlocked(b, dayNo);
    const list = unlocked ? movements.get(b.ExerciseId) || [] : [];
    const fixed = Dose.DurationFor(b, dayNo);
    const firstThumb = (movements.get(b.ExerciseId) || [])[0];
    const ownThumb = MediaRef.Describe(b.ThumbRef, '/api/Media/block/' + b.Id + '/thumb');
    return {
      Id: b.Id,
      OrderNo: b.OrderNo,
      Title: b.Title,
      Kind: b.Kind,
      GuideText: b.GuideText || null,
      Locked: !unlocked,
      UnlocksOnDay: unlocked ? null : b.ShowFromDay,
      // Timed blocks run for DurationSec; video blocks for as long as their
      // movements take unless the programme fixes a length.
      DurationSec: fixed || (list.length ? Dose.MovementsSec(list) : null),
      CheckInEverySec:
        b.Kind === 'timed' ? parseInt(b.CheckInEverySec, 10) || Dose.DEFAULT_CHECKIN_SEC : null,
      Exercise: b.ExerciseId ? exerciseById.get(b.ExerciseId) || null : null,
      thumb: ownThumb.kind ? ownThumb : firstThumb ? firstThumb.thumb : ownThumb,
      Movements: list,
    };
  });
}

/** Age from the Patient row. */
async function PatientAge(PatientId) {
  if (!PatientId) return null;
  const P = await Models.Patient.findByPk(PatientId, {
    attributes: ['id_data', 'p_birthday'],
    raw: true,
  });
  return P ? Dose.AgeOn(P.p_birthday) : null;
}

/** Dates (YYYY-MM-DD) of completed sessions over the last ~90 days, for the streak and week strip. */
async function CompletedDays(PatRegNo, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await Models.RehabSession.findAll({
    where: { PatRegNo, Status: 'completed', StartedAt: { [Op.gte]: since } },
    attributes: ['StartedAt'],
    raw: true,
  });
  const fmt = (d) => {
    const dt = new Date(d);
    return (
      dt.getFullYear() +
      '-' +
      String(dt.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dt.getDate()).padStart(2, '0')
    );
  };
  return [...new Set(rows.map((r) => fmt(r.StartedAt)))].sort();
}

/** The last resting HR this patient gave, to prefill the next session. */
async function LastRestingHr(PatRegNo) {
  const row = await Models.RehabSession.findOne({
    where: { PatRegNo, RestingHr: { [Op.ne]: null } },
    attributes: ['RestingHr'],
    order: [['StartedAt', 'DESC']],
    raw: true,
  });
  return row ? row.RestingHr : null;
}

/** Plan fields as both apps show them. */
function ShapePlan(plan, program) {
  const pct =
    plan.IntensityPct !== null && plan.IntensityPct !== undefined
      ? Number(plan.IntensityPct)
      : program.DefaultIntensityPct !== null && program.DefaultIntensityPct !== undefined
        ? Number(program.DefaultIntensityPct)
        : null;
  return {
    Id: plan.Id,
    StartDate: plan.StartDate,
    Status: plan.Status,
    IntensityPct: pct,
    MaxHrOverride: plan.MaxHrOverride || null,
    Notes: plan.Notes || null,
    DayNo: Dose.DayNo(plan.StartDate),
    Program: {
      Id: program.Id,
      Code: program.Code,
      Name: program.Name,
      HasHrTarget: !!program.HasHrTarget,
    },
  };
}

/**
 * Parse and validate a stop reason from the app.
 * Returns a JSON string, or null when absent. Unknown symptom codes are dropped.
 */
function CleanStopReason(input) {
  if (!input || typeof input !== 'object') return null;
  const symptoms = Array.isArray(input.symptoms)
    ? [...new Set(input.symptoms.map(String).filter((s) => STOP_SYMPTOMS.includes(s)))]
    : [];
  const note = input.note ? String(input.note).slice(0, 1000) : null;
  if (!symptoms.length && !note) return null;
  return JSON.stringify({ symptoms, note });
}

function ParseStopReason(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/** A session with its check-ins, as the summary screen and the doctor read it. */
async function SessionDetail(Id) {
  const [S, checkins] = await Promise.all([
    Models.RehabSession.findByPk(Id, { raw: true }),
    Models.RehabVitalSign.findAll({
      where: { SessionId: Id },
      attributes: ['AtSec', 'Pulse', 'Borg', 'BorgScale', 'Spo2', 'MeasuredAt'],
      order: [['AtSec', 'ASC']],
      raw: true,
    }),
  ]);
  if (!S) return null;
  return Object.assign({}, S, {
    StopReason: ParseStopReason(S.StopReason),
    Checkins: checkins.map((c) => Object.assign(c, { Zone: Dose.Zone(c.Pulse, S.TargetHr) })),
  });
}

module.exports = {
  SessionDetail,
  STOP_SYMPTOMS,
  FINISH_STATUSES,
  ShapeMovement,
  MovementsByExercise,
  ActivePlan,
  BuildDay,
  PatientAge,
  CompletedDays,
  LastRestingHr,
  ShapePlan,
  CleanStopReason,
  ParseStopReason,
};
