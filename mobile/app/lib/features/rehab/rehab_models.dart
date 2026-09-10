import '../../core/util/json_read.dart';

/// Дасгалын каталогийн нэг мөр.
class RehabExercise {
  const RehabExercise({
    required this.id,
    required this.name,
    this.code,
    this.description,
    this.categoryCode,
    this.durationSec,
    this.orderNo,
    this.mediaRef,
  });

  final int id;
  final String name;
  final String? code;
  final String? description;
  final String? categoryCode;
  final int? durationSec;
  final int? orderNo;

  /// 39 дасгалын видеоны байршил.
  ///
  /// Одоогоор **видео дамжуулах суваг байхгүй** — файлын давхарга нь `POST` +
  /// `Content-Disposition: attachment` хэлбэрээр өгдөг бөгөөд үүнийг ямар ч
  /// тоглуулагч урсгалаар тоглуулж чадахгүй (READINESS.md §2.4). Утгыг
  /// дамжуулж авч байгаа нь шийдвэр гармагц клиент талд бэлэн байхын тулд.
  final String? mediaRef;

  bool get hasMedia => (mediaRef ?? '').trim().isNotEmpty;

  factory RehabExercise.fromJson(Map<String, dynamic> json) => RehabExercise(
        id: J.intOf(json, <String>['Id', 'id']) ?? 0,
        name: J.strOr(json, <String>['Name', 'name'], fallback: 'Дасгал'),
        code: J.str(json, <String>['Code', 'code']),
        description: J.str(json, <String>['Description', 'description']),
        categoryCode: J.str(json, <String>['CategoryCode', 'categoryCode']),
        durationSec: J.intOf(json, <String>['DurationSec', 'durationSec']),
        orderNo: J.intOf(json, <String>['OrderNo', 'orderNo']),
        mediaRef: J.str(json, <String>['MediaRef', 'mediaRef']),
      );
}

/// Гүйцэтгэлийн тэмдэглэгээ.
class RehabProgress {
  const RehabProgress({
    required this.id,
    required this.exerciseId,
    this.completedAt,
    this.durationSec,
    this.notes,
  });

  final int id;
  final int exerciseId;
  final DateTime? completedAt;
  final int? durationSec;
  final String? notes;

  factory RehabProgress.fromJson(Map<String, dynamic> json) => RehabProgress(
        id: J.intOf(json, <String>['Id', 'id']) ?? 0,
        exerciseId: J.intOf(json, <String>['ExerciseId', 'exerciseId']) ?? 0,
        completedAt: J.date(json, <String>['CompletedAt', 'completedAt']),
        durationSec: J.intOf(json, <String>['DurationSec', 'durationSec']),
        notes: J.str(json, <String>['Notes', 'notes']),
      );
}

/// Дасгалын үеийн амин үзүүлэлтийн нэг хэмжилт (Шаардлага §44).
class RehabVital {
  const RehabVital({
    required this.id,
    this.measuredAt,
    this.phase,
    this.pulse,
    this.bloodPressure,
    this.spo2,
    this.borg,
  });

  final int id;
  final DateTime? measuredAt;

  /// Дасгалын өмнө / үеэр / дараа.
  final String? phase;

  final int? pulse;
  final String? bloodPressure;
  final int? spo2;

  /// Боргийн ачааллын мэдрэмжийн үнэлгээ (6–20).
  final int? borg;

  String get phaseLabel => rehabPhaseLabel(phase);

  factory RehabVital.fromJson(Map<String, dynamic> json) => RehabVital(
        id: J.intOf(json, <String>['Id', 'id']) ?? 0,
        measuredAt: J.date(json, <String>['MeasuredAt', 'measuredAt']),
        phase: J.str(json, <String>['Phase', 'phase']),
        pulse: J.intOf(json, <String>['Pulse', 'pulse']),
        bloodPressure: J.str(json, <String>['BloodPressure', 'bloodPressure']),
        spo2: J.intOf(json, <String>['Spo2', 'spo2']),
        borg: J.intOf(json, <String>['Borg', 'borg']),
      );
}

/// Дасгалын үе шатны код → монгол нэр.
///
/// `dico` утгууд ЗСҮТ-өөс батлагдаагүй байгаа (BLOCKERS.md §6) тул кодыг
/// таньж чадвал монголоор, эс чадвал байгаагаар нь харуулна.
String rehabPhaseLabel(String? phase) {
  final value = (phase ?? '').trim().toLowerCase();
  switch (value) {
    case 'before':
    case 'pre':
      return 'Дасгалын өмнө';
    case 'during':
    case 'mid':
      return 'Дасгалын үеэр';
    case 'after':
    case 'post':
      return 'Дасгалын дараа';
    case '':
      return 'Хэмжилт';
    default:
      return phase!.trim();
  }
}

/// Амин үзүүлэлтийн хариу — мөрүүд ба графикийн цуваа хамт ирнэ.
class RehabVitalsBundle {
  const RehabVitalsBundle({
    required this.rows,
    required this.labels,
    required this.pulse,
    required this.spo2,
  });

  final List<RehabVital> rows;
  final List<String> labels;
  final List<double?> pulse;
  final List<double?> spo2;

  bool get isEmpty => rows.isEmpty;

  static const RehabVitalsBundle empty = RehabVitalsBundle(
    rows: <RehabVital>[],
    labels: <String>[],
    pulse: <double?>[],
    spo2: <double?>[],
  );

  factory RehabVitalsBundle.fromJson(Map<String, dynamic> json) {
    final series = J.obj(json, <String>['series']) ?? <String, dynamic>{};
    return RehabVitalsBundle(
      rows: J
          .list(json, <String>['rows'])
          .map(RehabVital.fromJson)
          .toList(growable: false),
      labels: J.strList(json, <String>['labels']),
      pulse: J.numList(series, <String>['pulse']),
      spo2: J.numList(series, <String>['spo2']),
    );
  }
}

/// Эрсдэлийн үнэлгээ ба ачаалал даах чадварын үнэлгээ (Шаардлага §43).
///
/// Эмч бүртгэдэг, үйлчлүүлэгч зөвхөн уншина. Оноог **клиент тал тооцохгүй**.
class RehabAssessment {
  const RehabAssessment({
    required this.id,
    this.assessmentDate,
    this.riskLevel,
    this.toleranceScore,
    this.toleranceUnit,
    this.notes,
  });

  final int id;
  final DateTime? assessmentDate;

  /// Эмчийн тогтоосон эрсдэлийн түвшин. Текстээр ирнэ — эх хэвээр нь харуулна.
  final String? riskLevel;

  final num? toleranceScore;
  final String? toleranceUnit;
  final String? notes;

  String get toleranceLabel {
    if (toleranceScore == null) return '—';
    final unit = (toleranceUnit ?? '').trim();
    final value = toleranceScore! == toleranceScore!.roundToDouble()
        ? toleranceScore!.round().toString()
        : toleranceScore!.toStringAsFixed(1);
    return unit.isEmpty ? value : '$value $unit';
  }

  factory RehabAssessment.fromJson(Map<String, dynamic> json) =>
      RehabAssessment(
        id: J.intOf(json, <String>['Id', 'id']) ?? 0,
        assessmentDate: J.date(json, <String>['AssessmentDate']),
        riskLevel: J.str(json, <String>['RiskLevel']),
        toleranceScore: J.dbl(json, <String>['ToleranceScore']),
        toleranceUnit: J.str(json, <String>['ToleranceUnit']),
        notes: J.str(json, <String>['Notes']),
      );
}

/// Шинэ амин үзүүлэлт бүртгэх өгөгдөл.
class RehabVitalDraft {
  const RehabVitalDraft({
    this.exerciseId,
    this.phase,
    this.pulse,
    this.bloodPressure,
    this.spo2,
    this.borg,
    this.notes,
  });

  final int? exerciseId;
  final String? phase;
  final int? pulse;
  final String? bloodPressure;
  final int? spo2;
  final int? borg;
  final String? notes;

  Map<String, dynamic> toJson() => <String, dynamic>{
        if (exerciseId != null) 'ExerciseId': exerciseId,
        if (phase != null && phase!.isNotEmpty) 'Phase': phase,
        if (pulse != null) 'Pulse': pulse,
        if (bloodPressure != null && bloodPressure!.trim().isNotEmpty)
          'BloodPressure': bloodPressure!.trim(),
        if (spo2 != null) 'Spo2': spo2,
        if (borg != null) 'Borg': borg,
        if (notes != null && notes!.trim().isNotEmpty) 'Notes': notes!.trim(),
      };
}
