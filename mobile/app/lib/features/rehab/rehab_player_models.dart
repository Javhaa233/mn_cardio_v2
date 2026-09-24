import '../../core/util/json_read.dart';

/// Дасгалын тоглуулагчийн өгөгдөл — `GET /api/patient/rehab/today` болон
/// дасгалын бүртгэлийн хариу (API.md §2.7c).
///
/// Тооцоолол (зорилтот пульс, өдрийн минут, түгжээ) бүгд серверт хийгдэнэ —
/// энд зөвхөн уншина.

/// Медиагийн байршил. `MediaRef`-ийг клиент хэзээ ч задлахгүй (API.md §2.7b).
class RehabMedia {
  const RehabMedia({this.kind, this.url});

  /// `file` | `url` | `asset` | null.
  final String? kind;

  /// Татаж болох зам. null бол бичлэг хараахан байхгүй.
  final String? url;

  bool get isAvailable => (url ?? '').isNotEmpty;

  static const RehabMedia none = RehabMedia();

  factory RehabMedia.fromJson(Map<String, dynamic>? json) {
    if (json == null) return none;
    return RehabMedia(
      kind: J.str(json, <String>['kind']),
      url: J.str(json, <String>['url']),
    );
  }
}

/// Хөдөлгөөний явцад гарах мессеж (API.md §2.7c "Cues").
///
///   atSec 0      — хөдөлгөөний ажил эхлэхэд, зөвхөн 1-р сетэд
///   atSec N > 0  — ажлын N дахь секундэд, сет бүрт (цагаар хийх үед)
///   atSet N      — N-р сетийн ажил эхлэхэд
///
/// Сервер шалгаад эрэмбэлсэн ирнэ; апп [cueVisibleSec] секунд харуулна.
class RehabCue {
  const RehabCue({required this.text, this.atSec, this.atSet});

  final String text;
  final int? atSec;
  final int? atSet;

  bool get isSet => atSet != null;
  bool get isStart => atSet == null && (atSec ?? 0) == 0;

  static RehabCue? fromJson(Map<String, dynamic> json) {
    final text = J.str(json, <String>['Text']);
    if (text == null || text.trim().isEmpty) return null;
    return RehabCue(
      text: text.trim(),
      atSec: J.intOf(json, <String>['AtSec']),
      atSet: J.intOf(json, <String>['AtSet']),
    );
  }
}

/// Мессеж дэлгэц дээр хэдэн секунд харагдах (вэбийн урьдчилан харалттай ижил).
const int cueVisibleSec = 4;

/// Нэг давтагдах бичлэг — дасгалын жагсаалтын нэг хөдөлгөөн.
class RehabMovement {
  const RehabMovement({
    required this.id,
    required this.name,
    required this.steps,
    required this.prepSec,
    required this.media,
    required this.thumb,
    this.exerciseId,
    this.workSec,
    this.reps,
    this.restSec,
    this.loopStartMs,
    this.loopEndMs,
    this.sets = 1,
    this.setRestSec,
    this.warning,
    this.cues = const <RehabCue>[],
  });

  final int id;
  final int? exerciseId;
  final String name;
  final List<String> steps;

  /// Цагаар хийх бол секунд, тоогоор хийх бол [reps] — хөдөлгөөн бүрт тус тусдаа.
  final int? workSec;
  final int? reps;

  /// "Дараагийн дасгал" урьдчилан харах хугацаа, хамгийн багадаа 10.
  final int prepSec;
  final int? restSec;

  /// Сетийн тоо (≥ 1) ба сет хоорондын амралт. Хуучин сервер илгээхгүй бол 1.
  final int sets;
  final int? setRestSec;

  /// Бэлтгэлийн дэлгэц дээрх улаан анхааруулга.
  final String? warning;
  final List<RehabCue> cues;

  /// Бүтэн бичлэгийн хэсгийг давтах үед (жишээ бичлэг).
  final int? loopStartMs;
  final int? loopEndMs;

  final RehabMedia media;
  final RehabMedia thumb;

  bool get isCounted => (workSec ?? 0) <= 0 && (reps ?? 0) > 0;
  bool get hasSegment =>
      loopStartMs != null && loopEndMs != null && loopEndMs! > loopStartMs!;

  factory RehabMovement.fromJson(Map<String, dynamic> json) {
    final loop = J.obj(json, <String>['loop']);
    return RehabMovement(
      id: J.intOf(json, <String>['Id']) ?? 0,
      exerciseId: J.intOf(json, <String>['ExerciseId']),
      name: J.strOr(json, <String>['Name'], fallback: 'Дасгал'),
      steps: J.strList(json, <String>['Steps']),
      workSec: J.intOf(json, <String>['WorkSec']),
      reps: J.intOf(json, <String>['Reps']),
      prepSec: (J.intOf(json, <String>['PrepSec']) ?? 10).clamp(10, 600),
      restSec: J.intOf(json, <String>['RestSec']),
      sets: (J.intOf(json, <String>['Sets']) ?? 1).clamp(1, 20),
      setRestSec: J.intOf(json, <String>['SetRestSec']),
      warning: _nonEmpty(J.str(json, <String>['Warning'])),
      cues: J
          .list(json, <String>['Cues'])
          .map(RehabCue.fromJson)
          .whereType<RehabCue>()
          .toList(growable: false),
      loopStartMs: loop == null ? null : J.intOf(loop, <String>['startMs']),
      loopEndMs: loop == null ? null : J.intOf(loop, <String>['endMs']),
      media: RehabMedia.fromJson(J.obj(json, <String>['media'])),
      thumb: RehabMedia.fromJson(J.obj(json, <String>['thumb'])),
    );
  }
}

/// Хөтөлбөрийн өдрийн нэг хэсэг.
class RehabBlock {
  const RehabBlock({
    required this.id,
    required this.title,
    required this.kind,
    required this.locked,
    required this.movements,
    required this.thumb,
    this.orderNo,
    this.durationSec,
    this.unlocksOnDay,
    this.checkInEverySec,
    this.guideText,
    this.exerciseId,
    this.exerciseName,
    this.exerciseWarning,
  });

  final int id;
  final int? orderNo;
  final String title;

  /// `video` | `timed` | `vitals` | `image`.
  final String kind;
  final bool locked;
  final int? unlocksOnDay;
  final int? durationSec;
  final int? checkInEverySec;
  final String? guideText;
  final int? exerciseId;
  final String? exerciseName;

  /// Дасгалын анхааруулга — эхний хөдөлгөөний өмнө нэг удаа.
  final String? exerciseWarning;
  final RehabMedia thumb;
  final List<RehabMovement> movements;

  bool get isVideo => kind == 'video';
  bool get isTimed => kind == 'timed';
  bool get isVitals => kind == 'vitals';
  bool get isImage => kind == 'image';

  List<String> get guideLines => (guideText ?? '')
      .split('\n')
      .map((String s) => s.trim())
      .where((String s) => s.isNotEmpty)
      .toList(growable: false);

  factory RehabBlock.fromJson(Map<String, dynamic> json) {
    final ex = J.obj(json, <String>['Exercise']);
    return RehabBlock(
      id: J.intOf(json, <String>['Id']) ?? 0,
      orderNo: J.intOf(json, <String>['OrderNo']),
      title: J.strOr(json, <String>['Title'], fallback: 'Дасгал'),
      kind: J.strOr(json, <String>['Kind'], fallback: 'video'),
      locked: J.boolOf(json, <String>['Locked']),
      unlocksOnDay: J.intOf(json, <String>['UnlocksOnDay']),
      durationSec: J.intOf(json, <String>['DurationSec']),
      checkInEverySec: J.intOf(json, <String>['CheckInEverySec']),
      guideText: J.str(json, <String>['GuideText']),
      exerciseId: ex == null ? null : J.intOf(ex, <String>['Id']),
      exerciseName: ex == null ? null : J.str(ex, <String>['Name']),
      exerciseWarning:
          ex == null ? null : _nonEmpty(J.str(ex, <String>['Warning'])),
      thumb: RehabMedia.fromJson(J.obj(json, <String>['thumb'])),
      movements: J
          .list(json, <String>['Movements'])
          .map(RehabMovement.fromJson)
          .toList(growable: false),
    );
  }
}

/// Эмчийн оноосон хөтөлбөр.
class RehabPlanInfo {
  const RehabPlanInfo({
    required this.id,
    required this.programCode,
    required this.programName,
    required this.hasHrTarget,
    this.dayNo,
    this.startDate,
    this.intensityPct,
    this.notes,
  });

  final int id;
  final String programCode;
  final String programName;
  final bool hasHrTarget;
  final int? dayNo;
  final DateTime? startDate;
  final double? intensityPct;
  final String? notes;

  factory RehabPlanInfo.fromJson(Map<String, dynamic> json) {
    final program = J.obj(json, <String>['Program']) ?? <String, dynamic>{};
    return RehabPlanInfo(
      id: J.intOf(json, <String>['Id']) ?? 0,
      dayNo: J.intOf(json, <String>['DayNo']),
      startDate: J.date(json, <String>['StartDate']),
      intensityPct: J.dbl(json, <String>['IntensityPct']),
      notes: J.str(json, <String>['Notes']),
      programCode: J.strOr(program, <String>['Code'], fallback: ''),
      programName: J.strOr(program, <String>['Name'], fallback: 'Хөтөлбөр'),
      hasHrTarget: J.boolOf(program, <String>['HasHrTarget']),
    );
  }
}

/// Долоо хоногийн туузны нэг өдөр.
class RehabWeekDay {
  const RehabWeekDay({required this.date, required this.done, this.dayNo});

  final DateTime date;
  final int? dayNo;
  final bool done;

  factory RehabWeekDay.fromJson(Map<String, dynamic> json) => RehabWeekDay(
        date: J.date(json, <String>['date']) ?? DateTime.now(),
        dayNo: J.intOf(json, <String>['dayNo']),
        done: J.boolOf(json, <String>['done']),
      );
}

/// Өнөөдрийн хөтөлбөр бүхэлдээ.
class RehabToday {
  const RehabToday({
    required this.plan,
    required this.blocks,
    required this.streak,
    required this.week,
    required this.doneToday,
    required this.notStarted,
    this.age,
    this.maxHr,
    this.lastRestingHr,
  });

  final RehabPlanInfo? plan;
  final List<RehabBlock> blocks;
  final int streak;
  final List<RehabWeekDay> week;
  final bool doneToday;
  final bool notStarted;
  final int? age;
  final int? maxHr;
  final int? lastRestingHr;

  bool get hasPlan => plan != null;

  List<RehabBlock> get openBlocks =>
      blocks.where((RehabBlock b) => !b.locked).toList(growable: false);

  /// Өнөөдрийн нийт минут (түгжээгүй хэсгүүд).
  int get totalMinutes {
    var sec = 0;
    for (final b in openBlocks) {
      sec += b.durationSec ?? 0;
    }
    return (sec / 60).round();
  }

  static const RehabToday empty = RehabToday(
    plan: null,
    blocks: <RehabBlock>[],
    streak: 0,
    week: <RehabWeekDay>[],
    doneToday: false,
    notStarted: false,
  );

  factory RehabToday.fromJson(Map<String, dynamic> json) {
    final plan = J.obj(json, <String>['plan']);
    final hr = J.obj(json, <String>['hr']) ?? <String, dynamic>{};
    return RehabToday(
      plan: plan == null ? null : RehabPlanInfo.fromJson(plan),
      blocks: J
          .list(json, <String>['blocks'])
          .map(RehabBlock.fromJson)
          .toList(growable: false),
      streak: J.intOf(json, <String>['streak']) ?? 0,
      week: J
          .list(json, <String>['week'])
          .map(RehabWeekDay.fromJson)
          .toList(growable: false),
      doneToday: J.boolOf(json, <String>['doneToday']),
      notStarted: J.boolOf(json, <String>['notStarted']),
      age: J.intOf(hr, <String>['age']),
      maxHr: J.intOf(hr, <String>['maxHr']),
      lastRestingHr: J.intOf(hr, <String>['lastRestingHr']),
    );
  }
}

/// `POST /rehab/sessions`-ийн хариу. Зорилтот пульсыг сервер хадгална.
class RehabSessionStart {
  const RehabSessionStart({
    required this.id,
    this.dayNo,
    this.restingHr,
    this.maxHr,
    this.targetHr,
    this.warning,
  });

  final int id;
  final int? dayNo;
  final int? restingHr;
  final int? maxHr;
  final int? targetHr;
  final String? warning;

  factory RehabSessionStart.fromJson(Map<String, dynamic> json) =>
      RehabSessionStart(
        id: J.intOf(json, <String>['Id']) ?? 0,
        dayNo: J.intOf(json, <String>['DayNo']),
        restingHr: J.intOf(json, <String>['RestingHr']),
        maxHr: J.intOf(json, <String>['MaxHr']),
        targetHr: J.intOf(json, <String>['TargetHr']),
        warning: J.str(json, <String>['Warning']),
      );
}

/// Зорилтот пульстай харьцуулсан бүс.
enum HrZone { above, inRange, below }

HrZone? hrZoneOf(String? code) {
  switch (code) {
    case 'above':
      return HrZone.above;
    case 'in':
      return HrZone.inRange;
    case 'below':
      return HrZone.below;
  }
  return null;
}

/// Клиент талын бүсийн тооцоо — офлайн үед серверийн дүрмийг давтана
/// (`helper/RehabDose.js` Zone: дээш бол above, 5-аас их доош бол below).
HrZone? hrZoneLocal(int? pulse, int? target) {
  if (pulse == null || target == null || pulse <= 0 || target <= 0) return null;
  if (pulse > target) return HrZone.above;
  if (pulse < target - 5) return HrZone.below;
  return HrZone.inRange;
}

/// Дасгалын явцын нэг хэмжилт.
class RehabCheckin {
  const RehabCheckin({required this.atSec, this.pulse, this.borg, this.zone});

  final int atSec;
  final int? pulse;

  /// CR10 (0–10).
  final int? borg;
  final HrZone? zone;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'AtSec': atSec,
        if (pulse != null) 'Pulse': pulse,
        if (borg != null) 'Borg': borg,
      };

  factory RehabCheckin.fromJson(Map<String, dynamic> json) => RehabCheckin(
        atSec: J.intOf(json, <String>['AtSec']) ?? 0,
        pulse: J.intOf(json, <String>['Pulse']),
        borg: J.intOf(json, <String>['Borg']),
        zone: hrZoneOf(J.str(json, <String>['Zone'])),
      );
}

/// Дуусгах хүсэлт — алдвал дараа дахин илгээхээр хадгалагдана.
class RehabFinishDraft {
  const RehabFinishDraft({
    required this.sessionId,
    required this.status,
    required this.durationSec,
    required this.completedBlocks,
    required this.skippedMovements,
    required this.checkins,
    required this.completedExerciseIds,
    this.symptoms = const <String>[],
    this.note,
  });

  final int sessionId;

  /// `completed` | `stopped` | `abandoned`.
  final String status;
  final int durationSec;
  final int completedBlocks;
  final int skippedMovements;
  final List<RehabCheckin> checkins;
  final List<int> completedExerciseIds;
  final List<String> symptoms;
  final String? note;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'Status': status,
        'DurationSec': durationSec,
        'CompletedBlocks': completedBlocks,
        'SkippedMovements': skippedMovements,
        'Checkins': checkins.map((RehabCheckin c) => c.toJson()).toList(),
        'CompletedExerciseIds': completedExerciseIds,
        if (status == 'stopped')
          'StopReason': <String, dynamic>{
            'symptoms': symptoms,
            if (note != null && note!.trim().isNotEmpty) 'note': note!.trim(),
          },
      };

  Map<String, dynamic> toStorage() =>
      <String, dynamic>{'sessionId': sessionId, 'body': toJson()};
}

/// Дууссан дасгалын дэлгэрэнгүй.
class RehabSessionDetail {
  const RehabSessionDetail({
    required this.id,
    required this.status,
    required this.checkins,
    this.dayNo,
    this.startedAt,
    this.durationSec,
    this.restingHr,
    this.targetHr,
    this.completedBlocks,
    this.skippedMovements,
    this.symptoms = const <String>[],
  });

  final int id;
  final String status;
  final int? dayNo;
  final DateTime? startedAt;
  final int? durationSec;
  final int? restingHr;
  final int? targetHr;
  final int? completedBlocks;
  final int? skippedMovements;
  final List<String> symptoms;
  final List<RehabCheckin> checkins;

  int? get averagePulse {
    final values = checkins
        .map((RehabCheckin c) => c.pulse)
        .whereType<int>()
        .toList(growable: false);
    if (values.isEmpty) return null;
    return (values.reduce((int a, int b) => a + b) / values.length).round();
  }

  int? get maxBorg {
    final values =
        checkins.map((RehabCheckin c) => c.borg).whereType<int>().toList();
    if (values.isEmpty) return null;
    return values.reduce((int a, int b) => a > b ? a : b);
  }

  factory RehabSessionDetail.fromJson(Map<String, dynamic> json) {
    final stop = J.obj(json, <String>['StopReason']);
    return RehabSessionDetail(
      id: J.intOf(json, <String>['Id']) ?? 0,
      status: J.strOr(json, <String>['Status'], fallback: 'started'),
      dayNo: J.intOf(json, <String>['DayNo']),
      startedAt: J.date(json, <String>['StartedAt']),
      durationSec: J.intOf(json, <String>['DurationSec']),
      restingHr: J.intOf(json, <String>['RestingHr']),
      targetHr: J.intOf(json, <String>['TargetHr']),
      completedBlocks: J.intOf(json, <String>['CompletedBlocks']),
      skippedMovements: J.intOf(json, <String>['SkippedMovements']),
      symptoms: stop == null
          ? const <String>[]
          : J.strList(stop, <String>['symptoms']),
      checkins: J
          .list(json, <String>['Checkins'])
          .map(RehabCheckin.fromJson)
          .toList(growable: false),
    );
  }
}

/// Зогсоох үеийн шинж тэмдгийн жагсаалт. Код нь серверийн `STOP_SYMPTOMS`.
const List<MapEntry<String, String>> rehabStopSymptoms =
    <MapEntry<String, String>>[
  MapEntry<String, String>('chest_pain', 'Цээж өвдөх, шахах'),
  MapEntry<String, String>('dizzy', 'Толгой эргэх'),
  MapEntry<String, String>('breathless', 'Амьсгаадах'),
  MapEntry<String, String>('palpitations', 'Зүрх хүчтэй дэлсэх'),
  MapEntry<String, String>('nausea', 'Дотор муухайрах'),
  MapEntry<String, String>('other', 'Бусад'),
];

/// CR10 ачааллын мэдрэмжийн үнэлгээний тайлбар.
///
/// Хэллэг нь CR10-ийн түгээмэл монгол орчуулга; эцсийн үгийг сэргээн засах эмч
/// нар батална.
const List<String> cr10Labels = <String>[
  'Огт ачаалалгүй',
  'Маш хөнгөн',
  'Хөнгөн',
  'Дунд зэрэг',
  'Бага зэрэг хүнд',
  'Хүнд',
  'Хүнд',
  'Маш хүнд',
  'Маш хүнд',
  'Маш хүнд',
  'Хамгийн хүнд',
];

String? _nonEmpty(String? v) =>
    v == null || v.trim().isEmpty ? null : v.trim();
