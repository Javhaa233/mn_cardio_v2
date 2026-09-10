import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';

/// 2.2 Миний тэмдэглэл — өдөр тутмын эрүүл мэндийн бүртгэлийн нэг мөр.
class JournalEntry {
  const JournalEntry({
    required this.idData,
    this.date,
    this.time,
    this.systolic,
    this.diastolic,
    this.pulse,
    this.weight,
    this.inr,
    this.comment,
  });

  final int idData;
  final DateTime? date;
  final String? time;

  /// `blood_pressure` — дээд (систол) даралт.
  final num? systolic;

  /// `blood_pressure2` — доод (диастол) даралт.
  ///
  /// Уншихад ирдэг ба графикт зурагддаг боловч **үүсгэхэд сервер хүлээж
  /// авдаггүй** (READINESS.md §2.9). Backend засагдтал шинэ бичлэг дээр хоосон
  /// байна.
  final num? diastolic;

  final num? pulse;
  final num? weight;
  final num? inr;
  final String? comment;

  bool get hasBloodPressure => systolic != null || diastolic != null;

  /// `120/80` эсвэл зөвхөн нэг утга.
  String get bloodPressureLabel {
    if (systolic == null && diastolic == null) return '—';
    if (diastolic == null) return MnFormat.number(systolic, decimals: 0);
    if (systolic == null) return '—/${MnFormat.number(diastolic, decimals: 0)}';
    return '${MnFormat.number(systolic, decimals: 0)}/'
        '${MnFormat.number(diastolic, decimals: 0)}';
  }

  /// Огноо ба цагийг нэгтгэсэн харагдац.
  String get whenLabel {
    final d = MnFormat.date(date);
    final t = (time ?? '').trim();
    if (t.isEmpty) return d;
    return '$d $t';
  }

  bool get isEmptyReading =>
      systolic == null &&
      diastolic == null &&
      pulse == null &&
      weight == null &&
      inr == null;

  factory JournalEntry.fromJson(Map<String, dynamic> json) => JournalEntry(
        idData: J.intOf(json, <String>['id_data', 'Id']) ?? 0,
        date: J.date(json, <String>['date']),
        time: J.str(json, <String>['time']),
        systolic: J.dbl(json, <String>['blood_pressure']),
        diastolic: J.dbl(json, <String>['blood_pressure2']),
        pulse: J.dbl(json, <String>['pulse']),
        weight: J.dbl(json, <String>['weight']),
        inr: J.dbl(json, <String>['inr']),
        comment: J.str(json, <String>['comment']),
      );
}

/// `GET /api/patient/journal/summary` — график зурахад бэлэн цуваа.
///
/// Сервер тал огноогоор эрэмбэлж, 365 цэгээр хязгаарлаж өгдөг тул клиент тал
/// зөвхөн зурна.
class JournalSummary {
  const JournalSummary({
    required this.labels,
    required this.systolic,
    required this.diastolic,
    required this.pulse,
    required this.weight,
  });

  final List<String> labels;
  final List<double?> systolic;
  final List<double?> diastolic;
  final List<double?> pulse;
  final List<double?> weight;

  bool get isEmpty => labels.isEmpty;

  bool get hasBloodPressure =>
      systolic.any((double? v) => v != null) ||
      diastolic.any((double? v) => v != null);

  bool get hasPulse => pulse.any((double? v) => v != null);

  bool get hasWeight => weight.any((double? v) => v != null);

  static const JournalSummary empty = JournalSummary(
    labels: <String>[],
    systolic: <double?>[],
    diastolic: <double?>[],
    pulse: <double?>[],
    weight: <double?>[],
  );

  factory JournalSummary.fromJson(Map<String, dynamic> json) {
    final series = J.obj(json, <String>['series']) ?? <String, dynamic>{};
    return JournalSummary(
      labels: J.strList(json, <String>['labels']),
      systolic: J.numList(series, <String>['blood_pressure']),
      diastolic: J.numList(series, <String>['blood_pressure2']),
      pulse: J.numList(series, <String>['pulse']),
      weight: J.numList(series, <String>['weight']),
    );
  }
}

/// Шинэ тэмдэглэл үүсгэх өгөгдөл.
class JournalDraft {
  const JournalDraft({
    required this.date,
    this.time,
    this.systolic,
    this.diastolic,
    this.pulse,
    this.weight,
    this.inr,
    this.comment,
  });

  final DateTime date;
  final String? time;
  final num? systolic;
  final num? diastolic;
  final num? pulse;
  final num? weight;
  final num? inr;
  final String? comment;

  /// Сервер рүү илгээх бие.
  ///
  /// `blood_pressure2`-ыг мөн илгээж байгаа нь санаатай: backend түүнийг
  /// хүлээн авах болмогц (READINESS.md §2.9 — нэг мөрийн засвар) апп талд
  /// өөрчлөлт хийхгүйгээр ажиллана. Одоогоор сервер үл тоомсорлоно.
  Map<String, dynamic> toJson() => <String, dynamic>{
        'date': MnFormat.apiDate(date),
        if (time != null && time!.trim().isNotEmpty) 'time': time!.trim(),
        if (systolic != null) 'blood_pressure': systolic,
        if (diastolic != null) 'blood_pressure2': diastolic,
        if (pulse != null) 'pulse': pulse,
        if (weight != null) 'weight': weight,
        if (inr != null) 'inr': inr,
        if (comment != null && comment!.trim().isNotEmpty)
          'comment': comment!.trim(),
      };
}
