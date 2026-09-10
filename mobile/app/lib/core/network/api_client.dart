import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import 'api_exception.dart';
import 'auth_interceptor.dart';
import 'envelope.dart';
import 'envelope_interceptor.dart';

/// Backend-тэй харилцах цорын ганц гарц.
///
/// Дэлгэц болон repository-ууд `Dio`-г шууд хэрэглэхгүй: бүх дуудлага энд
/// төвлөрснөөр дугтуй задлах, алдаа хөрвүүлэх, токен сэргээх гурван дүрэм нэг
/// л газар хэрэгжинэ.
class ApiClient {
  ApiClient({
    required TokenReader readAccessToken,
    required TokenRefresher refreshSession,
    required SessionExpiredCallback onSessionExpired,
  }) {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        sendTimeout: AppConfig.sendTimeout,
        contentType: Headers.jsonContentType,
        responseType: ResponseType.json,
        // Дугтуйг өөрсдөө шалгах тул статусын шүүлтийг interceptor рүү өгнө.
        validateStatus: (status) => status != null && status < 500,
      ),
    );

    _dio.interceptors.add(EnvelopeInterceptor());
    _dio.interceptors.add(
      AuthInterceptor(
        readAccessToken: readAccessToken,
        refreshSession: refreshSession,
        onSessionExpired: onSessionExpired,
        retryClient: () => _dio,
      ),
    );

    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          request: false,
          requestBody: false,
          responseBody: false,
          logPrint: (Object o) => debugPrint('[api] $o'),
        ),
      );
    }
  }

  late final Dio _dio;

  Dio get raw => _dio;

  String get baseUrl => _dio.options.baseUrl;

  set baseUrl(String value) => _dio.options.baseUrl = value;

  // ---------------------------------------------------------------------
  // Мобайлын гадаргуу — /api/patient/*, /api/doctor/*, /api/auth/*
  // Жинхэнэ verb, жинхэнэ статус код, {success, message, data, code}.
  // ---------------------------------------------------------------------

  /// Ганц объект буцаах GET.
  Future<Map<String, dynamic>> getObject(
    String path, {
    Map<String, dynamic>? query,
    CancelToken? cancelToken,
  }) async {
    final response = await _guard(
      () => _dio.get<dynamic>(
        path,
        queryParameters: _clean(query),
        cancelToken: cancelToken,
      ),
    );
    return Envelope.asMap(Envelope.modernData(response));
  }

  /// `data` нь объект биш байж болох GET (null, жагсаалт гэх мэт).
  Future<dynamic> getRaw(
    String path, {
    Map<String, dynamic>? query,
    CancelToken? cancelToken,
  }) async {
    final response = await _guard(
      () => _dio.get<dynamic>(
        path,
        queryParameters: _clean(query),
        cancelToken: cancelToken,
      ),
    );
    return Envelope.modernData(response);
  }

  /// Хуудаслалттай жагсаалт буцаах GET.
  Future<Paged<T>> getPaged<T>(
    String path,
    T Function(Map<String, dynamic> row) parse, {
    int limit = AppConfig.pageSize,
    int offset = 0,
    Map<String, dynamic>? query,
    CancelToken? cancelToken,
  }) async {
    final effectiveLimit = limit.clamp(1, 100);
    final response = await _guard(
      () => _dio.get<dynamic>(
        path,
        queryParameters: _clean(<String, dynamic>{
          ...?query,
          'limit': effectiveLimit,
          'offset': offset,
        }),
        cancelToken: cancelToken,
      ),
    );
    return Paged.fromModern<T>(
      response,
      parse,
      requestedLimit: effectiveLimit,
      requestedOffset: offset,
    );
  }

  Future<Map<String, dynamic>> postObject(
    String path, {
    Object? body,
    Map<String, dynamic>? query,
    CancelToken? cancelToken,
  }) async {
    final response = await _guard(
      () => _dio.post<dynamic>(
        path,
        data: body,
        queryParameters: _clean(query),
        cancelToken: cancelToken,
      ),
    );
    return Envelope.asMap(Envelope.modernData(response));
  }

  Future<void> delete(
    String path, {
    Object? body,
    CancelToken? cancelToken,
  }) async {
    await _guard(
      () => _dio.delete<dynamic>(path, data: body, cancelToken: cancelToken),
    );
  }

  // ---------------------------------------------------------------------
  // Хуучин давхарга — бусад бүх /api/*
  // Уншилт ч гэсэн POST. {Success, Message, Data, Option}. Алдаа ч HTTP 200.
  // ---------------------------------------------------------------------

  /// Хуучин давхаргын дуудлага. `Data`-г задалж буцаана.
  Future<dynamic> legacy(
    String path, {
    Map<String, dynamic>? body,
    CancelToken? cancelToken,
  }) async {
    final response = await _guard(
      () => _dio.post<dynamic>(
        path,
        data: body ?? <String, dynamic>{},
        cancelToken: cancelToken,
      ),
    );
    return Envelope.legacyData(response);
  }

  /// Хуучин давхаргын дуудлага — `Data` ба `Option` хоёуланг нь шаардах үед.
  Future<Response<dynamic>> legacyResponse(
    String path, {
    Map<String, dynamic>? body,
    CancelToken? cancelToken,
  }) {
    return _guard(
      () => _dio.post<dynamic>(
        path,
        data: body ?? <String, dynamic>{},
        cancelToken: cancelToken,
      ),
    );
  }

  Future<Map<String, dynamic>> legacyObject(
    String path, {
    Map<String, dynamic>? body,
    CancelToken? cancelToken,
  }) async {
    return Envelope.asMap(await legacy(path, body: body, cancelToken: cancelToken));
  }

  Future<List<Map<String, dynamic>>> legacyList(
    String path, {
    Map<String, dynamic>? body,
    CancelToken? cancelToken,
  }) async {
    return Envelope.asList(await legacy(path, body: body, cancelToken: cancelToken));
  }

  /// Multipart илгээх — `/api/BaseObject/uploadFile` (API.md §7).
  Future<Map<String, dynamic>> upload(
    String path, {
    required FormData form,
    CancelToken? cancelToken,
    void Function(int sent, int total)? onProgress,
  }) async {
    final response = await _guard(
      () => _dio.post<dynamic>(
        path,
        data: form,
        cancelToken: cancelToken,
        onSendProgress: onProgress,
        options: Options(contentType: 'multipart/form-data'),
      ),
    );
    final body = Envelope.asMap(response.data);
    return Envelope.asMap(body['Data'] ?? body['data']);
  }

  // ---------------------------------------------------------------------

  /// `DioException`-г [ApiException] болгож дамжуулна. Дуудагч тал зөвхөн
  /// [ApiException] барихад хангалттай.
  Future<Response<dynamic>> _guard(
    Future<Response<dynamic>> Function() send,
  ) async {
    try {
      return await send();
    } on DioException catch (e) {
      final error = e.error;
      if (error is ApiException) throw error;
      throw ApiException(
        'Алдаа гарлаа. Дахин оролдоно уу.',
        statusCode: e.response?.statusCode,
      );
    }
  }

  /// `null` утгатай query параметрийг хасна — Dio тэдгээрийг `null` гэсэн
  /// мөр болгон илгээж, сервер тал огноо гэж уншиж эхэлдэг.
  Map<String, dynamic>? _clean(Map<String, dynamic>? query) {
    if (query == null) return null;
    final cleaned = <String, dynamic>{};
    query.forEach((key, dynamic value) {
      if (value == null) return;
      if (value is String && value.trim().isEmpty) return;
      cleaned[key] = value;
    });
    return cleaned.isEmpty ? null : cleaned;
  }
}
