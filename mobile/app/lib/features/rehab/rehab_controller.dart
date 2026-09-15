import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/util/async_state.dart';
import '../../shared/widgets/date_range_field.dart';
import 'rehab_models.dart';

/// 2.7 Сэргээн засах, дасгал хөдөлгөөн.
///
/// **Анхаар:** зургаан endpoint бүгд өнөөдөр 500 буцаана. Хяналт, загвар,
/// маршрут бүгд бичигдсэн боловч хүснэгтүүд үүсээгүй —
/// `scripts/add_rehabilitation_tables.sql` ажиллаагүй (READINESS.md §3).
/// Тиймээс энд бүх урсгалыг гүйцэд хийж, серверийн алдааг тусад нь таньж
/// "модуль хараахан идэвхжээгүй" гэсэн ойлгомжтой мессеж харуулна.
class RehabRepository {
  RehabRepository(this._api);

  final ApiClient _api;

  Future<List<RehabExercise>> fetchExercises() async {
    final data = await _api.getRaw('/api/patient/rehab/exercises');
    if (data is! List) return const <RehabExercise>[];
    return data
        .whereType<Map<dynamic, dynamic>>()
        .map((Map<dynamic, dynamic> e) =>
            RehabExercise.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  Future<List<RehabProgress>> fetchProgress({
    int limit = 100,
    int offset = 0,
    DateRange range = DateRange.all,
  }) async {
    final page = await _api.getPaged<RehabProgress>(
      '/api/patient/rehab/progress',
      RehabProgress.fromJson,
      limit: limit,
      offset: offset,
      query: range.toQuery(),
    );
    return page.items;
  }

  Future<void> markCompleted({
    required int exerciseId,
    int? durationSec,
    String? notes,
  }) async {
    await _api.postObject(
      '/api/patient/rehab/progress',
      body: <String, dynamic>{
        'ExerciseId': exerciseId,
        if (durationSec != null) 'DurationSec': durationSec,
        if (notes != null && notes.trim().isNotEmpty) 'Notes': notes.trim(),
      },
    );
  }

  Future<RehabVitalsBundle> fetchVitals({DateRange range = DateRange.all}) async {
    final data = await _api.getRaw(
      '/api/patient/rehab/vitals',
      query: range.toQuery(),
    );
    if (data is! Map) return RehabVitalsBundle.empty;
    return RehabVitalsBundle.fromJson(Map<String, dynamic>.from(data));
  }

  Future<void> addVital(RehabVitalDraft draft) async {
    await _api.postObject('/api/patient/rehab/vitals', body: draft.toJson());
  }

  /// Үнэлгээний **түүх** — `GET /api/patient/rehab/assessments`.
  ///
  /// Ганц тоо биш, явц чухал: өмнөх үнэлгээтэй харьцуулж сайжирсан эсэхийг
  /// үйлчлүүлэгч өөрөө харна.
  Future<List<RehabAssessment>> fetchAssessments() async {
    final page = await _api.getPaged<RehabAssessment>(
      '/api/patient/rehab/assessments',
      RehabAssessment.fromJson,
      limit: 20,
      offset: 0,
    );
    return page.items;
  }

  Future<RehabAssessment?> fetchAssessment() async {
    final data = await _api.getRaw('/api/patient/rehab/assessment');
    if (data is! Map) return null;
    return RehabAssessment.fromJson(Map<String, dynamic>.from(data));
  }
}

/// Серверийн 500 алдааг "модуль идэвхжээгүй" гэж тайлбарлах эсэх.
///
/// Хүснэгт байхгүйгээс болж унасан алдаа нь үйлчлүүлэгчид "алдаа гарлаа"
/// гэж харагдах ёсгүй — тэр нь дахин оролдоод шийдэгдэхгүй.
bool isModuleNotEnabled(ApiException e) =>
    e.statusCode == 500 || e.code == 'SERVER_ERROR';

class RehabController extends ChangeNotifier {
  RehabController(this._repo);

  final RehabRepository _repo;

  AsyncState<List<RehabExercise>> _exercises =
      const AsyncState<List<RehabExercise>>.idle();
  AsyncState<RehabVitalsBundle> _vitals =
      const AsyncState<RehabVitalsBundle>.idle();
  AsyncState<RehabAssessment?> _assessment =
      const AsyncState<RehabAssessment?>.idle();

  List<RehabProgress> _progress = const <RehabProgress>[];
  DateRange _vitalsRange = DateRange.lastDays(30);
  bool _moduleDisabled = false;

  AsyncState<List<RehabExercise>> get exercises => _exercises;
  AsyncState<RehabVitalsBundle> get vitals => _vitals;
  AsyncState<RehabAssessment?> get assessment => _assessment;

  List<RehabAssessment> _history = const <RehabAssessment>[];

  /// Сүүлийн үнэлгээнээс өмнөх бичлэгүүд.
  List<RehabAssessment> get assessmentHistory => _history;
  List<RehabProgress> get progress => _progress;
  DateRange get vitalsRange => _vitalsRange;

  /// Модуль эмнэлгийн систем дээр идэвхжээгүй байна.
  bool get moduleDisabled => _moduleDisabled;

  /// Дасгал бүрийн хамгийн сүүлийн гүйцэтгэл.
  DateTime? lastCompletedAt(int exerciseId) {
    DateTime? latest;
    for (final row in _progress) {
      if (row.exerciseId != exerciseId) continue;
      final at = row.completedAt;
      if (at == null) continue;
      if (latest == null || at.isAfter(latest)) latest = at;
    }
    return latest;
  }

  /// Өнөөдөр гүйцэтгэсэн дасгалын тоо.
  int get completedToday {
    final now = DateTime.now();
    return _progress.where((RehabProgress p) {
      final at = p.completedAt;
      if (at == null) return false;
      return at.year == now.year && at.month == now.month && at.day == now.day;
    }).length;
  }

  Future<void> loadAll({bool refresh = false}) async {
    await Future.wait<void>(<Future<void>>[
      loadExercises(refresh: refresh),
      loadVitals(refresh: refresh),
      loadAssessment(refresh: refresh),
    ]);
  }

  Future<void> loadExercises({bool refresh = false}) async {
    _exercises = refresh && _exercises.hasData
        ? _exercises.toRefreshing()
        : const AsyncState<List<RehabExercise>>.loading();
    notifyListeners();
    try {
      final list = await _repo.fetchExercises();
      // Гүйцэтгэлийг каталогтой хамт татна — дасгал бүр дээр "хийсэн" тэмдэг
      // харуулахад хэрэгтэй, тусад нь дуудлага хийх шаардлагагүй.
      try {
        _progress = await _repo.fetchProgress();
      } on ApiException {
        _progress = const <RehabProgress>[];
      }
      _moduleDisabled = false;
      _exercises = AsyncState<List<RehabExercise>>.ready(list);
    } on ApiException catch (e) {
      _moduleDisabled = isModuleNotEnabled(e);
      _exercises = AsyncState<List<RehabExercise>>.error(e);
    }
    notifyListeners();
  }

  Future<void> loadVitals({bool refresh = false}) async {
    _vitals = refresh && _vitals.hasData
        ? _vitals.toRefreshing()
        : const AsyncState<RehabVitalsBundle>.loading();
    notifyListeners();
    try {
      final bundle = await _repo.fetchVitals(range: _vitalsRange);
      _vitals = AsyncState<RehabVitalsBundle>.ready(bundle);
    } on ApiException catch (e) {
      if (isModuleNotEnabled(e)) _moduleDisabled = true;
      _vitals = AsyncState<RehabVitalsBundle>.error(e);
    }
    notifyListeners();
  }

  Future<void> setVitalsRange(DateRange value) async {
    if (_vitalsRange == value) return;
    _vitalsRange = value;
    await loadVitals(refresh: true);
  }

  Future<void> _loadHistory() async {
    try {
      _history = await _repo.fetchAssessments();
      notifyListeners();
    } on ApiException {
      // Түүх татагдаагүй нь дэлгэц унагаах шалтгаан биш.
    }
  }

  Future<void> loadAssessment({bool refresh = false}) async {
    _assessment = refresh && _assessment.hasData
        ? _assessment.toRefreshing()
        : const AsyncState<RehabAssessment?>.loading();
    notifyListeners();
    try {
      // Түүхийг чимээгүй татна — алдаа гарвал сүүлийн үнэлгээ харагдсаар байна.
      unawaited(_loadHistory());
      final row = await _repo.fetchAssessment();
      _assessment = AsyncState<RehabAssessment?>.ready(row);
    } on ApiException catch (e) {
      if (isModuleNotEnabled(e)) _moduleDisabled = true;
      _assessment = AsyncState<RehabAssessment?>.error(e);
    }
    notifyListeners();
  }

  /// Дасгал гүйцэтгэснийг тэмдэглэх.
  Future<ApiException?> markCompleted({
    required int exerciseId,
    int? durationSec,
    String? notes,
  }) async {
    try {
      await _repo.markCompleted(
        exerciseId: exerciseId,
        durationSec: durationSec,
        notes: notes,
      );
      _progress = await _repo.fetchProgress();
      notifyListeners();
      return null;
    } on ApiException catch (e) {
      return e;
    }
  }

  Future<ApiException?> addVital(RehabVitalDraft draft) async {
    try {
      await _repo.addVital(draft);
      await loadVitals(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    }
  }
}
