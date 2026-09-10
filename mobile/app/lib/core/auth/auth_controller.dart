import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../network/api_client.dart';
import '../network/api_exception.dart';
import '../storage/prefs.dart';
import '../storage/secure_store.dart';
import 'auth_repository.dart';
import 'biometric_service.dart';
import 'session.dart';

/// Тендер §33 — "Мобайл апп нь эмч болон үйлчлүүлэгч гэсэн нэвтрэх хэсэгтэй
/// байна." Хоёр хэсэг нь backend дээр өөр өөр endpoint, өөр эрхийн хаалгатай.
enum LoginRole {
  patient,
  doctor;

  String get label => this == LoginRole.patient ? 'Үйлчлүүлэгч' : 'Эмч';

  bool get isStaff => this == LoginRole.doctor;

  static LoginRole parse(String? value) =>
      value == LoginRole.doctor.name ? LoginRole.doctor : LoginRole.patient;
}

enum AuthStatus {
  /// Апп эхэлж байгаа — хадгалсан сесс шалгагдаж байна.
  unknown,

  /// Нэвтрээгүй.
  unauthenticated,

  /// Токен хадгалагдсан боловч биометрээр нээх шаардлагатай.
  locked,

  /// Нэвтэрсэн.
  authenticated,
}

/// Нэвтрэлтийн бүх төлөвийг эзэмшигч.
///
/// Мөн [ApiClient]-ийг үүсгэж, түүнд токен унших/сэргээх дуудлагуудыг өгнө —
/// ингэснээр аль ч repository эрхийн логикийг давтахгүй.
class AuthController extends ChangeNotifier {
  AuthController({
    required SecureStore store,
    required Prefs prefs,
    BiometricService? biometrics,
  })  : _store = store,
        _prefs = prefs,
        biometrics = biometrics ?? BiometricService() {
    api = ApiClient(
      readAccessToken: _store.readAccessToken,
      refreshSession: _refreshForInterceptor,
      onSessionExpired: _handleSessionExpired,
    );
    _repo = AuthRepository(api);
  }

  final SecureStore _store;
  final Prefs _prefs;
  final BiometricService biometrics;

  late final ApiClient api;
  late final AuthRepository _repo;

  AuthStatus _status = AuthStatus.unknown;
  LogedUser? _user;
  String? _lastError;
  bool _busy = false;
  int _failedAttempts = 0;
  bool _biometricAvailable = false;

  AuthStatus get status => _status;
  LogedUser? get user => _user;
  String? get lastError => _lastError;
  bool get busy => _busy;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get biometricEnabled => _prefs.biometricEnabled;
  bool get biometricAvailable => _biometricAvailable;
  String? get lastUserName => _prefs.lastUserName;

  /// Нэвтрэх дэлгэц дээр урьдчилан сонгогдох хэсэг.
  LoginRole get lastLoginRole => LoginRole.parse(_prefs.lastLoginRole);

  /// Нэвтэрсэн хүн эмч эсэх. Дэлгэцийн бүтэц үүгээр шийдэгдэнэ.
  ///
  /// Хадгалсан `LogedUser.RoleId`-аас уншина — сүүлд сонгосон хэсгээс биш.
  /// Сервер эцсийн эрхийг тогтооно, клиентийн сонголт биш.
  bool get isDoctorSession => _user?.isDoctor ?? false;

  /// Техникийн шаардлага §36 — 3 удаа буруу оруулсны дараа анхааруулга.
  int get failedAttempts => _failedAttempts;
  bool get shouldWarnAboutAttempts => _failedAttempts >= AppConfig.maxLoginAttempts;

  // -------------------------------------------------------------------
  // Эхлүүлэлт
  // -------------------------------------------------------------------

  /// Апп нээгдэх үед нэг удаа дуудагдана.
  Future<void> bootstrap() async {
    _failedAttempts = _prefs.failedLoginCount;
    _biometricAvailable = await biometrics.isAvailable();

    if (AppConfig.canOverrideBaseUrl) {
      final override = _prefs.baseUrlOverride;
      if (override != null && override.isNotEmpty) {
        AppConfig.setRuntimeOverride(override);
        api.baseUrl = AppConfig.baseUrl;
      }
    }

    final access = await _store.readAccessToken();
    final refresh = await _store.readRefreshToken();

    if ((access == null || access.isEmpty) &&
        (refresh == null || refresh.isEmpty)) {
      _set(AuthStatus.unauthenticated);
      return;
    }

    await _loadStoredUser();

    // Биометр асаалттай бол сесс сэргээхээс өмнө таниулгыг шаардана.
    if (_prefs.biometricEnabled && _biometricAvailable) {
      _set(AuthStatus.locked);
      return;
    }

    final restored = await _restoreSession();
    _set(restored ? AuthStatus.authenticated : AuthStatus.unauthenticated);
  }

  Future<void> _loadStoredUser() async {
    final raw = await _store.readLogedUser();
    if (raw == null || raw.isEmpty) return;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map) {
        _user = LogedUser.fromJson(Map<String, dynamic>.from(decoded));
      }
    } catch (_) {
      // Гэмтсэн бичлэг — үл тоомсорлож, сервер талаас дахин авна.
    }
  }

  /// Хадгалсан токеноор сесс сэргээх оролдлого.
  Future<bool> _restoreSession() async {
    final access = await _store.readAccessToken();
    final expiry = await _store.readAccessTokenExpiry();
    final refresh = await _store.readRefreshToken();

    final stillFresh = access != null &&
        access.isNotEmpty &&
        expiry != null &&
        DateTime.now().isBefore(expiry.subtract(AppConfig.refreshLeeway));

    if (stillFresh) return true;

    if (refresh != null && refresh.isNotEmpty) {
      try {
        final tokens = await _repo.refresh(refresh);
        await _persist(tokens);
        return true;
      } on ApiException {
        await _store.clearSession();
        return false;
      }
    }

    // Refresh токен байхгүй ч access токен хүчинтэй байж болно.
    if (access != null && access.isNotEmpty) {
      final valid = await _repo.isSessionValid(access);
      if (valid) {
        // Энэ мөчид эхний refresh токеноо авна — API.md §2, алхам 2.
        await _bootstrapRefreshToken(access);
        return true;
      }
    }

    await _store.clearSession();
    return false;
  }

  // -------------------------------------------------------------------
  // Нэвтрэх / гарах
  // -------------------------------------------------------------------

  Future<bool> login({
    required String userName,
    required String password,
    LoginRole role = LoginRole.patient,
  }) async {
    _lastError = null;
    _setBusy(true);
    try {
      final tokens = role.isStaff
          ? await _repo.loginStaff(
              userName: userName.trim(),
              password: password,
            )
          : await _repo.loginPatient(
              userName: userName.trim(),
              password: password,
            );
      await _persist(tokens);
      await _prefs.setLastUserName(userName.trim());
      await _prefs.setLastLoginRole(role.name);
      await _store.writeUserName(userName.trim());
      await _bootstrapRefreshToken(tokens.accessToken);
      await _resetFailedAttempts();
      _set(AuthStatus.authenticated);
      return true;
    } on ApiException catch (e) {
      // Сүлжээний алдааг буруу нууц үг гэж тоолохгүй.
      if (!e.isNetworkError) {
        await _bumpFailedAttempts();
      }
      _lastError = e.message;
      notifyListeners();
      return false;
    } finally {
      _setBusy(false);
    }
  }

  /// Эхний refresh токеныг авна. Амжилтгүй болбол нэвтрэлт хэвээр — зөвхөн
  /// 10 цагийн дараа дахин нууц үг шаардагдана.
  Future<void> _bootstrapRefreshToken(String accessToken) async {
    try {
      final tokens = await _repo.bootstrapRefreshToken(accessToken);
      await _persist(tokens);
    } on ApiException catch (e) {
      debugPrint('[auth] refresh токен авч чадсангүй: ${e.message}');
    }
  }

  /// Биометрээр түгжээг нээх.
  Future<bool> unlockWithBiometrics() async {
    _setBusy(true);
    try {
      final ok = await biometrics.authenticate();
      if (!ok) {
        _lastError = 'Таних амжилтгүй боллоо.';
        notifyListeners();
        return false;
      }
      final restored = await _restoreSession();
      if (!restored) {
        _lastError = 'Нэвтрэх хугацаа дууссан байна. Нууц үгээ оруулна уу.';
        _set(AuthStatus.unauthenticated);
        return false;
      }
      _lastError = null;
      _set(AuthStatus.authenticated);
      return true;
    } finally {
      _setBusy(false);
    }
  }

  /// Биометрээс татгалзаж нууц үгээр нэвтрэхийг сонгосон.
  void fallbackToPassword() {
    _lastError = null;
    _set(AuthStatus.unauthenticated);
  }

  Future<void> setBiometricEnabled(bool value) async {
    if (value && !_biometricAvailable) {
      _biometricAvailable = await biometrics.isAvailable();
      if (!_biometricAvailable) {
        _lastError =
            'Төхөөрөмж дээр хурууны хээ эсвэл түгжээ тохируулаагүй байна.';
        notifyListeners();
        return;
      }
      final ok = await biometrics.authenticate(
        reason: 'Биометрээр нэвтрэхийг идэвхжүүлэхийн тулд таниулна уу',
      );
      if (!ok) return;
    }
    await _prefs.setBiometricEnabled(value);
    notifyListeners();
  }

  /// Гарах.
  ///
  /// Сервер талд токеныг хүчингүй болгодоггүй (`LogOut` нь stub — API.md §2),
  /// тул гарах гэдэг нь бүхэлдээ хадгалалтыг цэвэрлэх үйлдэл.
  Future<void> logout({bool forgetUserName = false}) async {
    if (forgetUserName) {
      await _store.clearAll();
      await _prefs.setLastUserName(null);
      await _prefs.setBiometricEnabled(false);
    } else {
      await _store.clearSession();
    }
    _user = null;
    _lastError = null;
    _set(AuthStatus.unauthenticated);
  }

  // -------------------------------------------------------------------
  // Interceptor-т өгөх дуудлагууд
  // -------------------------------------------------------------------

  Future<bool> _refreshForInterceptor() async {
    final refresh = await _store.readRefreshToken();
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final tokens = await _repo.refresh(refresh);
      await _persist(tokens);
      return true;
    } on ApiException {
      return false;
    }
  }

  Future<void> _handleSessionExpired() async {
    await _store.clearSession();
    _user = null;
    _lastError = 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.';
    _set(AuthStatus.unauthenticated);
  }

  /// Апп дэлгэц рүү буцаж ирэх үед хугацаа дуусахаас өмнө урьдчилан сэргээнэ.
  Future<void> ensureFresh() async {
    if (_status != AuthStatus.authenticated) return;
    final expiry = await _store.readAccessTokenExpiry();
    if (expiry == null) return;
    if (DateTime.now().isBefore(expiry.subtract(AppConfig.refreshLeeway))) return;
    await _refreshForInterceptor();
  }

  // -------------------------------------------------------------------

  Future<void> _persist(AuthTokens tokens) async {
    await _store.writeTokens(
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiry: tokens.expiresAt,
    );
    final user = tokens.user;
    if (user != null) {
      _user = user;
      await _store.writeLogedUser(jsonEncode(user.toJson()));
    }
  }

  Future<void> _bumpFailedAttempts() async {
    _failedAttempts += 1;
    await _prefs.setFailedLoginCount(_failedAttempts);
  }

  Future<void> _resetFailedAttempts() async {
    _failedAttempts = 0;
    await _prefs.setFailedLoginCount(0);
  }

  void _set(AuthStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setBusy(bool value) {
    _busy = value;
    notifyListeners();
  }

  // -------------------------------------------------------------------
  // Нууц үг сэргээх
  // -------------------------------------------------------------------

  Future<String> forgotPassword(
    String userName, {
    LoginRole role = LoginRole.patient,
  }) =>
      _repo.forgotPassword(userName.trim(), staff: role.isStaff);

  Future<String> resetPassword({
    required String userName,
    required String token,
    required String password,
    LoginRole role = LoginRole.patient,
  }) =>
      _repo.resetPassword(
        userName: userName.trim(),
        token: token.trim(),
        password: password,
        staff: role.isStaff,
      );

  /// QA-д серверийн хаяг солих (release билд дээр идэвхгүй).
  Future<void> setBaseUrlOverride(String? value) async {
    if (!AppConfig.canOverrideBaseUrl) return;
    await _prefs.setBaseUrlOverride(value);
    AppConfig.setRuntimeOverride(value);
    api.baseUrl = AppConfig.baseUrl;
    notifyListeners();
  }
}
