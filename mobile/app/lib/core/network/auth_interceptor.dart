import 'dart:async';

import 'package:dio/dio.dart';

import 'api_exception.dart';

typedef TokenReader = Future<String?> Function();

/// Токен амжилттай сэргээгдвэл `true`.
typedef TokenRefresher = Future<bool> Function();

typedef SessionExpiredCallback = Future<void> Function();

/// Хүсэлт бүрд Bearer толгой нэмж, токен хүчингүй болсон үед **нэг удаа**
/// сэргээгээд хүсэлтийг давтана.
///
/// Гурван дүрэм (FLUTTER.md § "Auth and session"):
///  * Зэрэг явж буй арван дуудлага арван refresh биш, **нэг** refresh өдөөнө —
///    үүнийг [_inFlightRefresh] нэг future-аар хамгаална.
///  * `/api/auth/refresh` өөрөө хэзээ ч давтагдахгүй — тэр нь хязгааргүй давталт.
///  * Сэргээлт бүтэлгүйтвэл хадгалалтыг цэвэрлэж нэвтрэх дэлгэц рүү шилжинэ.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required this.readAccessToken,
    required this.refreshSession,
    required this.onSessionExpired,
    required this.retryClient,
  });

  final TokenReader readAccessToken;
  final TokenRefresher refreshSession;
  final SessionExpiredCallback onSessionExpired;

  /// Давталтыг гүйцэтгэх Dio. Interceptor-ууд нь энэ клиент дээр мөн ажиллах
  /// боловч `_kRetriedFlag` дахин давтахаас сэргийлнэ.
  final Dio Function() retryClient;

  static const String _kRetriedFlag = 'mncardio_retried';

  /// Эдгээр замд токен сэргээх оролдлого хийхгүй.
  static const List<String> _noRetryPaths = <String>[
    '/api/auth/refresh',
    '/api/PatientUser/Login',
    '/api/User/Login',
    '/api/PatientUser/ForgotPassword',
    '/api/PatientUser/ResetPassword',
    '/api/User/ForgetPassword',
    '/api/User/ResetPassword',
  ];

  Future<bool>? _inFlightRefresh;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.headers['Authorization'] == null) {
      final token = await readAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final failure = err.error;
    final isAuthFailure = failure is ApiException && failure.isTokenInvalid;

    if (!isAuthFailure || !_mayRetry(err.requestOptions)) {
      handler.next(err);
      return;
    }

    final refreshed = await _refreshOnce();
    if (!refreshed) {
      await onSessionExpired();
      handler.next(err);
      return;
    }

    try {
      final response = await _replay(err.requestOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    } catch (retryError, stack) {
      handler.next(
        DioException(
          requestOptions: err.requestOptions,
          error: retryError is ApiException
              ? retryError
              : ApiException('Алдаа гарлаа. Дахин оролдоно уу.'),
          stackTrace: stack,
        ),
      );
    }
  }

  bool _mayRetry(RequestOptions options) {
    if (options.extra[_kRetriedFlag] == true) return false;
    final path = options.path;
    for (final blocked in _noRetryPaths) {
      if (path.toLowerCase().contains(blocked.toLowerCase())) return false;
    }
    return true;
  }

  Future<bool> _refreshOnce() {
    final existing = _inFlightRefresh;
    if (existing != null) return existing;

    final future = refreshSession().whenComplete(() {
      _inFlightRefresh = null;
    });
    _inFlightRefresh = future;
    return future;
  }

  Future<Response<dynamic>> _replay(RequestOptions options) async {
    final token = await readAccessToken();
    final headers = Map<String, dynamic>.from(options.headers);
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    } else {
      headers.remove('Authorization');
    }

    return retryClient().fetch<dynamic>(
      options.copyWith(
        headers: headers,
        extra: <String, dynamic>{...options.extra, _kRetriedFlag: true},
      ),
    );
  }
}
