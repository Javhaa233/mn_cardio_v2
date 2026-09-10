import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/paged_controller.dart';
import 'evisit.dart';

/// 2.6 Цахим үзлэг.
class EvisitsRepository {
  EvisitsRepository(this._api);

  final ApiClient _api;

  Future<Paged<Evisit>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _api.getPaged<Evisit>(
      '/api/patient/evisits',
      Evisit.fromJson,
      limit: limit,
      offset: offset,
    );
  }

  /// Хүсэлт үүсгэх. Биеийн талбар нь `Comment` — PascalCase.
  Future<void> create(String comment) async {
    await _api.postObject(
      '/api/patient/evisits',
      body: <String, dynamic>{'Comment': comment.trim()},
    );
  }
}

class EvisitsController extends PagedController<Evisit> {
  EvisitsController(this._repo);

  final EvisitsRepository _repo;

  bool _sending = false;
  bool get sending => _sending;

  @override
  Future<Paged<Evisit>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(limit: limit, offset: offset);
  }

  Future<ApiException?> create(String comment) async {
    if (_sending) return null;
    _sending = true;
    notifyListeners();
    try {
      await _repo.create(comment);
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }
}
