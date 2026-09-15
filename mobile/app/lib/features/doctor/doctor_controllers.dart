import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/async_state.dart';
import '../../core/util/paged_controller.dart';
import '../../shared/widgets/date_range_field.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';

// ---------------------------------------------------------------------------
// Профайл
// ---------------------------------------------------------------------------

/// Эмчийн өөрийн мэдээлэл. Нүүр хуудас, цэс, тайлан гурав хэрэглэдэг тул
/// нэг л удаа ачаална.
class DoctorProfileController extends ChangeNotifier {
  DoctorProfileController(this._repo);

  final DoctorRepository _repo;

  AsyncState<DoctorMe> _state = const AsyncState<DoctorMe>.idle();
  AsyncState<DoctorMe> get state => _state;
  DoctorMe? get me => _state.data;

  Future<void> load({bool refresh = false}) async {
    if (_state.isLoading || _state.isRefreshing) return;
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<DoctorMe>.loading());
    try {
      _emit(AsyncState<DoctorMe>.ready(await _repo.fetchMe()));
    } on ApiException catch (e) {
      _emit(AsyncState<DoctorMe>.error(e, data: _state.data));
    }
  }

  void _emit(AsyncState<DoctorMe> next) {
    _state = next;
    notifyListeners();
  }
}

// ---------------------------------------------------------------------------
// 1.1 Миний үзлэгүүд
// ---------------------------------------------------------------------------

class DoctorVisitsController extends PagedController<DoctorVisit> {
  DoctorVisitsController(this._repo);

  final DoctorRepository _repo;

  VisitScope _scope = VisitScope.mine;
  DateRange _range = DateRange.all;
  String _search = '';
  IcdCode? _icd;
  Timer? _debounce;

  VisitScope get scope => _scope;
  DateRange get range => _range;
  String get search => _search;

  /// Сонгосон онош (ICD-10). `null` бол оношоор шүүхгүй.
  IcdCode? get icd => _icd;

  @override
  Future<Paged<DoctorVisit>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchVisits(
      limit: limit,
      offset: offset,
      scope: _scope,
      range: _range,
      search: _search,
      icd10: _icd?.code ?? '',
    );
  }

  Future<void> setIcd(IcdCode? value) async {
    if (_icd?.code == value?.code) return;
    _icd = value;
    await reset();
  }

  Future<void> setScope(VisitScope value) async {
    if (_scope == value) return;
    _scope = value;
    await reset();
  }

  Future<void> setRange(DateRange value) async {
    if (_range == value) return;
    _range = value;
    await reset();
  }

  /// Хайлт бичих бүрд хүсэлт явуулахгүй — бичиж дуустал хүлээнэ.
  void setSearch(String value) {
    _search = value;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 450), reset);
    notifyListeners();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}

// ---------------------------------------------------------------------------
// 1.2 Миний хяналт
// ---------------------------------------------------------------------------

class DoctorMonitoringController extends PagedController<MonitoringRow> {
  DoctorMonitoringController(this._repo);

  final DoctorRepository _repo;

  @override
  Future<Paged<MonitoringRow>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchMonitoring(limit: limit, offset: offset);
  }

  /// Хяналтад авах. Амжилттай бол жагсаалтыг дахин татна — серверийн эрэмбэ,
  /// `since` огноог клиент талд таамаглахгүй.
  Future<ApiException?> add(int patientId) async {
    try {
      await _repo.addMonitoring(patientId);
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    }
  }

  Future<ApiException?> remove(int patientId) async {
    try {
      await _repo.removeMonitoring(patientId);
      removeWhere((MonitoringRow r) => r.patientId == patientId);
      return null;
    } on ApiException catch (e) {
      return e;
    }
  }

  bool isMonitored(int patientId) =>
      items.any((MonitoringRow r) => r.patientId == patientId);
}

/// Хяналтад буй нэг үйлчлүүлэгчийн тэмдэглэл.
class MonitoringJournalController extends ChangeNotifier {
  MonitoringJournalController(this._repo, this.patientId);

  final DoctorRepository _repo;
  final int patientId;

  AsyncState<PatientJournalBundle> _state =
      const AsyncState<PatientJournalBundle>.idle();
  DateRange _range = DateRange.lastDays(90);

  AsyncState<PatientJournalBundle> get state => _state;
  DateRange get range => _range;

  Future<void> load({bool refresh = false}) async {
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<PatientJournalBundle>.loading());
    try {
      final bundle =
          await _repo.fetchMonitoringJournal(patientId, range: _range);
      _emit(AsyncState<PatientJournalBundle>.ready(bundle));
    } on ApiException catch (e) {
      _emit(AsyncState<PatientJournalBundle>.error(e, data: _state.data));
    }
  }

  Future<void> setRange(DateRange value) async {
    if (_range == value) return;
    _range = value;
    await load(refresh: true);
  }

  void _emit(AsyncState<PatientJournalBundle> next) {
    _state = next;
    notifyListeners();
  }
}

// ---------------------------------------------------------------------------
// 1.3 Миний зөвлөгөө
// ---------------------------------------------------------------------------

class DoctorAdviceController extends PagedController<DoctorAdvice> {
  DoctorAdviceController(this._repo);

  final DoctorRepository _repo;

  AdviceFilter _filter = AdviceFilter.mine;
  AdviceFilter get filter => _filter;

  @override
  Future<Paged<DoctorAdvice>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchAdvice(limit: limit, offset: offset, filter: _filter);
  }

  Future<void> setFilter(AdviceFilter value) async {
    if (_filter == value) return;
    _filter = value;
    await reset();
  }
}

/// Нэг зөвлөгөөний дэлгэрэнгүй.
class DoctorAdviceDetailController extends ChangeNotifier {
  DoctorAdviceDetailController(this._repo, this.adviceId);

  final DoctorRepository _repo;
  final int adviceId;

  AsyncState<DoctorAdviceDetail> _state =
      const AsyncState<DoctorAdviceDetail>.idle();
  AsyncState<DoctorAdviceDetail> get state => _state;

  Future<void> load({bool refresh = false}) async {
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<DoctorAdviceDetail>.loading());
    try {
      _emit(AsyncState<DoctorAdviceDetail>.ready(
        await _repo.fetchAdviceDetail(adviceId),
      ));
    } on ApiException catch (e) {
      _emit(AsyncState<DoctorAdviceDetail>.error(e, data: _state.data));
    }
  }

  void _emit(AsyncState<DoctorAdviceDetail> next) {
    _state = next;
    notifyListeners();
  }
}

// ---------------------------------------------------------------------------
// 1.4 Миний тайлан
// ---------------------------------------------------------------------------

class DoctorReportController extends ChangeNotifier {
  DoctorReportController(this._repo);

  final DoctorRepository _repo;

  AsyncState<DoctorReport> _state = const AsyncState<DoctorReport>.idle();
  DateRange _range = DateRange.lastDays(30);

  AsyncState<DoctorReport> get state => _state;
  DateRange get range => _range;

  Future<void> load({bool refresh = false}) async {
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<DoctorReport>.loading());
    try {
      _emit(AsyncState<DoctorReport>.ready(
        await _repo.fetchReport(range: _range),
      ));
    } on ApiException catch (e) {
      _emit(AsyncState<DoctorReport>.error(e, data: _state.data));
    }
  }

  Future<void> setRange(DateRange value) async {
    if (_range == value) return;
    _range = value;
    await load(refresh: true);
  }

  void _emit(AsyncState<DoctorReport> next) {
    _state = next;
    notifyListeners();
  }
}

// ---------------------------------------------------------------------------
// 1.5 Үйлчлүүлэгч хайх, харах
// ---------------------------------------------------------------------------

class PatientSearchController extends PagedController<PatientBrief> {
  PatientSearchController(this._repo);

  final DoctorRepository _repo;

  String _search = '';
  Timer? _debounce;

  String get search => _search;

  /// Сервер 3-аас доошгүй тэмдэгт шаарддаг тул түүнээс богино үед хүсэлт
  /// огт явуулахгүй — 400 авах шаардлагагүй.
  bool get isSearchTooShort => _search.trim().length < 3;

  @override
  Future<Paged<PatientBrief>> fetchPage({
    required int limit,
    required int offset,
  }) {
    if (isSearchTooShort) return Future<Paged<PatientBrief>>.value(Paged.empty());
    return _repo.searchPatients(
      search: _search,
      limit: limit,
      offset: offset,
    );
  }

  void setSearch(String value) {
    _search = value;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 450), reset);
    notifyListeners();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}

/// Үйлчлүүлэгчийн карт: профайл, үзлэг, хэмжилтийн график, цахим үзлэг.
class PatientCardController extends ChangeNotifier {
  PatientCardController(this._repo, this.patientId);

  final DoctorRepository _repo;
  final int patientId;

  AsyncState<PatientCard> _card = const AsyncState<PatientCard>.idle();
  AsyncState<List<DoctorEvisit>> _evisits =
      const AsyncState<List<DoctorEvisit>>.idle();
  bool _monitoringBusy = false;

  AsyncState<PatientCard> get card => _card;
  AsyncState<List<DoctorEvisit>> get evisits => _evisits;
  bool get monitoringBusy => _monitoringBusy;

  Future<void> load({bool refresh = false}) async {
    await Future.wait<void>(<Future<void>>[
      _loadCard(refresh: refresh),
      loadEvisits(),
    ]);
  }

  Future<void> _loadCard({bool refresh = false}) async {
    _card = refresh && _card.hasData
        ? _card.toRefreshing()
        : const AsyncState<PatientCard>.loading();
    notifyListeners();
    try {
      _card = AsyncState<PatientCard>.ready(
        await _repo.fetchPatientCard(patientId),
      );
    } on ApiException catch (e) {
      _card = AsyncState<PatientCard>.error(e, data: _card.data);
    }
    notifyListeners();
  }

  /// Цахим үзлэг нь тусдаа, хуучин endpoint-оос ирдэг тул тусад нь ачаална —
  /// тэр нь бүтэлгүйтсэн ч картын үндсэн мэдээлэл харагдана.
  Future<void> loadEvisits() async {
    _evisits = const AsyncState<List<DoctorEvisit>>.loading();
    notifyListeners();
    try {
      _evisits = AsyncState<List<DoctorEvisit>>.ready(
        await _repo.fetchPatientEvisits(patientId),
      );
    } on ApiException catch (e) {
      _evisits = AsyncState<List<DoctorEvisit>>.error(e);
    }
    notifyListeners();
  }

  /// Хяналтад авах / хасах. Буцаах утга: алдаа, эсвэл `null` бол амжилттай.
  Future<ApiException?> toggleMonitoring() async {
    final current = _card.data;
    if (current == null || _monitoringBusy) return null;

    _monitoringBusy = true;
    notifyListeners();
    try {
      if (current.isMonitoredByMe) {
        await _repo.removeMonitoring(patientId);
      } else {
        await _repo.addMonitoring(patientId);
      }
      await _loadCard(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _monitoringBusy = false;
      notifyListeners();
    }
  }
}

// ---------------------------------------------------------------------------
// Нүүр хуудасны асуумжийн урсгал — вебийн `AdviceHome` (`GetFeed`)
// ---------------------------------------------------------------------------

/// Хуудас бүр 10 — вебийнх шиг. Карт бүр base64 зураг авч явдаг тул том
/// хуудас сүлжээ, санах ойд хүнд.
class DoctorFeedController extends PagedController<FeedTicket> {
  DoctorFeedController(this._repo) : super(pageSize: 10);

  final DoctorRepository _repo;

  FeedFilter _filter = FeedFilter.all;
  String _search = '';

  FeedFilter get filter => _filter;
  String get search => _search;
  bool get isFiltered => _filter != FeedFilter.all || _search.isNotEmpty;

  @override
  Future<Paged<FeedTicket>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchFeed(
      filter: _filter,
      search: _search,
      pageNumber: offset ~/ limit,
      pageSize: limit,
    );
  }

  Future<void> setFilter(FeedFilter value) async {
    if (value == _filter) return;
    _filter = value;
    await reset();
  }

  /// Сервер 2-оос доош тэмдэгттэй хайлтыг үл тоодог тул тэр үед шүүлтгүй.
  Future<void> setSearch(String value) async {
    final trimmed = value.trim();
    final next = trimmed.length < 2 ? '' : trimmed;
    if (next == _search) return;
    _search = next;
    await reset();
  }
}

