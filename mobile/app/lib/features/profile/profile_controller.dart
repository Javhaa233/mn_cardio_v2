import 'package:flutter/foundation.dart';

import '../../core/network/api_exception.dart';
import '../../core/util/async_state.dart';
import 'patient_profile.dart';
import 'profile_repository.dart';

/// Үйлчлүүлэгчийн бүртгэлийн төлөв.
///
/// Профайл нь нүүр хуудас, тэмдэглэл, чат гэх мэт олон дэлгэцэд хэрэгтэй тул
/// апп-ын хэмжээнд нэг л удаа ачаалж, дахин ашиглана.
class ProfileController extends ChangeNotifier {
  ProfileController(this._repo);

  final ProfileRepository _repo;

  AsyncState<PatientProfile> _state = const AsyncState<PatientProfile>.idle();
  AsyncState<PatientProfile> get state => _state;
  PatientProfile? get profile => _state.data;

  Future<void> load({bool refresh = false}) async {
    if (_state.isLoading || _state.isRefreshing) return;
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<PatientProfile>.loading());
    try {
      final profile = await _repo.fetchMe();
      _emit(AsyncState<PatientProfile>.ready(profile));
    } on ApiException catch (e) {
      _emit(AsyncState<PatientProfile>.error(e, data: _state.data));
    }
  }

  /// Гарах үед цэвэрлэнэ — өөр хэрэглэгч нэвтрэхэд өмнөх бүртгэл харагдахгүй.
  void clear() {
    _state = const AsyncState<PatientProfile>.idle();
    notifyListeners();
  }

  void _emit(AsyncState<PatientProfile> next) {
    _state = next;
    notifyListeners();
  }
}
