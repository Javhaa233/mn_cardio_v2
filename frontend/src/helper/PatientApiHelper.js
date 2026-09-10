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

// 2.6 Цахим үзлэг
PatientApiHelper.prototype.GetEvisits = (params) =>
  request("GET", "/evisits", { params });

PatientApiHelper.prototype.CreateEvisit = (data) =>
  request("POST", "/evisits", { data });

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
