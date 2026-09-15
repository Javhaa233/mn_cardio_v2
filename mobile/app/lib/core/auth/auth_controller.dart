import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../network/api_client.dart';
import '../push/push_registrar.dart';
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

  /// Push төхөөрөмжийн бүртгэл. Firebase/APNs түлхүүр ирэх хүртэл токен
  /// байхгүй тул бүртгэл хийгдэхгүй — урсгал нь бэлэн.
  PushRegistrar? _push;

  set pushRegistrar(PushRegistrar value) => _push = value;

  late final ApiClient api;
  late final AuthRepository _repo;

  AuthStatus _status = AuthStatus.unknown;
  LogedUser? _user;
  String? _lastError;
  bool _busy = false;
  int _failedAttempts = 0;
  bool _biometricAvailable = false;

  /// Хурууны хээгээр нэвтрэх мэдээлэл хадгалагдсан эсэх.
  bool _hasBiometricLogin = false;

  /// Энэ сешнд амжилттай нэвтэрсэн нууц үг — **зөвхөн санах ойд**.
  /// Хэрэглэгч биометрийг асаахад үүнийг хамгаалагдсан хадгалалтад бичнэ.
  String? _lastPassword;

  /// Төхөөрөмж дээр сэргээх боломжтой сесс хадгалагдсан эсэх.
  ///
  /// Биометр нь **хадгалсан сессийг нээх** хэрэгсэл болохоос нэвтрэлт биш:
  /// токен байхгүй үед хурууны хээ таньсан ч сэргээх юм алга. Гарсны дараа
  /// товчийг харуулсаар байвал хэрэглэгч таниулаад "хугацаа дууссан" гэсэн
  /// ойлгомжгүй алдаа авна.
  bool _hasStoredSession = false;

  AuthStatus get status => _status;
  LogedUser? get user => _user;
  String? get lastError => _lastError;
  bool get busy => _busy;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get biometricEnabled => _prefs.biometricEnabled;
  bool get biometricAvailable => _biometricAvailable;

  /// Биометрээр нээх боломжтой эсэх.
  ///
  /// Хадгалсан сесс байвал түүнийг сэргээнэ; байхгүй (жишээ нь гарсны дараа)
  /// бол хадгалсан нэвтрэх мэдээллээр дахин нэвтэрнэ.
  bool get canUnlockWithBiometrics =>
      _prefs.biometricEnabled &&
      _biometricAvailable &&
      (_hasStoredSession || _hasBiometricLogin);

  /// Биометрийг асаахад нууц үг дахин асуух шаардлагатай эсэх.
  bool get needsPasswordForBiometric => _lastPassword == null;
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
    await _refreshStoredSessionFlag();
    _hasBiometricLogin = (await _store.readBiometricLogin()) != null;

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
  ///
  /// Алхам бүрийг логлоно: "нэвтрэх хугацаа дууссан" гэж хэлэхээсээ өмнө
  /// ЯАГААД гэдгийг мэдэж байх ёстой. Хурууны хээгээр нээх бүрт энэ урсгал
  /// дахин ажилладаг тул нэг алдаа бүх биометр нэвтрэлтийг унагадаг.
  Future<bool> _restoreSession() async {
    final access = await _store.readAccessToken();
    final expiry = await _store.readAccessTokenExpiry();
    final refresh = await _store.readRefreshToken();

    debugPrint('[auth] сэргээх: access=${access != null}'
        ' refresh=${refresh != null} expiry=$expiry');

    final stillFresh = access != null &&
        access.isNotEmpty &&
        expiry != null &&
        DateTime.now().isBefore(expiry.subtract(AppConfig.refreshLeeway));

    if (stillFresh) {
      debugPrint('[auth] токен хүчинтэй хэвээр');
      return true;
    }

    if (refresh != null && refresh.isNotEmpty) {
      try {
        final tokens = await _repo.refresh(refresh);
        await _persist(tokens);
        debugPrint('[auth] refresh токеноор сэргээлээ');
        return true;
      } on ApiException catch (e) {
        debugPrint('[auth] refresh амжилтгүй: ${e.code} ${e.message}');
        await _store.clearSession();
        return false;
      }
    }

    // Refresh токен байхгүй ч access токен хүчинтэй байж болно.
    if (access != null && access.isNotEmpty) {
      final valid = await _repo.isSessionValid(access);
      debugPrint('[auth] /auth/session хариу: $valid');
      if (valid) {
        // Энэ мөчид эхний refresh токеноо авна — API.md §2, алхам 2.
        await _bootstrapRefreshToken(access);
        return true;
      }
    }

    debugPrint('[auth] сэргээх боломжгүй — хадгалалтыг цэвэрлэв');
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
      await _refreshStoredSessionFlag();
      _lastPassword = password;
      // Биометр аль хэдийн асаалттай бол шинэ нууц үгийг шинэчилнэ — эс
      // бөгөөс хуучин нууц үгээр хурууны хээ ажиллахаа болино.
      if (_prefs.biometricEnabled) {
        await _storeBiometricLogin(userName.trim(), password, role);
      }
      _set(AuthStatus.authenticated);
      // Токен эргэлддэг тул нэвтрэх бүрт дахин бүртгэнэ (API.md §2.9).
      unawaited(_push?.register(api, isDoctor: isDoctorSession) ?? Future<void>.value());
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

  /// Хадгалсан сесс байгаа эсэхийг дахин тооцоолно.
  Future<void> _refreshStoredSessionFlag() async {
    final access = await _store.readAccessToken();
    final refresh = await _store.readRefreshToken();
    _hasStoredSession = (access != null && access.isNotEmpty) ||
        (refresh != null && refresh.isNotEmpty);
  }

  /// Нэвтрэх мэдээллийг хамгаалагдсан хадгалалтад бичнэ.
  Future<void> _storeBiometricLogin(
    String userName,
    String password,
    LoginRole role,
  ) async {
    await _store.writeBiometricLogin(jsonEncode(<String, dynamic>{
      'userName': userName,
      'password': password,
      'role': role.name,
    }));
    _hasBiometricLogin = true;
  }

  /// Биометрээр нэвтрэх / түгжээг нээх.
  ///
  /// Хоёр тохиолдол:
  ///  * **сесс хадгалагдсан** — аппыг хаагаад нээсэн. Токеныг сэргээнэ;
  ///  * **сесс байхгүй** — хэрэглэгч гарсан. Хадгалсан нэвтрэх мэдээллээр
  ///    дахин нэвтэрнэ. Мэдээллийг зөвхөн хурууны хээ таньсны **дараа** уншина.
  Future<bool> unlockWithBiometrics() async {
    await _refreshStoredSessionFlag();
    final stored = await _store.readBiometricLogin();
    _hasBiometricLogin = stored != null;
    debugPrint('[auth] биометр: сесс=$_hasStoredSession'
        ' хадгалсан нэвтрэлт=$_hasBiometricLogin');

    if (!_hasStoredSession && stored == null) {
      _lastError = 'Хадгалсан нэвтрэлт олдсонгүй. Нууц үгээ оруулна уу.';
      _set(AuthStatus.unauthenticated);
      return false;
    }

    _setBusy(true);
    try {
      final ok = await biometrics.authenticate();
      if (!ok) {
        _lastError = 'Таних амжилтгүй боллоо.';
        notifyListeners();
        return false;
      }

      if (_hasStoredSession) {
        final restored = await _restoreSession();
        if (restored) {
          _lastError = null;
          _set(AuthStatus.authenticated);
          return true;
        }
      }

      if (stored == null) {
        _lastError = 'Нэвтрэх хугацаа дууссан байна. Нууц үгээ оруулна уу.';
        _set(AuthStatus.unauthenticated);
        return false;
      }

      debugPrint('[auth] хадгалсан нэвтрэх мэдээллээр дахин нэвтэрч байна');
      // Хадгалсан мэдээллээр дахин нэвтэрнэ.
      final decoded = jsonDecode(stored);
      if (decoded is! Map) {
        await _forgetBiometricLogin();
        _lastError = 'Хадгалсан нэвтрэлт гэмтсэн байна. Нууц үгээ оруулна уу.';
        _set(AuthStatus.unauthenticated);
        return false;
      }

      final map = Map<String, dynamic>.from(decoded);
      final signedIn = await login(
        userName: '${map['userName']}',
        password: '${map['password']}',
        role: LoginRole.parse(map['role'] as String?),
      );
      if (!signedIn) {
        // Нууц үг солигдсон байж болно — хадгалсан мэдээлэл ашиггүй.
        await _forgetBiometricLogin();
        _lastError = 'Нууц үг өөрчлөгдсөн байна. Нууц үгээ оруулна уу.';
        _set(AuthStatus.unauthenticated);
      }
      return signedIn;
    } finally {
      _setBusy(false);
    }
  }

  Future<void> _forgetBiometricLogin() async {
    await _store.clearBiometricLogin();
    _hasBiometricLogin = false;
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
    if (value) {
      final password = _lastPassword;
      final userName = _prefs.lastUserName;
      if (password != null && userName != null) {
        await _storeBiometricLogin(userName, password, lastLoginRole);
      }
    } else {
      // Унтраасан бол нууц үгийг төхөөрөмж дээр үлдээх шалтгаангүй.
      await _forgetBiometricLogin();
    }
    notifyListeners();
  }

  /// Биометрийг асаахад нууц үг санах ойд байхгүй бол (апп дахин нээгдсэн)
  /// хэрэглэгчээс асууж, энд дамжуулна.
  Future<void> saveBiometricPassword(String password) async {
    final userName = _prefs.lastUserName;
    if (userName == null) return;
    _lastPassword = password;
    await _storeBiometricLogin(userName, password, lastLoginRole);
    notifyListeners();
  }

  /// Гарах.
  ///
  /// Сервер дээрх сессийг хаагаад дараа нь локал хадгалалтыг цэвэрлэнэ.
  Future<void> logout({bool forgetUserName = false}) async {
    // Push мэдэгдэл өөр хүн рүү очихоос сэргийлж төхөөрөмжийн бүртгэлийг
    // эхлээд салгана, дараа нь токеныг хүчингүй болгоно.
    await _push?.unregister(api, isDoctor: isDoctorSession);
    await _repo.logout();

    if (forgetUserName) {
      await _store.clearAll();
      await _prefs.setLastUserName(null);
      await _prefs.setBiometricEnabled(false);
      _hasBiometricLogin = false;
    } else {
      await _store.clearSession();
    }
    _user = null;
    _lastError = null;
    _lastPassword = null;
    _hasStoredSession = false;
    // Хурууны хээний мэдээллийг үлдээнэ: гарсны дараа ч биометрээр нэвтрэх
    // боломжтой байхыг ЗСҮТ шаардсан. Тохиргооноос унтраавал устана.
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
    _hasStoredSession = false;
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
