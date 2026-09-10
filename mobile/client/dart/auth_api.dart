import 'api_client.dart';
import 'token_store.dart';

/// Login, session and password reset.
///
/// The two login endpoints are part of the **legacy** layer, so their token
/// arrives at `Data.token` with a capital D even though every data endpoint you
/// call afterwards uses the lowercase envelope. That asymmetry is the most
/// common first-hour mistake — it is absorbed here so it never reaches your
/// screens.
class AuthApi {
  AuthApi(this._api, this._tokens);

  final ApiClient _api;
  final TokenStore _tokens;

  /// Patient login.
  ///
  /// [userName] is the patient's **registration number**, which begins with two
  /// Cyrillic letters (`ПП…`) — not Latin `PP`. Do not let the user type it
  /// with an English keyboard layout and expect a match.
  Future<Map<String, dynamic>> loginPatient(String userName, String password) =>
      _login('/api/PatientUser/Login', userName, password);

  /// Doctor / staff login.
  ///
  /// Excludes RoleId 4, and the account must have a linked `DoctorsProfile`
  /// row — without one, login fails with
  /// `Хэрэглэгчид харъяалагдах эмчийн мэдээлэл олдсонгүй` even when the
  /// password is correct. Surface that as an account problem, not a wrong
  /// password.
  Future<Map<String, dynamic>> loginDoctor(String userName, String password) =>
      _login('/api/User/Login', userName, password);

  Future<Map<String, dynamic>> _login(
    String path,
    String userName,
    String password,
  ) async {
    final data = await _api.post(
      path,
      body: {'UserName': userName, 'Password': password},
      skipAuth: true,
    );
    final map = Map<String, dynamic>.from(data as Map);
    final token = map['token'] as String?;
    if (token == null || token.isEmpty) {
      throw ApiException('Нэвтрэх нэр эсвэл нууц үг буруу байна');
    }
    await _tokens.save(accessToken: token);

    // Trade the fresh access token for a refresh token straight away, so the
    // user is not asked for a password again in 10 hours.
    await bootstrapRefreshToken();

    return Map<String, dynamic>.from(map['LogedUser'] as Map? ?? const {});
  }

  /// Obtains the first refresh token.
  ///
  /// Neither login endpoint returns one. `/api/auth/refresh` accepts a
  /// still-valid access token as Bearer precisely so a client can bootstrap
  /// without the login endpoints changing shape.
  Future<void> bootstrapRefreshToken() async {
    try {
      final data = await _api.post('/api/auth/refresh');
      final map = Map<String, dynamic>.from(data as Map);
      await _tokens.save(
        accessToken: map['token'] as String?,
        refreshToken: map['refreshToken'] as String?,
      );
    } on ApiException {
      // Non-fatal: the access token is still good for 10 hours. The user will
      // simply be asked to log in again when it expires.
    }
  }

  /// Whether the stored access token is still valid, and who it belongs to.
  ///
  /// Call this on launch to decide whether to refresh, rather than provoking an
  /// error from a data endpoint.
  ///
  /// Returns `{Id, UserName, RoleId, OrganizationId, IsPatient}`. Note `RoleId`
  /// is a number here and a string on `/api/doctor/me` — use
  /// [ApiClient.roleIdOf].
  Future<Map<String, dynamic>?> session() async {
    try {
      final data = await _api.get('/api/auth/session');
      return Map<String, dynamic>.from(data as Map);
    } on ApiException catch (e) {
      if (e.isTokenProblem) return null;
      rethrow;
    }
  }

  /// Clears both tokens. There is nothing to call server-side — `LogOut` is a
  /// stub that invalidates nothing.
  Future<void> logout() => _tokens.clear();

  // --- Password reset -------------------------------------------------------
  //
  // Note the spelling split, which is baked into the routes: the patient side
  // is Forgot, the staff side is Forget. It is not a typo here.

  Future<void> patientForgotPassword(String userName) => _api
      .post('/api/PatientUser/ForgotPassword', body: {'UserName': userName}, skipAuth: true)
      .then((_) {});

  Future<void> patientResetPassword({
    required String userName,
    required String token,
    required String password,
  }) =>
      _api.post(
        '/api/PatientUser/ResetPassword',
        body: {'UserName': userName, 'Token': token, 'Password': password},
        skipAuth: true,
      ).then((_) {});

  Future<void> doctorForgetPassword(String userName) => _api
      .post('/api/User/ForgetPassword', body: {'UserName': userName}, skipAuth: true)
      .then((_) {});

  Future<void> doctorResetPassword({
    required String userName,
    required String token,
    required String password,
  }) =>
      _api.post(
        '/api/User/ResetPassword',
        body: {'UserName': userName, 'Token': token, 'Password': password},
        skipAuth: true,
      ).then((_) {});

  Future<void> changePassword({
    required String current,
    required String next,
    required bool isPatient,
  }) =>
      _api.post(
        isPatient ? '/api/PatientUser/ChangePassword' : '/api/User/ChangePassword',
        body: {'Password': current, 'NewPassword': next},
      ).then((_) {});
}
