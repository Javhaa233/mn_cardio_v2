import 'package:flutter/foundation.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/async_state.dart';
import '../../core/util/paged_controller.dart';
import '../../shared/widgets/date_range_field.dart';
import 'journal_entry.dart';
import 'journal_repository.dart';

/// 2.2 Миний тэмдэглэлийн жагсаалт.
class JournalController extends PagedController<JournalEntry> {
  JournalController(this._repo);

  final JournalRepository _repo;

  DateRange _range = DateRange.all;
  DateRange get range => _range;

  /// Хамгийн сүүлийн бичлэг — нүүр хуудсан дээрх товч харагдац.
  JournalEntry? get latest => items.isEmpty ? null : items.first;

  @override
  Future<Paged<JournalEntry>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(limit: limit, offset: offset, range: _range);
  }

  Future<void> setRange(DateRange value) async {
    if (_range == value) return;
    _range = value;
    await reset();
  }

  /// Шинэ бичлэг хадгална.
  ///
  /// Амжилттай болбол жагсаалтыг эхнээс нь дахин татна — серверийн эрэмбэ,
  /// талбарын хэвийн болголтыг клиент талд таамаглахгүйн тулд.
  ///
  /// Буцаах утга: доод даралт хадгалагдсан эсэх. `false` бол хэрэглэгч доод
  /// даралт бичсэн атал сервер хадгалаагүй гэсэн үг (READINESS.md §2.9).
  Future<JournalSaveResult> create(JournalDraft draft) async {
    try {
      await _repo.create(draft);
      await load(refresh: true);

      final saved = latest;
      final diastolicDropped = draft.diastolic != null &&
          saved != null &&
          saved.diastolic == null;

      return JournalSaveResult(
        success: true,
        diastolicDropped: diastolicDropped,
      );
    } on ApiException catch (e) {
      return JournalSaveResult(success: false, error: e);
    }
  }
}

/// Хадгалалтын үр дүн.
class JournalSaveResult {
  const JournalSaveResult({
    required this.success,
    this.diastolicDropped = false,
    this.error,
  });

  final bool success;
  final bool diastolicDropped;
  final ApiException? error;
}

/// Тэмдэглэлийн график.
class JournalSummaryController extends ChangeNotifier {
  JournalSummaryController(this._repo);

  final JournalRepository _repo;

  AsyncState<JournalSummary> _state = const AsyncState<JournalSummary>.idle();
  AsyncState<JournalSummary> get state => _state;

  DateRange _range = DateRange.lastDays(30);
  DateRange get range => _range;

  Future<void> load({bool refresh = false}) async {
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<JournalSummary>.loading());
    try {
      final summary = await _repo.fetchSummary(range: _range);
      _emit(AsyncState<JournalSummary>.ready(summary));
    } on ApiException catch (e) {
      _emit(AsyncState<JournalSummary>.error(e, data: _state.data));
    }
  }

  Future<void> setRange(DateRange value) async {
    if (_range == value) return;
    _range = value;
    await load(refresh: true);
  }

  void _emit(AsyncState<JournalSummary> next) {
    _state = next;
    notifyListeners();
  }
}
