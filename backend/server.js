const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
// Used only by the REPORT_DIR fallback below, on a platform that is neither
// win32 nor linux. It was never imported, so that branch threw
// "ReferenceError: os is not defined" at boot instead of picking a default.
const os = require('os');
dotenv.config({ path: './config/Config.env' });

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Levelled logging. This replaces a console.log patch that classified lines by
// looking for the substrings "error"/"exception"/"fail" and silently dropped
// everything else in production - which both promoted innocent lines to stderr
// and threw away the boot record. See helper/Logger.js for the full note.
//
// Required and installed BEFORE any controller is required, so every console.*
// call in the app is routed through it.
const Logger = require('./helper/Logger');
Logger.CaptureConsole();

// Platform-based ALLFILE_DIR configuration
if (process.platform === 'win32') {
  process.env.ALLFILE_DIR = process.env.ALLFILE_DIR_WINDOWS;
} else if (process.platform === 'linux') {
  process.env.ALLFILE_DIR = process.env.ALLFILE_DIR1;
}
// macOS and others will use the default ALLFILE_DIR from .env

// Validate ALLFILE_DIR exists
if (!process.env.ALLFILE_DIR) {
  console.error('ERROR: ALLFILE_DIR is not configured in environment variables');
  process.exit(1);
}

// Create ALLFILE_DIR if it doesn't exist
try {
  if (!fs.existsSync(process.env.ALLFILE_DIR)) {
    fs.mkdirSync(process.env.ALLFILE_DIR, { recursive: true });
    console.log(`Created ALLFILE_DIR: ${process.env.ALLFILE_DIR}`);
  } else {
    console.log(`ALLFILE_DIR: ${process.env.ALLFILE_DIR}`);
  }
} catch (err) {
  console.error(`ERROR: Failed to create/access ALLFILE_DIR: ${process.env.ALLFILE_DIR}`, err);
  process.exit(1);
}

// Validate REPORT_DIR exists and create if needed
if (!process.env.REPORT_DIR) {
  console.warn('WARNING: REPORT_DIR is not configured in environment variables, using default');
  // Set a default based on platform
  if (process.platform === 'win32') {
    process.env.REPORT_DIR = 'C:/MnCardioReports/';
  } else if (process.platform === 'linux') {
    process.env.REPORT_DIR = '/home/admin630/Desktop/outReports/';
  } else {
    process.env.REPORT_DIR = path.join(os.homedir(), 'Desktop', 'outReports');
  }
}

// Create REPORT_DIR if it doesn't exist
try {
  if (!fs.existsSync(process.env.REPORT_DIR)) {
    fs.mkdirSync(process.env.REPORT_DIR, { recursive: true });
    console.log(`Created REPORT_DIR: ${process.env.REPORT_DIR}`);
  } else {
    console.log(`REPORT_DIR: ${process.env.REPORT_DIR}`);
  }
} catch (err) {
  console.error(`ERROR: Failed to create/access REPORT_DIR: ${process.env.REPORT_DIR}`, err);
  process.exit(1);
}

const cors = require('cors');
const helmet = require('helmet');
const Auth = require('./helper/Auth');
const Flags = require('./helper/FeatureFlags');
const SchemaProbe = require('./helper/SchemaProbe');
const RateLimit = require('./helper/RateLimit');
const sequelize = require('./config/DbConnection');

const app = express();

// CORS Configuration - Environment-aware
const corsOptions = {
  // Moved to config/CorsOrigin.js so the Socket.IO servers share one list.
  // Socket.IO v4 does not inherit this middleware - it has its own request
  // handler and needs the origin passed to it explicitly.
  origin: require('./config/CorsOrigin').originCallback,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'app'],
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Controller registry grouped by domain for easy lookup
const controllers = {
  system: {
    AppController: require('./controllers/system/AppController'),
    BaseController: require('./controllers/system/BaseController'),
    CustomDataApiController: require('./controllers/system/CustomDataApiController'),
    TestController: require('./controllers/system/TestController'),
    MediaController: require('./controllers/system/MediaController'),
    MediaTicketController: require('./controllers/system/MediaTicketController'),
  },
  auth: {
    UserController: require('./controllers/auth/UserController'),
    UserRequestController: require('./controllers/auth/UserRequestController'),
    PatientUserController: require('./controllers/auth/PatientUserController'),
  },
  organization: {
    DoctorsTeamController: require('./controllers/organization/DoctorsTeamController'),
    AdviceController: require('./controllers/organization/AdviceController'),
    DoctorProfileController: require('./controllers/organization/DoctorProfileController'),
    OrganizationController: require('./controllers/organization/OrganizationController'),
    DashboardController: require('./controllers/organization/DashboardController'),
  },
  patientCare: {
    VisitController: require('./controllers/patient-care/VisitController'),
    StayController: require('./controllers/patient-care/StayController'),
    FollowUpController: require('./controllers/patient-care/FollowUpController'),
    PatientController: require('./controllers/patient-care/PatientController'),
    PatientMonitoringController: require('./controllers/patient-care/PatientMonitoringController'),
    OrderHospitalizationController: require('./controllers/patient-care/OrderHospitalizationController'),
    RemoteVisitController: require('./controllers/patient-care/RemoteVisitController'),
    TenderFormController: require('./controllers/patient-care/TenderFormController'),
    PatientTransferController: require('./controllers/patient-care/PatientTransferController'),
    PatientSendPageController: require('./controllers/patient-care/PatientSendPageController'),
    OutPatientInfoController: require('./controllers/patient-care/OutPatientInfoController'),
  },
  communication: {
    ChatController: require('./controllers/communication/ChatController'),
    NotificationController: require('./controllers/communication/NotificationController'),
  },
  integrations: {
    EMDServiceController: require('./controllers/integrations/EMDServiceController'),
    XypServiceController: require('./controllers/integrations/XypServiceController'),
  },
  reporting: {
    ReportController: require('./controllers/reporting/ReportController'),
  },
  heartFailure: {
    HfStayController: require('./controllers/heart-failure/HfStayController'),
    HfAmbulanceController: require('./controllers/heart-failure/HfAmbulanceController'),
    HfHospitalizationController: require('./controllers/heart-failure/HfHospitalizationController'),
  },
  cvd: {
    CVDMonitoringController: require('./controllers/cvd/CVDMonitoringController'),
    CVDAnalysisController: require('./controllers/cvd/CVDAnalysisController'),
    CVDDrugController: require('./controllers/cvd/CVDDrugController'),
    CVDHunAmController: require('./controllers/cvd/CVDHunAmController'),
    CVDReportController: require('./controllers/cvd/CVDReportController'),
    CVDMonitoringPatientController: require('./controllers/cvd/CVDMonitoringPatientController'),
    RiskScoresController: require('./controllers/cvd/RiskScoresController'),
  },
  devices: {
    PacemakerOneController: require('./controllers/devices/PacemakerOneController'),
    PacemakerTwoController: require('./controllers/devices/PacemakerTwoController'),
    PacemakerThreeController: require('./controllers/devices/PacemakerThreeController'),
    PaceMakerRhythmController: require('./controllers/devices/PaceMakerRhythmController'),
    ICDRhythmController: require('./controllers/devices/ICDRhythmController'),
  },
  rhythm: {
    CardiacRhythmController: require('./controllers/rhythm/CardiacRhythmController'),
    AtrialRhythmController: require('./controllers/rhythm/AtrialRhythmController'),
    MonitoringRhythmController: require('./controllers/rhythm/MonitoringRhythmController'),
    AtrialRhythmNewController: require('./controllers/rhythm/AtrialRhythmNewController'),
  },
  diagnostics: {
    CathLabController: require('./controllers/diagnostics/CathLabController'),
    EchoController: require('./controllers/diagnostics/EchoController'),
    SurgeryPlansController: require('./controllers/diagnostics/SurgeryPlansController'),
    LaboratoryTestController: require('./controllers/diagnostics/LaboratoryTestController'),
  },
  vascular: {
    VascularDiseaseController: require('./controllers/vascular/VascularDiseaseController'),
    ValveDiseasesController: require('./controllers/vascular/ValveDiseasesController'),
    ValveDiseasesEndoController: require('./controllers/vascular/ValveDiseasesEndoController'),
    CongenitalMalformationsController: require('./controllers/vascular/CongenitalMalformationsController'),
  },
};

const { AppController, BaseController, CustomDataApiController, TestController } =
  controllers.system;

const routeGroups = {
  public: [
    { path: '/User', controller: controllers.auth.UserController },
    { path: '/UserRequest', controller: controllers.auth.UserRequestController },
    { path: '/PatientUser', controller: controllers.auth.PatientUserController },
    { path: '/Test', controller: TestController },
  ],
  protected: [
    { path: '/BaseObject', controller: BaseController },
    // Moved out of `public` on 2026-09-16. It was grouped with the pre-auth
    // bootstrap routes as "the XYP server-to-server call", but it is not one:
    // nothing in the frontend, the mobile app or the acceptance harness calls
    // it, and XYP calls US on the citizen endpoints, not this one. What it
    // actually did was let any anonymous caller make this server sign a
    // WS100008_registerOTPRequest to xyp.gov.mn with the hospital's own key and
    // REGNUM - unmetered, since RateLimit.AUTH_PATHS does not list it and the
    // global bucket is count-only by default.
    //
    // Kept rather than deleted (unlike the four TestController routes) because
    // it is the only working reference for XYP SOAP signing, and mobile tender
    // 1.2 needs that. It is a developer probe now, so it also requires RoleId 1
    // inside the controller.
    { path: '/XypService', controller: controllers.integrations.XypServiceController },
    // Moved out of `public`. Every other member of that group is a pre-auth
    // bootstrap route (login, registration, the ХУР server-to-server call);
    // /RiskScores was not - both of its callers already send a bearer token,
    // so nothing external depended on it being open. Patients reach it through
    // PATIENT_ALLOWED_PREFIXES below; its one writing route is gated to admins
    // inside the controller.
    { path: '/RiskScores', controller: controllers.cvd.RiskScoresController },
    { path: '/Visit', controller: controllers.patientCare.VisitController },
    { path: '/DoctorsTeam', controller: controllers.organization.DoctorsTeamController },
    { path: '/Advice', controller: controllers.organization.AdviceController },
    { path: '/DoctorProfile', controller: controllers.organization.DoctorProfileController },
    { path: '/Organization', controller: controllers.organization.OrganizationController },
    { path: '/CustomDataApi', controller: CustomDataApiController },
    { path: '/Stay', controller: controllers.patientCare.StayController },
    { path: '/FollowUp', controller: controllers.patientCare.FollowUpController },
    {
      path: '/PatientMonitoring',
      controller: controllers.patientCare.PatientMonitoringController,
    },
    {
      path: '/OrderHospitalization',
      controller: controllers.patientCare.OrderHospitalizationController,
    },
    { path: '/Chat', controller: controllers.communication.ChatController },
    { path: '/Notification', controller: controllers.communication.NotificationController },
    { path: '/PacemakerOne', controller: controllers.devices.PacemakerOneController },
    { path: '/PacemakerTwo', controller: controllers.devices.PacemakerTwoController },
    { path: '/PacemakerThree', controller: controllers.devices.PacemakerThreeController },
    { path: '/Dashboard', controller: controllers.organization.DashboardController },
    { path: '/Patient', controller: controllers.patientCare.PatientController },
    { path: '/CathLab', controller: controllers.diagnostics.CathLabController },
    { path: '/Echo', controller: controllers.diagnostics.EchoController },
    { path: '/LaboratoryTest', controller: controllers.diagnostics.LaboratoryTestController },
    { path: '/HfStay', controller: controllers.heartFailure.HfStayController },
    { path: '/RemoteVisit', controller: controllers.patientCare.RemoteVisitController },
    { path: '/TenderForm', controller: controllers.patientCare.TenderFormController },
    { path: '/Report', controller: controllers.reporting.ReportController },
    { path: '/PatientTransfer', controller: controllers.patientCare.PatientTransferController },
    { path: '/PatientSendPage', controller: controllers.patientCare.PatientSendPageController },
    { path: '/OutPatientInfo', controller: controllers.patientCare.OutPatientInfoController },
    { path: '/CVDMonitoring', controller: controllers.cvd.CVDMonitoringController },
    { path: '/CVDAnalysis', controller: controllers.cvd.CVDAnalysisController },
    { path: '/CVDDrug', controller: controllers.cvd.CVDDrugController },
    { path: '/CVDHunAm', controller: controllers.cvd.CVDHunAmController },
    { path: '/CVDReport', controller: controllers.cvd.CVDReportController },
    { path: '/EMDService', controller: controllers.integrations.EMDServiceController },
    { path: '/HfAmbulance', controller: controllers.heartFailure.HfAmbulanceController },
    {
      path: '/HfHospitalization',
      controller: controllers.heartFailure.HfHospitalizationController,
    },
    { path: '/VascularDisease', controller: controllers.vascular.VascularDiseaseController },
    { path: '/CardiacRhythm', controller: controllers.rhythm.CardiacRhythmController },
    { path: '/ValveDiseases', controller: controllers.vascular.ValveDiseasesController },
    { path: '/ValveDiseasesEndo', controller: controllers.vascular.ValveDiseasesEndoController },
    {
      path: '/CongenitalMalformations',
      controller: controllers.vascular.CongenitalMalformationsController,
    },
    {
      path: '/CVDMonitoringPatient',
      controller: controllers.cvd.CVDMonitoringPatientController,
    },
    { path: '/AtrialRhythm', controller: controllers.rhythm.AtrialRhythmController },
    { path: '/PaceMakerRhythm', controller: controllers.devices.PaceMakerRhythmController },
    { path: '/ICDRhythm', controller: controllers.devices.ICDRhythmController },
    { path: '/MonitoringRhythm', controller: controllers.rhythm.MonitoringRhythmController },
    { path: '/SurgeryPlans', controller: controllers.diagnostics.SurgeryPlansController },
    { path: '/AtrialRhythmNew', controller: controllers.rhythm.AtrialRhythmNewController },
  ],
};

// "Protected" only ever meant "presents a valid token" - there was no role
// check anywhere, so a patient's role-4 token opened all 47 prefixes, including
// CathLab, Report and every clinical registry. A patient needs a small subset;
// everything outside it is refused before the controller sees the request.
const PATIENT_ALLOWED_PREFIXES = new Set([
  '/BaseObject', // scoped per row by helper/PatientScope.js
  '/PatientMonitoring',
  '/RemoteVisit',
  '/CVDMonitoringPatient',
  '/Notification',
  // Иргэний эрсдэл тооцоолуур. CalculateRisk is a stateless lookup against the
  // WHO/ISH band table - it takes no patient identifier and reads no patient
  // row, so opening it to RoleId 4 exposes nothing. The prefix also carries
  // CreateFromExcel, which writes; that route checks for RoleId 1 itself
  // (controllers/cvd/RiskScoresController.js), because this allowlist is
  // per-prefix and cannot express "this route but not that one".
  '/RiskScores',
  // Mobile tender §8 ("Эмчээс асуух асуулт"). Safe to open because every /Chat
  // route resolves the caller through ChatIdentity.Me and proves membership
  // with AssertMembership before touching a room - no route accepts a caller
  // identifier. The member-management routes refuse RoleId 4 outright, and the
  // doctor directory is narrowed to the patient's care team by
  // CHAT_PATIENT_DIRECTORY.
  '/Chat',
]);

const restrictPatientRoutes = (routePath) => (req, res, next) => {
  const LogedUser = req.LogedUser;
  if (LogedUser && String(LogedUser.RoleId) === '4' && !PATIENT_ALLOWED_PREFIXES.has(routePath)) {
    return res.send({
      Success: false,
      Message: 'Хандах эрхгүй байна',
      Data: null,
    });
  }
  return next();
};

const registerRoutes = (routes, secure = false) => {
  routes.forEach(({ path, controller }) => {
    if (!controller) {
      throw new Error(`Missing controller for ${path}`);
    }
    const handlers = secure
      ? [Auth.verifyToken, restrictPatientRoutes(path), controller]
      : [controller];
    const fullPath = `/api${path}`;
    app.use(fullPath, ...handlers);
    Logger.info(`\u2713 Registered route: ${fullPath} ${secure ? '(protected)' : '(public)'}`);
  });
};

// Static files
app.use(express.static(__dirname + '/public'));

// Body parsing - Express 5 has built-in body parser
//
// JSON_BODY_LIMIT defaults to '100mb', i.e. exactly what this was, because the
// real ceiling is not guessable from the code: the registry forms post base64
// images through BaseObject/create, and lowering this blind would reject a
// clinical save rather than an attack. The middleware below records what
// actually arrives so the limit can be set from data instead of a guess.
app.use(express.json({ limit: Flags.JsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: Flags.JsonBodyLimit, parameterLimit: 100000 }));

// Size instrumentation, not enforcement. Runs after the parsers so a body that
// was already refused does not also produce a log line.
app.use((req, res, next) => {
  const Len = Number(req.headers['content-length'] || 0);
  if (Len > Flags.BodySizeWarnBytes) {
    // console.error: console.log is silenced in production, and this is a
    // production measurement.
    console.error(`[BodySize] ${req.method} ${req.originalUrl} ${Math.round(Len / 1024)}KB`);
  }
  return next();
});

// nginx terminates TLS and the server binds 127.0.0.1 in production, so without
// this every request appears to come from the proxy and any per-IP logic would
// treat the whole internet as one client.
app.set('trust proxy', 1);

// Rate limiting. Registered before every route table so it covers the mobile
// mounts, the 49 legacy prefixes and the generic /api layer alike. Both buckets
// COUNT ONLY until RATE_LIMIT_ENABLED is set - the first deploy is there to
// find out what a hospital shift actually looks like, not to start refusing.
app.use(RateLimit.Global());
app.use(RateLimit.AuthPaths());

// Request logging middleware
if (isDevelopment) {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

console.log('\n=== Registering Routes ===');

/*
 * The mobile surfaces are mounted BEFORE the legacy route table, deliberately.
 *
 * Express matches mount paths case-INSENSITIVELY unless 'case sensitive
 * routing' is set, and it is not. The legacy table registers `/api/Patient`
 * (PatientController), so that prefix also matches `/api/patient/me`. With the
 * legacy table first, its mount-level Auth.verifyToken answered every
 * unauthenticated /api/patient request with the legacy HTTP-200
 * { Success:false, AuthError:true } envelope instead of the 401 this surface
 * documents — a mobile client checking status codes would read that as success.
 *
 * Mounting first is only safe because these routers apply their auth PER ROUTE
 * rather than at the mount (see api/patient/index.js). A path they do not serve
 * — `/api/patient/SearchPatient`, say — matches no route, runs no middleware,
 * and falls through to PatientController exactly as before.
 *
 * They are also kept out of the generic app.use('/api', require('./api')) mount
 * further down, which carries no authentication at all.
 */
app.use('/api/patient', require('./api/patient'));
Logger.info('✓ Registered route: /api/patient (protected, patient only)');

app.use('/api/doctor', require('./api/doctor'));
Logger.info('✓ Registered route: /api/doctor (protected, staff only)');

/*
 * Mobile app configuration — the forced-update check and the terms text.
 *
 * Mounted here, beside the two surfaces it serves, and before the legacy table
 * for the same case-insensitive-prefix reason they are. /version carries no
 * authentication at all and /config is gated by token alone; both decisions are
 * argued in api/mobile/index.js.
 *
 * Deliberately NOT behind the X-App-Build gate that /api/patient and
 * /api/doctor now carry: an app being told it is too old has to be able to ask
 * what to upgrade to.
 */
app.use('/api/mobile', require('./api/mobile'));
Logger.info('✓ Registered route: /api/mobile (version check public, config token-gated)');

/*
 * Улсын цагийн эталон (§1.3). UNAUTHENTICATED: a clock is not a secret, and a
 * client detecting its own drift may need to do so before it can log in.
 * Reports whether chrony is synchronised rather than asserting that it is -
 * the NTP host itself is a ЗСҮТ deliverable. See api/time/index.js.
 */
app.use('/api/time', require('./api/time'));
Logger.info('✓ Registered route: /api/time (public)');

/*
 * Operational endpoints for roles 1 and 6. Gated inside api/admin/index.js by a
 * stricter rule than RequireDoctor, which also admits roles 2 and 3.
 */
app.use('/api/admin', require('./api/admin'));
Logger.info('✓ Registered route: /api/admin (roles 1, 6)');

// Session lifecycle — token refresh. Deliberately NOT behind verifyToken: a
// client refreshes precisely when its access token has expired, and these
// handlers verify strictly for themselves.
app.use('/api/auth', require('./api/auth'));
Logger.info('✓ Registered route: /api/auth (self-authenticating)');

/*
 * Streaming media. Mounted HERE rather than in routeGroups.protected, and the
 * reason is the envelope, not the routing.
 *
 * The legacy table answers an auth failure with HTTP 200 and
 * { Success:false, AuthError:true } - by design, and the web client depends on
 * it. A VIDEO PLAYER does not: it would receive 200, read Content-Type
 * application/json, and try to decode a JSON error as video. Measured, not
 * assumed - an unauthenticated GET through the legacy gate returns exactly that.
 *
 * VerifyTokenJson turns the same failure into a real 401, which a player
 * handles. No PATIENT_ALLOWED_PREFIXES entry is needed either: that list only
 * governs the legacy table, and every route here resolves its file through
 * FileAccessHelper.MayDownload, which applies the patient scope itself.
 */
/*
 * Ticket redemption mounts FIRST, and ungated.
 *
 * A browser's <audio>/<video> element cannot send an Authorization header, so
 * the chat's voice and video messages are unreachable through the gated route
 * below. This one takes a short-lived credential scoped to a single file and a
 * single user instead - helper/MediaTicket.js explains the shape and why it is
 * not the session-token-in-a-URL that SocketAuth warns against.
 *
 * It is safe to mount this before the gate ONLY because the router declares
 * exactly one path, /t/:ticket. Every other /api/Media/* request matches
 * nothing in it and falls through to the authenticated router. Do not add
 * routes to that file.
 */
app.use('/api/Media', controllers.system.MediaTicketController);

app.use('/api/Media', require('./helper/VerifyTokenJson'), controllers.system.MediaController);

/*
 * FHIR R4 read-only projection (tracker 19, 20). Its own mount because the
 * response envelope is FHIR's - resources and OperationOutcome - and must not
 * be wrapped in either of this system's two house envelopes.
 *
 * Gated inside api/fhir/index.js and behind FEATURE_FHIR_EXPORT, default off:
 * the scope of FHIR compliance is still an open customer decision, and turning
 * it on publishes an interface somebody will integrate against.
 */
app.use('/api/fhir', require('./api/fhir'));
Logger.info('✓ Registered route: /api/fhir (read-only projection)');
Logger.info('✓ Registered route: /api/Media (streaming, json envelope)');

registerRoutes(routeGroups.public);
registerRoutes(routeGroups.protected, true);

// API routes
app.use('/api', require('./api'));
Logger.info('✓ Registered route: /api');

// Health check. The version is READ, not written here: it used to be the
// literal 'MnCardio API v2.0', which every release since has quietly falsified.
// package.json is the one number, and PM2 reports the same value.
app.get('/', function (req, res) {
  return res.send('MnCardio API v' + require('./package.json').version);
});

app.get('/health', function (req, res) {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler - must be after all routes
app.use((req, res) => {
  console.error(`\u274C 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    Success: false,
    Message: `Route not found: ${req.method} ${req.url}`,
    AvailableRoutes: {
      public: ['/User/Login', '/Test', '/health', '/'],
      protected: 'requires authentication token',
    },
  });
});

// Global error handler - must be last middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = isDevelopment ? err.message : 'Internal server error';
  console.error(`\u274C Error on ${req.method} ${req.url}:`, err.message);
  if (isDevelopment) {
    console.error(err.stack);
  }
  res.status(statusCode).json({
    Success: false,
    Message: message,
  });
});

console.log('=== Routes Registration Complete ===\n');

// Start server with database connection check
async function startServer() {
  try {
    // Check database connection first
    console.log('Checking database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    console.log(`  Database: ${process.env.SQL_DB}`);
    console.log(`  Host: ${process.env.SQL_HOST}`);
    console.log(`  User: ${process.env.SQL_USER}`);
    console.log('');

    // One line naming every behaviour switch and its resolved value. A
    // deployment sitting in the wrong mode - password checks off, rate limiting
    // off, licence enforcement on - is far cheaper to spot here than to
    // diagnose later from behaviour.
    Flags.LogResolved();

    // Read the schema once, now that the connection is up, so every feature
    // whose DDL script has not been run yet can answer "dark" instead of
    // throwing at the first caller. Prints which ones those are.
    await SchemaProbe.Warm();
    SchemaProbe.LogPending();

    // Media left mid-transcode by a restart or a deploy. Without this a row
    // stays 'pending' for ever and its clip shows a permanent "processing"
    // hint. Not awaited: it is background work and must not hold up the listen.
    require('./helper/MediaTranscode')
      .ResumePending()
      .catch((ex) => console.error('[MediaTranscode] resume failed: ' + ex.message));

    // Start services
    AppController.runService();

    // Create Server
    const PORT = process.env.PORT || 5001;
    // In development, bind to all interfaces for easier access
    // In production, bind to localhost only (Nginx proxies external requests)
    const HOST = isDevelopment ? '0.0.0.0' : '127.0.0.1';
    const server = http.createServer(app).listen(PORT, HOST, () => {
      // Logger.info, not console.log: this banner is the record of what the
      // process came up as, and under the old console patch none of it
      // survived in production.
      Logger.info('=== Server Started Successfully ===');
      Logger.info(`✓ Environment: ${isDevelopment ? 'Development' : 'Production'}`);
      Logger.info(`✓ Log level: ${Logger.Level()}`);
      Logger.info(`✓ MnCardio Server running on http://${HOST}:${PORT}`);
      Logger.info(`✓ Access from this machine: http://localhost:${PORT}`);
      if (HOST === '0.0.0.0') {
        Logger.info(`✓ Access from network: http://<your-ip>:${PORT}`);
      }
      Logger.info(
        `✓ CORS: ${isDevelopment ? 'allowlist + any loopback port (dev)' : 'allowlist only'}`
      );
      if (isDevelopment) {
        Logger.debug(`  curl http://localhost:${PORT}/health`);
        Logger.debug(`  curl -X POST http://localhost:${PORT}/api/User/Login`);
      }
      Logger.info('=================================');
    });

    // WebSockets
    const ChatSocket = require('./WebSockets/ChatSocket');
    const NotificationSocket = require('./WebSockets/NotificationSocket');

    ChatSocket.SetServer(server);
    NotificationSocket.SetServer(server);
  } catch (error) {
    console.error('✗ Unable to connect to the database:');
    console.error(`  Error: ${error.message}`);
    console.error('  Please check your database configuration in Config.env');
    process.exit(1);
  }
}

/**
 * Last-resort process handlers.
 *
 * There were none, and Node's default for an unhandled rejection is to throw -
 * which ends the process. That turned any un-awaited, un-caught async call in a
 * request path into a server restart: a DB hiccup while writing one audit row
 * could take down every in-flight request, and PM2 gives up after
 * `max_restarts` (10). Two such calls were found in this audit.
 *
 * These log loudly and KEEP RUNNING. That is the right trade for a clinical
 * system mid-shift: a dropped background write is better than dropping every
 * open form in the hospital. A crash that genuinely corrupts state will still
 * surface through the error handler and the logs.
 *
 * They are registered here, after startServer() is defined and before it runs,
 * so they also cover failures during startup.
 */
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION - the process stayed up, but something was not awaited:');
  console.error(reason instanceof Error ? reason.stack || reason.message : reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION - the process stayed up, but this needs fixing:');
  console.error(err && err.stack ? err.stack : err);
});

// Start the server
startServer();
