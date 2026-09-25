/**
 * "Which doctors belong to this patient", and its inverse.
 *
 * This rule already existed, privately, inside ChatController - it decides who
 * a patient may start a chat with. Several things now need the same answer:
 * whether a doctor may write a rehabilitation assessment for a patient, whether
 * an unassigned e-visit request should appear in their triage queue, and
 * whether an access-audit row counts as a treating or a non-treating read.
 *
 * It is extracted rather than copied because it is a security boundary, and a
 * security boundary maintained in two files is one that will disagree with
 * itself. api/doctor/controller.js already refuses to duplicate BuildAdviceScope
 * for exactly this reason, and helper/AdviceScopeHelper.js exists because
 * nothing else could reuse the Advice rules while they lived in a controller.
 *
 * Two membership routes, both of which count:
 *
 *   the care team - DoctorsTeamPatient(patient_id) -> team_id ->
 *   LookupDoctorTeam(doctor_id) -> DoctorsProfile.id_data -> DoctorsProfile.UserId
 *   (the DB column is named `id`, which is the Users.Id, not the profile's own key);
 *
 *   a doctor actively monitoring the patient (PatientMonitoringDoctor,
 *   is_active '1') - the doctor app's "Миний хяналт". Care teams alone left a
 *   monitored patient unable to reach the doctor watching their journal.
 *
 * rec_status 2 is soft-deleted throughout the legacy generation.
 *
 * A NOTE ON THE TWO DOCTOR IDS, because they are easy to mix up and the mistake
 * is silent: DoctorsProfile.id is the Users.Id; DoctorsProfile.id_data is the
 * profile's own primary key. This file speaks in Users.Id, because that is what
 * chat, tokens and PatientMonitoringDoctor.user_id use. Columns named DoctorId
 * elsewhere in the schema mean id_data. Getting it wrong joins the wrong doctor
 * and nothing errors.
 */

const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

/** Users.Id of every doctor on this patient's care team or monitoring them. */
async function GetCareTeamUserIds(PatientId) {
  if (!PatientId) return [];

  const Rows = await sequelize.query(
    `SELECT dp.id AS UserId
       FROM [DoctorsTeamPatient] dtp
       JOIN [LookupDoctorTeam] ldt
         ON ldt.team_id = dtp.team_id AND ISNULL(ldt.rec_status, 0) <> 2
       JOIN [DoctorsProfile] dp
         ON dp.id_data = ldt.doctor_id AND ISNULL(dp.rec_status, 0) <> 2
      WHERE dtp.patient_id = :PatientId
        AND ISNULL(dtp.rec_status, 0) <> 2
        AND dp.id IS NOT NULL
     UNION
     SELECT pmd.user_id AS UserId
       FROM [PatientMonitoringDoctor] pmd
       JOIN [Users] u ON u.Id = pmd.user_id AND u.RoleId <> 4
      WHERE pmd.patient_id = :PatientId
        AND pmd.is_active = '1'`,
    { type: Sequelize.QueryTypes.SELECT, replacements: { PatientId } }
  );

  return Rows.map((R) => R.UserId);
}

/**
 * The inverse: Patient.id_data of every patient this doctor is responsible for.
 *
 * Used to scope a triage queue. Deliberately the same two membership routes, so
 * "my patients" means the same thing in both directions - a patient who can
 * chat with me is a patient whose request I can see.
 */
async function GetCareTeamPatientIds(UserId) {
  if (!UserId) return [];

  const Rows = await sequelize.query(
    `SELECT dtp.patient_id AS PatientId
       FROM [DoctorsTeamPatient] dtp
       JOIN [LookupDoctorTeam] ldt
         ON ldt.team_id = dtp.team_id AND ISNULL(ldt.rec_status, 0) <> 2
       JOIN [DoctorsProfile] dp
         ON dp.id_data = ldt.doctor_id AND ISNULL(dp.rec_status, 0) <> 2
      WHERE dp.id = :UserId
        AND ISNULL(dtp.rec_status, 0) <> 2
        AND dtp.patient_id IS NOT NULL
     UNION
     SELECT pmd.patient_id AS PatientId
       FROM [PatientMonitoringDoctor] pmd
      WHERE pmd.user_id = :UserId
        AND pmd.is_active = '1'
        AND pmd.patient_id IS NOT NULL`,
    { type: Sequelize.QueryTypes.SELECT, replacements: { UserId } }
  );

  return Rows.map((R) => R.PatientId);
}

/**
 * May this doctor act on this patient's record?
 *
 * Admins (RoleId 1) always may. Everyone else must be on the care team or
 * monitoring. Note that several existing READ endpoints are deliberately
 * nationwide and do not ask this - reading a colleague's patient is how a
 * national consult service works. Use this on WRITES, and on anything that
 * exposes a list of patients the caller did not already name.
 */
async function CanAccessPatient(Doctor, PatientId) {
  if (!Doctor || !PatientId) return false;
  if (Doctor.IsAdmin || String(Doctor.RoleId) === '1') return true;
  if (!Doctor.UserId) return false;

  const Ids = await GetCareTeamUserIds(PatientId);
  return Ids.map(String).includes(String(Doctor.UserId));
}

/**
 * Is this user one of the patient's treating clinicians?
 *
 * Same question as CanAccessPatient, asked for a different purpose - the access
 * log needs it to tell a routine read from one worth telling the patient about
 * - so admin is NOT a shortcut here. An administrator opening a record is
 * precisely the kind of access the "notify on non-treating access" policy
 * exists to surface.
 *
 * Memoised for five minutes. This runs on read paths, and the underlying
 * membership changes on the scale of days.
 */
const TreatingCache = new Map();
const TREATING_TTL_MS = 5 * 60 * 1000;

async function IsTreating({ UserId, PatientId }) {
  if (!UserId || !PatientId) return false;

  const Key = String(UserId) + ':' + String(PatientId);
  const Now = Date.now();
  const Hit = TreatingCache.get(Key);
  if (Hit && Now - Hit.At < TREATING_TTL_MS) return Hit.Value;

  const Ids = await GetCareTeamUserIds(PatientId);
  const Value = Ids.map(String).includes(String(UserId));

  // Bounded, so a long-running process cannot accumulate one entry per
  // doctor-patient pair for the lifetime of the box.
  if (TreatingCache.size > 5000) TreatingCache.clear();
  TreatingCache.set(Key, { At: Now, Value });

  return Value;
}

/**
 * Who is monitoring this patient right now - for the "Энэ өвчтөн ...-ын хяналтад
 * байна" banner on the patient card (web and doctor app).
 *
 * Deliberately NOT behind CanAccessPatient: the banner is how a doctor who is
 * not yet on the team finds out and takes the patient, so asking for access
 * first would make the banner useless to exactly the person it is for. What it
 * returns is therefore limited to name, organisation and since-when - the same
 * a colleague would learn by asking at the nurses' station - never anything
 * clinical.
 *
 * Since uses date_modif, not date_creation: the legacy date_creation is a SQL
 * `date` and drops the time, and SavePatient re-activates an old row by
 * flipping is_active, so date_creation would report the FIRST time, not this one.
 */
async function GetMonitors(PatientId, ViewerUserId) {
  if (!PatientId) return [];

  const Rows = await sequelize.query(
    `SELECT pmd.user_id AS UserId,
            dp.lastname AS LastName,
            dp.firstname AS FirstName,
            u.UserName AS UserName,
            o.Name AS OrganizationName,
            pmd.date_modif AS Since
       FROM [PatientMonitoringDoctor] pmd
       JOIN [Users] u ON u.Id = pmd.user_id AND u.RoleId <> 4
       LEFT JOIN [DoctorsProfile] dp
         ON dp.id = pmd.user_id AND ISNULL(dp.rec_status, 0) <> 2
       LEFT JOIN [Organization] o ON o.Id = dp.OrganizationId
      WHERE pmd.patient_id = :PatientId
        AND pmd.is_active = '1'
      ORDER BY pmd.date_modif`,
    { type: Sequelize.QueryTypes.SELECT, replacements: { PatientId } }
  );

  // A doctor with two profile rows would otherwise be listed twice.
  const Seen = new Set();
  const Result = [];
  for (const R of Rows) {
    if (Seen.has(String(R.UserId))) continue;
    Seen.add(String(R.UserId));
    const Last = (R.LastName || '').trim();
    const First = (R.FirstName || '').trim();
    // "Д.Бат" - initial of the family name, then the given name, as on the slip.
    const Name = First ? (Last ? Last.charAt(0) + '.' + First : First) : R.UserName || '';
    Result.push({
      UserId: R.UserId,
      Name,
      OrganizationName: R.OrganizationName || '',
      Since: R.Since,
      IsMe: ViewerUserId != null && String(R.UserId) === String(ViewerUserId),
    });
  }
  return Result;
}

module.exports = {
  GetCareTeamUserIds,
  GetCareTeamPatientIds,
  CanAccessPatient,
  IsTreating,
  GetMonitors,
};
