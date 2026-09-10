/// Хоёр өөр дугтуйнаас (`{Success,...}` ба `{success,...}`) үүсэх алдааг нэг
/// төрөл болгон хөрвүүлсэн хэлбэр.
///
/// [message] нь серверээс ирсэн монгол текст — шууд харуулж болно.
/// [code] нь тогтвортой танигч (`PATIENT_NOT_RESOLVED` гэх мэт). Логик заавал
/// [code] дээр салаална — [message] нь өөрчлөгдөж болох дэлгэцийн текст.
class ApiException implements Exception {
  ApiException(
    this.message, {
    this.code,
    this.isAuthError = false,
    this.statusCode,
    this.isNetworkError = false,
  });

  final String message;
  final String? code;
  final bool isAuthError;
  final int? statusCode;
  final bool isNetworkError;

  /// Токен хүчингүй болсон — сэргээх (refresh) оролдлого хийх утгатай эсэх.
  bool get isTokenInvalid =>
      isAuthError || code == 'TOKEN_INVALID' || statusCode == 401;

  /// Хэрэглэгчид харагдах эрхийн алдаа — сэргээгээд ч давтагдана.
  bool get isForbidden => statusCode == 403;

  /// Үйлчлүүлэгчийн бүртгэл олдоогүй. Энэ нь кодын алдаа биш, өгөгдлийн
  /// нөхцөл — API.md §2 "The two patient-gate errors".
  bool get isPatientNotResolved => code == 'PATIENT_NOT_RESOLVED';

  bool get isNotAPatient => code == 'NOT_A_PATIENT';

  bool get isNotFound => statusCode == 404 || code == 'NOT_FOUND';

  @override
  String toString() => 'ApiException($code/$statusCode): $message';
}
