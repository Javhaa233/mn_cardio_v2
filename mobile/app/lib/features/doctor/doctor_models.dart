import 'dart:convert';
import 'dart:typed_data';

import '../../core/network/envelope.dart';
import '../../core/util/json_read.dart';
import '../../shared/widgets/attachment_view.dart';
import '../../core/util/mn_format.dart';
import '../journal/journal_entry.dart';

/// Нэг объект дээрх эрх — `GET /api/doctor/me`-ийн `permissions`.
class DoctorPermission {
  const DoctorPermission({
    required this.object,
    this.create = true,
    this.read = true,
    this.update = true,
    this.delete = true,
  });

  final String object;
  final bool create;
  final bool read;
  final bool update;
  final bool delete;

  factory DoctorPermission.fromJson(Map<String, dynamic> json) =>
      DoctorPermission(
        object: J.strOr(json, <String>['object', 'Object']),
        create: J.boolOf(json, <String>['create']),
        read: J.boolOf(json, <String>['read']),
        update: J.boolOf(json, <String>['update']),
        delete: J.boolOf(json, <String>['delete']),
      );
}

/// Эмчийн өөрийн мэдээлэл — `GET /api/doctor/me`.
class DoctorMe {
  const DoctorMe({
    required this.userId,
    required this.roleId,
    required this.isAdmin,
    required this.fullName,
    this.doctorId,
    this.email,
    this.organizationName,
    this.provCityName,
    this.soumDistName,
    this.permissions = const <DoctorPermission>[],
    this.permissionMode = 'off',
  });

  final int userId;
  final String roleId;
  final bool isAdmin;
  final String fullName;
  final int? doctorId;
  final String? email;
  final String? organizationName;
  final String? provCityName;
  final String? soumDistName;

  /// Хэрэглэгч тус бүрийн эрх — Техникийн шаардлага §1.2.
  final List<DoctorPermission> permissions;

  /// `off` · `warn` · `enforce` — сервер дээрх горим.
  final String permissionMode;

  /// Тухайн үйлдэл зөвшөөрөгдсөн эсэх.
  ///
  /// **Хоосон жагсаалт нь "юу ч зөвшөөрөөгүй" биш, "тохируулаагүй"**
  /// (API.md §9.8). Эмчийн эрхийн матриц одоогоор хоосон тул хоосон дээр
  /// бүгдийг нуувал цэсгүй апп болно.
  bool can(String object, {String action = 'read'}) {
    if (permissions.isEmpty) return true;
    for (final p in permissions) {
      if (p.object.toLowerCase() != object.toLowerCase()) continue;
      return switch (action) {
        'create' => p.create,
        'update' => p.update,
        'delete' => p.delete,
        _ => p.read,
      };
    }
    // Энэ объектод дүрэм алга — хаахгүй.
    return true;
  }

  String get roleLabel {
    if (isAdmin) return 'Администратор';
    switch (roleId) {
      case '2':
      case '3':
        return 'Эмч';
      case '6':
        return 'Тохиргооны эрх';
      default:
        return 'Ажилтан';
    }
  }

  String get initials {
    final parts = fullName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '—';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  }

  String get location {
    final parts = <String>[
      if ((provCityName ?? '').trim().isNotEmpty) provCityName!.trim(),
      if ((soumDistName ?? '').trim().isNotEmpty) soumDistName!.trim(),
    ];
    return parts.join(', ');
  }

  factory DoctorMe.fromJson(Map<String, dynamic> json) {
    final profile = J.obj(json, <String>['profile']) ?? <String, dynamic>{};
    final org = J.obj(json, <String>['organization']) ?? <String, dynamic>{};

    return DoctorMe(
      userId: J.intOf(json, <String>['UserId']) ?? 0,
      roleId: J.strOr(json, <String>['RoleId']),
      isAdmin: J.boolOf(json, <String>['IsAdmin']),
      fullName: J.str(json, <String>['FullName']) ??
          J.str(profile, <String>['FullName']) ??
          'Эмч',
      doctorId: J.intOf(json, <String>['DoctorId']),
      email: J.str(profile, <String>['email']),
      organizationName: J.str(org, <String>['Name']),
      provCityName: J.str(profile, <String>['ProvCityName']) ??
          J.str(org, <String>['addr_prov_city']),
      soumDistName: J.str(profile, <String>['SoumDistName']) ??
          J.str(org, <String>['addr_soum_dist']),
      permissionMode:
          J.strOr(json, <String>['permissionMode'], fallback: 'off'),
      permissions: Envelope.asList(json['permissions'])
          .map(DoctorPermission.fromJson)
          .toList(growable: false),
    );
  }
}

/// Үзлэг, хяналт, хайлтын жагсаалтад давтагдан гарах үйлчлүүлэгчийн товч.
class PatientBrief {
  const PatientBrief({
    required this.idData,
    required this.registration,
    required this.lastName,
    required this.firstName,
    this.birthday,
    this.age,
    this.telephone,
    this.telephone2,
    this.provinceCity,
    this.soumDistrict,
    this.bagKhoroo,
  });

  final int idData;
  final String registration;
  final String lastName;
  final String firstName;
  final DateTime? birthday;
  final int? age;
  final String? telephone;
  final String? telephone2;
  final String? provinceCity;
  final String? soumDistrict;
  final String? bagKhoroo;

  String get fullName {
    final parts = <String>[
      if (lastName.trim().isNotEmpty) lastName.trim(),
      if (firstName.trim().isNotEmpty) firstName.trim(),
    ];
    return parts.isEmpty ? 'Нэр тодорхойгүй' : parts.join(' ');
  }

  String get initials {
    final f = firstName.trim();
    final l = lastName.trim();
    if (f.isNotEmpty && l.isNotEmpty) return '${l[0]}${f[0]}'.toUpperCase();
    if (f.isNotEmpty) return f[0].toUpperCase();
    if (l.isNotEmpty) return l[0].toUpperCase();
    return '—';
  }

  int? get effectiveAge => age ?? MnFormat.ageFrom(birthday);

  String get address {
    final parts = <String>[
      if ((provinceCity ?? '').trim().isNotEmpty) provinceCity!.trim(),
      if ((soumDistrict ?? '').trim().isNotEmpty) soumDistrict!.trim(),
      if ((bagKhoroo ?? '').trim().isNotEmpty) bagKhoroo!.trim(),
    ];
    return parts.join(', ');
  }

  /// Жагсаалтын мөрөнд гарах "45 настай · РД12345678".
  String get subtitle {
    final parts = <String>[
      if (effectiveAge != null) '${effectiveAge} настай',
      if (registration.trim().isNotEmpty) registration.trim(),
    ];
    return parts.join(' · ');
  }

  factory PatientBrief.fromJson(Map<String, dynamic> json) => PatientBrief(
        idData: J.intOf(json, <String>['id_data', 'PatientId']) ?? 0,
        registration: J.strOr(json, <String>['p_registration', 'PatRegNo']),
        lastName: J.strOr(json, <String>['p_lastname']),
        firstName: J.strOr(json, <String>['p_firstname']),
        birthday: J.date(json, <String>['p_birthday']),
        age: J.intOf(json, <String>['p_age']),
        telephone: J.str(json, <String>['p_telephone']),
        telephone2: J.str(json, <String>['p_telephone2']),
        provinceCity: J.str(json, <String>['addr_prov_city']),
        soumDistrict: J.str(json, <String>['addr_soum_dist']),
        bagKhoroo: J.str(json, <String>['addr_bag_khoroo']),
      );
}

/// 1.1 Миний үзлэгүүд — `GET /api/doctor/visits`.
class DoctorVisit {
  const DoctorVisit({
    required this.idData,
    this.visitDate,
    this.chiefComplaint,
    this.mainDiagnosis,
    this.mainDiagnosisMn,
    this.icd10,
    this.examTypeIcd,
    this.causeIcd10,
    this.procedureIcd9,
    this.hasComplication = false,
    this.patientId,
    this.patRegNo,
    this.organizationId,
    this.patient,
  });

  final int idData;
  final DateTime? visitDate;
  final String? chiefComplaint;

  /// Онош — эх хэлбэрээр. Эмнэлзүйн бичиглэлийг өөрчлөхгүй.
  final String? mainDiagnosis;
  final String? mainDiagnosisMn;

  final String? icd10;
  final String? examTypeIcd;
  final String? causeIcd10;
  final String? procedureIcd9;
  final bool hasComplication;
  final int? patientId;
  final String? patRegNo;
  final int? organizationId;
  final PatientBrief? patient;

  /// Дэлгэцэнд харуулах онош: монгол хувилбар байвал түүнийг, эс бөгөөс эхийг.
  String get diagnosisLabel {
    final mn = (mainDiagnosisMn ?? '').trim();
    if (mn.isNotEmpty) return mn;
    final raw = (mainDiagnosis ?? '').trim();
    if (raw.isNotEmpty) return raw;
    return 'Онош тэмдэглэгдээгүй';
  }

  String get patientName => patient?.fullName ?? (patRegNo ?? 'Үйлчлүүлэгч');

  factory DoctorVisit.fromJson(Map<String, dynamic> json) {
    final patientJson = J.obj(json, <String>['Patient']);
    return DoctorVisit(
      idData: J.intOf(json, <String>['id_data']) ?? 0,
      visitDate: J.date(json, <String>['visit_date']),
      chiefComplaint: J.str(json, <String>['chief_complaint']),
      mainDiagnosis: J.str(json, <String>['main_diagnosis']),
      mainDiagnosisMn: J.str(json, <String>['main_diagnosis_mn']),
      icd10: J.str(json, <String>['icd10']),
      examTypeIcd: J.str(json, <String>['exam_type_icd']),
      causeIcd10: J.str(json, <String>['cause_icd10']),
      procedureIcd9: J.str(json, <String>['procedure_icd9']),
      hasComplication: J.boolOf(json, <String>['has_complication']),
      patientId: J.intOf(json, <String>['PatientId']),
      patRegNo: J.str(json, <String>['PatRegNo']),
      organizationId: J.intOf(json, <String>['OrganizationId']),
      patient: patientJson == null ? null : PatientBrief.fromJson(patientJson),
    );
  }
}

/// 1.2 Миний хяналт — жагсаалтын нэг мөр.
class MonitoringRow {
  const MonitoringRow({
    required this.idData,
    this.since,
    this.patient,
    this.latestReading,
    this.rehab,
  });

  final int idData;
  final DateTime? since;
  final PatientBrief? patient;

  /// Сэргээн засах товч — хөтөлбөр, өдөр, сүүлийн дасгал. Хөтөлбөр ч, дасгал
  /// ч байхгүй бол `null`.
  final RehabGlance? rehab;

  /// Хамгийн сүүлийн хэмжилт — жагсаалттай хамт ирдэг тул мөр бүрд нэмэлт
  /// дуудлага хийхгүй.
  final JournalEntry? latestReading;

  int? get patientId => patient?.idData;

  factory MonitoringRow.fromJson(Map<String, dynamic> json) {
    final patientJson = J.obj(json, <String>['patient']);
    final readingJson = J.obj(json, <String>['latestReading']);
    final rehabJson = J.obj(json, <String>['rehab']);
    return MonitoringRow(
      idData: J.intOf(json, <String>['id_data']) ?? 0,
      since: J.date(json, <String>['since']),
      patient: patientJson == null ? null : PatientBrief.fromJson(patientJson),
      latestReading:
          readingJson == null ? null : JournalEntry.fromJson(readingJson),
      rehab: rehabJson == null ? null : RehabGlance.fromJson(rehabJson),
    );
  }
}

/// Миний хяналтын мөрөн дээрх сэргээн засах товч (`rehab`,
/// backend helper/RehabPlayer.js MonitoringSummary).
class RehabGlance {
  const RehabGlance({
    this.planId,
    this.planStatus,
    this.programCode,
    this.programName,
    this.dayNo,
    this.lastSessionAt,
    this.lastStatus,
    this.stoppedWithSymptoms = false,
  });

  final int? planId;
  final String? planStatus;
  final String? programCode;
  final String? programName;
  final int? dayNo;
  final DateTime? lastSessionAt;
  final String? lastStatus;

  /// Үйлчлүүлэгч шинж тэмдгийн хуудаснаас дасгалаа зогсоосон — эмч заавал
  /// харах ёстой төлөв.
  final bool stoppedWithSymptoms;

  factory RehabGlance.fromJson(Map<String, dynamic> json) => RehabGlance(
        planId: J.intOf(json, <String>['planId']),
        planStatus: J.str(json, <String>['planStatus']),
        programCode: J.str(json, <String>['programCode']),
        programName: J.str(json, <String>['programName']),
        dayNo: J.intOf(json, <String>['dayNo']),
        lastSessionAt: J.date(json, <String>['lastSessionAt']),
        lastStatus: J.str(json, <String>['lastStatus']),
        stoppedWithSymptoms: J.boolOf(json, <String>['stoppedWithSymptoms']),
      );
}

/// Үйлчлүүлэгчийг хяналтдаа авсан эмч — картын дээрх мэдэгдэлд.
/// Нэр, байгууллага л ирнэ; эмнэлзүйн мэдээлэл биш.
class MonitorBrief {
  const MonitorBrief({
    required this.name,
    this.organizationName,
    this.isMe = false,
  });

  final String name;
  final String? organizationName;
  final bool isMe;

  String get label => (organizationName == null || organizationName!.isEmpty)
      ? name
      : '$name ($organizationName)';

  factory MonitorBrief.fromJson(Map<String, dynamic> json) => MonitorBrief(
        name: J.str(json, <String>['name']) ?? '',
        organizationName: J.str(json, <String>['organizationName']),
        isMe: J.boolOf(json, <String>['isMe']),
      );
}

/// Хяналтад буй үйлчлүүлэгчийн тэмдэглэл — мөрүүд ба графикийн цуваа хамт.
class PatientJournalBundle {
  const PatientJournalBundle({required this.rows, required this.summary});

  final List<JournalEntry> rows;
  final JournalSummary summary;

  bool get isEmpty => rows.isEmpty && summary.isEmpty;

  static const PatientJournalBundle empty = PatientJournalBundle(
    rows: <JournalEntry>[],
    summary: JournalSummary.empty,
  );

  factory PatientJournalBundle.fromJson(Map<String, dynamic> json) =>
      PatientJournalBundle(
        rows: J
            .list(json, <String>['rows'])
            .map(JournalEntry.fromJson)
            .toList(growable: false),
        summary: JournalSummary.fromJson(json),
      );
}

/// Зөвлөгөөний төлөв. `adv_ticket_closed`: `n` нээлттэй, `y` хаагдсан,
/// `3` ноорог.
enum AdviceStatus {
  open,
  closed,
  draft;

  String get label => switch (this) {
        AdviceStatus.open => 'Нээлттэй',
        AdviceStatus.closed => 'Хаагдсан',
        AdviceStatus.draft => 'Ноорог',
      };

  static AdviceStatus parse(String? raw) {
    switch ((raw ?? '').trim()) {
      case '3':
        return AdviceStatus.draft;
      case 'y':
        return AdviceStatus.closed;
      default:
        return AdviceStatus.open;
    }
  }
}

/// 1.3 Миний зөвлөгөө — эмчийн өөрийн бичсэн асуумж.
class DoctorAdvice {
  const DoctorAdvice({
    required this.idData,
    required this.body,
    required this.status,
    this.ticketType,
    this.level,
    this.date,
    this.patientId,
    this.commentCount = 0,
    this.files = const <Attachment>[],
  });

  final int idData;
  final String body;
  final AdviceStatus status;
  final String? ticketType;
  final String? level;
  final DateTime? date;
  final int? patientId;
  final int commentCount;

  /// Асуумжид хавсаргасан зураг, дуу бичлэг, баримт (API.md §6).
  final List<Attachment> files;

  /// Тасалбруудын ихэнх дээр `Body` хоосон бөгөөд агуулга нь эхний хариунд
  /// байдаг (API.md §3, 2.4). Жагсаалтад хариу ирдэггүй тул энд зөвхөн
  /// хоосон эсэхийг мэдэгдэнэ.
  bool get hasBody => body.trim().isNotEmpty;

  factory DoctorAdvice.fromJson(Map<String, dynamic> json) => DoctorAdvice(
        idData: J.intOf(json, <String>['id_data']) ?? 0,
        body: J.strOr(json, <String>['Body', 'body']),
        status: AdviceStatus.parse(J.str(json, <String>['adv_ticket_closed'])),
        ticketType: J.str(json, <String>['ticket_type']),
        level: J.str(json, <String>['level']),
        date: J.date(json, <String>['date_creation']),
        patientId: J.intOf(json, <String>['adv_id_patient']),
        commentCount: J.intOf(json, <String>['commentCount']) ?? 0,
        files: J
            .list(json, <String>['files'])
            .map(Attachment.fromJson)
            .toList(growable: false),
      );
}

/// Зөвлөгөөний хариу.
class DoctorAdviceComment {
  const DoctorAdviceComment({
    required this.idData,
    required this.comment,
    this.date,
    this.authorUserId,
    this.files = const <Attachment>[],
  });

  final int idData;
  final String comment;
  final DateTime? date;
  final int? authorUserId;

  /// Хариултын хавсралт — эмч ихэвчлэн ЗЦБ эсвэл дуу бичлэгээр хариулдаг.
  final List<Attachment> files;

  factory DoctorAdviceComment.fromJson(Map<String, dynamic> json) =>
      DoctorAdviceComment(
        idData: J.intOf(json, <String>['id_data']) ?? 0,
        comment: J.strOr(json, <String>['adv_com_comment']),
        date: J.date(json, <String>['date_creation']),
        authorUserId: J.intOf(json, <String>['id']),
        files: J
            .list(json, <String>['files'])
            .map(Attachment.fromJson)
            .toList(growable: false),
      );
}

/// `GET /api/doctor/advice/:id` — асуумж ба хариунууд.
class DoctorAdviceDetail {
  const DoctorAdviceDetail({required this.ticket, required this.comments});

  final DoctorAdvice ticket;
  final List<DoctorAdviceComment> comments;

  /// `Body` хоосон үед эхний хариуг гол агуулга болгоно.
  String get displayBody {
    if (ticket.hasBody) return ticket.body.trim();
    if (comments.isNotEmpty) return comments.first.comment.trim();
    return '';
  }

  /// Гол агуулгын хамт харагдах хавсралтууд — `Body` хоосон үед эхний хариу
  /// гол агуулга болдог тул түүний файлууд ч энд орно.
  List<Attachment> get displayFiles {
    if (ticket.hasBody || comments.isEmpty) return ticket.files;
    return <Attachment>[...ticket.files, ...comments.first.files];
  }

  List<DoctorAdviceComment> get thread {
    if (ticket.hasBody) return comments;
    if (comments.isEmpty) return const <DoctorAdviceComment>[];
    return comments.sublist(1);
  }

  factory DoctorAdviceDetail.fromJson(Map<String, dynamic> json) {
    final ticketJson = J.obj(json, <String>['ticket']) ?? <String, dynamic>{};
    return DoctorAdviceDetail(
      ticket: DoctorAdvice.fromJson(ticketJson),
      comments: J
          .list(json, <String>['comments'])
          .map(DoctorAdviceComment.fromJson)
          .toList(growable: false),
    );
  }
}

/// Онош ба түүний тоо — тайлан дээрх эрэмбэ.
class DiagnosisCount {
  const DiagnosisCount({required this.diagnosis, required this.total});

  final String diagnosis;
  final int total;

  factory DiagnosisCount.fromJson(Map<String, dynamic> json) => DiagnosisCount(
        diagnosis: J.strOr(json, <String>['diagnosis']),
        total: J.intOf(json, <String>['total']) ?? 0,
      );
}

/// 1.4 Миний тайлан — `GET /api/doctor/reports/summary`.
class DoctorReport {
  const DoctorReport({
    required this.myVisits,
    required this.organizationVisits,
    required this.monitoredPatients,
    required this.adviceAuthored,
    required this.topDiagnoses,
    this.from,
    this.to,
    this.sourceOrganizationId,
    this.generatedAt,
  });

  final int myVisits;
  final int organizationVisits;
  final int monitoredPatients;
  final int adviceAuthored;
  final List<DiagnosisCount> topDiagnoses;
  final String? from;
  final String? to;

  /// Эх сурвалжийн тэмдэглэгээ — Техникийн шаардлага §29 "Мэдээллийн сангаас
  /// гарах мэдээлэлд эх сурвалжийг тогтоох тэмдэглэгээтэй байх".
  final int? sourceOrganizationId;
  final DateTime? generatedAt;

  bool get isEmpty =>
      myVisits == 0 &&
      organizationVisits == 0 &&
      monitoredPatients == 0 &&
      adviceAuthored == 0;

  static const DoctorReport empty = DoctorReport(
    myVisits: 0,
    organizationVisits: 0,
    monitoredPatients: 0,
    adviceAuthored: 0,
    topDiagnoses: <DiagnosisCount>[],
  );

  factory DoctorReport.fromJson(Map<String, dynamic> json) {
    final window = J.obj(json, <String>['window']) ?? <String, dynamic>{};
    final source = J.obj(json, <String>['source']) ?? <String, dynamic>{};
    return DoctorReport(
      myVisits: J.intOf(json, <String>['myVisits']) ?? 0,
      organizationVisits: J.intOf(json, <String>['organizationVisits']) ?? 0,
      monitoredPatients: J.intOf(json, <String>['monitoredPatients']) ?? 0,
      adviceAuthored: J.intOf(json, <String>['adviceAuthored']) ?? 0,
      topDiagnoses: J
          .list(json, <String>['topDiagnoses'])
          .map(DiagnosisCount.fromJson)
          .toList(growable: false),
      from: J.str(window, <String>['from']),
      to: J.str(window, <String>['to']),
      sourceOrganizationId: J.intOf(source, <String>['OrganizationId']),
      generatedAt: J.date(source, <String>['generatedAt']),
    );
  }
}

/// 1.5 Үйлчлүүлэгчийн карт — `GET /api/doctor/patients/:id`.
class PatientCard {
  const PatientCard({
    required this.patient,
    required this.visits,
    required this.journal,
    required this.isMonitoredByMe,
    this.monitoredBy,
  });

  final PatientBrief patient;
  final List<DoctorVisit> visits;
  final JournalSummary journal;
  final bool isMonitoredByMe;

  /// Энэ үйлчлүүлэгчийг хяналтдаа авсан бүх эмч (намайг оруулаад).
  /// `null` = сервер энэ талбарыг илгээгээгүй (хуучин хувилбар) — хоосон
  /// жагсаалт биш, учир нь хоосон нь "хэний ч хяналтад байхгүй" гэсэн үг.
  final List<MonitorBrief>? monitoredBy;

  factory PatientCard.fromJson(Map<String, dynamic> json) {
    final patientJson = J.obj(json, <String>['patient']) ?? <String, dynamic>{};
    final journalJson = J.obj(json, <String>['journal']) ?? <String, dynamic>{};
    return PatientCard(
      patient: PatientBrief.fromJson(patientJson),
      visits: J
          .list(json, <String>['visits'])
          .map(DoctorVisit.fromJson)
          .toList(growable: false),
      journal: JournalSummary.fromJson(journalJson),
      isMonitoredByMe: J.boolOf(json, <String>['isMonitoredByMe']),
      monitoredBy: json['monitoredBy'] is List
          ? J
              .list(json, <String>['monitoredBy'])
              .map(MonitorBrief.fromJson)
              .toList(growable: false)
          : null,
    );
  }
}

/// Үйлчлүүлэгчийн цахим үзлэгийн хүсэлт, эмчийн талаас харагдах хэлбэр.
///
/// Хуучин `/api/RemoteVisit/GetList`-ээс ирнэ. [patientId]-г **заавал**
/// уншина: шүүлтүүр сервер талд ажилласан эсэхийг клиент тал шалгахад
/// хэрэглэнэ (доорх repository-г үзнэ үү).
/// Эмчийн харах цахим үзлэгийн хүсэлт — `GET /api/doctor/evisits`.
///
/// Үйлчлүүлэгчийн хүснэгттэй ижил талбарууд дээр нэмээд хэний тухай болохыг
/// заасан `Patient` картыг агуулна.
class DoctorEvisit {
  const DoctorEvisit({
    required this.id,
    required this.comment,
    this.patientId,
    this.patientName,
    this.patientRegistration,
    this.status,
    this.statusLabel,
    this.requestedDate,
    this.scheduledDate,
    this.doctorId,
    this.doctorName,
    this.meetingUrl,
    this.createDate,
  });

  final int id;
  final String comment;
  final int? patientId;
  final String? patientName;
  final String? patientRegistration;
  final String? status;
  final String? statusLabel;
  final DateTime? requestedDate;
  final DateTime? scheduledDate;
  final int? doctorId;
  final String? doctorName;

  /// Зөвхөн `scheduled` төлөвт утгатай — эмнэлзүйн ярианы эрхийн холбоос.
  final String? meetingUrl;
  final DateTime? createDate;

  bool get isRequested => status == 'requested';
  bool get isScheduled => status == 'scheduled';
  bool get isOpen => isRequested || isScheduled;

  String get label {
    final fromServer = (statusLabel ?? '').trim();
    if (fromServer.isNotEmpty) return fromServer;
    return switch (status) {
      'requested' => 'Хүсэлт илгээсэн',
      'scheduled' => 'Цаг товлосон',
      'completed' => 'Үзлэг хийгдсэн',
      'cancelled' => 'Цуцалсан',
      _ => 'Тодорхойгүй',
    };
  }

  factory DoctorEvisit.fromJson(Map<String, dynamic> json) {
    final patient = J.obj(json, <String>['Patient']) ?? <String, dynamic>{};
    final name = <String>[
      J.strOr(patient, <String>['p_lastname']),
      J.strOr(patient, <String>['p_firstname']),
    ].where((String p) => p.trim().isNotEmpty).join(' ');

    return DoctorEvisit(
      id: J.intOf(json, <String>['Id', 'id_data']) ?? 0,
      comment: J.strOr(json, <String>['Comment']),
      patientId: J.intOf(json, <String>['PatientId']) ??
          J.intOf(patient, <String>['id_data']),
      patientName: name.isEmpty ? null : name,
      patientRegistration: J.str(patient, <String>['p_registration']),
      status: J.str(json, <String>['Status']),
      statusLabel: J.str(json, <String>['StatusLabel']),
      requestedDate: J.date(json, <String>['RequestedDate']),
      scheduledDate: J.date(json, <String>['ScheduledDate']),
      doctorId: J.intOf(json, <String>['DoctorId']),
      doctorName: J.str(json, <String>['DoctorName']),
      meetingUrl: J.str(json, <String>['MeetingUrl']),
      createDate: J.date(json, <String>['CreateDate']),
    );
  }
}

/// Асуумжийн хэлбэр — `OptionTypes` (`dico = ticket_type`).
///
/// `/BaseObject/getData` хариунд `{Label, Value}` хэлбэртэй ирдэг (SQL нь
/// баганыг ингэж нэрлэдэг). Утга нь өгөгдлийн санд текст ч, тоо ч байж болох
/// тул хоёуланг нь мөр болгож уншина.
class TicketTypeOption {
  const TicketTypeOption({required this.value, required this.label});

  final String value;
  final String label;

  factory TicketTypeOption.fromJson(Map<String, dynamic> json) {
    String read(String upper, String lower) =>
        '${json[upper] ?? json[lower] ?? ''}'.trim();
    return TicketTypeOption(
      value: read('Value', 'value'),
      label: read('Label', 'label'),
    );
  }
}

// ---------------------------------------------------------------------------
// Асуумжийн урсгал — вебийн `view/AdviceHome.jsx` (`/Advice/GetFeed`)
// ---------------------------------------------------------------------------

int _feedInt(dynamic v, {int fallback = 0}) {
  if (v is num) return v.toInt();
  return int.tryParse('${v ?? ''}') ?? fallback;
}

/// Огнооны эхний 10 тэмдэгт. `date_creation` өгөгдлийн санд зөвхөн огноогоор
/// хадгалагддаг; хариултын цаг нь урсгалд хэрэггүй дэлгэрэнгүй.
String _feedDay(dynamic v) {
  final s = '${v ?? ''}';
  return s.length >= 10 ? s.substring(0, 10) : s;
}

Map<String, dynamic> _feedMap(dynamic v) =>
    v is Map ? Map<String, dynamic>.from(v) : <String, dynamic>{};

String _feedFirst(List<dynamic> values) {
  for (final dynamic v in values) {
    final s = '${v ?? ''}'.trim();
    if (s.isNotEmpty) return s;
  }
  return '';
}

/// Асуумж, хариултын хавсралт.
///
/// Сервер зургийг base64 thumbnail болгож (`FileSrc`), `FileInfo`-той хамт
/// өгдөг. Зураг бус файлд `FileSrc` ирдэггүй — тэр нь нэрээрээ л харагдана.
class FeedFile {
  FeedFile({required this.name, required this.ext, this.src});

  final String name;
  final String ext;
  final String? src;

  static const Set<String> _imageExt = <String>{
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic',
  };

  bool get isImage => _imageExt.contains(ext) && bytes != null;

  /// Нэг удаа задлаад хадгална: карт дахин зурагдах бүрт base64 задлахгүй,
  /// `MemoryImage` ч байтын ижил instance-аар кэшлэгдэнэ.
  late final Uint8List? bytes = _decode(src);

  static Uint8List? _decode(String? src) {
    if (src == null || src.isEmpty) return null;
    final comma = src.startsWith('data:') ? src.indexOf(',') : -1;
    try {
      return base64Decode(comma == -1 ? src : src.substring(comma + 1));
    } catch (_) {
      return null;
    }
  }

  factory FeedFile.fromJson(Map<String, dynamic> json) {
    final info = _feedMap(json['FileInfo']);
    final src = json['FileSrc'];
    return FeedFile(
      name: _feedFirst(<dynamic>[info['Name'], info['original_name'], 'файл']),
      ext: '${info['ext'] ?? ''}'.toLowerCase().replaceAll('.', ''),
      src: src is String ? src : null,
    );
  }

  static List<FeedFile> listOf(dynamic value) => value is List
      ? value
          .whereType<Map<dynamic, dynamic>>()
          .map((Map<dynamic, dynamic> m) =>
              FeedFile.fromJson(Map<String, dynamic>.from(m)))
          .toList(growable: false)
      : const <FeedFile>[];
}

/// Асуумжийн хариулт.
class FeedComment {
  FeedComment({
    required this.id,
    required this.text,
    required this.date,
    required this.authorName,
    this.avatar,
    this.files = const <FeedFile>[],
    this.fileTotal = 0,
  });

  final int id;
  final String text;
  final String date;
  final String authorName;
  final FeedFile? avatar;
  final List<FeedFile> files;
  final int fileTotal;

  /// `GetFeed`-ийн картад зориулсан урьдчилан харах хэлбэр.
  factory FeedComment.fromFeed(Map<String, dynamic> json) {
    final avatarSrc = json['AvatarSrc'];
    final files = FeedFile.listOf(json['Files']);
    return FeedComment(
      id: _feedInt(json['Id']),
      text: '${json['Text'] ?? ''}',
      date: _feedDay(json['Date']),
      authorName: '${json['AuthorName'] ?? ''}'.trim(),
      avatar: avatarSrc is String && avatarSrc.isNotEmpty
          ? FeedFile(name: 'avatar', ext: 'jpg', src: avatarSrc)
          : null,
      files: files,
      fileTotal: _feedInt(json['FileTotal'], fallback: files.length),
    );
  }

  /// `GetComments`-ийн хуучин бичлэгийн хэлбэр — вебийн `toPreviewComment`.
  factory FeedComment.fromThread(Map<String, dynamic> json) {
    final dp = _feedMap(json['DoctorsProfile']);
    final users = _feedMap(json['Users']);
    final fromParts = <dynamic>[dp['lastname'], dp['firstname']]
        .where((dynamic v) => '${v ?? ''}'.trim().isNotEmpty)
        .join(' ');
    final avatars = FeedFile.listOf(dp['Files']);
    final files = FeedFile.listOf(json['Files']);
    return FeedComment(
      id: _feedInt(json['id_data']),
      text: '${json['adv_com_comment'] ?? ''}',
      date: _feedDay(json['date_creation']),
      authorName: _feedFirst(<dynamic>[dp['FullName'], fromParts, users['UserName']]),
      avatar: avatars.isEmpty ? null : avatars.first,
      files: files,
      fileTotal: files.length,
    );
  }
}

/// Урсгалын нэг асуумж (`GetFeed`, `GetTicket`).
class FeedTicket {
  FeedTicket({
    required this.id,
    required this.isMine,
    required this.status,
    required this.date,
    required this.body,
    required this.authorName,
    this.avatar,
    this.organizationName,
    this.province,
    this.soum,
    this.patientAge,
    this.patientGender,
    this.files = const <FeedFile>[],
    this.fileTotal = 0,
    this.commentQty = 0,
    this.viewQty = 0,
    this.comments = const <FeedComment>[],
  });

  final int id;
  final bool isMine;

  /// `adv_ticket_closed`: `n` нээлттэй, `y` хаагдсан, `3` ноорог.
  final String status;
  final String date;
  final String body;
  final String authorName;
  final FeedFile? avatar;
  final String? organizationName;
  final String? province;
  final String? soum;
  final int? patientAge;
  final String? patientGender;
  final List<FeedFile> files;
  final int fileTotal;
  final int commentQty;
  final int viewQty;
  final List<FeedComment> comments;

  bool get isOpen => status == 'n';
  bool get isClosed => status == 'y';
  bool get isDraft => status == '3';
  bool get hasBody => body.trim().isNotEmpty;
  DateTime? get createdAt => DateTime.tryParse(date);

  String get statusLabel => switch (status) {
        'n' => 'Нээлттэй',
        'y' => 'Хаагдсан',
        '3' => 'Ноорог',
        _ => '',
      };

  String get place => <String?>[province, soum]
      .where((String? s) => (s ?? '').trim().isNotEmpty)
      .join(' · ');

  String get patientLabel => <String>[
        if (patientAge != null) '$patientAge нас',
        if (patientGender != null) patientGender!,
      ].join(' · ');

  factory FeedTicket.fromFeed(Map<String, dynamic> json) {
    final dp = _feedMap(json['DoctorsProfile']);
    final users = _feedMap(json['Users']);
    final org = _feedMap(dp['Organization']);
    final patient = _feedMap(json['Patient']);
    final fromParts = <dynamic>[dp['firstname'], dp['lastname']]
        .where((dynamic v) => '${v ?? ''}'.trim().isNotEmpty)
        .join(' ');
    final avatars = FeedFile.listOf(dp['Files']);
    final files = FeedFile.listOf(json['Files']);

    return FeedTicket(
      id: _feedInt(json['id_data']),
      isMine: json['IsMine'] == true,
      status: '${json['adv_ticket_closed'] ?? ''}'.trim(),
      date: _feedDay(json['date_creation']),
      body: '${json['Body'] ?? ''}',
      // Жинхэнэ нэрийг нэвтрэх нэрээс түрүүлж — хариултын урьдчилсан харагдац
      // ч вебэд ийм дараалалтай.
      authorName: _feedFirst(<dynamic>[dp['FullName'], fromParts, users['UserName'], '—']),
      avatar: avatars.isEmpty ? null : avatars.first,
      organizationName: _feedFirst(<dynamic>[org['Name']]).isEmpty
          ? null
          : _feedFirst(<dynamic>[org['Name']]),
      province: _feedFirst(<dynamic>[_feedMap(json['DictProvinceCity'])['name']]),
      soum: _feedFirst(<dynamic>[_feedMap(json['DictSoumDistrict'])['name']]),
      patientAge: _ageFrom(patient['p_birthday']),
      patientGender: _genderLabel(patient['p_gender']),
      files: files,
      fileTotal: _feedInt(json['FileTotal'], fallback: files.length),
      commentQty: _feedInt(json['CommentQty']),
      viewQty: _feedInt(json['ViewQty']),
      comments: json['Comments'] is List
          ? (json['Comments'] as List<dynamic>)
              .whereType<Map<dynamic, dynamic>>()
              .map((Map<dynamic, dynamic> m) =>
                  FeedComment.fromFeed(Map<String, dynamic>.from(m)))
              .toList(growable: false)
          : const <FeedComment>[],
    );
  }

  /// Вебийн `ObjectHelper.getGenderLabel`: `1`/`F` эмэгтэй, `2`/`M` эрэгтэй.
  static String? _genderLabel(dynamic value) {
    final v = '${value ?? ''}'.trim().toUpperCase();
    if (v == '1' || v == 'F' || v == 'FEMALE') return 'Эмэгтэй';
    if (v == '2' || v == 'M' || v == 'MALE') return 'Эрэгтэй';
    return null;
  }

  static int? _ageFrom(dynamic value) {
    final born = DateTime.tryParse('${value ?? ''}');
    if (born == null) return null;
    final now = DateTime.now();
    var age = now.year - born.year;
    if (now.month < born.month ||
        (now.month == born.month && now.day < born.day)) {
      age--;
    }
    return age < 0 || age > 130 ? null : age;
  }
}


/// ICD-10 лавлахын нэг мөр — `GET /api/doctor/icd10?search=`.
class IcdCode {
  const IcdCode({required this.code, required this.nameMn, this.nameEn});

  final String code;
  final String nameMn;
  final String? nameEn;

  /// Монгол нэр байхгүй бол англиар — лавлахад хоёулаа бүрэн биш.
  String get label => nameMn.trim().isNotEmpty ? nameMn : (nameEn ?? '');

  factory IcdCode.fromJson(Map<String, dynamic> json) => IcdCode(
        code: J.strOr(json, <String>['code', 'Code']),
        nameMn: J.strOr(json, <String>['name_mn', 'NameMn']),
        nameEn: J.str(json, <String>['name_en', 'NameEn']),
      );
}
