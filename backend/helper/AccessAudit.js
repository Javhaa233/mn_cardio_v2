/**
 * Who looked at whose record.
 *
 * Tracker row 24 asks for two things: an access log, and a notification to the
 * patient when their record is read. Only the first is unambiguous. What
 * "notify on every access" means is a customer question with three plausible
 * readings whose volumes differ by orders of magnitude (mobile/BLOCKERS.md item
 * 15), so the write side ships now and the notify side is a policy setting -
 * ACCESS_NOTIFY_POLICY - that defaults to none. When the answer arrives it is a
 * value, not a rewrite.
 *
 * VOLUME IS THE WHOLE DESIGN PROBLEM. An audit row per patient-record read on a
 * system with ~450,000 Visit rows is affordable; a row per result row is not,
 * and a row per list query is noise nobody will ever read. Two rules keep it
 * honest:
 *
 *   1. Hook only where exactly ONE patient has been resolved. Never on a list,
 *      never on a search, never on a dashboard aggregate. An export writes one
 *      row carrying a count, not one row per record exported.
 *
 *   2. Dedupe. A doctor refreshing a patient's chart, or a mobile screen
 *      polling it, is one clinical act. Repeat reads of the same subject by the
 *      same user collapse for ACCESS_AUDIT_DEDUPE_MIN minutes.
 *
 * Deliberately NOT hooked, and this list is part of the design rather than an
 * omission: /BaseObject list, Dashboard/*, CVDAnalysis/*, CVDReport/*, Report/*.
 * Those are cohort aggregates with no single subject.
 *
 * Never throws. An audit failure must not turn a working clinical read into a
 * 500 - the record of the read is less important than the read.
 */

const Flags = require('./FeatureFlags');
const CareTeam = require('./CareTeam');
const BaseControllerHelper = require('./BaseControllerHelper');

/** 'userId:patientId:objectName' -> epoch ms of the last row written. */
const Recent = new Map();

const DedupeMs = () => Flags.AccessAuditDedupeMin * 60 * 1000;

function ShouldWrite(Key, Now) {
  const Last = Recent.get(Key);
  if (Last && Now - Last < DedupeMs()) return false;

  // Bounded. Without this a long-running process accumulates one entry per
  // user-patient-object triple for the lifetime of the box.
  if (Recent.size > 20000) Recent.clear();
  Recent.set(Key, Now);
  return true;
}

/**
 * Record that LogedUser read PatientId's data.
 *
 * Fire-and-forget: call it without awaiting if the handler has nothing to do
 * with the result. It swallows its own errors either way.
 *
 * @param {object}  p.LogedUser  req.LogedUser
 * @param {number}  p.PatientId  Patient.id_data - the subject, required
 * @param {string}  p.ObjectName what was read, e.g. 'Visit'
 * @param {number}  p.ObjectId   optional row id
 * @param {string}  p.Action     short verb, e.g. 'ViewVisit'
 * @param {number}  p.RowCount   for exports: how many records left the system
 */
async function RecordAccess({ LogedUser, PatientId, ObjectName, ObjectId, Action, RowCount }) {
  try {
    if (!Flags.AccessAuditEnabled) return;
    if (!LogedUser || !PatientId || !ObjectName) return;

    // A patient reading their own record is not an access event worth logging:
    // it is the entire purpose of the patient app, and logging it would bury
    // the staff reads this table exists to surface.
    if (String(LogedUser.RoleId) === '4') return;

    const Now = Date.now();
    const Key = String(LogedUser.Id) + ':' + String(PatientId) + ':' + String(ObjectName);
    if (!ShouldWrite(Key, Now)) return;

    await BaseControllerHelper.CreateUserActionHistory({
      LinkObjectName: ObjectName,
      LinkObjectId: ObjectId || null,
      Action: Action || 'View',
      LogedUser,
      PatientId,
      Notes: RowCount ? String(ObjectName) + ' x' + String(RowCount) : 'Read',
      NotesMn: RowCount
        ? String(ObjectName) + ' ' + String(RowCount) + ' мөр гаргав'
        : 'Мэдээлэл үзсэн',
    });
  } catch (ex) {
    console.error('[AccessAudit] could not record access: ' + ex.message);
  }
}

/**
 * Is this user one of the patient's treating clinicians?
 *
 * Delegated to CareTeam so there is one definition of "my patient" across chat,
 * rehabilitation, e-visit triage and this. Note that admin is NOT treated as
 * treating - an administrator opening a record is exactly the access the
 * "notify on non-treating access" policy exists to surface.
 */
async function IsTreating({ UserId, PatientId }) {
  try {
    return await CareTeam.IsTreating({ UserId, PatientId });
  } catch (ex) {
    console.error('[AccessAudit] IsTreating failed: ' + ex.message);
    // Fail towards "treating", i.e. towards NOT notifying. A false alarm
    // telling a patient their record was read improperly is worse than a
    // missed one, and the audit row is written either way.
    return true;
  }
}

module.exports = { RecordAccess, IsTreating };
