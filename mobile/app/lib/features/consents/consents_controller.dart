import 'package:flutter/foundation.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/async_state.dart';
import 'consent.dart';

/// Техникийн шаардлага §1.2 — эмчилгээнээс бусад зорилгоор хувийн мэдээлэл
/// ашиглахад "Зөвшөөрөл" авах.
class ConsentsRepository {
  ConsentsRepository(this._api);

  final ApiClient _api;

  Future<List<ConsentPurpose>> fetchAll() async {
    final data = await _api.getObject('/api/patient/consents');
    return Envelope.asList(data['items'])
        .map(ConsentPurpose.fromJson)
        .toList(growable: false);
  }

  Future<ConsentDocument> fetchDocument(String purposeCode) async {
    final data = await _api.getObject(
      '/api/patient/consents/$purposeCode/document',
    );
    return ConsentDocument.fromJson(data);
  }

  Future<void> grant({
    required String purposeCode,
    required int documentId,
  }) {
    return _api.postObject(
      '/api/patient/consents',
      body: <String, dynamic>{
        'purposeCode': purposeCode,
        // Аль текстэд зөвшөөрснийг сервер бүртгэнэ. Хуучирсан дугаар илгээвэл
        // сервер татгалзана — хэрэглэгч уншаагүй текстэд зөвшөөрөх ёсгүй.
        'documentId': documentId,
      },
    );
  }

  Future<void> withdraw(String purposeCode) =>
      _api.delete('/api/patient/consents/$purposeCode');
}

class ConsentsController extends ChangeNotifier {
  ConsentsController(this._repo);

  final ConsentsRepository _repo;

  AsyncState<List<ConsentPurpose>> _state =
      const AsyncState<List<ConsentPurpose>>.idle();
  String? _busyPurpose;

  AsyncState<List<ConsentPurpose>> get state => _state;
  List<ConsentPurpose> get items => _state.data ?? const <ConsentPurpose>[];

  /// Аль зорилго дээр хүсэлт явж байна — тухайн мөрийг л түгжинэ.
  String? get busyPurpose => _busyPurpose;

  /// Сервер дээр зөвшөөрлийн бүртгэл асаагүй бол (503 `FEATURE_DISABLED`).
  bool get isDisabled => _state.error?.code == 'FEATURE_DISABLED';

  Future<void> load({bool refresh = false}) async {
    if (!refresh && (_state.isLoading || _state.isRefreshing)) return;
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<List<ConsentPurpose>>.loading());
    try {
      _emit(AsyncState<List<ConsentPurpose>>.ready(await _repo.fetchAll()));
    } on ApiException catch (e) {
      _emit(AsyncState<List<ConsentPurpose>>.error(e, data: _state.data));
    }
  }

  Future<ConsentDocument?> document(String purposeCode) async {
    try {
      return await _repo.fetchDocument(purposeCode);
    } on ApiException {
      return null;
    }
  }

  /// Зөвшөөрөх / цуцлах. Алдааг дэлгэцэд харуулахаар буцаана.
  Future<ApiException?> setGranted(
    ConsentPurpose purpose, {
    required bool granted,
    int? documentId,
  }) async {
    _busyPurpose = purpose.purposeCode;
    notifyListeners();
    try {
      if (granted) {
        await _repo.grant(
          purposeCode: purpose.purposeCode,
          documentId: documentId ?? purpose.documentId,
        );
      } else {
        await _repo.withdraw(purpose.purposeCode);
      }
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _busyPurpose = null;
      notifyListeners();
    }
  }

  void _emit(AsyncState<List<ConsentPurpose>> next) {
    _state = next;
    notifyListeners();
  }
}
