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

// Verify the token (401 in this surface's envelope, not the legacy 200), then
// assert the caller is a patient and resolve the ids handlers scope by.
const gate = [require('../../helper/VerifyTokenJson'), require('../../helper/RequirePatient')];

// 2.1 Миний бүртгэл
router.get('/me', gate, c.getMe);

// 2.2 Миний тэмдэглэл — the daily log, plus the series behind its chart
router.get('/journal', gate, c.listJournal);
router.post('/journal', gate, c.createJournal);
router.get('/journal/summary', gate, c.journalSummary);

// 2.3 Эмчээс асуух асуулт
router.get('/questions', gate, c.listQuestions);
router.post('/questions', gate, c.createQuestion);

// 2.4 Эмчийн зөвлөгөө
router.get('/advice', gate, c.listAdvice);

// 2.5 Эрсдэл үнэлгээ (ЗСӨ) — inputs only until ЗСҮТ approve the methodology
router.get('/risk', gate, c.getRisk);

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

// 2.7 Сэргээн засах, дасгал хөдөлгөөн
// Inert until scripts/add_rehabilitation_tables.sql has been run against the
// database - the tables do not exist yet, and DDL is a DBA request here.
router.get('/rehab/exercises', gate, c.listExercises);
router.get('/rehab/progress', gate, c.listRehabProgress);
router.post('/rehab/progress', gate, c.createRehabProgress);
router.get('/rehab/vitals', gate, c.listRehabVitals);
router.post('/rehab/vitals', gate, c.createRehabVital);
router.get('/rehab/assessment', gate, c.getRehabAssessment);

module.exports = router;
