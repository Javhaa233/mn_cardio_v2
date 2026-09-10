/**
 * The endpoint catalogue.
 *
 * Paths are DISCOVERED from the backend source rather than typed out here, so
 * the catalogue cannot silently drift from the routing table. What is written
 * by hand is only the part a parser cannot know: which role to call as, what
 * body an endpoint needs, and whether it is safe to call at all.
 *
 * Anything not annotated gets a bare `{}` body. That is deliberate: a handler
 * that answers "missing required field" has still proved it is mounted, wired
 * to its controller and able to run — which is what the sweep is for. Depth is
 * Layer 2's job.
 */
const fs = require('fs');
const path = require('path');

const BACKEND = path.resolve(__dirname, '..', '..', 'backend');

/* ------------------------------------------------------------ discovery */

function readRouteGroups() {
  const src = fs.readFileSync(path.join(BACKEND, 'server.js'), 'utf8');
  const map = {};

  // controllers registry: system: { BaseController: require('./controllers/system/BaseController'), ... }
  const fileByName = {};
  for (const m of src.matchAll(/(\w+):\s*require\('\.\/(controllers\/[^']+)'\)/g)) {
    fileByName[m[1]] = m[2] + '.js';
  }

  // routeGroups entries: { path: '/Visit', controller: controllers.patientCare.VisitController }
  const groupsStart = src.indexOf('const routeGroups');
  const groupsEnd = src.indexOf('const registerRoutes', groupsStart);
  const groups = src.slice(groupsStart, groupsEnd);

  let current = null;
  for (const line of groups.split('\n')) {
    if (/^\s*public\s*:/.test(line)) current = 'public';
    else if (/^\s*protected\s*:/.test(line)) current = 'protected';
    const m = line.match(/path:\s*'([^']+)'\s*,\s*controller:\s*([\w.]+)/);
    if (m && current) {
      const ctrlName = m[2].split('.').pop();
      if (fileByName[ctrlName]) {
        map['/api' + m[1]] = { file: fileByName[ctrlName], group: current };
      }
    }
  }
  return map;
}

function readRoutes(relFile) {
  const abs = path.join(BACKEND, relFile);
  if (!fs.existsSync(abs)) return [];
  const src = fs.readFileSync(abs, 'utf8');
  const out = [];
  const seen = new Set();
  const add = (method, sub) => {
    const key = method + ' ' + sub;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ method, sub });
    }
  };

  // Style A: router.post('/X', handler) — and the same with double quotes,
  // which nine declarations use.
  for (const line of src.split('\n')) {
    if (/^\s*\/\//.test(line)) continue; // commented out
    const m = line.match(/router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/);
    if (m) add(m[1].toUpperCase(), m[2]);
  }

  // Style B: router.route('/X').get(...).put(...) — chained, and it spans
  // several lines. api/base and both auth controllers use it, which is where
  // ResetPassword lives, so missing it would leave a password-reset route
  // untested.
  const stripped = src.replace(/^\s*\/\/.*$/gm, '');
  for (const m of stripped.matchAll(/router\s*\.\s*route\(\s*['"]([^'"]+)['"]\s*\)([\s\S]*?)(?=router\s*\.\s*route\(|module\.exports|$)/g)) {
    const sub = m[1];
    for (const v of m[2].matchAll(/\.\s*(get|post|put|delete|patch)\s*\(/g)) {
      add(v[1].toUpperCase(), sub);
    }
  }

  return out;
}

function discover() {
  const eps = [];
  const groups = readRouteGroups();

  for (const [prefix, info] of Object.entries(groups)) {
    for (const r of readRoutes(info.file)) {
      const full = (prefix + (r.sub === '/' ? '' : r.sub)) || prefix;
      eps.push({
        method: r.method,
        path: full || prefix,
        prefix,
        group: info.group,
        source: info.file,
      });
    }
  }

  for (const [prefix, rel] of [
    ['/api/patient', 'api/patient/index.js'],
    ['/api/doctor', 'api/doctor/index.js'],
    ['/api/auth', 'api/auth/index.js'],
    ['/api/base', 'api/base/index.js'],
    ['/api/report', 'api/report/index.js'],
  ]) {
    for (const r of readRoutes(rel)) {
      eps.push({
        method: r.method,
        path: prefix + (r.sub === '/' ? '' : r.sub),
        prefix,
        group: prefix === '/api/base' || prefix === '/api/report' ? 'unauthenticated' : 'gated',
        source: rel,
      });
    }
  }

  eps.push({ method: 'GET', path: '/health', prefix: '/health', group: 'public', source: 'server.js' });
  return eps;
}

/* ----------------------------------------------------------- annotation */

// Endpoints that must NOT be called, each with the reason it is excluded.
const SKIP = {
  '/api/User/ForgetPassword': 'sends email; no SMTP configured on the test host',
  '/api/PatientUser/ForgotPassword': 'sends email; no SMTP configured',
  '/api/UserRequest/Register': 'sends email — exercised in Layer 2 where the failure is expected',
  '/api/Test/ApiSendMail': 'public route that sends real mail to a hardcoded address',
  '/api/Test/uploadFile': 'public unauthenticated 1GB upload — probed for existence only, never used',
  '/api/XypService/testCall': 'live SOAP call to xyp.gov.mn with real credentials',
  '/api/EMDService/getTablet': 'calls the external ЭМД service',
  '/api/EMDService/getTabletByDiagnosis': 'calls the external ЭМД service',

  /*
   * These reach out to Mongolian government services (st.auth.itc.gov.mn for
   * ХУР auth, st.health.gov.mn for ЭМХТ citizen info) from inside what looks
   * like an ordinary lookup. Discovered by hitting them: the upstream is
   * currently serving a maintenance page, the call has no timeout, and the
   * request hangs for 70s+ or dies with a 502.
   *
   * Skipped for two reasons — repeatedly calling a national health service
   * from a test harness is not acceptable, and each failure dumps a whole
   * Axios error object into the log (see the 1.5 GB api-error.log finding).
   * Their behaviour is recorded in the report rather than re-provoked.
   */
  '/api/CVDMonitoring/CheckPatient': 'calls ХУР/ЭМХТ; hangs 70s+ when the upstream is down',
  '/api/CVDMonitoring/FindPatientDataForUpdate': 'calls ХУР/ЭМХТ; 502s when the upstream is down',
  '/api/AtrialRhythm/checkConfirm': 'calls ХУР/ЭМХТ; 502s when the upstream is down',
  '/api/AtrialRhythmNew/checkConfirm': 'calls ХУР/ЭМХТ; 502s when the upstream is down',
  '/api/Organization/Merge': 'irreversible restructuring of organisation data',
  '/api/RiskScores/CreateFromExcel': 'bulk import from a spreadsheet on disk',
  '/api/BaseObject/destroy': 'generic delete — exercised in Layer 2 with a non-matching filter',
  '/api/TenderForm/Delete': 'exercised in Layer 2 against a record we created',
  '/api/DoctorsTeam/DeleteDoctorsTeam': 'destructive',
  '/api/DoctorsTeam/RemoveDoctor': 'destructive',
  '/api/DoctorsTeam/RemovePatient': 'destructive',
  '/api/PatientMonitoring/RemovePatient': 'destructive',
  '/api/Chat/RemoveUserFromChatRoom': 'destructive',
  '/api/UserRequest/Decline': 'destructive',
  '/api/OutPatientInfo/UpdateStayDates': 'mutates admission dates used by password-expiry logic',
  '/api/BaseObject/deleteFile': 'exercised in Layer 2 against a file we uploaded',
  '/api/BaseObject/uploadFile': 'multipart — exercised in Layer 2',
  '/api/User/Save': 'creates a user — exercised in Layer 2 where the result is inspected',
  '/api/PatientUser/Save': 'creates a patient user — Layer 2',
  '/api/User/ChangePassword': 'changes a password — Layer 2',
  '/api/PatientUser/ChangePassword': 'changes a password — Layer 2',
  '/api/Visit/CustomSave': 'creates an examination — Layer 2',
  '/api/TenderForm/CustomSave': 'creates a form instance — Layer 2',
  '/api/doctor/monitoring': 'POST adds to the monitoring list — Layer 2',
};

// Endpoints returning a stream rather than JSON.
const BINARY = /Print(Report|Ambulatori|ByStayId)$|ExportExcel$|ExportText$|DownloadAttachment$|downloadFile$|ExportDoctorsTeamPatient$/;

// Bodies for endpoints that need one to get past their first guard.
const BODY = {
  '/api/BaseObject/getData': { ObjectName: 'Visit' },
  '/api/BaseObject/': { ObjectName: 'Organization', PageSize: 3, PageNumber: 0 },
  '/api/BaseObject/getListInfo': { ObjectName: 'Organization', PageSize: 3, PageNumber: 0 },
  '/api/BaseObject/getDetail': {
    ObjectName: 'Organization',
    SearchField: [{ Field: 'Id', Value: 5, Op: 'Equals' }],
  },
  '/api/BaseObject/getDetailInfo': {
    ObjectName: 'Organization',
    SearchField: [{ Field: 'Id', Value: 5, Op: 'Equals' }],
  },
  '/api/BaseObject/ExportExcel': { ObjectName: 'Organization', PageSize: 5, PageNumber: 0 },
  '/api/BaseObject/ExportText': { ObjectName: 'Organization', PageSize: 5, PageNumber: 0 },
  '/api/Visit/GetCustomFormData': { PatientId: 1124 },
  '/api/Visit/GetLastVisitId': { PatientId: 1124 },
  '/api/Visit/GetVisitsByPatient': {
    ObjectName: 'Visit',
    PageSize: 3,
    PageNumber: 0,
    SearchField: [{ Field: 'PatientId', Value: 1124, Op: 'Equals' }],
  },
  '/api/Visit/PrintAmbulatoriHTML': { StartDate: '2026-01-01', EndDate: '2026-01-31' },
  '/api/TenderForm/GetConfig': { FormCode: '1.1' },
  '/api/TenderForm/GetList': { FormCode: '1.1' },
  '/api/TenderForm/GetData': { FormCode: '1.1', PatRegNo: 'ZZ00000000' },
  '/api/TenderForm/GetPrevious': { FormCode: '1.1', PatRegNo: 'ZZ00000000' },
  '/api/TenderForm/PrintHtml': { FormCode: '1.1', Blank: true },
  '/api/TenderForm/PrintReport': { FormCode: '1.1', Blank: true },
  '/api/Patient/SearchPatient': { SearchText: 'Бат', PageSize: 3, PageNumber: 0 },
  '/api/Patient/CheckPatient': { PatRegNo: 'ZZ00000000' },
  '/api/Patient/FindPatient': { PatRegNo: 'ZZ00000000' },
  '/api/PatientMonitoring/GetList': { ObjectName: 'PatientMonitoringDoctor', PageSize: 3, PageNumber: 0 },
  '/api/PatientMonitoring/CheckPatientMonitoring': { PatientId: 1124 },
  '/api/PatientMonitoring/getPressureChartData': { PatientId: 1124 },
  '/api/Advice/GetFeed': { PageNumber: 0, PageSize: 5, Filter: 'all' },
  '/api/Advice/GetList': { ObjectName: 'Advice', PageSize: 3, PageNumber: 0 },
  '/api/Advice/GetStats': {},
  '/api/Advice/GetComments': { AdviceId: 1 },
  '/api/Advice/CheckByPatient': { PatientId: 1124 },
  '/api/Notification/GetListData': { ObjectName: 'Notification', PageSize: 3, PageNumber: 0 },
  '/api/Chat/GetChatRoomList': {},
  '/api/Chat/SearchUsers': { SearchText: 'a', PageSize: 3, PageNumber: 0 },
  '/api/Chat/GetUnreadCount': {},
  '/api/Chat/GetDirectoryFilters': {},
  '/api/DoctorProfile/GetByUserId': { UserId: 10 },
  '/api/DoctorProfile/GetCustomFormData': {},
  '/api/DoctorsTeam/GetList': { ObjectName: 'DoctorsTeam', PageSize: 3, PageNumber: 0 },
  '/api/DoctorsTeam/GetDoctorsTeams': {},
  // ObjectName is required; these are the three the report screen actually asks for
  // (ReportLocationSelect.jsx). An empty body used to reach Models[undefined].
  '/api/Report/GetProvinceData': {
    ObjectName: 'DictProvinceCity',
    Option: { Field: 'name', Type: 'NotEquals', Value: '' },
  },
  '/api/UserRequest/GetProvinceData': {
    ObjectName: 'DictProvinceCity',
    Option: { Field: 'name', Type: 'NotEquals', Value: '' },
  },
  '/api/UserRequest/CheckUserName': { UserName: 'zz_nonexistent_zz', Email: 'zz@example.com' },
  // SelectType is required - BaseDateSelect.jsx sends 7DAYS|1MONTH|6MONTH|1YEAR.
  '/api/Dashboard/GetCreatePatients': {
    SelectType: '1MONTH',
    StartDate: '2026-01-01',
    EndDate: '2026-01-31',
  },
  '/api/Dashboard/GetCreateAllVisits': {
    SelectType: '1MONTH',
    StartDate: '2026-01-01',
    EndDate: '2026-01-31',
  },
  '/api/Organization/GetOne/:id': null,
  // These field names were invented and matched nothing in the controller. The
  // real contract is CalculateRisk.jsx -> CVDHelper.calculateRisk: lowercase,
  // Yes/No strings, and the column really is spelled 'cholestrol'.
  '/api/RiskScores/CalculateRisk': {
    gender: 'M',
    isCholestrol: 'No',
    isDiabetes: 'No',
    isSmoker: 'No',
    age: 55,
    pressure: 140,
    BMI: 25,
  },
};

// Which identity to call as. Default: doctor.
const ROLE = {
  '/api/UserRequest/Confirm': 'admin',
  '/api/RiskScores/CreateFromExcel': 'admin',
  '/api/patient/': 'patient',
  '/health': 'none',
  '/api/User/Login': 'none',
  '/api/PatientUser/Login': 'none',
  '/api/UserRequest/CheckUserName': 'none',
  '/api/UserRequest/GetProvinceData': 'none',
  '/api/auth/session': 'doctor',
  '/api/auth/refresh': 'doctor',
};

function roleFor(ep) {
  if (ROLE[ep.path]) return ROLE[ep.path];
  if (ep.path.startsWith('/api/patient/')) return 'patient';
  if (ep.path.startsWith('/api/base') || ep.path.startsWith('/api/report')) return 'none';
  if (ep.path.startsWith('/api/Test')) return 'none';
  return 'doctor';
}

function build() {
  return discover()
    .map((ep) => {
      const skip = SKIP[ep.path];
      // Path params cannot be swept blindly.
      const hasParam = ep.path.includes(':');
      return Object.assign({}, ep, {
        role: roleFor(ep),
        body: Object.prototype.hasOwnProperty.call(BODY, ep.path) ? BODY[ep.path] : {},
        // true when the catalogue supplied a realistic body, so a failure is a
        // real defect rather than the endpoint asking for input it was not given.
        probed: Object.prototype.hasOwnProperty.call(BODY, ep.path),
        expect: BINARY.test(ep.path) ? 'binary' : 'json',
        heavy: /Print|Export/.test(ep.path), // headless Chrome / xlsx — run serially
        skip: skip || (hasParam ? 'path parameter — covered by Layer 2' : null),
      });
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

module.exports = { build, SKIP };
