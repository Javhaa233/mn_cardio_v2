import Server from "config/Server";

/**
 * Client for /api/doctor/*.
 *
 * The sibling of PatientApiHelper, and deliberately the same shape: real HTTP
 * verbs, the lowercase { success, message, data } envelope, a stable `code` on
 * failures, promises rather than callbacks. Keep the two consistent — they are
 * two halves of one API and the mobile client consumes both.
 *
 * WHY THIS FILE DID NOT EXIST UNTIL NOW. /api/doctor is 41 routes over a
 * 2,847-line controller — audited, permission-gated, and recorded as delivered
 * (tracker web row 129, Дууссан 100%). It was written for the mobile app, and
 * `grep -r "api/doctor" frontend/src` returned nothing at all: the web has
 * never called any of it. Every doctor-module screen therefore reads as
 * "Эхлээгүй 0%" while its server sits finished. This is the missing half.
 *
 * THE ONE DIFFERENCE FROM PatientApiHelper. Every method here takes a patient
 * identifier. A patient's token identifies the patient, so PatientApiHelper
 * deliberately takes none; a doctor's token identifies the doctor, and which
 * patient they mean is the question. The server still decides whether they may
 * — see the gate note below — so passing an id is not the same as being trusted
 * with it.
 *
 * THE GATE. Most of these refuse with 403 `NOT_MONITORED` unless the patient is
 * on the calling doctor's monitoring list (`IsMonitored`, doctor/controller.js).
 * That refusal is a normal outcome on a screen that can be opened for any
 * patient, not an error to swallow — callers should read `code` and say so,
 * rather than rendering an empty panel that looks like missing data.
 *
 * `PatientId` here is `Patient.id_data` — the same value PatientMonitoringDoctor
 * rows carry as `patient_id`, and the same one chat uses as `UserId` for
 * UserType 'P'. It is NOT `PatientUsers.Id`.
 */
function DoctorApiHelper() {}

// One shape for every outcome, so callers never have to distinguish a network
// failure from a refusal. Identical to PatientApiHelper.request by design.
const request = async (method, url, options = {}) => {
  try {
    const res = await Server({
      method,
      url: "/doctor" + url,
      params: options.params,
      data: options.data,
      headers: options.headers,
      onUploadProgress: options.onUploadProgress,
    });
    const body = res && res.data ? res.data : {};
    return {
      success: body.success === true,
      code: body.code || null,
      message: body.message || "",
      data: body.data !== undefined ? body.data : null,
      total: body.total,
    };
  } catch (err) {
    const body = err?.response?.data || {};
    return {
      success: false,
      code: body.code || "NETWORK_ERROR",
      message: body.message || "",
      data: null,
    };
  }
};

/** Is this refusal the monitoring gate rather than a fault? */
DoctorApiHelper.prototype.IsNotMonitored = (res) =>
  !!res && res.success === false && res.code === "NOT_MONITORED";

// --- 29 Миний хяналт ------------------------------------------------------

DoctorApiHelper.prototype.GetMe = () => request("GET", "/me");

DoctorApiHelper.prototype.GetMonitoring = (params) =>
  request("GET", "/monitoring", { params });

// PascalCase `PatientId` - addMonitoring reads req.body.PatientId. Sending
// `patientId` gets a PATIENT_REQUIRED refusal that reads as "pick a patient"
// when one was in fact picked.
DoctorApiHelper.prototype.AddMonitoring = (PatientId) =>
  request("POST", "/monitoring", { data: { PatientId } });

DoctorApiHelper.prototype.RemoveMonitoring = (PatientId) =>
  request("DELETE", "/monitoring/" + PatientId);

/**
 * The patient's own readings — blood pressure, pulse, weight — already shaped
 * for a chart as { rows, labels, series }, capped at 365 rows server-side and
 * access-audited.
 *
 * There is also a legacy POST /PatientMonitoring/getPressureChartData that
 * returns a similar shape and has no callers anywhere. Prefer this one: the
 * legacy route is neither audited nor capped.
 */
DoctorApiHelper.prototype.GetMonitoringJournal = (PatientId, params) =>
  request("GET", "/monitoring/" + PatientId + "/journal", { params });

// --- 36/37 Асуумж ---------------------------------------------------------

DoctorApiHelper.prototype.GetPatientQuestions = (PatientId, params) =>
  request("GET", "/monitoring/" + PatientId + "/questions", { params });

/**
 * Answer a question, optionally with attachments.
 *
 * USE THIS RATHER THAN /BaseObject/create ON VisitComments. The generic create
 * writes the row and stops: it notifies nobody and has nowhere to put a file.
 * This endpoint writes the same row through the same BaseCreate, then stores
 * the attachments against it and calls NotifyPatient — so the answer actually
 * reaches the patient's phone, which is the acceptance criterion for tracker
 * rows 36 and 37 ("асуулт эмчид хүрнэ", "зөвлөгөө мэдэгдэлтэйгээр хүрнэ").
 * Before this, a doctor answering on the web left the patient silent.
 *
 * `Files` are the browser File objects; send none and it posts plain JSON,
 * which is what the server branches on.
 */
DoctorApiHelper.prototype.ReplyPatientQuestion = (
  PatientId,
  { Comment, Files } = {},
  onUploadProgress,
) => {
  const url = "/monitoring/" + PatientId + "/questions";
  if (!Files || Files.length === 0) {
    return request("POST", url, { data: { comment: Comment || "" } });
  }
  const form = new FormData();
  form.append("comment", Comment || "");
  // The field name is not read by the server — AttachmentIntake.Parse flattens
  // every file part regardless of key — but keeping it stable makes a request
  // legible in the network tab.
  Files.forEach((f, i) => form.append("file" + i, f, f.name));
  return request("POST", url, {
    data: form,
    // Let the browser set multipart/form-data itself, so it can add the
    // boundary. Setting the header by hand omits it and the parse fails.
    headers: { "Content-Type": undefined },
    onUploadProgress,
  });
};

// --- 32 Үйлчлүүлэгчийн модулийг харах (read-only) --------------------------

DoctorApiHelper.prototype.GetPatient = (PatientId) =>
  request("GET", "/patients/" + PatientId);

/**
 * Risk INPUTS, not a score — helper/RiskInputs.js returns the measurements and
 * deliberately no number, because the ЗСӨ methodology and its bands are an
 * unapproved ЗСҮТ deliverable (blocker letter §5). For a number, use the CVD
 * calculator (Helper.CVDHelper) and do not invent a second formula.
 */
DoctorApiHelper.prototype.GetPatientRisk = (PatientId) =>
  request("GET", "/patients/" + PatientId + "/risk");

/** Lab, echo, cathlab and ECG merged into one list, confidentiality-filtered. */
DoctorApiHelper.prototype.GetPatientDiagnostics = (PatientId, params) =>
  request("GET", "/patients/" + PatientId + "/diagnostics", { params });

DoctorApiHelper.prototype.GetDiagnostic = (Type, Id) =>
  request("GET", "/diagnostics/" + Type + "/" + Id);

DoctorApiHelper.prototype.GetPatientRehab = (PatientId) =>
  request("GET", "/patients/" + PatientId + "/rehab");

DoctorApiHelper.prototype.GetPatientAssessments = (PatientId, params) =>
  request("GET", "/patients/" + PatientId + "/rehab/assessment", { params });

DoctorApiHelper.prototype.GetPatientConsents = (PatientId) =>
  request("GET", "/patients/" + PatientId + "/consents");

// --- 40 Цахим үзлэг -------------------------------------------------------

/** scope: mine | unassigned | all */
DoctorApiHelper.prototype.GetEvisits = (params) =>
  request("GET", "/evisits", { params });

DoctorApiHelper.prototype.GetEvisit = (Id) => request("GET", "/evisits/" + Id);

/**
 * The three triage actions. The state machine lives in
 * backend/helper/RemoteVisitFlow.js — requested -> scheduled -> completed |
 * cancelled, with terminal states refused server-side, so a stale button in a
 * browser tab cannot move a finished visit.
 */
DoctorApiHelper.prototype.ScheduleEvisit = (Id, data) =>
  request("POST", "/evisits/" + Id + "/schedule", { data });

DoctorApiHelper.prototype.CompleteEvisit = (Id, data) =>
  request("POST", "/evisits/" + Id + "/complete", { data });

DoctorApiHelper.prototype.CancelEvisit = (Id, data) =>
  request("POST", "/evisits/" + Id + "/cancel", { data });

export default new DoctorApiHelper();
