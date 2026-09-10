import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';
import '../journal/journal_entry.dart';

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
  });

  final int idData;
  final DateTime? since;
  final PatientBrief? patient;

  /// Хамгийн сүүлийн хэмжилт — жагсаалттай хамт ирдэг тул мөр бүрд нэмэлт
  /// дуудлага хийхгүй.
  final JournalEntry? latestReading;

  int? get patientId => patient?.idData;

  factory MonitoringRow.fromJson(Map<String, dynamic> json) {
    final patientJson = J.obj(json, <String>['patient']);
    final readingJson = J.obj(json, <String>['latestReading']);
    return MonitoringRow(
      idData: J.intOf(json, <String>['id_data']) ?? 0,
      since: J.date(json, <String>['since']),
      patient: patientJson == null ? null : PatientBrief.fromJson(patientJson),
      latestReading:
          readingJson == null ? null : JournalEntry.fromJson(readingJson),
    );
  }
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

/// 1.3 Миний зөвлөгөө — эмчийн өөрийн бичсэн тасалбар.
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
  });

  final int idData;
  final String body;
  final AdviceStatus status;
  final String? ticketType;
  final String? level;
  final DateTime? date;
  final int? patientId;
  final int commentCount;

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
      );
}

/// Зөвлөгөөний хариу.
class DoctorAdviceComment {
  const DoctorAdviceComment({
    required this.idData,
    required this.comment,
    this.date,
    this.authorUserId,
  });

  final int idData;
  final String comment;
  final DateTime? date;
  final int? authorUserId;

  factory DoctorAdviceComment.fromJson(Map<String, dynamic> json) =>
      DoctorAdviceComment(
        idData: J.intOf(json, <String>['id_data']) ?? 0,
        comment: J.strOr(json, <String>['adv_com_comment']),
        date: J.date(json, <String>['date_creation']),
        authorUserId: J.intOf(json, <String>['id']),
      );
}

/// `GET /api/doctor/advice/:id` — тасалбар ба хариунууд.
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
  });

  final PatientBrief patient;
  final List<DoctorVisit> visits;
  final JournalSummary journal;
  final bool isMonitoredByMe;

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
    );
  }
}

/// Үйлчлүүлэгчийн цахим үзлэгийн хүсэлт, эмчийн талаас харагдах хэлбэр.
///
/// Хуучин `/api/RemoteVisit/GetList`-ээс ирнэ. [patientId]-г **заавал**
/// уншина: шүүлтүүр сервер талд ажилласан эсэхийг клиент тал шалгахад
/// хэрэглэнэ (доорх repository-г үзнэ үү).
class DoctorEvisit {
  const DoctorEvisit({
    required this.id,
    required this.patientId,
    required this.comment,
    this.createDate,
  });

  final int id;
  final int? patientId;
  final String comment;
  final DateTime? createDate;

  factory DoctorEvisit.fromJson(Map<String, dynamic> json) => DoctorEvisit(
        id: J.intOf(json, <String>['Id', 'id_data']) ?? 0,
        patientId: J.intOf(json, <String>['PatientId']),
        comment: J.strOr(json, <String>['Comment']),
        createDate: J.date(json, <String>['CreateDate']),
      );
}
