/**
 * Telling a patient that somebody read their record. Tracker row 24, notify half.
 *
 * THE POLICY IS A SETTING BECAUSE THE QUESTION IS UNANSWERED, NOT BECAUSE
 * SETTINGS ARE NICE. "Notify on every record access" has three readings and
 * they differ in volume by orders of magnitude (BLOCKERS item 15, put to ЗСҮТ
 * on 2026-09-09). Building one of them and calling it done would be guessing at
 * the customer's expense; building all four as a switch means their answer
 * changes a value rather than this file.
 *
 *   none        (default) audit only. Today's behaviour.
 *   every       one notification per audit row that survives deduplication.
 *               Roughly one per patient contact.
 *   digest      a daily summary per patient, from a node-schedule job beside
 *               the three AppController already runs.
 *   nontreating only when the reader is NOT on the patient's care team.
 *
 * RECOMMEND nontreating. It is the only reading whose volume is bounded, and
 * it is the one that matches what the requirement is actually for: a patient
 * does not want to be told that their own cardiologist opened their chart -
 * that is what a cardiologist does. They want to know when somebody outside
 * their care did.
 *
 * Nothing here decides whether the ACCESS is allowed; helper/AccessAudit.js has
 * already recorded it by the time this runs.
 */

const Flags = require('./FeatureFlags');
const CareTeam = require('./CareTeam');
const NotificationHelper = require('./NotificationHelper');

/**
 * Should this access produce a notification now?
 *
 * Returns { Notify, Defer, Reason }. Defer means "record it for the daily
 * digest" rather than "send nothing" - the digest job picks those up.
 */
async function Decide({ LogedUser, PatientId }) {
  const Policy = Flags.AccessNotifyPolicy;

  if (Policy === 'none') return { Notify: false, Defer: false, Reason: 'policy-none' };
  if (!LogedUser || !PatientId) return { Notify: false, Defer: false, Reason: 'incomplete' };

  // A patient reading their own record is not an access event.
  if (String(LogedUser.RoleId) === '4') return { Notify: false, Defer: false, Reason: 'self' };

  if (Policy === 'digest') return { Notify: false, Defer: true, Reason: 'digest' };
  if (Policy === 'every') return { Notify: true, Defer: false, Reason: 'every' };

  if (Policy === 'nontreating') {
    // Admin is deliberately NOT treated as treating: an administrator opening
    // a record is precisely the access this policy exists to surface.
    const Treating = await CareTeam.IsTreating({ UserId: LogedUser.Id, PatientId });
    return Treating
      ? { Notify: false, Defer: false, Reason: 'treating' }
      : { Notify: true, Defer: false, Reason: 'nontreating' };
  }

  return { Notify: false, Defer: false, Reason: 'unknown-policy' };
}

/**
 * Send it. Best-effort and never throws - a notification failing must not fail
 * the clinical read that triggered it.
 *
 * The message deliberately names the ORGANISATION and not the individual.
 * Telling a patient "Dr X opened your record" invites a confrontation with a
 * named clinician over what may be entirely routine access; naming the
 * institution lets them ask the institution, which is who can actually answer.
 */
async function Notify({ LogedUser, PatientId, ObjectName }) {
  try {
    const Decision = await Decide({ LogedUser, PatientId });
    if (!Decision.Notify) return Decision;

    const Org =
      LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Name
        : null;

    await NotificationHelper.NotifyPatient({
      PatientId,
      Action: 'RecordAccessed',
      LinkObjectName: ObjectName || 'Patient',
      LinkObjectId: PatientId,
      NotesMn: Org
        ? 'Таны эрүүл мэндийн мэдээлэлд ' + Org + '-ийн эмч хандлаа'
        : 'Таны эрүүл мэндийн мэдээлэлд хандалт хийгдлээ',
      Notes: 'Your health record was accessed',
      LogedUser,
    });

    return Decision;
  } catch (ex) {
    console.error('[AccessNotify] ' + ex.message);
    return { Notify: false, Defer: false, Reason: 'error' };
  }
}

module.exports = { Decide, Notify };
