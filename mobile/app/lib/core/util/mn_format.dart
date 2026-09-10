import 'package:intl/intl.dart';

/// Огноо, тоо, хугацааг монгол хэлбэрээр бичих.
///
/// Огноог `yyyy.MM.dd` гэсэн тодорхой загвараар бичнэ — эмнэлгийн баримтад
/// хэрэглэгддэг хэлбэр бөгөөд `intl`-ийн локалиас хамааралгүй тул төхөөрөмжийн
/// хэлний тохиргоо солигдоход өөрчлөгдөхгүй.
class MnFormat {
  MnFormat._();

  static const List<String> monthNames = <String>[
    'Нэгдүгээр сар',
    'Хоёрдугаар сар',
    'Гуравдугаар сар',
    'Дөрөвдүгээр сар',
    'Тавдугаар сар',
    'Зургаадугаар сар',
    'Долоодугаар сар',
    'Наймдугаар сар',
    'Есдүгээр сар',
    'Аравдугаар сар',
    'Арван нэгдүгээр сар',
    'Арван хоёрдугаар сар',
  ];

  static const List<String> weekdayNames = <String>[
    'Даваа',
    'Мягмар',
    'Лхагва',
    'Пүрэв',
    'Баасан',
    'Бямба',
    'Ням',
  ];

  static final DateFormat _date = DateFormat('yyyy.MM.dd');
  static final DateFormat _dateTime = DateFormat('yyyy.MM.dd HH:mm');
  static final DateFormat _time = DateFormat('HH:mm');
  static final DateFormat _apiDate = DateFormat('yyyy-MM-dd');

  /// `2026.09.10`
  static String date(DateTime? value) =>
      value == null ? '—' : _date.format(value.toLocal());

  /// `2026.09.10 14:30`
  static String dateTime(DateTime? value) =>
      value == null ? '—' : _dateTime.format(value.toLocal());

  /// `14:30`
  static String time(DateTime? value) =>
      value == null ? '—' : _time.format(value.toLocal());

  /// Сервер рүү илгээх огнооны хэлбэр (`yyyy-MM-dd`).
  static String apiDate(DateTime value) => _apiDate.format(value);

  /// `Есдүгээр сарын 10, Пүрэв`
  static String longDate(DateTime value) {
    final local = value.toLocal();
    final month = monthNames[local.month - 1];
    final weekday = weekdayNames[local.weekday - 1];
    return '$month-ын ${local.day}, $weekday';
  }

  /// Өнөөдөр / өчигдөр гэх мэт ойлгомжтой бичиглэл, эс бөгөөс огноо.
  static String friendlyDate(DateTime? value) {
    if (value == null) return '—';
    final local = value.toLocal();
    final now = DateTime.now();
    final days = _dayDiff(now, local);
    if (days == 0) return 'Өнөөдөр';
    if (days == 1) return 'Өчигдөр';
    if (days == 2) return 'Уржигдар';
    if (days > 0 && days < 7) return '$days хоногийн өмнө';
    return date(local);
  }

  /// Жагсаалтын мөрөнд тохирсон "хэзээ" — өнөөдөр бол цаг, эс бөгөөс огноо.
  static String friendlyDateTime(DateTime? value) {
    if (value == null) return '—';
    final local = value.toLocal();
    final days = _dayDiff(DateTime.now(), local);
    if (days == 0) return time(local);
    if (days == 1) return 'Өчигдөр ${time(local)}';
    if (days > 0 && days < 7) return '$days хоногийн өмнө';
    return dateTime(local);
  }

  static int _dayDiff(DateTime now, DateTime other) {
    final a = DateTime(now.year, now.month, now.day);
    final b = DateTime(other.year, other.month, other.day);
    return a.difference(b).inDays;
  }

  /// Хугацааг `12 мин 30 сек` хэлбэрээр.
  static String duration(int? seconds) {
    if (seconds == null || seconds <= 0) return '—';
    final minutes = seconds ~/ 60;
    final rest = seconds % 60;
    if (minutes == 0) return '$rest сек';
    if (rest == 0) return '$minutes мин';
    return '$minutes мин $rest сек';
  }

  /// Аравтын тоог илүүдэл тэггүйгээр.
  static String number(num? value, {int decimals = 1}) {
    if (value == null) return '—';
    if (value == value.roundToDouble()) return value.round().toString();
    return value.toStringAsFixed(decimals);
  }

  /// Файлын хэмжээ.
  static String fileSize(int? bytes) {
    if (bytes == null || bytes <= 0) return '—';
    const units = <String>['Б', 'КБ', 'МБ', 'ГБ'];
    var size = bytes.toDouble();
    var unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return '${size.toStringAsFixed(unit == 0 ? 0 : 1)} ${units[unit]}';
  }

  /// Нас — `p_age` талбар хоосон үед төрсөн огноогоор тооцно.
  static int? ageFrom(DateTime? birthday) {
    if (birthday == null) return null;
    final now = DateTime.now();
    var age = now.year - birthday.year;
    final hadBirthday = now.month > birthday.month ||
        (now.month == birthday.month && now.day >= birthday.day);
    if (!hadBirthday) age -= 1;
    return age < 0 ? null : age;
  }

  /// Сервер талаас ирэх огноог задлах. Хоосон, буруу утгыг `null` болгоно.
  static DateTime? parseDate(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is int) return DateTime.fromMillisecondsSinceEpoch(value);
    if (value is String) {
      final trimmed = value.trim();
      if (trimmed.isEmpty) return null;
      return DateTime.tryParse(trimmed);
    }
    return null;
  }
}
