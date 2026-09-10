import 'api_client.dart';

/// `/api/patient/*` — Үйлчлүүлэгчийн модуль, tender §2 modules 2.1–2.7.
///
/// **No method here takes a patient identifier.** It always comes from the
/// token. There is nowhere to put someone else's id, which is the point of the
/// surface — do not add one.
///
/// Shared conventions: `limit` defaults to 20 and is **capped at 100**
/// server-side; `offset` pages; `from` / `to` filter on the resource's own date
/// column.
///
/// The list methods here return just the rows. The envelope also carries
/// `total`, `limit` and `offset` alongside `data` — when you need those for an
/// infinite scroll, call `ApiClient.get` directly and read the whole map rather
/// than going through the helper.
class PatientApi {
  PatientApi(this._api);

  final ApiClient _api;

  // --- 2.1 Миний бүртгэл ----------------------------------------------------

  /// The signed-in patient's own record.
  ///
  /// Throws `ApiException(code: 'PATIENT_NOT_RESOLVED')` when the account has
  /// no linked `Patient` row. That is a data condition, not a client bug —
  /// surface it as "бүртгэл олдсонгүй, эмнэлэгт хандана уу", never as a login
  /// failure.
  Future<Map<String, dynamic>> me() async =>
      Map<String, dynamic>.from(await _api.get('/api/patient/me') as Map);

  // --- 2.2 Миний тэмдэглэл --------------------------------------------------

  Future<List<Map<String, dynamic>>> journal({
    int limit = 20,
    int offset = 0,
    String? from,
    String? to,
  }) async =>
      _rows(await _api.get('/api/patient/journal',
          query: {'limit': limit, 'offset': offset, 'from': from, 'to': to}));

  /// Records a reading. [date] is required — omit it and the server answers
  /// `400 DATE_REQUIRED`.
  ///
  /// Note the asymmetry: reads return `blood_pressure2` (diastolic) and the
  /// summary chart plots it, but **create does not accept it**. A patient
  /// cannot record diastolic pressure through this endpoint today.
  Future<int?> addJournalEntry({
    required String date,
    String? time,
    String? bloodPressure,
    String? pulse,
    String? weight,
    String? inr,
    String? comment,
  }) async {
    final data = await _api.post('/api/patient/journal', body: {
      'date': date,
      'time': time,
      'blood_pressure': bloodPressure,
      'pulse': pulse,
      'weight': weight,
      'inr': inr,
      'comment': comment,
    });
    return (data as Map)['id_data'] as int?;
  }

  /// Chart-ready series, built server-side and capped at 365 points.
  ///
  /// Returns `{labels, series: {blood_pressure, blood_pressure2, pulse, weight}}`.
  Future<Map<String, dynamic>> journalSummary({String? from, String? to}) async =>
      Map<String, dynamic>.from(await _api
          .get('/api/patient/journal/summary', query: {'from': from, 'to': to}) as Map);

  // --- 2.3 Эмчээс асуух асуулт ----------------------------------------------

  /// The question thread. `is_doctor` distinguishes a reply from a question.
  Future<List<Map<String, dynamic>>> questions({int limit = 20, int offset = 0}) async =>
      _rows(await _api
          .get('/api/patient/questions', query: {'limit': limit, 'offset': offset}));

  /// Asks a question. Required, else `400 COMMENT_REQUIRED`.
  Future<int?> askQuestion(String comment) async {
    final data = await _api.post('/api/patient/questions', body: {'comment': comment});
    return (data as Map)['id_data'] as int?;
  }

  // --- 2.4 Эмчийн зөвлөгөө --------------------------------------------------

  /// Doctor-authored advice. Read-only by design.
  ///
  /// Two data facts that shape the UI: `body` is empty on 57% of tickets
  /// because the clinical content sits in the first reply — fall back to
  /// `comments[0]` and label it — and no notification is delivered when advice
  /// arrives, so do not build a badge you cannot feed.
  Future<List<Map<String, dynamic>>> advice({int limit = 20, int offset = 0}) async =>
      _rows(await _api.get('/api/patient/advice', query: {'limit': limit, 'offset': offset}));

  // --- 2.5 Эрсдэл үнэлгээ (ЗСӨ) ---------------------------------------------

  /// Returns `{bodySize, history}` — the **raw inputs only**.
  ///
  /// No score and no risk class is computed anywhere in the backend: the
  /// methodology and its risk classification are an unapproved ЗСҮТ
  /// deliverable. Do not invent a formula. A wrong cardiovascular risk number
  /// shown to a patient is a clinical safety problem, not a rounding error.
  ///
  /// Two spellings to expect in the payload: body weight is
  /// `bodySize['Weigth']` (a typo baked into the database) and BMI comes back
  /// as `BJI`.
  Future<Map<String, dynamic>> risk() async =>
      Map<String, dynamic>.from(await _api.get('/api/patient/risk') as Map);

  // --- 2.6 Цахим үзлэг ------------------------------------------------------

  /// Fields here are **PascalCase inside the lowercase envelope** — `Id`,
  /// `Comment`, `CreateDate` — because `RemoteVisit` is a newer-generation
  /// table. The envelope tells you nothing about the field names inside it.
  ///
  /// This is a complaint box, not a booking system: no scheduling, no status,
  /// no doctor assignment and no video exist in the backend.
  Future<List<Map<String, dynamic>>> eVisits({int limit = 20, int offset = 0}) async =>
      _rows(await _api.get('/api/patient/evisits', query: {'limit': limit, 'offset': offset}));

  /// Note the capital `C` on `Comment` here, against lowercase on questions.
  Future<int?> submitEVisit(String comment) async {
    final data = await _api.post('/api/patient/evisits', body: {'Comment': comment});
    return (data as Map)['Id'] as int?;
  }

  // --- 2.7 Сэргээн засах, дасгал хөдөлгөөн ----------------------------------

  /// The exercise catalogue.
  ///
  /// Returns 200 with an **empty list** today: the tables exist on the test
  /// server but no exercises have been seeded, because the exercise list, its
  /// categories and the 39 videos are still customer decisions. An empty list
  /// here is correct — build the screen, it will fill.
  ///
  /// Unlike its siblings this route takes no limit/offset.
  ///
  /// `MediaRef` is a placeholder for the videos. There is **no video delivery
  /// path** in the backend yet — the file layer serves POST + attachment
  /// disposition, which no player can stream — so do not wire a player to it.
  Future<List<Map<String, dynamic>>> rehabExercises() async =>
      _rows(await _api.get('/api/patient/rehab/exercises'));

  Future<List<Map<String, dynamic>>> rehabProgress({
    int limit = 20,
    int offset = 0,
    String? from,
    String? to,
  }) async =>
      _rows(await _api.get('/api/patient/rehab/progress',
          query: {'limit': limit, 'offset': offset, 'from': from, 'to': to}));

  /// [exerciseId] is required, else `400 EXERCISE_REQUIRED`.
  Future<int?> recordRehabProgress({
    required int exerciseId,
    int? durationSec,
    String? notes,
  }) async {
    final data = await _api.post('/api/patient/rehab/progress', body: {
      'ExerciseId': exerciseId,
      'DurationSec': durationSec,
      'Notes': notes,
    });
    return (data as Map)['Id'] as int?;
  }

  /// Returns `{rows, labels, series: {pulse, spo2}}`, capped at 365 points.
  Future<Map<String, dynamic>> rehabVitals({String? from, String? to}) async =>
      Map<String, dynamic>.from(
          await _api.get('/api/patient/rehab/vitals', query: {'from': from, 'to': to}) as Map);

  /// No server-side validation on this one — every field is optional.
  Future<int?> recordRehabVitals({
    int? exerciseId,
    String? phase,
    int? pulse,
    String? bloodPressure,
    int? spo2,
    int? borg,
    String? notes,
  }) async {
    final data = await _api.post('/api/patient/rehab/vitals', body: {
      'ExerciseId': exerciseId,
      'Phase': phase,
      'Pulse': pulse,
      'BloodPressure': bloodPressure,
      'Spo2': spo2,
      'Borg': borg,
      'Notes': notes,
    });
    return (data as Map)['Id'] as int?;
  }

  /// The latest assessment, or null when there is none. `data: null` with
  /// `success: true` is the normal empty answer, not an error.
  Future<Map<String, dynamic>?> rehabAssessment() async {
    final data = await _api.get('/api/patient/rehab/assessment');
    return data == null ? null : Map<String, dynamic>.from(data as Map);
  }

  List<Map<String, dynamic>> _rows(dynamic data) => (data as List? ?? const [])
      .map((e) => Map<String, dynamic>.from(e as Map))
      .toList(growable: false);
}
