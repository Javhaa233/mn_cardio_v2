import '../../core/network/api_client.dart';
import '../../core/network/envelope.dart';
import '../../core/util/paged_controller.dart';
import 'advice.dart';

/// 2.4 Эмчийн зөвлөгөө — зөвхөн уншина.
class AdviceRepository {
  AdviceRepository(this._api);

  final ApiClient _api;

  Future<Paged<Advice>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _api.getPaged<Advice>(
      '/api/patient/advice',
      Advice.fromJson,
      limit: limit,
      offset: offset,
    );
  }
}

class AdviceController extends PagedController<Advice> {
  AdviceController(this._repo);

  final AdviceRepository _repo;

  @override
  Future<Paged<Advice>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(limit: limit, offset: offset);
  }
}
