import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Нууц утгуудыг зөвхөн Keystore (Android) / Keychain (iOS) дотор хадгална.
///
/// `shared_preferences` **биш**: тэр нь задгай текст файл бөгөөд root хийсэн
/// төхөөрөмж дээр 10 цагийн турш хүчинтэй, үндэсний ЭМ мэдээллийн санд хандах
/// токеныг ил үлдээнэ (FLUTTER.md § "Packages").
class SecureStore {
  SecureStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock_this_device,
              ),
            );

  final FlutterSecureStorage _storage;

  static const String _kAccessToken = 'mncardio.access_token';
  static const String _kRefreshToken = 'mncardio.refresh_token';
  static const String _kAccessTokenExpiry = 'mncardio.access_token_expiry';
  static const String _kUserName = 'mncardio.username';
  static const String _kLogedUser = 'mncardio.loged_user';

  /// Хурууны хээгээр нэвтрэхэд ашиглах нэвтрэх мэдээлэл.
  ///
  /// Гарсны дараа ч биометрээр нэвтрэх боломжтой байхыг ЗСҮТ шаардсан
  /// (2026-09-15). Токен гарахад устдаг тул сэргээх зүйл үлдэхгүй — иймд
  /// нэвтрэх нэр, нууц үгийг Keychain/Keystore дотор хадгална.
  ///
  /// **Уншихын өмнө заавал биометрийн шалгалт хийнэ** ([AuthController]).
  /// Хэрэглэгч биометрийг унтраавал энэ бичлэг устана.
  static const String _kBiometricLogin = 'mncardio.biometric_login';

  Future<String?> readAccessToken() => _storage.read(key: _kAccessToken);

  Future<String?> readRefreshToken() => _storage.read(key: _kRefreshToken);

  Future<String?> readUserName() => _storage.read(key: _kUserName);

  Future<String?> readLogedUser() => _storage.read(key: _kLogedUser);

  Future<DateTime?> readAccessTokenExpiry() async {
    final raw = await _storage.read(key: _kAccessTokenExpiry);
    if (raw == null) return null;
    final ms = int.tryParse(raw);
    if (ms == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(ms);
  }

  Future<void> writeTokens({
    required String accessToken,
    String? refreshToken,
    DateTime? accessTokenExpiry,
  }) async {
    await _storage.write(key: _kAccessToken, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _kRefreshToken, value: refreshToken);
    }
    if (accessTokenExpiry != null) {
      await _storage.write(
        key: _kAccessTokenExpiry,
        value: accessTokenExpiry.millisecondsSinceEpoch.toString(),
      );
    }
  }

  Future<String?> readBiometricLogin() => _storage.read(key: _kBiometricLogin);

  Future<void> writeBiometricLogin(String json) =>
      _storage.write(key: _kBiometricLogin, value: json);

  Future<void> clearBiometricLogin() => _storage.delete(key: _kBiometricLogin);

  Future<void> writeUserName(String userName) =>
      _storage.write(key: _kUserName, value: userName);

  Future<void> writeLogedUser(String json) =>
      _storage.write(key: _kLogedUser, value: json);

  /// Гарах үед бүх токеныг устгана.
  ///
  /// Сервер тал токеныг хүчингүй болгодоггүй (`LogOut` нь зөвхөн амжилт
  /// буцаадаг stub — API.md §2), тул гарах үйлдэл бүхэлдээ клиентийн үүрэг.
  Future<void> clearSession() async {
    await _storage.delete(key: _kAccessToken);
    await _storage.delete(key: _kRefreshToken);
    await _storage.delete(key: _kAccessTokenExpiry);
    await _storage.delete(key: _kLogedUser);
  }

  /// Хэрэглэгчийн нэрийг ч устгана — өөр хүн төхөөрөмжийг ашиглах тохиолдол.
  Future<void> clearAll() async {
    await clearSession();
    await clearBiometricLogin();
    await _storage.delete(key: _kUserName);
  }
}
