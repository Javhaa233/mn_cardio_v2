import 'package:flutter/foundation.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/util/async_state.dart';
import 'risk_assessment.dart';

/// 2.5 Эрсдэл үнэлгээ (ЗСӨ).
class RiskRepository {
  RiskRepository(this._api);

  final ApiClient _api;

  Future<RiskAssessment> fetch() async {
    final data = await _api.getRaw('/api/patient/risk');
    if (data is! Map) return RiskAssessment.empty;
    return RiskAssessment.fromJson(Map<String, dynamic>.from(data));
  }
}

class RiskController extends ChangeNotifier {
  RiskController(this._repo);

  final RiskRepository _repo;

  AsyncState<RiskAssessment> _state = const AsyncState<RiskAssessment>.idle();
  AsyncState<RiskAssessment> get state => _state;

  Future<void> load({bool refresh = false}) async {
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<RiskAssessment>.loading());
    try {
      final result = await _repo.fetch();
      _emit(AsyncState<RiskAssessment>.ready(result));
    } on ApiException catch (e) {
      _emit(AsyncState<RiskAssessment>.error(e, data: _state.data));
    }
  }

  void _emit(AsyncState<RiskAssessment> next) {
    _state = next;
    notifyListeners();
  }
}
