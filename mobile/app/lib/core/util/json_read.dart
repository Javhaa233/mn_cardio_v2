import 'mn_format.dart';

/// JSON талбарыг найдвартай унших туслахууд.
///
/// Backend нэг талбарыг нэг газар тоо, нөгөө газар мөр болгож буцаадаг
/// (жишээ нь `p_age`), мөн `RemoteVisit` шиг шинэ хүснэгтүүд жижиг дугтуй
/// дотор PascalCase талбартай ирдэг (API.md §3, 2.6). Тиймээс төрөл хатуу
/// таамаглахын оронд энд хөрвүүлнэ.
class J {
  J._();

  static String? str(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v == null) continue;
      if (v is String) {
        final trimmed = v.trim();
        if (trimmed.isNotEmpty) return trimmed;
        continue;
      }
      return v.toString();
    }
    return null;
  }

  static String strOr(
    Map<String, dynamic> json,
    List<String> keys, {
    String fallback = '',
  }) =>
      str(json, keys) ?? fallback;

  static int? intOf(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v == null) continue;
      if (v is int) return v;
      if (v is num) return v.toInt();
      if (v is String) {
        final parsed = int.tryParse(v.trim());
        if (parsed != null) return parsed;
        final asDouble = double.tryParse(v.trim());
        if (asDouble != null) return asDouble.round();
      }
    }
    return null;
  }

  static double? dbl(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v == null) continue;
      if (v is num) return v.toDouble();
      if (v is String) {
        final parsed = double.tryParse(v.trim().replaceAll(',', '.'));
        if (parsed != null) return parsed;
      }
    }
    return null;
  }

  static bool boolOf(
    Map<String, dynamic> json,
    List<String> keys, {
    bool fallback = false,
  }) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v == null) continue;
      if (v is bool) return v;
      if (v is num) return v != 0;
      if (v is String) {
        final s = v.trim().toLowerCase();
        if (s == 'true' || s == '1' || s == 'y' || s == 'yes') return true;
        if (s == 'false' || s == '0' || s == 'n' || s == 'no') return false;
      }
    }
    return fallback;
  }

  static DateTime? date(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final parsed = MnFormat.parseDate(json[key]);
      if (parsed != null) return parsed;
    }
    return null;
  }

  static Map<String, dynamic>? obj(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v is Map) return Map<String, dynamic>.from(v);
    }
    return null;
  }

  static List<Map<String, dynamic>> list(
    Map<String, dynamic> json,
    List<String> keys,
  ) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v is List) {
        return v
            .whereType<Map<dynamic, dynamic>>()
            .map(Map<String, dynamic>.from)
            .toList(growable: false);
      }
    }
    return const <Map<String, dynamic>>[];
  }

  static List<double?> numList(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v is List) {
        return v.map<double?>((dynamic e) {
          if (e is num) return e.toDouble();
          if (e is String) return double.tryParse(e.trim());
          return null;
        }).toList(growable: false);
      }
    }
    return const <double?>[];
  }

  static List<String> strList(Map<String, dynamic> json, List<String> keys) {
    for (final key in keys) {
      final dynamic v = json[key];
      if (v is List) {
        return v
            .map<String>((dynamic e) => e?.toString() ?? '')
            .toList(growable: false);
      }
    }
    return const <String>[];
  }
}
