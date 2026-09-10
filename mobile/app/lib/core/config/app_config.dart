import 'dart:io';

import 'package:flutter/foundation.dart';

/// Апп-ын ажиллах орчны тохиргоо.
///
/// Үндсэн хаяг нь `--dart-define=MNCARDIO_API_BASE_URL=...` -аар өгөгдөнө. Утга
/// өгөөгүй үед хөгжүүлэлтийн орчны боломжит хаягийг платформоор сонгоно:
/// Android эмулятор хостыг `10.0.2.2` гэж хардаг тул `localhost` ажиллахгүй
/// (mobile/README.md § "Reaching the backend").
class AppConfig {
  AppConfig._();

  static const String _definedBaseUrl =
      String.fromEnvironment('MNCARDIO_API_BASE_URL');

  /// QA-д серверийг апп дотроос сольж туршихад ашиглана. Release билд дээр
  /// идэвхгүй — үйлдвэрлэлийн апп зөвхөн билдэд шигтгэсэн хаягаар ажиллана.
  static String? _runtimeOverride;

  /// Туршилтын сервер. `--dart-define` өгөөгүй үед энэ рүү холбогдоно.
  ///
  /// Локал backend өргөтгөх нь SQL Server, `Config.env` шаарддаг тул анхдагчаар
  /// ажиллаж буй туршилтын серверийг сонгосон нь санаатай: апп юу ч тохируулах
  /// шаардлагагүйгээр нээгдэнэ (QUICKSTART.md).
  static const String testServerUrl = 'https://mncardio.itsystem.mn';

  static String get baseUrl {
    if (!kReleaseMode && _runtimeOverride != null &&
        _runtimeOverride!.trim().isNotEmpty) {
      return _normalize(_runtimeOverride!);
    }
    if (_definedBaseUrl.isNotEmpty) return _normalize(_definedBaseUrl);
    return _normalize(testServerUrl);
  }

  static bool get canOverrideBaseUrl => !kReleaseMode;

  static void setRuntimeOverride(String? value) {
    if (!kReleaseMode) _runtimeOverride = value;
  }

  static String? get runtimeOverride => _runtimeOverride;

  /// Локал backend рүү холбогдох хаяг — QA цонхонд санал болгоно.
  ///
  /// Утас, эмулятор өөрсдийн `localhost`-ыг хардаг тул шууд `localhost` бичиж
  /// болохгүй: Android эмулятор хостыг `10.0.2.2` гэж хардаг, бодит төхөөрөмж
  /// компьютерийн LAN IP шаардана.
  static String get localDevSuggestion {
    if (kIsWeb) return 'http://localhost:5001';
    if (Platform.isAndroid) return 'http://10.0.2.2:5001';
    return 'http://localhost:5001';
  }

  static String _normalize(String url) {
    var v = url.trim();
    while (v.endsWith('/')) {
      v = v.substring(0, v.length - 1);
    }
    return v;
  }

  /// Socket.IO нь HTTP-тэй ижил хост дээр, өөр өөр mount path-тай
  /// (`/chatmessage`, `/notification`) — API.md §5.
  static String get socketUrl => baseUrl;

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 60);

  /// Хандах эрхийн токен 10 цаг амьдардаг. Хугацаа дуусахаас өмнө урьдчилан
  /// сэргээхэд ашиглах зөрүү — API.md §2.
  static const Duration refreshLeeway = Duration(minutes: 5);

  /// Жагсаалтын нэг хуудасны хэмжээ. Сервер дээрх дээд хязгаар 100.
  static const int pageSize = 20;

  /// Нэвтрэхэд буруу нууц үг оруулж болох тоо — Техникийн шаардлага §36.
  /// Сервер тал дээр тоолуур байхгүй тул төхөөрөмж дээр тоолж анхааруулна.
  static const int maxLoginAttempts = 3;
}
