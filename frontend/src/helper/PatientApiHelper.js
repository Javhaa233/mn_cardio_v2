import { saveAs } from "file-saver";

import Server from "config/Server";

/**
 * Client for /api/patient/*.
 *
 * The rest of the app talks to the legacy POST-only controllers through
 * BaseCrudHelper, which uses the PascalCase { Success, Message, Data } envelope.
 * This surface is different on purpose: real HTTP verbs, the lowercase
 * { success, message, data } envelope, and a stable `code` on failures. It is
 * the same API the Android/iOS app will consume, so the web portal exercising it
 * is what keeps the two honest.
 *
 * No method takes a patient identifier. The server derives the patient from the
 * verified token, which is why swapping password login for ДАН later does not
 * touch any of this.
 *
 * Promise-based rather than the callback style used elsewhere — this layer is
 * new, so there is no existing call site to stay consistent with, and promises
 * are what the mobile client will use.
 */
function PatientApiHelper() {}

// One shape for every outcome, so callers never have to distinguish a network
// failure from a refusal.
const request = async (method, url, options = {}) => {
  try {
    const res = await Server({
      method,
      url: "/patient" + url,
      params: options.params,
      data: options.data,
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

// 2.1 Миний бүртгэл
PatientApiHelper.prototype.GetMe = () => request("GET", "/me");

// 2.2 Миний тэмдэглэл
PatientApiHelper.prototype.GetJournal = (params) =>
  request("GET", "/journal", { params });

PatientApiHelper.prototype.CreateJournalEntry = (data) =>
  request("POST", "/journal", { data });

// The series behind the chart the tender's acceptance criterion requires.
PatientApiHelper.prototype.GetJournalSummary = (params) =>
  request("GET", "/journal/summary", { params });

/**
 * The journal as a file - mobile tender section 1.8, "so a patient can show a
 * doctor at an appointment".
 *
 * Does NOT go through `request` above: that unwraps a JSON envelope, and this
 * endpoint answers with the bytes of a file plus a Content-Disposition. It
 * still has to cope with a JSON body, because a refusal (a bad format, an
 * expired token) comes back as the ordinary envelope with an ordinary status -
 * which is exactly the trap the four hand-rolled CVD downloads fell into,
 * where a Blob response never matched their success check.
 *
 * Formats are the server's: xlsx, csv, txt. The file carries the provenance
 * stamp the tender requires - organisation, database, timestamp, and on this
 * one the patient's own name and registration number.
 */
PatientApiHelper.prototype.ExportJournal = async (params = {}) => {
  const format = params.format || "xlsx";
  try {
    const res = await Server({
      method: "GET",
      url: "/patient/journal/export",
      params: Object.assign({}, params, { format }),
      responseType: "blob",
    });

    const body = res && res.data;
    const contentType =
      (body && body.type) || (res.headers && res.headers["content-type"]) || "";

    // A refusal arrives as JSON even though we asked for a blob.
    if (contentType.indexOf("application/json") !== -1) {
      const parsed = JSON.parse(await body.text());
      return {
        success: false,
        code: parsed.code || null,
        message: parsed.message || "",
      };
    }

    // Prefer the server's own filename: it already contains the registration
    // number, so two exports from one device do not overwrite each other.
    const disposition =
      (res.headers && res.headers["content-disposition"]) || "";
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = match ? match[1] : "journal." + format;

    saveAs(new Blob([body], { type: contentType || undefined }), fileName);
    return { success: true, code: null, message: "" };
  } catch (err) {
    const status = err?.response?.status;
    return {
      success: false,
      code: status ? "HTTP_" + status : "NETWORK_ERROR",
      message: "",
    };
  }
};

// 2.3 Эмчээс асуух асуулт
PatientApiHelper.prototype.GetQuestions = (params) =>
  request("GET", "/questions", { params });

PatientApiHelper.prototype.CreateQuestion = (data) =>
  request("POST", "/questions", { data });

// 2.4 Эмчийн зөвлөгөө
PatientApiHelper.prototype.GetAdvice = (params) =>
  request("GET", "/advice", { params });

// 2.5 Эрсдэл үнэлгээ (ЗСӨ)
PatientApiHelper.prototype.GetRisk = () => request("GET", "/risk");

/**
 * 3.1 Шинжилгээ, оношилгоо - the patient's own investigations.
 *
 * Returns one flat, date-ordered list across lab, echo, cathlab and ECG, each
 * row already reduced to { type, id, date, title, summary } by the server. The
 * per-record endpoint beside it answers with the RAW table row, whose columns
 * are transliterated clinical names - that is the doctor's view of the record,
 * and which of those fields a patient may see is a clinical decision nobody
 * has signed off, so this client deliberately exposes only the curated list.
 */
PatientApiHelper.prototype.GetDiagnostics = (params) =>
  request("GET", "/diagnostics", { params });

// 2.6 Цахим үзлэг
PatientApiHelper.prototype.GetEvisits = (params) =>
  request("GET", "/evisits", { params });

PatientApiHelper.prototype.CreateEvisit = (data) =>
  request("POST", "/evisits", { data });

/** One request, with its assigned doctor and - once scheduled - its join link. */
PatientApiHelper.prototype.GetEvisit = (id) =>
  request("GET", "/evisits/" + encodeURIComponent(id));

/**
 * Withdraw a request.
 *
 * The server allows this from `requested` and `scheduled` only, and answers
 * INVALID_TRANSITION for anything terminal - so the UI hides the action on a
 * completed or already-cancelled row rather than offering something that will
 * be refused. `Reason` is appended to the original complaint server-side, never
 * substituted for it.
 */
PatientApiHelper.prototype.CancelEvisit = (id, Reason) =>
  request("POST", "/evisits/" + encodeURIComponent(id) + "/cancel", {
    data: Reason ? { Reason } : {},
  });

/* ---------------------------------------------------------- Сануулга */

/**
 * Medication, exercise and follow-up reminders the patient sets themselves -
 * the mobile tender's "patient-configurable notifications".
 *
 * Delete is a soft delete server-side: it stops the reminder firing and keeps
 * the history answerable.
 */
PatientApiHelper.prototype.GetReminders = (params) =>
  request("GET", "/reminders", { params });

PatientApiHelper.prototype.CreateReminder = (data) =>
  request("POST", "/reminders", { data });

PatientApiHelper.prototype.UpdateReminder = (id, data) =>
  request("PATCH", "/reminders/" + encodeURIComponent(id), { data });

PatientApiHelper.prototype.DeleteReminder = (id) =>
  request("DELETE", "/reminders/" + encodeURIComponent(id));

/** Option lists, served from OptionTypes so unapproved wording is not baked in. */
PatientApiHelper.prototype.GetOptions = (dico) =>
  request("GET", "/options/" + encodeURIComponent(dico));

/* ------------------------------------- Зөвшөөрөл, хандалтын түүх */

PatientApiHelper.prototype.GetConsents = () => request("GET", "/consents");

PatientApiHelper.prototype.GetConsentDocument = (purposeCode) =>
  request("GET", "/consents/" + encodeURIComponent(purposeCode) + "/document");

PatientApiHelper.prototype.GrantConsent = (purposeCode, documentId) =>
  request("POST", "/consents", { data: { purposeCode, documentId } });

PatientApiHelper.prototype.WithdrawConsent = (purposeCode) =>
  request("DELETE", "/consents/" + encodeURIComponent(purposeCode));

/**
 * Who has looked at my record.
 *
 * Behind FEATURE_ACCESS_LOG_API on the server, which answers 503
 * FEATURE_DISABLED when it is off - so callers must treat that as "not
 * available here" rather than as an error.
 */
PatientApiHelper.prototype.GetAccessLog = (params) =>
  request("GET", "/access-log", { params });

/* ---------------------------------------------------------- Мэдэгдэл */

PatientApiHelper.prototype.GetNotifications = (params) =>
  request("GET", "/notifications", { params });

/**
 * The badge count on its own.
 *
 * Separate from the list precisely so the top bar does not page a list just to
 * count it - the server exposes both for that reason.
 */
PatientApiHelper.prototype.GetUnreadCount = () =>
  request("GET", "/notifications/unread-count");

PatientApiHelper.prototype.MarkNotificationRead = (id) =>
  request("POST", "/notifications/" + encodeURIComponent(id) + "/read");

PatientApiHelper.prototype.MarkAllNotificationsRead = () =>
  request("POST", "/notifications/read-all");

// 2.7 Сэргээн засах, дасгал хөдөлгөөн
// These stay inert until backend/scripts/add_rehabilitation_tables.sql has been
// run — the tables do not exist yet — so the screen must handle an error here
// as an expected state, not a crash.
PatientApiHelper.prototype.GetExercises = () =>
  request("GET", "/rehab/exercises");

PatientApiHelper.prototype.GetRehabProgress = (params) =>
  request("GET", "/rehab/progress", { params });

PatientApiHelper.prototype.MarkExerciseDone = (data) =>
  request("POST", "/rehab/progress", { data });

PatientApiHelper.prototype.GetRehabVitals = (params) =>
  request("GET", "/rehab/vitals", { params });

PatientApiHelper.prototype.CreateRehabVital = (data) =>
  request("POST", "/rehab/vitals", { data });

PatientApiHelper.prototype.GetRehabAssessment = () =>
  request("GET", "/rehab/assessment");

export default new PatientApiHelper();
