import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../network/api_client.dart';
import '../network/api_exception.dart';
import '../network/envelope.dart';
import '../network/envelope_interceptor.dart';
import '../util/mn_text.dart';
import 'session.dart';

/// Нэвтрэлт, токен сэргээлт, нууц үг сэргээх дуудлагууд.
class AuthRepository {
  AuthRepository(this._api);

  final ApiClient _api;

  /// Refresh-ийг тусдаа, эрхийн interceptor-гүй клиентээр дуудна.
  ///
  /// Шалтгаан: [ApiClient] дээрх эрхийн interceptor алдаа гарвал дахин refresh
  /// хийхийг оролдож хязгааргүй давталт үүсгэнэ. Мөн refresh токеноор
  /// сэргээхэд хуучирсан access токеныг толгойд явуулах ёсгүй.
  Dio _bareClient() {
    final dio = Dio(
      BaseOptions(
        baseUrl: _api.baseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        contentType: Headers.jsonContentType,
        validateStatus: (status) => status != null && status < 500,
      ),
    );
    dio.interceptors.add(EnvelopeInterceptor());
    return dio;
  }

  // -------------------------------------------------------------------
  // Нэвтрэх
  // -------------------------------------------------------------------

  /// Үйлчлүүлэгчийн нэвтрэлт — хуучин дугтуй, алдаа ч HTTP 200-аар ирнэ.
  ///
  /// Буруу нэр эсвэл нууц үг үед `Success:false` ирэх бөгөөд interceptor
  /// түүнийг [ApiException] болгож хувиргана.
  Future<AuthTokens> loginPatient({
    required String userName,
    required String password,
  }) async {
    final Map<String, dynamic> data;
    try {
      data = await _api.legacyObject(
        '/api/PatientUser/Login',
        body: <String, dynamic>{'UserName': userName, 'Password': password},
      );
    } on ApiException catch (e) {
      if (e.isNetworkError) rethrow;
      throw ApiException(
        mnMessage(e.message, 'Нэвтрэх нэр эсвэл нууц үг буруу байна.'),
        code: e.code,
        statusCode: e.statusCode,
      );
    }

    final token = data['token'] as String?;
    if (token == null || token.isEmpty) {
      throw ApiException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
    }

    final userJson = data['LogedUser'];
    final user = userJson is Map
        ? LogedUser.fromJson(Map<String, dynamic>.from(userJson))
        : null;

    if (user != null && !user.isPatient) {
      // Эмчийн эрхээр үйлчлүүлэгчийн апп руу орох оролдлого.
      throw ApiException(
        'Энэ бүртгэл эмчийн эрхтэй байна. Үйлчлүүлэгчийн хэсгээр нэвтрэх боломжгүй.',
        code: 'NOT_A_PATIENT',
      );
    }

    return AuthTokens(
      accessToken: token,
      expiresAt: jwtExpiry(token),
      user: user,
    );
  }

  /// Эмч / эмнэлгийн ажилтны нэвтрэлт.
  ///
  /// `RoleId 4`-ийг оруулдаггүй бөгөөд бүртгэлд холбогдох `DoctorsProfile` мөр
  /// заавал байх ёстой — эс бөгөөс нууц үг зөв байсан ч
  /// "Хэрэглэгчид харъяалагдах эмчийн мэдээлэл олдсонгүй" гэж татгалзана
  /// (API.md §2).
  ///
  /// > **Тендер §2 — мэргэжлийн зөвшөөрлийн код.** Эмчийн нэвтрэлтийг
  /// > зөвшөөрлийн кодтой уялдуулах шаардлага байгаа боловч **тийм шалгалт
  /// > серверт байхгүй**, `DoctorsProfile`-д код хадгалах багана ч алга
  /// > (READINESS.md §6, мөр 13). Иймд энд байхгүй шалгалтыг байгаа мэт
  /// > дүрсэлсэн UI хийхгүй.
  ///
  /// > **Аюулгүй байдал:** `NODE_ENV` нь `production` биш үед сервер тал
  /// > ажилтны нууц үгийг **огт шалгадаггүй** (`UserController.js:246`).
  /// > Нэвтрэлт ажиллаж байгааг зөвхөн production тохиргоотой сервер дээр
  /// > шалгаж баталгаажуулна.
  Future<AuthTokens> loginStaff({
    required String userName,
    required String password,
  }) async {
    final Map<String, dynamic> data;
    try {
      data = await _api.legacyObject(
        '/api/User/Login',
        body: <String, dynamic>{'UserName': userName, 'Password': password},
      );
    } on ApiException catch (e) {
      if (e.isNetworkError) rethrow;
      throw ApiException(
        mnMessage(e.message, 'Нэвтрэх нэр эсвэл нууц үг буруу байна.'),
        code: e.code,
        statusCode: e.statusCode,
      );
    }

    final token = data['token'] as String?;
    if (token == null || token.isEmpty) {
      throw ApiException('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
    }

    final userJson = data['LogedUser'];
    final user = userJson is Map
        ? LogedUser.fromJson(Map<String, dynamic>.from(userJson))
        : null;

    if (user != null && user.isPatient) {
      throw ApiException(
        'Энэ бүртгэл үйлчлүүлэгчийн эрхтэй байна. '
        'Үйлчлүүлэгчийн хэсгээр нэвтэрнэ үү.',
        code: 'NOT_A_DOCTOR',
      );
    }

    return AuthTokens(
      accessToken: token,
      expiresAt: jwtExpiry(token),
      user: user,
    );
  }

  // -------------------------------------------------------------------
  // Сесс
  // -------------------------------------------------------------------

  /// Эхний refresh токеныг авах — хүчинтэй access токеноор Bearer маягаар
  /// дуудна (API.md §2, алхам 2).
  Future<AuthTokens> bootstrapRefreshToken(String accessToken) =>
      _refreshCall(bearer: accessToken);

  /// Хадгалсан refresh токеноор шинэ хос авна.
  Future<AuthTokens> refresh(String refreshToken) =>
      _refreshCall(refreshToken: refreshToken);

  Future<AuthTokens> _refreshCall({String? bearer, String? refreshToken}) async {
    final dio = _bareClient();
    try {
      final response = await dio.post<dynamic>(
        '/api/auth/refresh',
        data: refreshToken != null
            ? <String, dynamic>{'refreshToken': refreshToken}
            : <String, dynamic>{},
        options: Options(
          headers: bearer != null
              ? <String, dynamic>{'Authorization': 'Bearer ' + bearer}
              : null,
        ),
      );

      final data = Envelope.asMap(Envelope.modernData(response));
      final token = data['token'] as String?;
      if (token == null || token.isEmpty) {
        throw ApiException(
          'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.',
          code: 'TOKEN_INVALID',
        );
      }

      final expiresIn = data['expiresIn'];
      final expiresAt = expiresIn is num
          ? DateTime.now().add(Duration(seconds: expiresIn.toInt()))
          : jwtExpiry(token);

      final userJson = data['LogedUser'];
      return AuthTokens(
        accessToken: token,
        refreshToken: data['refreshToken'] as String?,
        expiresAt: expiresAt,
        user: userJson is Map
            ? LogedUser.fromJson(Map<String, dynamic>.from(userJson))
            : null,
      );
    } on DioException catch (e) {
      final error = e.error;
      if (error is ApiException) throw error;
      throw ApiException(
        'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.',
        code: 'TOKEN_INVALID',
      );
    } finally {
      dio.close();
    }
  }

  /// Access токен хүчинтэй эсэхийг шалгана — апп нээгдэх үед нөөц хүсэлт
  /// илгээхгүйгээр шийдэхэд ашиглана.
  Future<bool> isSessionValid(String accessToken) async {
    final dio = _bareClient();
    try {
      final response = await dio.get<dynamic>(
        '/api/auth/session',
        options: Options(
          headers: <String, dynamic>{'Authorization': 'Bearer ' + accessToken},
        ),
      );
      final body = response.data;
      return body is Map && body['success'] == true;
    } catch (_) {
      return false;
    } finally {
      dio.close();
    }
  }

  // -------------------------------------------------------------------
  // Нууц үг — админы дэмжлэггүйгээр сэргээх (Техникийн шаардлага §1.2.5)
  // -------------------------------------------------------------------

  /// Сэргээх заавар бүхий холбоосыг бүртгэлтэй имэйл рүү илгээнэ.
  ///
  /// Хоёр үзэгчид хоёр өөр зам: үйлчлүүлэгч `PatientUser/ForgotPassword`,
  /// ажилтан `User/ForgetPassword` — **бичиглэл нь өөр** (Forget/Forgot),
  /// энэ нь алдаа биш, серверийн бодит зам (API.md §2).
  Future<String> forgotPassword(String userName, {bool staff = false}) async {
    try {
      final response = await _api.legacyResponse(
        staff ? '/api/User/ForgetPassword' : '/api/PatientUser/ForgotPassword',
        body: <String, dynamic>{'UserName': userName},
      );
      return mnMessage(
        Envelope.messageOf(response.data, fallback: ''),
        'Нууц үг сэргээх заавар бүртгэлтэй имэйл рүү илгээгдлээ.',
      );
    } on ApiException catch (e) {
      if (e.isNetworkError) rethrow;
      throw ApiException(
        mnMessage(e.message, 'Хэрэглэгч олдсонгүй. Нэвтрэх нэрээ шалгана уу.'),
        code: e.code,
        statusCode: e.statusCode,
      );
    }
  }

  /// Имэйлээр ирсэн кодоор шинэ нууц үг тогтооно.
  ///
  /// Ажилтны талд сервер нууц үгийн нарийвчилсан шалгуур тавьдаг,
  /// үйлчлүүлэгчийн талд тавьдаггүй — клиент тал хоёуланд нь адил шалгана.
  Future<String> resetPassword({
    required String userName,
    required String token,
    required String password,
    bool staff = false,
  }) async {
    try {
      final response = await _api.legacyResponse(
        staff ? '/api/User/ResetPassword' : '/api/PatientUser/ResetPassword',
        body: <String, dynamic>{
          'UserName': userName,
          'Token': token,
          'Password': password,
        },
      );
      return mnMessage(
        Envelope.messageOf(response.data, fallback: ''),
        'Нууц үг амжилттай шинэчлэгдлээ.',
      );
    } on ApiException catch (e) {
      if (e.isNetworkError) rethrow;
      throw ApiException(
        mnMessage(
          e.message,
          'Сэргээх код буруу эсвэл хугацаа нь дууссан байна.',
        ),
        code: e.code,
        statusCode: e.statusCode,
      );
    }
  }
}
