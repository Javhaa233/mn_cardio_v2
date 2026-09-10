import 'dart:async';

import 'package:dio/dio.dart';

import 'token_store.dart';

/// One exception type for both of the backend's response envelopes.
///
/// Branch on [code], never on [message]. The messages are Mongolian display
/// strings and will be reworded; `PATIENT_NOT_RESOLVED` will not.
class ApiException implements Exception {
  ApiException(this.message, {this.code, this.isAuthError = false, this.status});

  /// Already Mongolian and safe to show to the user.
  final String message;

  /// Stable machine-readable code, e.g. `DATE_REQUIRED`. Null on the legacy
  /// layer, which does not emit codes.
  final String? code;

  /// True when the legacy layer reported an authentication failure. The mobile
  /// surfaces report the same condition as `code == 'TOKEN_INVALID'`.
  final bool isAuthError;

  final int? status;

  bool get isTokenProblem => isAuthError || code == 'TOKEN_INVALID';

  @override
  String toString() => 'ApiException(${code ?? status ?? '-'}): $message';
}

/// The МнКардио API client.
///
/// Handles the two things that otherwise cost every new client a day:
///
///  1. **The legacy layer returns HTTP 200 for every failure**, including auth
///     failures. Without the interceptor below, `dio` reports success and the
///     UI silently renders empty lists forever.
///  2. **Access tokens last 10 hours.** A single-flight refresh replays the
///     failed request instead of bouncing the user to the login screen.
///
/// See mobile/API.md for the full contract and mobile/QUICKSTART.md to get a
/// first token in your hand.
class ApiClient {
  ApiClient({
    required this.baseUrl,
    required TokenStore tokens,
    Dio? dio,
    this.onSessionExpired,
  })  : _tokens = tokens,
        _dio = dio ?? Dio() {
    _dio.options
      ..baseUrl = baseUrl
      ..connectTimeout = const Duration(seconds: 15)
      ..receiveTimeout = const Duration(seconds: 30)
      ..headers.addAll(<String, String>{
        'Accept': 'application/json',
        // The web frontend sends this on every request and some handlers read
        // it. It costs nothing and avoids a class of confusing empty results.
        'app': '1',
      })
      // Never let dio throw on status alone. The legacy layer uses 200 for
      // failures and the mobile layer uses real codes; both are handled below.
      ..validateStatus = (_) => true;

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _attachToken,
        onResponse: _unwrapEnvelope,
      ),
    );
  }

  final String baseUrl;
  final Dio _dio;
  final TokenStore _tokens;

  /// Called when the refresh token is gone or rejected. Route to login here.
  final void Function()? onSessionExpired;

  /// Guards the refresh so ten parallel 401s trigger one refresh, not ten.
  Future<bool>? _refreshInFlight;

  Dio get raw => _dio;

  // ---------------------------------------------------------------------------
  // Interceptors
  // ---------------------------------------------------------------------------

  Future<void> _attachToken(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra['skipAuth'] != true) {
      final token = await _tokens.accessToken;
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    handler.next(options);
  }

  /// Normalises both envelopes into either a plain payload or an [ApiException].
  void _unwrapEnvelope(Response<dynamic> response, ResponseInterceptorHandler handler) {
    final dynamic body = response.data;

    if (body is Map) {
      // Legacy PascalCase: {Success, Message, Data, Option} — HTTP is always 200.
      if (body.containsKey('Success')) {
        if (body['Success'] != true) {
          return handler.reject(
            DioException(
              requestOptions: response.requestOptions,
              response: response,
              error: ApiException(
                (body['Message'] as String?) ?? 'Алдаа гарлаа',
                isAuthError: body['AuthError'] == true,
                status: response.statusCode,
              ),
            ),
          );
        }
        return handler.next(response);
      }

      // Mobile lowercase: {success, message, data, code} — real status codes.
      if (body.containsKey('success')) {
        if (body['success'] != true) {
          return handler.reject(
            DioException(
              requestOptions: response.requestOptions,
              response: response,
              error: ApiException(
                (body['message'] as String?) ?? 'Алдаа гарлаа',
                code: body['code'] as String?,
                status: response.statusCode,
              ),
            ),
          );
        }
        return handler.next(response);
      }
    }

    // Not an envelope at all — a binary download, or /health.
    final status = response.statusCode ?? 0;
    if (status < 200 || status >= 300) {
      return handler.reject(
        DioException(
          requestOptions: response.requestOptions,
          response: response,
          error: ApiException('Алдаа гарлаа', status: status),
        ),
      );
    }
    handler.next(response);
  }

  // ---------------------------------------------------------------------------
  // Payload extraction
  // ---------------------------------------------------------------------------

  /// Pulls the payload out of whichever envelope came back.
  ///
  /// The mobile surfaces put it in `data`; the legacy layer puts it in `Data`
  /// with paging in `Option`. Doing this centrally beats remembering which is
  /// which at every call site.
  static dynamic payloadOf(dynamic body) {
    if (body is Map) {
      if (body.containsKey('data')) return body['data'];
      if (body.containsKey('Data')) return body['Data'];
    }
    return body;
  }

  /// `RoleId` is a **number** on `/api/auth/session` and a **string** on
  /// `/api/doctor/me`. Compare through this and the difference stops mattering.
  static String? roleIdOf(dynamic value) => value?.toString();

  // ---------------------------------------------------------------------------
  // Verbs
  // ---------------------------------------------------------------------------

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? query,
    bool skipAuth = false,
  }) =>
      _send(() => _dio.get<dynamic>(
            path,
            queryParameters: _clean(query),
            options: Options(extra: {'skipAuth': skipAuth}),
          ));

  Future<dynamic> post(
    String path, {
    Object? body,
    Map<String, dynamic>? query,
    bool skipAuth = false,
  }) =>
      _send(() => _dio.post<dynamic>(
            path,
            data: body,
            queryParameters: _clean(query),
            options: Options(
              extra: {'skipAuth': skipAuth},
              // Mongolian text everywhere — be explicit about the charset.
              contentType: 'application/json; charset=utf-8',
            ),
          ));

  Future<dynamic> delete(String path, {Object? body}) =>
      _send(() => _dio.delete<dynamic>(path, data: body));

  /// Runs a request, and on a token problem refreshes once and replays it.
  Future<dynamic> _send(Future<Response<dynamic>> Function() run) async {
    try {
      final res = await run();
      return payloadOf(res.data);
    } on DioException catch (e) {
      final err = e.error;
      if (err is ApiException && err.isTokenProblem) {
        final refreshed = await _refreshOnce();
        if (refreshed) {
          try {
            final res = await run();
            return payloadOf(res.data);
          } on DioException catch (e2) {
            throw _asApiException(e2);
          }
        }
        onSessionExpired?.call();
      }
      throw _asApiException(e);
    }
  }

  ApiException _asApiException(DioException e) {
    final err = e.error;
    if (err is ApiException) return err;
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return ApiException('Сүлжээний хугацаа дууслаа. Дахин оролдоно уу');
    }
    return ApiException('Сүлжээний алдаа гарлаа');
  }

  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------

  /// Single-flight: concurrent callers await the same refresh.
  ///
  /// Never retries the refresh call itself — that is how you get an infinite
  /// loop.
  Future<bool> _refreshOnce() {
    final existing = _refreshInFlight;
    if (existing != null) return existing;

    final future = _doRefresh();
    _refreshInFlight = future;
    return future.whenComplete(() => _refreshInFlight = null);
  }

  Future<bool> _doRefresh() async {
    final refreshToken = await _tokens.refreshToken;
    if (refreshToken == null || refreshToken.isEmpty) return false;

    try {
      // A bare Dio: this must not pass through the interceptors above, or a
      // failing refresh would recurse.
      final bare = Dio(BaseOptions(
        baseUrl: baseUrl,
        headers: const {'Accept': 'application/json', 'app': '1'},
        validateStatus: (_) => true,
      ));
      final res = await bare.post<dynamic>(
        '/api/auth/refresh',
        data: {'refreshToken': refreshToken},
        options: Options(contentType: 'application/json; charset=utf-8'),
      );
      final body = res.data;
      if (body is Map && body['success'] == true && body['data'] is Map) {
        final data = body['data'] as Map;
        await _tokens.save(
          accessToken: data['token'] as String?,
          refreshToken: data['refreshToken'] as String?,
        );
        return true;
      }
    } catch (_) {
      // Fall through to a false result: the caller routes to login.
    }
    await _tokens.clear();
    return false;
  }

  Map<String, dynamic>? _clean(Map<String, dynamic>? query) {
    if (query == null) return null;
    final out = <String, dynamic>{};
    query.forEach((k, v) {
      if (v != null) out[k] = v;
    });
    return out.isEmpty ? null : out;
  }
}
