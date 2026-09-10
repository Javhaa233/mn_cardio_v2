import 'package:dio/dio.dart';

import 'api_exception.dart';

/// Backend-д хоёр өөр дугтуй зэрэг ажилладаг (API.md §1):
///
/// * Мобайлын гадаргуу (`/api/patient/*`, `/api/doctor/*`, `/api/auth/*`) —
///   `{success, message, data, code}`, жинхэнэ HTTP статустай.
/// * Хуучин давхарга (бусад бүх `/api/*`) — `{Success, Message, Data, Option}`,
///   алдаа гарсан ч **HTTP 200** буцаана.
///
/// Дугтуйг таних, задлах логикийг нэг газар төвлөрүүлж, дуудлага бүр дээр
/// "энэ аль нь билээ" гэж санахаас сэргийлнэ.
class Envelope {
  Envelope._();

  static bool isLegacy(dynamic body) =>
      body is Map && body.containsKey('Success');

  static bool isModern(dynamic body) =>
      body is Map && body.containsKey('success');

  /// Мобайлын дугтуйнаас `data`-г задлана.
  static dynamic modernData(Response<dynamic> response) {
    final body = response.data;
    if (body is Map) return body['data'];
    return body;
  }

  /// Хуучин дугтуйнаас `Data`-г задлана.
  static dynamic legacyData(Response<dynamic> response) {
    final body = response.data;
    if (body is Map) return body['Data'];
    return body;
  }

  static Map<String, dynamic> asMap(dynamic value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) return Map<String, dynamic>.from(value);
    return <String, dynamic>{};
  }

  static List<Map<String, dynamic>> asList(dynamic value) {
    if (value is List) {
      return value
          .whereType<dynamic>()
          .map((dynamic e) => asMap(e))
          .toList(growable: false);
    }
    return const <Map<String, dynamic>>[];
  }

  /// Сервер талаас ирсэн монгол мессежийг гаргаж авна. Байхгүй бол ерөнхий
  /// текст — англи мессеж хэрэглэгчид хэзээ ч харагдахгүй.
  static String messageOf(dynamic body, {required String fallback}) {
    if (body is Map) {
      final dynamic m = body['Message'] ?? body['message'];
      if (m is String && m.trim().isNotEmpty) return m.trim();
    }
    return fallback;
  }
}

/// Хуудаслалттай жагсаалт. Мобайлын гадаргуу `data` дотор жагсаалт, түүний
/// хажууд `total/limit/offset` буцаадаг; хуучин давхарга `Option` дотор
/// `{Total, PageNumber, PageSize, HasMore}` буцаадаг.
class Paged<T> {
  const Paged({
    required this.items,
    required this.total,
    required this.limit,
    required this.offset,
  });

  final List<T> items;
  final int total;
  final int limit;
  final int offset;

  bool get hasMore => offset + items.length < total;

  /// `const []` энд ажиллахгүй: тогтмол илэрхийлэл төрлийн параметр ([T])
  /// лавлаж чадахгүй.
  static Paged<T> empty<T>() =>
      Paged<T>(items: <T>[], total: 0, limit: 0, offset: 0);

  Paged<T> appendedWith(Paged<T> next) => Paged<T>(
        items: <T>[...items, ...next.items],
        total: next.total,
        limit: next.limit,
        offset: next.offset,
      );

  /// Мобайлын дугтуйнаас хуудаслалт бүхий жагсаалт үүсгэнэ.
  static Paged<T> fromModern<T>(
    Response<dynamic> response,
    T Function(Map<String, dynamic> row) parse, {
    required int requestedLimit,
    required int requestedOffset,
  }) {
    final body = Envelope.asMap(response.data);
    final rows = Envelope.asList(body['data']).map(parse).toList(growable: false);
    return Paged<T>(
      items: rows,
      total: _int(body['total']) ?? rows.length,
      limit: _int(body['limit']) ?? requestedLimit,
      offset: _int(body['offset']) ?? requestedOffset,
    );
  }

  /// Хуучин дугтуйнаас хуудаслалт бүхий жагсаалт үүсгэнэ.
  static Paged<T> fromLegacy<T>(
    Response<dynamic> response,
    T Function(Map<String, dynamic> row) parse, {
    required int pageNumber,
    required int pageSize,
  }) {
    final body = Envelope.asMap(response.data);
    final rows = Envelope.asList(body['Data']).map(parse).toList(growable: false);
    final option = Envelope.asMap(body['Option']);
    final total = _int(option['Total']) ?? rows.length;
    final size = _int(option['PageSize']) ?? pageSize;
    final page = _int(option['PageNumber']) ?? pageNumber;
    return Paged<T>(
      items: rows,
      total: total,
      limit: size,
      offset: (page - 1) * size,
    );
  }

  static int? _int(dynamic v) {
    if (v is int) return v;
    if (v is num) return v.toInt();
    if (v is String) return int.tryParse(v);
    return null;
  }
}

/// Сервер тал `Success:false` эсвэл `success:false` гэж хариулсныг илрүүлж,
/// [ApiException] болгоно.
ApiException? envelopeFailureOf(dynamic body, {int? statusCode}) {
  if (body is! Map) return null;

  if (body.containsKey('Success')) {
    if (body['Success'] == true) return null;
    return ApiException(
      Envelope.messageOf(body, fallback: 'Алдаа гарлаа. Дахин оролдоно уу.'),
      code: body['Code'] as String?,
      isAuthError: body['AuthError'] == true,
      statusCode: statusCode,
    );
  }

  if (body.containsKey('success')) {
    if (body['success'] == true) return null;
    return ApiException(
      Envelope.messageOf(body, fallback: 'Алдаа гарлаа. Дахин оролдоно уу.'),
      code: body['code'] as String?,
      statusCode: statusCode,
    );
  }

  return null;
}
