import '../../core/network/envelope.dart';
import '../../core/util/json_read.dart';
import '../../shared/widgets/attachment_view.dart';

/// 2.3 Эмчээс асуух асуулт — нэг мөр нь асуулт эсвэл эмчийн хариу.
///
/// [isDoctor] нь хоёрыг ялгана: `true` бол эмчийн хариу, `false` бол
/// үйлчлүүлэгчийн асуулт (API.md §3, 2.3).
class Question {
  const Question({
    required this.idData,
    required this.comment,
    required this.isDoctor,
    this.dateCreation,
    this.doctorName,
    this.files = const <Attachment>[],
  });

  final int idData;
  final String comment;
  final bool isDoctor;
  final DateTime? dateCreation;
  final String? doctorName;

  /// Зураг, дуу бичлэг, баримт — Техникийн шаардлага §2.3.
  final List<Attachment> files;

  String get authorLabel {
    if (!isDoctor) return 'Таны асуулт';
    final name = (doctorName ?? '').trim();
    return name.isEmpty ? 'Эмчийн хариу' : name;
  }

  factory Question.fromJson(Map<String, dynamic> json) => Question(
        idData: J.intOf(json, <String>['id_data', 'Id']) ?? 0,
        comment: J.strOr(json, <String>['comment']),
        isDoctor: J.boolOf(json, <String>['is_doctor']),
        dateCreation: J.date(json, <String>['date_creation', 'date']),
        doctorName: J.str(json, <String>['doctor_name']),
        files: Envelope.asList(json['files'])
            .map(Attachment.fromJson)
            .toList(growable: false),
      );
}
