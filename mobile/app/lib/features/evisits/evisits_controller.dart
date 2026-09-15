import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/mn_format.dart';
import '../../core/util/paged_controller.dart';
import 'evisit.dart';

/// 2.6 Цахим үзлэг — хүсэлт, цаг захиалга, үзлэг.
class EvisitsRepository {
  EvisitsRepository(this._api);

  final ApiClient _api;

  Future<Paged<Evisit>> fetchPage({
    required int limit,
    required int offset,
    String status = '',
  }) {
    return _api.getPaged<Evisit>(
      '/api/patient/evisits',
      Evisit.fromJson,
      limit: limit,
      offset: offset,
      query: <String, dynamic>{
        if (status.isNotEmpty) 'status': status,
      },
    );
  }

  Future<Evisit> fetchOne(int id) async {
    final data = await _api.getObject('/api/patient/evisits/$id');
    return Evisit.fromJson(data);
  }

  /// Хүсэлт үүсгэх. Биеийн талбар нь `Comment` — PascalCase.
  ///
  /// [requestedDate] заавал биш. Өнгөрсөн огноог сервер `400 DATE_IN_PAST`
  /// гэж татгалзана; нээлттэй 3 хүсэлтээс дээш бол `409`.
  Future<void> create(String comment, {DateTime? requestedDate}) async {
    await _api.postObject(
      '/api/patient/evisits',
      body: <String, dynamic>{
        'Comment': comment.trim(),
        if (requestedDate != null)
          'RequestedDate': MnFormat.apiDateTime(requestedDate),
      },
    );
  }

  Future<void> cancel(int id, String reason) async {
    await _api.postObject(
      '/api/patient/evisits/$id/cancel',
      body: <String, dynamic>{'Reason': reason.trim()},
    );
  }
}

class EvisitsController extends PagedController<Evisit> {
  EvisitsController(this._repo);

  final EvisitsRepository _repo;

  bool _sending = false;
  String _status = '';

  bool get sending => _sending;

  /// Хоосон бол бүх төлөв.
  String get status => _status;

  /// Нээлттэй хүсэлтийн тоо — сервер дээд тал нь 3-ыг зөвшөөрнө.
  int get openCount => items.where((Evisit e) => e.isOpen).length;

  @override
  Future<Paged<Evisit>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(limit: limit, offset: offset, status: _status);
  }

  Future<void> setStatus(String value) async {
    if (_status == value) return;
    _status = value;
    await reset();
  }

  Future<ApiException?> create(String comment, {DateTime? requestedDate}) async {
    if (_sending) return null;
    _sending = true;
    notifyListeners();
    try {
      await _repo.create(comment, requestedDate: requestedDate);
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }

  Future<ApiException?> cancel(Evisit visit, String reason) async {
    if (_sending) return null;
    _sending = true;
    notifyListeners();
    try {
      await _repo.cancel(visit.id, reason);
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }

  /// Товлосон цагийн холбоос зөвхөн `scheduled` үед ирдэг тул дэлгэрэнгүйг
  /// нээхдээ дахин татна — кэшэлсэн холбоос хуучирсан байж болно.
  Future<Evisit?> refreshOne(int id) async {
    try {
      return await _repo.fetchOne(id);
    } on ApiException {
      return null;
    }
  }
}
