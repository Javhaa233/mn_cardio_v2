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
    this.createDate,
  });

  final int id;
  final String comment;
  final DateTime? createDate;

  factory Evisit.fromJson(Map<String, dynamic> json) => Evisit(
        id: J.intOf(json, <String>['Id', 'id', 'id_data']) ?? 0,
        comment: J.strOr(json, <String>['Comment', 'comment']),
        createDate: J.date(json, <String>['CreateDate', 'create_date']),
      );
}
