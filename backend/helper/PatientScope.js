/**
 * Row-level scoping for patients (RoleId 4).
 *
 * The backend has an organisation filter for staff (BaseControllerHelper.AddOrgFilter)
 * but it is structurally unreachable for a patient: it returns early when the
 * session has no Doctor.OrganizationId. That left every patient-facing read
 * trusting an identifier supplied by the client, so changing a patient_id in the
 * request body returned another patient's records.
 *
 * This module answers one question - "which column ties this table to a patient,
 * and what is this patient's value for it" - and the answer is derived from the
 * session (helper/Auth.js puts PatientId / PatRegNo / PatientUserId on
 * req.LogedUser for role 4), never from the request.
 *
 * The two table generations identify a patient differently (CLAUDE.md §5):
 *   - legacy tables  -> patient_id  = Patient.id_data
 *   - newer CVD/self-service tables -> PatRegNo (a string, no FK)
 *   - VisitComments  -> patient_user_id = PatientUsers.Id
 * so the mapping has to be explicit per ObjectName rather than guessed.
 */

const PATIENT_ROLE = '4';

// ObjectName -> the column that identifies the patient, and which session value
// fills it. Anything not listed here is not patient-readable at all.
const SCOPE_BY_OBJECT = {
  // Legacy generation: patient_id -> Patient.id_data
  PatientMonitoring: { Field: 'patient_id', From: 'PatientId' },
  PatientHistory: { Field: 'PatientId', From: 'PatientId' },
  RemoteVisit: { Field: 'PatientId', From: 'PatientId' },
  Advice: { Field: 'adv_id_patient', From: 'PatientId' },

  // The patient's own record.
  Patient: { Field: 'id_data', From: 'PatientId' },

  // Scoped by the patient the thread is ABOUT, not by who wrote each line:
  // doctor replies carry patient_id and no patient_user_id, so scoping by the
  // authoring account would hide every reply from the patient.
  VisitComments: { Field: 'patient_id', From: 'PatientId' },

  // READ SIDE ONLY, and that restriction is load-bearing.
  //
  // This entry lets a patient LIST their own notifications. It must never be
  // relied on for a WRITE: ApplyPatientOwnership assigns Data[ToPatientId] from
  // the session, so a notification generated during a patient's action FOR A
  // DOCTOR - filing an e-visit request, say - would be silently re-addressed to
  // the patient themselves, and the doctor would never hear about it.
  //
  // Producers therefore write with Models.Notification.create directly, never
  // through BaseControllerHelper.BaseCreate. helper/NotificationHelper.js does
  // exactly that and says so.
  Notification: { Field: 'ToPatientId', From: 'PatientId' },

  /*
   * Attachments a patient uploads themselves (tender §2.3), added 2026-09-14.
   *
   * WITHOUT THIS ENTRY A PATIENT CANNOT ATTACH ANYTHING, SILENTLY.
   * BaseCreate's first act is ApplyPatientOwnership, which refuses outright
   * when an object has no entry here and returns null - no throw, no log. So
   * POST /api/patient/questions with a photo answered 200, moved the bytes into
   * ALLFILE_DIR, and wrote no File row at all: the attachment existed on disk
   * and nowhere else. It is the same trap helper/NotificationHelper.js records
   * for Notification, and it fails in the same silent way.
   *
   * `patient_id` is the right column: File has carried one since the legacy
   * schema, and stamping it from the session is what makes the row the
   * patient's own rather than whatever the request claimed.
   *
   * READ-SIDE EFFECT, considered: this also lets ApplyPatientFilter scope a
   * /BaseObject read of File to `patient_id = me`. That is a narrower query
   * than the refusal it replaces, and it returns only rows the patient already
   * reaches through /api/patient/questions. Ownership of the BYTES is not
   * decided here in any case - helper/FileAccessHelper.MayDownload re-resolves
   * every handle to its stored row and authorizes the record it hangs off.
   */
  File: { Field: 'patient_id', From: 'PatientId' },

  // Newer generation: joined by registration number, no foreign key.
  CVDMonitoring: { Field: 'PatRegNo', From: 'PatRegNo' },
  PatientBodySize: { Field: 'PatRegNo', From: 'PatRegNo' },
  PatientOwnHistory: { Field: 'PatRegNo', From: 'PatRegNo' },
};

const IsPatient = (LogedUser) => !!LogedUser && String(LogedUser.RoleId) === PATIENT_ROLE;

/**
 * True when this ObjectName is something a patient may touch at all.
 */
const IsPatientReadable = (ObjectName) =>
  Object.prototype.hasOwnProperty.call(SCOPE_BY_OBJECT, ObjectName);

/**
 * Force the patient predicate onto a SearchOption.
 *
 * Returns { Allowed, Reason }. When Allowed is false the caller must refuse the
 * request outright rather than run an unscoped query.
 *
 * Any client-supplied clause on the same column is stripped first, so a crafted
 * body cannot widen or contradict the filter.
 */
const ApplyPatientFilter = function ({ ObjectName, LogedUser, Option }) {
  if (!IsPatient(LogedUser)) {
    return { Allowed: true, Reason: null };
  }

  const scope = SCOPE_BY_OBJECT[ObjectName];
  if (!scope) {
    return { Allowed: false, Reason: 'ObjectNotAllowedForPatient' };
  }

  const value = LogedUser[scope.From];
  if (value === undefined || value === null || value === '') {
    // The session could not be resolved to a patient record. Failing closed is
    // the only safe option: an unfiltered query here returns everyone.
    return { Allowed: false, Reason: 'PatientNotResolved' };
  }

  if (!Option.SearchField) Option.SearchField = [];
  Option.SearchField = Option.SearchField.filter((f) => !f || f.Field !== scope.Field);
  Option.SearchField.push({
    Field: scope.Field,
    Value: '' + value,
    Op: 'Equals',
  });

  return { Allowed: true, Reason: null };
};

/**
 * Same rule for writes: stamp the owning patient onto the row and refuse any
 * attempt to write on someone else's behalf.
 */
const ApplyPatientOwnership = function ({ ObjectName, LogedUser, Data }) {
  if (!IsPatient(LogedUser)) {
    return { Allowed: true, Reason: null };
  }

  const scope = SCOPE_BY_OBJECT[ObjectName];
  if (!scope) {
    return { Allowed: false, Reason: 'ObjectNotAllowedForPatient' };
  }

  const value = LogedUser[scope.From];
  if (value === undefined || value === null || value === '') {
    return { Allowed: false, Reason: 'PatientNotResolved' };
  }

  if (Data && typeof Data === 'object') {
    Data[scope.Field] = value;
  }

  return { Allowed: true, Reason: null };
};

module.exports = {
  PATIENT_ROLE,
  SCOPE_BY_OBJECT,
  IsPatient,
  IsPatientReadable,
  ApplyPatientFilter,
  ApplyPatientOwnership,
};
