import '../../core/util/json_read.dart';
import '../../shared/widgets/attachment_view.dart';

/// Зөвлөгөөний асуумж дээрх нэг сэтгэгдэл.
class AdviceComment {
  const AdviceComment({
    required this.idData,
    required this.comment,
    this.date,
    this.files = const <Attachment>[],
  });

  final int idData;
  final String comment;
  final DateTime? date;

  /// Хариултын хавсралт — зураг, дуу бичлэг, баримт (API.md §6).
  final List<Attachment> files;

  factory AdviceComment.fromJson(Map<String, dynamic> json) => AdviceComment(
        idData: J.intOf(json, <String>['id_data', 'Id']) ?? 0,
        comment: J.strOr(json, <String>['comment']),
        date: J.date(json, <String>['date', 'date_creation']),
        files: J
            .list(json, <String>['files'])
            .map(Attachment.fromJson)
            .toList(growable: false),
      );
}

/// 2.4 Эмчийн зөвлөгөө. Зөвхөн уншина — агуулгыг эмч бичдэг.
class Advice {
  const Advice({
    required this.idData,
    required this.body,
    required this.closed,
    this.ticketType,
    this.date,
    this.comments = const <AdviceComment>[],
    this.files = const <Attachment>[],
  });

  final int idData;
  final String body;
  final bool closed;
  final String? ticketType;
  final DateTime? date;
  final List<AdviceComment> comments;

  /// Асуумжид өөрт нь хавсаргасан файлууд.
  final List<Attachment> files;

  /// Асуумжийн **гол агуулга**.
  ///
  /// Тасалбруудын 57 хувь дээр `Body` хоосон бөгөөд эмнэлзүйн агуулга нь эхний
  /// хариунд байдаг (API.md §3, 2.4). Иймд хоосон `body`-г шууд харуулж
  /// "зөвлөгөө хоосон байна" гэсэн сэтгэгдэл төрүүлэхийн оронд эхний
  /// сэтгэгдлийг агуулга болгон авна.
  String get displayBody {
    final trimmed = body.trim();
    if (trimmed.isNotEmpty) return trimmed;
    if (comments.isNotEmpty) return comments.first.comment.trim();
    return '';
  }

  /// Гол агуулгын хамт харагдах хавсралтууд.
  ///
  /// `body` хоосон үед эхний хариу нь гол агуулга болдог тул түүний
  /// хавсралтыг ч мөн энд оруулна — эс тэгвээс дуу бичлэг алга болно.
  List<Attachment> get displayFiles {
    if (body.trim().isNotEmpty || comments.isEmpty) return files;
    return <Attachment>[...files, ...comments.first.files];
  }

  /// Гол агуулгын дараах хэлэлцүүлэг.
  List<AdviceComment> get thread {
    if (body.trim().isNotEmpty) return comments;
    if (comments.isEmpty) return const <AdviceComment>[];
    return comments.sublist(1);
  }

  bool get isEmpty => displayBody.isEmpty && comments.isEmpty;

  String get statusLabel => closed ? 'Хаагдсан' : 'Нээлттэй';

  int get commentCount => comments.length;

  factory Advice.fromJson(Map<String, dynamic> json) => Advice(
        idData: J.intOf(json, <String>['id_data', 'Id']) ?? 0,
        body: J.strOr(json, <String>['body', 'Body']),
        closed: J.boolOf(json, <String>['closed']),
        ticketType: J.str(json, <String>['ticket_type']),
        date: J.date(json, <String>['date', 'date_creation']),
        comments: J
            .list(json, <String>['comments'])
            .map(AdviceComment.fromJson)
            .toList(growable: false),
        files: J
            .list(json, <String>['files'])
            .map(Attachment.fromJson)
            .toList(growable: false),
      );
}
