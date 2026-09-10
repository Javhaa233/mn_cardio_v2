import 'package:dio/dio.dart';

import 'api_exception.dart';
import 'envelope.dart';

/// Хоёр дугтуйг нэг [ApiException] болгон хөрвүүлнэ.
///
/// Хуучин давхарга алдааг **HTTP 200**-оор буцаадаг тул зөвхөн статус кодыг
/// шалгасан клиент "токен хүчингүй", "эрх байхгүй", "өгөгдлийн сан унасан"
/// гурвыг амжилт гэж үзээд UI-д хоосон жагсаалт өгнө. Иймд хариу бүрийн биеийг
/// шалгах ёстой — API.md §1.
///
/// Энэ interceptor нь [AuthInterceptor]-оос **өмнө** бүртгэгдэнэ. Ингэснээр
/// дугтуйн алдаа эхлээд [ApiException] болж хувирч, дараа нь эрхийн interceptor
/// түүнийг харж токен сэргээх эсэхээ шийднэ.
class EnvelopeInterceptor extends Interceptor {
  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    final failure = envelopeFailureOf(
      response.data,
      statusCode: response.statusCode,
    );
    if (failure != null) {
      handler.reject(
        DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: failure,
        ),
        // Дараагийн interceptor-уудын onError дуудагдана.
        true,
      );
      return;
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.error is ApiException) {
      handler.next(err);
      return;
    }

    final normalized = _normalize(err);
    handler.next(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        stackTrace: err.stackTrace,
        error: normalized,
      ),
    );
  }

  ApiException _normalize(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          'Сервертэй холбогдох хугацаа хэтэрлээ. Интернэт холболтоо шалгана уу.',
          isNetworkError: true,
        );
      case DioExceptionType.connectionError:
        return ApiException(
          'Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.',
          isNetworkError: true,
        );
      case DioExceptionType.cancel:
        return ApiException('Хүсэлт цуцлагдлаа.');
      case DioExceptionType.badCertificate:
        return ApiException(
          'Серверийн аюулгүй байдлын гэрчилгээ хүчингүй байна.',
        );
      case DioExceptionType.badResponse:
      case DioExceptionType.unknown:
        break;
    }

    final status = err.response?.statusCode;
    final body = err.response?.data;

    final fromEnvelope = envelopeFailureOf(body, statusCode: status);
    if (fromEnvelope != null) return fromEnvelope;

    return ApiException(
      _messageForStatus(status, body),
      statusCode: status,
      isAuthError: status == 401,
    );
  }

  String _messageForStatus(int? status, dynamic body) {
    final serverMessage = Envelope.messageOf(body, fallback: '');
    if (serverMessage.isNotEmpty) return serverMessage;

    switch (status) {
      case 400:
        return 'Илгээсэн мэдээлэл буруу байна.';
      case 401:
        return 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.';
      case 403:
        return 'Танд энэ үйлдлийг хийх эрх байхгүй байна.';
      case 404:
        return 'Мэдээлэл олдсонгүй.';
      case 413:
        return 'Файлын хэмжээ хэтэрсэн байна.';
      case 429:
        return 'Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Серверт алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.';
      default:
        return 'Алдаа гарлаа. Дахин оролдоно уу.';
    }
  }
}
