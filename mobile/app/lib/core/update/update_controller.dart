import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../network/api_client.dart';
import '../network/api_exception.dart';
import '../util/json_read.dart';

/// Серверээс ирэх хувилбарын мэдээлэл — `GET /api/mobile/version`.
class UpdateInfo {
  const UpdateInfo({
    required this.forceUpdate,
    this.latestVersion,
    this.latestBuild,
    this.minSupportedBuild,
    this.storeUrl,
    this.releaseNotes,
  });

  /// **Сервер тооцоолж өгнө** — өөрсдөө билдийн дугаар харьцуулахгүй.
  final bool forceUpdate;
  final String? latestVersion;
  final int? latestBuild;
  final int? minSupportedBuild;
  final String? storeUrl;
  final String? releaseNotes;

  factory UpdateInfo.fromJson(Map<String, dynamic> json, {required bool ios}) =>
      UpdateInfo(
        forceUpdate: J.boolOf(json, <String>['forceUpdate']),
        latestVersion: J.str(json, <String>['latestVersion']),
        latestBuild: J.intOf(json, <String>['latestBuild']),
        minSupportedBuild: J.intOf(json, <String>['minSupportedBuild']),
        storeUrl: J.str(json, <String>[
          ios ? 'storeUrlIos' : 'storeUrlAndroid',
          'storeUrl',
        ]),
        releaseNotes: J.str(json, <String>['releaseNotes']),
      );
}

/// Техникийн шаардлага §2.1 — "Автоматаар шинэчлэлтээ татдаг байх".
///
/// Дэлгүүр аппыг өөрөө шинэчилдэг ч, API өөрчлөгдсөн үед хуучин билд
/// ажиллуулахыг зогсоох хэрэгтэй. Сервер аль билдээс доош дэмжихгүйгээ хэлнэ:
///
/// * апп нээгдэхэд `GET /api/mobile/version` — нэвтрэлт шаардахгүй тул
///   нэвтэрч чадахгүй байгаа хуучин апп ч хариу авна;
/// * дуудлага бүрт `X-App-Build` толгой явна, сервер `426 UPDATE_REQUIRED`
///   буцаавал шууд блоклоно.
class UpdateController extends ChangeNotifier {
  UpdateInfo? _info;
  bool _blockedByServer = false;
  int? _build;
  String? _version;

  UpdateInfo? get info => _info;
  int? get build => _build;
  String? get version => _version;

  /// Апп ашиглах боломжгүй — албан ёсны шинэчлэлт шаардлагатай.
  bool get blocked => _blockedByServer || (_info?.forceUpdate ?? false);

  /// Шинэ хувилбар гарсан эсэх (албадахгүй).
  bool get updateAvailable {
    final latest = _info?.latestBuild;
    final current = _build;
    if (latest == null || current == null) return false;
    return latest > current;
  }

  String get platform {
    if (kIsWeb) return 'web';
    return Platform.isIOS ? 'ios' : 'android';
  }

  /// Аппын билдийн дугаарыг уншиж, дуудлага бүрт явуулна.
  Future<void> attach(ApiClient api) async {
    try {
      final info = await PackageInfo.fromPlatform();
      _version = info.version;
      _build = int.tryParse(info.buildNumber);
      if (_build != null) {
        // Сервер энэ толгойгоор хуучин билдийг таньж 426 буцаана. Толгой
        // байхгүй бол ямагт нэвтэрдэг тул хуучин билдүүд эвдрэхгүй.
        api.raw.options.headers['X-App-Build'] = '$_build';
      }
    } catch (_) {
      // Билдийн мэдээлэл уншиж чадсангүй — шалгалтгүйгээр үргэлжилнэ.
    }
  }

  /// Хувилбарын шалгалт. Алдаа гарвал чимээгүй өнгөрнө — сүлжээгүй байх нь
  /// аппыг зогсоох шалтгаан биш.
  Future<void> check(ApiClient api) async {
    try {
      final data = await api.getObject(
        '/api/mobile/version',
        query: <String, dynamic>{
          'platform': platform,
          if (_build != null) 'build': _build,
        },
      );
      _info = UpdateInfo.fromJson(data, ios: platform == 'ios');
      notifyListeners();
    } on ApiException {
      // Тохиргоо уншигдаагүй — хуучин байдлаар үргэлжилнэ.
    }
  }

  /// Сервер `426 UPDATE_REQUIRED` буцаасан үед interceptor дуудна.
  void markBlockedByServer() {
    if (_blockedByServer) return;
    _blockedByServer = true;
    notifyListeners();
  }
}
