import 'package:shared_preferences/shared_preferences.dart';

/// Нууцад хамаарахгүй тохиргоо: биометр идэвхжүүлсэн эсэх, сануулгын жагсаалт,
/// QA-гийн сервер хаяг. Токен энд **хэзээ ч** орохгүй — [SecureStore] харна уу.
class Prefs {
  Prefs(this._prefs);

  final SharedPreferences _prefs;

  static Future<Prefs> load() async => Prefs(await SharedPreferences.getInstance());

  static const String _kBiometricEnabled = 'mncardio.biometric_enabled';
  static const String _kLastUserName = 'mncardio.last_username';
  static const String _kBaseUrlOverride = 'mncardio.base_url_override';
  static const String _kReminders = 'mncardio.reminders';
  static const String _kOnboarded = 'mncardio.onboarded';
  static const String _kTermsAcceptedVersion = 'mncardio.terms_version';
  static const String _kFailedLoginCount = 'mncardio.failed_login_count';
  static const String _kLastLoginRole = 'mncardio.last_login_role';

  bool get biometricEnabled => _prefs.getBool(_kBiometricEnabled) ?? false;
  Future<void> setBiometricEnabled(bool value) =>
      _prefs.setBool(_kBiometricEnabled, value);

  String? get lastUserName => _prefs.getString(_kLastUserName);
  Future<void> setLastUserName(String? value) async {
    if (value == null || value.isEmpty) {
      await _prefs.remove(_kLastUserName);
    } else {
      await _prefs.setString(_kLastUserName, value);
    }
  }

  String? get baseUrlOverride => _prefs.getString(_kBaseUrlOverride);
  Future<void> setBaseUrlOverride(String? value) async {
    if (value == null || value.trim().isEmpty) {
      await _prefs.remove(_kBaseUrlOverride);
    } else {
      await _prefs.setString(_kBaseUrlOverride, value.trim());
    }
  }

  String? get remindersJson => _prefs.getString(_kReminders);
  Future<void> setRemindersJson(String value) =>
      _prefs.setString(_kReminders, value);

  bool get onboarded => _prefs.getBool(_kOnboarded) ?? false;
  Future<void> setOnboarded(bool value) => _prefs.setBool(_kOnboarded, value);

  int get termsAcceptedVersion => _prefs.getInt(_kTermsAcceptedVersion) ?? 0;
  Future<void> setTermsAcceptedVersion(int value) =>
      _prefs.setInt(_kTermsAcceptedVersion, value);

  /// Техникийн шаардлага §36 — 3 удаа буруу нууц үг оруулбал анхааруулна.
  /// Сервер тал тоолуургүй тул төхөөрөмж дээр тоолно. Энэ нь аюулгүй байдлын
  /// хамгаалалт биш, зөвхөн хэрэглэгчид өгөх мэдэгдэл.
  int get failedLoginCount => _prefs.getInt(_kFailedLoginCount) ?? 0;
  Future<void> setFailedLoginCount(int value) =>
      _prefs.setInt(_kFailedLoginCount, value);

  /// Сүүлд сонгосон нэвтрэх хэсэг — `patient` эсвэл `doctor`.
  ///
  /// Тендер §33-ын дагуу апп нь эмч, үйлчлүүлэгч гэсэн хоёр нэвтрэх хэсэгтэй.
  /// Хэрэглэгч болгон нээх бүрдээ сонголтоо дахин хийхгүйн тулд санана.
  String? get lastLoginRole => _prefs.getString(_kLastLoginRole);
  Future<void> setLastLoginRole(String? value) async {
    if (value == null || value.isEmpty) {
      await _prefs.remove(_kLastLoginRole);
    } else {
      await _prefs.setString(_kLastLoginRole, value);
    }
  }
}
