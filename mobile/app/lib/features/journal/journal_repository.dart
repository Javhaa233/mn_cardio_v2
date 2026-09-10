import '../../core/network/api_client.dart';
import '../../core/network/envelope.dart';
import '../../shared/widgets/date_range_field.dart';
import 'journal_entry.dart';

/// 2.2 Миний тэмдэглэл.
class JournalRepository {
  JournalRepository(this._api);

  final ApiClient _api;

  /// Шинэхнээс нь эрэмбэлсэн жагсаалт.
  Future<Paged<JournalEntry>> fetchPage({
    required int limit,
    required int offset,
    DateRange range = DateRange.all,
  }) {
    return _api.getPaged<JournalEntry>(
      '/api/patient/journal',
      JournalEntry.fromJson,
      limit: limit,
      offset: offset,
      query: range.toQuery(),
    );
  }

  /// Шинэ бичлэг. `date` заавал — эс бөгөөс сервер 400 `DATE_REQUIRED` өгнө.
  Future<int> create(JournalDraft draft) async {
    final data = await _api.postObject(
      '/api/patient/journal',
      body: draft.toJson(),
    );
    final id = data['id_data'];
    if (id is num) return id.toInt();
    return 0;
  }

  /// Графикийн цуваа. Сервер тал эрэмбэлж, 365 цэгээр таслаад өгнө.
  Future<JournalSummary> fetchSummary({DateRange range = DateRange.all}) async {
    final data = await _api.getRaw(
      '/api/patient/journal/summary',
      query: range.toQuery(),
    );
    if (data is! Map) return JournalSummary.empty;
    return JournalSummary.fromJson(Map<String, dynamic>.from(data));
  }
}
