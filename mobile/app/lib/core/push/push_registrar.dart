import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../network/api_client.dart';
import '../network/api_exception.dart';

/// Push токеныг өгөх эх сурвалж.
///
/// **Өнөөдөр токен байхгүй.** FCM (Android) ба APNs (iOS) хоёулаа ЗСҮТ-ийн
/// нэр дээрх Firebase төсөл, Apple түлхүүр шаарддаг бөгөөд тэдгээр нь ирээгүй
/// байна (BLOCKERS.md §3). Тиймээс `firebase_messaging` санг аппад оруулаагүй:
/// тохиргооны файлгүйгээр билд унана.
///
/// Түлхүүр ирмэгц хийх ажил бол ЭНЭ интерфейсийн хэрэгжилт — бүртгэх,
/// салгах, нэвтрэх бүрт шинэчлэх логик бүгд бэлэн.
abstract class PushTokenSource {
  Future<String?> currentToken();
}

/// Түлхүүр ирээгүй үеийн хэрэгжилт — токен байхгүй гэж хариулна.
class NoPushTokenSource implements PushTokenSource {
  const NoPushTokenSource();

  @override
  Future<String?> currentToken() async => null;
}

/// Төхөөрөмжийг серверт бүртгэх, салгах — API.md §2.9.
///
/// Сервер нь нэвтэрсэн хүн бүрийн төхөөрөмжийг тусад нь бүртгэдэг. Нэг утсыг
/// өөр хүн ашиглавал токен шинэ эзэн рүү **шилжинэ** — өмнөх хүний эмнэлгийн
/// мэдэгдэл хэн нэгэнд очихгүй байх гол хамгаалалт нь энэ.
class PushRegistrar {
  PushRegistrar({PushTokenSource source = const NoPushTokenSource()})
      : _source = source;

  final PushTokenSource _source;
  String? _lastRegistered;

  String get _platform {
    if (kIsWeb) return 'web';
    return Platform.isIOS ? 'ios' : 'android';
  }

  /// Нэвтрэх бүрт дуудна — токен эргэлддэг тул анхны суулгацаар хангалтгүй.
  Future<void> register(ApiClient api, {required bool isDoctor}) async {
    final token = await _source.currentToken();
    if (token == null || token.isEmpty) return;

    String? appVersion;
    try {
      appVersion = (await PackageInfo.fromPlatform()).version;
    } catch (_) {
      appVersion = null;
    }

    try {
      await api.postObject(
        isDoctor ? '/api/doctor/devices' : '/api/patient/devices',
        body: <String, dynamic>{
          'token': token,
          'platform': _platform,
          if (appVersion != null) 'app_version': appVersion,
          'locale': 'mn',
        },
      );
      _lastRegistered = token;
    } on ApiException catch (e) {
      debugPrint('[push] бүртгэл амжилтгүй: ${e.message}');
    }
  }

  /// Гарахад дуудна. Токеныг салгахгүй бол дараагийн хэрэглэгчийн мэдэгдэл
  /// энэ утсанд ирсээр байна.
  Future<void> unregister(ApiClient api, {required bool isDoctor}) async {
    final token = _lastRegistered ?? await _source.currentToken();
    if (token == null || token.isEmpty) return;
    try {
      await api.postObject(
        isDoctor
            ? '/api/doctor/devices/unregister'
            : '/api/patient/devices/unregister',
        // `DELETE /devices/:token` биш: FCM токен ~163 тэмдэгт, дотроо `:`
        // `-` агуулдаг тул замын хэсэгт тавихад эвдэрдэг (API.md §2.9).
        body: <String, dynamic>{'token': token},
      );
    } on ApiException catch (e) {
      debugPrint('[push] салгах амжилтгүй: ${e.message}');
    } finally {
      _lastRegistered = null;
    }
  }
}
