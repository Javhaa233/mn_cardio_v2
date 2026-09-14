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
 *   2.3 Эмчээс асуух асуулт, answered by the doctor
 *                          -> /monitoring/:patientId/questions
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
router.get('/monitoring/:patientId/questions', gate, c.listPatientQuestions);
router.post('/monitoring/:patientId/questions', gate, c.replyPatientQuestion);

// 30 Миний зөвлөгөө
router.get('/advice', gate, c.listAdvice);
router.get('/advice/:id', gate, c.getAdvice);

// 31 Миний тайлан
router.get('/reports/summary', gate, c.reportSummary);

// 32 Read access to the patient side
router.get('/patients', gate, c.searchPatients);
router.get('/patients/:id', gate, c.getPatient);

// 2.6 Цахим үзлэг - the triage side of the patient's remote-examination request
// Queue of requests: ?scope=mine|unassigned|all, ?status, ?from, ?to
router.get('/evisits', gate, c.listDoctorEvisits);
// One request with the patient's card and their latest reading
router.get('/evisits/:id', gate, c.getDoctorEvisit);
// Confirm or move a slot, and assign it to the calling doctor
router.post('/evisits/:id/schedule', gate, c.scheduleEvisit);
// Mark the examination done. The clinical note belongs in Visit, not here
router.post('/evisits/:id/complete', gate, c.completeEvisit);
// Refuse or withdraw a request
router.post('/evisits/:id/cancel', gate, c.cancelDoctorEvisit);

// 2.7 Сэргээн засах - the exercise catalogue, same shape the patient app gets
router.get('/rehab/exercises', gate, c.listRehabExercises);
// Everything rehabilitation knows about one patient: assessment, progress, vitals
router.get('/patients/:id/rehab', gate, c.getPatientRehab);
// The assessment history, newest first
router.get('/patients/:id/rehab/assessment', gate, c.listPatientAssessments);
// Record an assessment. Nothing is scored - the methodology is a ЗСҮТ deliverable
router.post('/patients/:id/rehab/assessment', gate, c.createPatientAssessment);

// Push registration, identical in shape to the patient app's. Works today on
// the log driver, with no FCM or APNs keys
router.post('/devices', gate, c.registerDevice);
router.post('/devices/unregister', gate, c.unregisterDevice);
router.get('/devices', gate, c.listDevices);

module.exports = router;
