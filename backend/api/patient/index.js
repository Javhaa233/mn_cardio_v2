const express = require('express');
const c = require('./controller');

/**
 * /api/patient/* — the surface the mobile app consumes.
 *
 * Mounted in server.js with Auth.verifyToken + requirePatient in front of it,
 * deliberately NOT under the existing `app.use('/api', require('./api'))`,
 * which is registered without any authentication at all.
 *
 * Conventions, because the Android/iOS client inherits them:
 *   - real HTTP verbs, not POST-for-everything like the legacy controllers
 *   - lowercase { success, message, data } envelope, plus `code` on failures
 *   - lists take ?limit & ?offset and return { total, limit, offset }
 *   - date windows are ?from & ?to on the resource's own date column
 *   - no endpoint accepts a patient identifier; it always comes from the token
 */
const router = express.Router();

// 2.1 Миний бүртгэл
router.get('/me', c.getMe);

// 2.2 Миний тэмдэглэл — the daily log, plus the series behind its chart
router.get('/journal', c.listJournal);
router.post('/journal', c.createJournal);
router.get('/journal/summary', c.journalSummary);

// 2.3 Эмчээс асуух асуулт
router.get('/questions', c.listQuestions);
router.post('/questions', c.createQuestion);

// 2.4 Эмчийн зөвлөгөө
router.get('/advice', c.listAdvice);

// 2.5 Эрсдэл үнэлгээ (ЗСӨ) — inputs only until ЗСҮТ approve the methodology
router.get('/risk', c.getRisk);

// 2.6 Цахим үзлэг
router.get('/evisits', c.listEvisits);
router.post('/evisits', c.createEvisit);

// 2.7 Сэргээн засах, дасгал хөдөлгөөн
// Inert until scripts/add_rehabilitation_tables.sql has been run against the
// database - the tables do not exist yet, and DDL is a DBA request here.
router.get('/rehab/exercises', c.listExercises);
router.get('/rehab/progress', c.listRehabProgress);
router.post('/rehab/progress', c.createRehabProgress);
router.get('/rehab/vitals', c.listRehabVitals);
router.post('/rehab/vitals', c.createRehabVital);
router.get('/rehab/assessment', c.getRehabAssessment);

module.exports = router;
