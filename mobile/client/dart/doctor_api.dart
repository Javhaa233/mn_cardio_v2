import 'api_client.dart';

/// `/api/doctor/*` — Эмчийн модуль, tender §2 / tracker rows 28–32.
///
/// Same conventions as `PatientApi`: real verbs, real status codes, the
/// lowercase envelope, `limit`/`offset`/`from`/`to`.
///
/// **No method takes a doctor, user or organisation identifier** — all three
/// come from the token. Scoping is enforced server-side, so a visit id outside
/// your organisation returns 404 rather than the record.
///
/// Gate failures arrive as [ApiException] with these codes:
/// `NOT_AUTHENTICATED` (401), `NOT_A_DOCTOR` (403, you used a patient token),
/// `ROLE_NOT_ALLOWED` (403), `ORGANIZATION_NOT_RESOLVED` (403).
class DoctorApi {
  DoctorApi(this._api);

  final ApiClient _api;

  /// `{UserId, DoctorId, RoleId, IsAdmin, FullName, profile, organization}`.
  ///
  /// `RoleId` comes back here as a **string** ("3") but as a **number** on
  /// `/api/auth/session`. Compare through [ApiClient.roleIdOf].
  Future<Map<String, dynamic>> me() async =>
      Map<String, dynamic>.from(await _api.get('/api/doctor/me') as Map);

  // --- 28 Миний үзлэгүүд ----------------------------------------------------

  /// [scope] is `mine` (what this user recorded, the default) or `organization`
  /// (the whole organisation including children). Admins see everything.
  ///
  /// [search] matches registration number, last name or first name.
  Future<List<Map<String, dynamic>>> visits({
    String scope = 'mine',
    String? search,
    String? from,
    String? to,
    int limit = 20,
    int offset = 0,
  }) async =>
      _rows(await _api.get('/api/doctor/visits', query: {
        'scope': scope,
        'search': search,
        'from': from,
        'to': to,
        'limit': limit,
        'offset': offset,
      }));

  /// Organisation-scoped. An id outside your scope returns
  /// `ApiException(code: 'NOT_FOUND')`, not the record — `Visit` holds ~450,000
  /// rows and an unscoped detail endpoint would be an enumeration hole.
  Future<Map<String, dynamic>> visit(int id) async =>
      Map<String, dynamic>.from(await _api.get('/api/doctor/visits/$id') as Map);

  // --- 29 Миний хяналт ------------------------------------------------------

  /// Each row is `{id_data, since, patient, latestReading}` — the most recent
  /// journal reading is included, so the list screen needs no second call per
  /// patient.
  Future<List<Map<String, dynamic>>> monitoring({int limit = 20, int offset = 0}) async =>
      _rows(await _api
          .get('/api/doctor/monitoring', query: {'limit': limit, 'offset': offset}));

  /// Adds a patient to **your own** monitoring list; the doctor comes from the
  /// token.
  ///
  /// Use this rather than the legacy `/api/PatientMonitoring/SavePatient`,
  /// which reads `UserId` and `DoctorId` from the request body and can
  /// therefore be pointed at another doctor's list. Both write the same audit
  /// rows.
  Future<Map<String, dynamic>> addToMonitoring(int patientId) async =>
      Map<String, dynamic>.from(
          await _api.post('/api/doctor/monitoring', body: {'PatientId': patientId}) as Map);

  Future<Map<String, dynamic>> removeFromMonitoring(int patientId) async =>
      Map<String, dynamic>.from(
          await _api.delete('/api/doctor/monitoring/$patientId') as Map);

  /// Returns `{rows, labels, series}`. Refuses a patient you do not monitor
  /// with `ApiException(code: 'NOT_MONITORED')`.
  Future<Map<String, dynamic>> monitoredPatientJournal(
    int patientId, {
    String? from,
    String? to,
  }) async =>
      Map<String, dynamic>.from(await _api.get(
        '/api/doctor/monitoring/$patientId/journal',
        query: {'from': from, 'to': to},
      ) as Map);

  // --- 30 Миний зөвлөгөө ----------------------------------------------------

  /// The doctor's **own** tickets. [filter] is `mine`, `drafts` or `all`.
  ///
  /// This is deliberately not the organisation-wide wall — that stays at
  /// `/api/Advice/GetFeed` with its own visibility rules.
  Future<List<Map<String, dynamic>>> advice({
    String filter = 'mine',
    int limit = 20,
    int offset = 0,
  }) async =>
      _rows(await _api.get('/api/doctor/advice',
          query: {'filter': filter, 'limit': limit, 'offset': offset}));

  /// `{ticket, comments}`, author-scoped — someone else's ticket returns 404.
  Future<Map<String, dynamic>> adviceDetail(int id) async =>
      Map<String, dynamic>.from(await _api.get('/api/doctor/advice/$id') as Map);

  // --- 31 Миний тайлан ------------------------------------------------------

  /// `{window, myVisits, organizationVisits, monitoredPatients, adviceAuthored,
  /// topDiagnoses, source}`.
  ///
  /// `source` carries the organisation and timestamp provenance marking both
  /// tenders require on anything exported — keep it if you render or share this.
  Future<Map<String, dynamic>> reportSummary({String? from, String? to}) async =>
      Map<String, dynamic>.from(
          await _api.get('/api/doctor/reports/summary', query: {'from': from, 'to': to}) as Map);

  // --- 32 Read access to the patient side -----------------------------------

  /// [search] must be **at least 3 characters**, else
  /// `ApiException(code: 'SEARCH_TOO_SHORT')`. Debounce your search box rather
  /// than firing on every keystroke.
  Future<List<Map<String, dynamic>>> searchPatients(
    String search, {
    int limit = 20,
    int offset = 0,
  }) async =>
      _rows(await _api.get('/api/doctor/patients',
          query: {'search': search, 'limit': limit, 'offset': offset}));

  /// `{patient, visits[20], journal{labels, series}, isMonitoredByMe}` —
  /// everything one screen needs in a single call.
  Future<Map<String, dynamic>> patient(int id) async =>
      Map<String, dynamic>.from(await _api.get('/api/doctor/patients/$id') as Map);

  List<Map<String, dynamic>> _rows(dynamic data) => (data as List? ?? const [])
      .map((e) => Map<String, dynamic>.from(e as Map))
      .toList(growable: false);
}
