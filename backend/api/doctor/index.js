const express = require('express');
const c = require('./controller');

/**
 * /api/doctor/* — the doctor surface the mobile app consumes.
 *
 * The counterpart of api/patient, mounted in server.js with Auth.verifyToken +
 * requireDoctor in front of it, and deliberately NOT under the generic
 * app.use('/api', require('./api')) mount, which carries no authentication.
 *
 * Covers tender §2 "Эмчийн модуль" and tracker rows 28-32:
 *   28 Миний үзлэгүүд      -> /visits
 *   29 Миний хяналт        -> /monitoring
 *   30 Миний зөвлөгөө      -> /advice
 *   31 Миний тайлан        -> /reports/summary
 *   32 Үйлчлүүлэгчийн модуль харах -> /patients
 *
 * Same conventions as api/patient, because the client inherits them:
 *   - real HTTP verbs and real status codes, not POST-for-everything
 *   - lowercase { success, message, data } envelope, plus `code` on failures
 *   - lists take ?limit & ?offset and return { total, limit, offset }
 *   - date windows are ?from & ?to on the resource's own date column
 *   - no endpoint accepts a doctor, user or organisation identifier; those
 *     always come from the token via req.Doctor
 *
 * These read the same tables as the legacy controllers/** layer. Nothing here
 * duplicates clinical logic - writes that carry any (saving an examination,
 * publishing advice) stay in the legacy controllers, and this surface reads.
 * The two exceptions are the monitoring list add/remove, which are a doctor's
 * own working set rather than clinical data.
 */
const router = express.Router();

// Auth applied per route, not to the mount, and mounted before the legacy route
// table. See the same note in api/patient/index.js: Express matches mount paths
// case-insensitively, so a legacy prefix can shadow this one, and mount-level
// middleware would intercept paths this router does not serve.
const gate = [require('../../helper/VerifyTokenJson'), require('../../helper/RequireDoctor')];

router.get('/me', gate, c.getMe);

// 28 Миний үзлэгүүд
router.get('/visits', gate, c.listVisits);
router.get('/visits/:id', gate, c.getVisit);

// 29 Миний хяналт
router.get('/monitoring', gate, c.listMonitoring);
router.post('/monitoring', gate, c.addMonitoring);
router.delete('/monitoring/:patientId', gate, c.removeMonitoring);
router.get('/monitoring/:patientId/journal', gate, c.getMonitoringJournal);

// 30 Миний зөвлөгөө
router.get('/advice', gate, c.listAdvice);
router.get('/advice/:id', gate, c.getAdvice);

// 31 Миний тайлан
router.get('/reports/summary', gate, c.reportSummary);

// 32 Read access to the patient side
router.get('/patients', gate, c.searchPatients);
router.get('/patients/:id', gate, c.getPatient);

module.exports = router;
