const express = require('express');
const c = require('./controller');

/**
 * /api/patient/* — the surface the mobile app consumes.
 *
 * Mounted in server.js BEFORE the legacy route table, and with its auth applied
 * PER ROUTE rather than to the mount. Both of those matter:
 *
 *   Express route matching is case-insensitive by default, and the legacy table
 *   registers `/api/Patient` (PatientController). That prefix therefore also
 *   matches `/api/patient/me`. While this router was mounted after it, the
 *   legacy mount's Auth.verifyToken ran first and answered an unauthenticated
 *   request with the legacy HTTP-200 { AuthError: true } envelope, not the 401
 *   this surface promises.
 *
 *   Mounting first fixes that, but mount-level middleware runs on any path
 *   under the prefix, which would make this router intercept - and 403 -
 *   `/api/patient/SearchPatient` and its two siblings on the way to
 *   PatientController. Route-level middleware only runs when a route actually
 *   matches, so anything this router does not serve falls through untouched.
 *
 * Conventions, because the Android/iOS client inherits them:
 *   - real HTTP verbs, not POST-for-everything like the legacy controllers
 *   - lowercase { success, message, data } envelope, plus `code` on failures
 *   - lists take ?limit & ?offset and return { total, limit, offset }
 *   - date windows are ?from & ?to on the resource's own date column
 *   - no endpoint accepts a patient identifier; it always comes from the token
 */
const router = express.Router();

/*
 * Verify the token (401 in this surface's envelope, not the legacy 200), then
 * assert the caller is a patient and resolve the ids handlers scope by.
 *
 * The X-App-Build gate sits FIRST, before the token is even verified: an app
 * too old to be allowed through should be told to update rather than told its
 * session expired. A request with no X-App-Build header passes untouched, which
 * is every build in the field today and the web frontend - see the header of
 * helper/RequireAppBuild.js for why "cannot tell" must never mean "refuse".
 */
const gate = [
  require('../../helper/RequireAppBuild'),
  require('../../helper/VerifyTokenJson'),
  require('../../helper/RequirePatient'),
];

// 2.1 Миний бүртгэл
router.get('/me', gate, c.getMe);

// 2.2 Миний тэмдэглэл — the daily log, plus the series behind its chart
router.get('/journal', gate, c.listJournal);
router.post('/journal', gate, c.createJournal);
router.get('/journal/summary', gate, c.journalSummary);
// §1.8 - the journal as a file, for showing a doctor at an appointment.
// Returns a FILE with a source stamp, not the JSON envelope
router.get('/journal/export', gate, c.exportJournal);

// 2.3 Эмчээс асуух асуулт
router.get('/questions', gate, c.listQuestions);
router.post('/questions', gate, c.createQuestion);

// 2.4 Эмчийн зөвлөгөө
router.get('/advice', gate, c.listAdvice);

// 2.5 Эрсдэл үнэлгээ (ЗСӨ) — inputs only until ЗСҮТ approve the methodology
router.get('/risk', gate, c.getRisk);

// §3.1 Шинжилгээ, оношлогоо — the patient's own results, same shape the doctor
// app gets. Scoped by the token, and a foreign id answers 404, never 403
router.get('/diagnostics', gate, c.listDiagnostics);
router.get('/diagnostics/:type/:id', gate, c.getDiagnostic);

// 2.6 Цахим үзлэг - request, appointment and the state of both
router.get('/evisits', gate, c.listEvisits);
router.post('/evisits', gate, c.createEvisit);
// One request, with its assigned doctor and - only once scheduled - its join link
router.get('/evisits/:id', gate, c.getEvisit);
// Withdraw a request. A named transition, not a generic status PATCH
router.post('/evisits/:id/cancel', gate, c.cancelEvisit);

// Option lists for the dropdowns above, served from the OptionTypes dictionary
// so unapproved wording never gets hardcoded into the app
router.get('/options/:dico', gate, c.listOptions);

// Мэдэгдэл (tracker 48). Patients were denied every notification row until now
router.get('/notifications', gate, c.listNotifications);
// The badge count on its own, so the app is not paging a list to count
router.get('/notifications/unread-count', gate, c.unreadNotificationCount);
router.post('/notifications/:id/read', gate, c.markNotificationRead);
router.post('/notifications/read-all', gate, c.markAllNotificationsRead);

// Push registration. Works today on the log driver, with no FCM or APNs keys
router.post('/devices', gate, c.registerDevice);
// POST, not DELETE /:token - an FCM token is ~163 chars and contains ':'
router.post('/devices/unregister', gate, c.unregisterDevice);
router.get('/devices', gate, c.listDevices);

// Сануулга - medication, exercise and follow-up reminders the patient sets
// themselves. Fired by services/ReminderDispatcher.js, which converts to
// Asia/Ulaanbaatar explicitly because the server runs UTC
router.get('/reminders', gate, c.listReminders);
router.post('/reminders', gate, c.createReminder);
router.patch('/reminders/:id', gate, c.updateReminder);
// Soft delete: stops firing, keeps the history answerable
router.delete('/reminders/:id', gate, c.deleteReminder);

// Хандалтын түүх (tracker 24) - who looked at my record. Behind
// FEATURE_ACCESS_LOG_API: UserActionHistory holds ~637k rows and this query
// needs IX_UserActionHistory_PatientId to be affordable
router.get('/access-log', gate, c.listAccessLog);

// Зөвшөөрөл (tracker 23) - consent for non-treatment use of personal data.
// PatientConsent is APPEND-ONLY: withdrawing writes a new row, never an update,
// because proving what was agreed and when it stopped is the point
router.get('/consents', gate, c.listConsents);
router.get('/consents/:purposeCode/document', gate, c.getConsentDocument);
router.post('/consents', gate, c.grantConsent);
router.delete('/consents/:purposeCode', gate, c.withdrawConsent);

// 2.7 Сэргээн засах, дасгал хөдөлгөөн
// Live on MnCardio_test: the tables exist and the catalogue holds 39 rows. They
// are PLACEHOLDERS - the real exercise names are clinical content ЗСҮТ enter
// through /BaseObject. Videos are served by /api/Media; see helper/MediaRef.js
// for how the hosting decision stays a database value.
router.get('/rehab/exercises', gate, c.listExercises);
router.get('/rehab/progress', gate, c.listRehabProgress);
router.post('/rehab/progress', gate, c.createRehabProgress);
router.get('/rehab/vitals', gate, c.listRehabVitals);
router.post('/rehab/vitals', gate, c.createRehabVital);
router.get('/rehab/assessment', gate, c.getRehabAssessment);
// The history behind that single row - risk level and exercise tolerance over
// a whole programme, which is why they are recorded repeatedly
router.get('/rehab/assessments', gate, c.listRehabAssessments);

// The guided player (scripts/add_rehab_program_tables.sql). Today's programme
// day, one exercise's movement playlist, and a session with heart rate check-ins
router.get('/rehab/today', gate, c.getRehabToday);
router.get('/rehab/exercises/:id/movements', gate, c.listExerciseMovements);
router.get('/rehab/sessions', gate, c.listRehabSessions);
router.post('/rehab/sessions', gate, c.startRehabSession);
router.get('/rehab/sessions/:id', gate, c.getRehabSession);
router.post('/rehab/sessions/:id/checkins', gate, c.addRehabCheckin);
router.patch('/rehab/sessions/:id', gate, c.finishRehabSession);

module.exports = router;
