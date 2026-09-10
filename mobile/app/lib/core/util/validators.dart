/// Талбарын шалгалт. Бүх мессеж монгол — Техникийн шаардлага §1.3.11.
///
/// Эмнэлзүйн хэмжилтийн хязгаарууд нь **бичлэгийн алдаа барих** зорилготой
/// бөгөөд оношилгооны шийдвэр биш. Хэт өргөн хязгаар авсан нь санаатай:
/// эмнэлзүйн хувьд боломжтой ховор утгыг апп хориглох ёсгүй.
class Validators {
  Validators._();

  static String? required(String? value, {String field = 'Энэ талбар'}) {
    if (value == null || value.trim().isEmpty) {
      return '$field-ыг бөглөнө үү.';
    }
    return null;
  }

  static String? userName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Нэвтрэх нэрээ оруулна уу.';
    }
    if (value.trim().length < 3) {
      return 'Нэвтрэх нэр хэт богино байна.';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Нууц үгээ оруулна уу.';
    }
    return null;
  }

  /// Шинэ нууц үг тогтоох үеийн шалгалт.
  ///
  /// Серверийн `helper/PasswordPolicy.js` дэх дүрмийг **яг адилхан** давтана:
  /// 8-аас доошгүй тэмдэгт, дотор нь том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт
  /// тус бүр нэгээс доошгүй.
  ///
  /// Хоёр зүйлийг анхаарна:
  ///
  /// * Үсгийн шалгуур нь **латин** `a-z` / `A-Z` — серверийн regex ийм.
  ///   Зөвхөн кирилл үсэгтэй нууц үг серверт татгалзана, тиймээс энд ч
  ///   зөвшөөрөхгүй. Илүү зөөлөн байвал хэрэглэгч сервер дээр гэнэт унана.
  /// * Туршилтын сервер өнөөдөр хуучин билд дээр ажиллаж байгаа тул сул нууц
  ///   үг хүлээж авч болзошгүй (API.md §2). Клиент тал дүрмээ баримтална —
  ///   сервер шинэчлэгдэхэд шууд таарна.
  static String? newPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Шинэ нууц үгээ оруулна уу.';
    }
    if (value.length < 8) {
      return 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.';
    }
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Том үсэг (A–Z) нэгээс доошгүй агуулсан байна.';
    }
    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Жижиг үсэг (a–z) нэгээс доошгүй агуулсан байна.';
    }
    if (!RegExp(r'\d').hasMatch(value)) {
      return 'Тоо нэгээс доошгүй агуулсан байна.';
    }
    if (!RegExp(r'''[!@#$%^&*()+=\-?;,./{}|":<>\[\]\\' ~_]''').hasMatch(value)) {
      return 'Тусгай тэмдэгт (жишээ нь ! @ # \$ % _ -) нэгээс доошгүй '
          'агуулсан байна.';
    }
    return null;
  }

  /// Нууц үгийн шаардлагыг маягт дээр урьдчилан харуулах текст.
  static const String passwordRequirementHint =
      'Хамгийн багадаа 8 тэмдэгт: том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт';

  static String? confirmPassword(String? value, String original) {
    if (value == null || value.isEmpty) {
      return 'Нууц үгээ давтан оруулна уу.';
    }
    if (value != original) {
      return 'Нууц үг таарахгүй байна.';
    }
    return null;
  }

  /// Систолын даралт (дээд).
  static String? systolic(String? value, {bool isRequired = false}) =>
      _range(value, 50, 300, 'Дээд даралт', isRequired: isRequired);

  /// Диастолын даралт (доод).
  static String? diastolic(String? value, {bool isRequired = false}) =>
      _range(value, 30, 200, 'Доод даралт', isRequired: isRequired);

  static String? pulse(String? value, {bool isRequired = false}) =>
      _range(value, 20, 250, 'Судасны цохилт', isRequired: isRequired);

  static String? weight(String? value, {bool isRequired = false}) =>
      _range(value, 10, 400, 'Жин', isRequired: isRequired, allowDecimal: true);

  static String? inr(String? value, {bool isRequired = false}) =>
      _range(value, 0.5, 12, 'INR', isRequired: isRequired, allowDecimal: true);

  static String? spo2(String? value, {bool isRequired = false}) =>
      _range(value, 50, 100, 'Хүчилтөрөгчийн ханалт', isRequired: isRequired);

  /// Боргийн ачааллын үнэлгээ — 6–20 масштаб.
  static String? borg(String? value, {bool isRequired = false}) =>
      _range(value, 6, 20, 'Боргийн үнэлгээ', isRequired: isRequired);

  static String? comment(String? value, {int max = 2000, bool isRequired = true}) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return isRequired ? 'Агуулгыг бөглөнө үү.' : null;
    }
    if (trimmed.length > max) {
      return 'Хэт урт байна. Дээд тал нь $max тэмдэгт.';
    }
    return null;
  }

  static String? _range(
    String? value,
    num min,
    num max,
    String label, {
    required bool isRequired,
    bool allowDecimal = false,
  }) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return isRequired ? '$label-ыг оруулна уу.' : null;
    }
    final parsed = allowDecimal
        ? double.tryParse(trimmed.replaceAll(',', '.'))
        : int.tryParse(trimmed);
    if (parsed == null) {
      return '$label-ыг тоогоор оруулна уу.';
    }
    if (parsed < min || parsed > max) {
      return '$label $min–$max хооронд байна.';
    }
    return null;
  }
}
