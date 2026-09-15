import '../../core/util/json_read.dart';

/// 2.6 Цахим үзлэг — `GET /api/patient/evisits`.
///
/// **Талбарын нэр нь PascalCase**, хэдийгээр дугтуй нь жижиг үсгийн хэлбэртэй.
/// `RemoteVisit` бол шинэ үеийн хүснэгт тул дугтуйн бичиглэл талбар руу
/// дамжаагүй (API.md §3, 2.6).
class Evisit {
  const Evisit({
    required this.id,
    required this.comment,
    this.status,
    this.statusLabel,
    this.requestedDate,
    this.scheduledDate,
    this.doctorId,
    this.doctorName,
    this.meetingUrl,
    this.createDate,
    this.updateDate,
  });

  final int id;
  final String comment;

  /// `requested` → `scheduled` → `completed`, аль ч нээлттэй төлөвөөс
  /// `cancelled`. Сүүлийн хоёр нь **эцсийн** — дахин нээгдэхгүй, давтан
  /// зөвлөгөө бол шинэ хүсэлт.
  final String? status;
  final String? statusLabel;

  /// Үйлчлүүлэгчийн хүссэн цаг (заавал биш).
  final DateTime? requestedDate;

  /// Эмнэлгээс баталсан цаг.
  final DateTime? scheduledDate;

  final int? doctorId;
  final String? doctorName;

  /// **Зөвхөн `scheduled` үед л утгатай.** Энэ нь эмнэлзүйн ярианд нэвтрэх
  /// эрхийн холбоос тул хүсэлт хүлээгдэж байхад ч, үзлэг дууссаны дараа ч
  /// өгөгддөггүй (API.md §2.6). Кэшлэхгүй.
  final String? meetingUrl;

  final DateTime? createDate;
  final DateTime? updateDate;

  bool get isRequested => status == 'requested';
  bool get isScheduled => status == 'scheduled';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';

  /// Цуцлах боломжтой эсэх — эцсийн төлөвт орсон бол үгүй.
  bool get isOpen => isRequested || isScheduled;

  bool get canJoin => isScheduled && (meetingUrl ?? '').trim().isNotEmpty;

  /// Сервер `StatusLabel`-ийг `remotevisit_status` толиос өгдөг. Байхгүй бол
  /// л энд буцаана — монгол үг кодод бичихээс зайлсхийсэн.
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

  factory Evisit.fromJson(Map<String, dynamic> json) => Evisit(
        id: J.intOf(json, <String>['Id', 'id', 'id_data']) ?? 0,
        comment: J.strOr(json, <String>['Comment', 'comment']),
        status: J.str(json, <String>['Status']),
        statusLabel: J.str(json, <String>['StatusLabel']),
        requestedDate: J.date(json, <String>['RequestedDate']),
        scheduledDate: J.date(json, <String>['ScheduledDate']),
        doctorId: J.intOf(json, <String>['DoctorId']),
        doctorName: J.str(json, <String>['DoctorName']),
        meetingUrl: J.str(json, <String>['MeetingUrl']),
        createDate: J.date(json, <String>['CreateDate', 'create_date']),
        updateDate: J.date(json, <String>['UpdateDate']),
      );
}
