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

/*
 * Auth applied per route, not to the mount, and mounted before the legacy route
 * table. See the same note in api/patient/index.js: Express matches mount paths
 * case-insensitively, so a legacy prefix can shadow this one, and mount-level
 * middleware would intercept paths this router does not serve.
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
  require('../../helper/RequireDoctor'),
];

/*
 * §1.2 Хэрэглэгч тус бүрээр эрх тохируулах.
 *
 * INERT BY DEFAULT. FEATURE_PERMISSIONS is 'off', so every one of these is a
 * pass-through until somebody turns it on - which is what makes it safe to wire
 * the whole surface in one change. 'warn' then logs what WOULD be denied, and
 * that log is how RoleToPermission gets seeded from real traffic. Only after
 * that is 'enforce' safe. See helper/Permissions.js.
 *
 * The object names below are the ones the mobile app touches. They are the
 * rows ЗСҮТ need in Permissions before any of this can enforce anything.
 *
 * FOUR ROUTES ARE DELIBERATELY NOT GATED: /me, /notifications*, /devices* and
 * their siblings. Those are a user's own account surface rather than clinical
 * objects - gating /me in particular would mean a user with no permissions
 * could not even load the response that tells them what permissions they have,
 * and could not register for push to be told about it.
 */
const may = require('../../helper/RequirePermission');

router.get('/me', gate, c.getMe);

// Dropdown wording (rehab risk, phase, category, e-visit status). Ungated like
// /me: it is dictionary text, not a clinical object, and a doctor with no
// permissions still needs a form that can render
router.get('/options/:dico', gate, c.listOptions);

// 28 Миний үзлэгүүд
router.get('/visits', gate, may('Visit', 'read'), c.listVisits);
// §1.8 - the same filters as the list, as a file. Declared BEFORE /visits/:id
// so 'export' is never captured as an id
router.get('/visits/export', gate, may('Visit', 'read'), c.exportVisits);
router.get('/visits/:id', gate, may('Visit', 'read'), c.getVisit);
// §1.8 - the examination note as A4 PDF. Returns a FILE, not the envelope
router.get('/visits/:id/print', gate, may('Visit', 'read'), c.printVisit);

// 29 Миний хяналт
router.get('/monitoring', gate, may('PatientMonitoring', 'read'), c.listMonitoring);
router.post('/monitoring', gate, may('PatientMonitoring', 'create'), c.addMonitoring);
router.delete(
  '/monitoring/:patientId',
  gate,
  may('PatientMonitoring', 'delete'),
  c.removeMonitoring
);
router.get(
  '/monitoring/:patientId/journal',
  gate,
  may('PatientMonitoring', 'read'),
  c.getMonitoringJournal
);
router.get(
  '/monitoring/:patientId/questions',
  gate,
  may('PatientMonitoring', 'read'),
  c.listPatientQuestions
);
router.post(
  '/monitoring/:patientId/questions',
  gate,
  may('PatientMonitoring', 'update'),
  c.replyPatientQuestion
);

// 30 Миний зөвлөгөө
router.get('/advice', gate, may('Advice', 'read'), c.listAdvice);
router.get('/advice/:id', gate, may('Advice', 'read'), c.getAdvice);

// 31 Миний тайлан
router.get('/reports/summary', gate, may('Report', 'read'), c.reportSummary);
// The same report as xlsx / csv / txt, with the source stamp the tender
// requires. Shares DoctorExamReportHelper with the web export, so the two
// downloads can never disagree about the numbers
router.get('/reports/summary/export', gate, may('Report', 'read'), c.exportReportSummary);

// Онош, ICD-ээр хайх (§1.3) - autocomplete for the diagnosis box. Declared
// before /patients/:id so no path ambiguity can arise as this file grows
router.get('/icd10', gate, may('Visit', 'read'), c.searchIcd10);

// 32 Read access to the patient side. ?icd10= on the list, so "every patient
// with an I21 diagnosis" is a query rather than a manual sweep
router.get('/patients', gate, may('PatientCard', 'read'), c.searchPatients);
router.get('/patients/:id', gate, may('PatientCard', 'read'), c.getPatient);
// §2.1 - the doctor's view of the patient's own risk screen, same rows
router.get('/patients/:id/risk', gate, may('PatientCard', 'read'), c.getPatientRisk);

// §1.2 Асран хамгаалагчийн зөвшөөрөл - the patient records their own at
// /api/patient/consents; a patient who cannot had no route at all
router.get('/patients/:id/consents', gate, may('PatientCard', 'read'), c.listPatientConsents);
router.post('/patients/:id/consents', gate, may('PatientCard', 'update'), c.createPatientConsent);

// §3.1 Шинжилгээ, оношлогоо - lab, echo, cathlab and ECG as one list.
// Both are audited and both run the confidentiality check: LaboratoryTest
// carries hiv, hbs_ag, hcv and syphilis
router.get('/patients/:id/diagnostics', gate, may('Diagnostics', 'read'), c.listPatientDiagnostics);
router.get('/diagnostics/:type/:id', gate, may('Diagnostics', 'read'), c.getDiagnostic);

// 2.6 Цахим үзлэг - the triage side of the patient's remote-examination request
// Queue of requests: ?scope=mine|unassigned|all, ?status, ?from, ?to
router.get('/evisits', gate, may('RemoteVisit', 'read'), c.listDoctorEvisits);
// One request with the patient's card and their latest reading
router.get('/evisits/:id', gate, may('RemoteVisit', 'read'), c.getDoctorEvisit);
// Confirm or move a slot, and assign it to the calling doctor
router.post('/evisits/:id/schedule', gate, may('RemoteVisit', 'update'), c.scheduleEvisit);
// Mark the examination done. The clinical note belongs in Visit, not here
router.post('/evisits/:id/complete', gate, may('RemoteVisit', 'update'), c.completeEvisit);
// Refuse or withdraw a request
router.post('/evisits/:id/cancel', gate, may('RemoteVisit', 'update'), c.cancelDoctorEvisit);

// 2.7 Сэргээн засах - the exercise catalogue, same shape the patient app gets
router.get('/rehab/exercises', gate, may('Rehab', 'read'), c.listRehabExercises);
// Everything rehabilitation knows about one patient: assessment, progress, vitals
router.get('/patients/:id/rehab', gate, may('Rehab', 'read'), c.getPatientRehab);
// The assessment history, newest first
router.get('/patients/:id/rehab/assessment', gate, may('Rehab', 'read'), c.listPatientAssessments);
// Record an assessment. Nothing is scored - the methodology is a ЗСҮТ deliverable
router.post(
  '/patients/:id/rehab/assessment',
  gate,
  may('Rehab', 'create'),
  c.createPatientAssessment
);
// The guided player: programmes, a patient's plan (assign / change / pause /
// end) and their sessions with heart rate check-ins and stop symptoms
router.get('/rehab/programs', gate, may('Rehab', 'read'), c.listRehabPrograms);
router.get('/patients/:id/rehab/plan', gate, may('Rehab', 'read'), c.getPatientRehabPlan);
router.post('/patients/:id/rehab/plan', gate, may('Rehab', 'create'), c.savePatientRehabPlan);
router.get(
  '/patients/:id/rehab/sessions/:sessionId',
  gate,
  may('Rehab', 'read'),
  c.getPatientRehabSession
);

// §1.6 ЭМД кодчилол - the legacy /api/EMDService/* takes PatRegNo from the
// request BODY; these resolve it from the patient id after checking access, so
// a caller cannot ask the national insurance service about an arbitrary citizen
router.get('/emd/drugs', gate, may('Visit', 'read'), c.emdDrugs);
router.get('/emd/services', gate, may('Visit', 'read'), c.emdServices);

// Мэдэгдэл - the same four the patient app has, addressed by ToUserId.
// Registering a device was possible before this existed, so the doctor app had
// a bell with nothing behind it
router.get('/notifications', gate, c.listNotifications);
// The badge count on its own, so the app is not paging a list to count
router.get('/notifications/unread-count', gate, c.unreadNotificationCount);
router.post('/notifications/:id/read', gate, c.markNotificationRead);
router.post('/notifications/read-all', gate, c.markAllNotificationsRead);

// Push registration, identical in shape to the patient app's. Works today on
// the log driver, with no FCM or APNs keys
router.post('/devices', gate, c.registerDevice);
router.post('/devices/unregister', gate, c.unregisterDevice);
router.get('/devices', gate, c.listDevices);

module.exports = router;
