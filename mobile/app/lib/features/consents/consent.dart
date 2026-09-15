import '../../core/util/json_read.dart';

/// Нэг зорилгын зөвшөөрлийн төлөв — `GET /api/patient/consents`.
///
/// [granted] нь **гурван утгатай**: `null` бол хэзээ ч асуугаагүй, `false` бол
/// татгалзсан буюу цуцалсан, `true` бол зөвшөөрсөн. Татгалзсаныг "асуугаагүй"
/// гэж үзвэл апп татгалзсан хүнээс дахин дахин асууна.
class ConsentPurpose {
  const ConsentPurpose({
    required this.purposeCode,
    required this.titleMn,
    required this.documentId,
    this.version,
    this.granted,
    this.grantedDate,
    this.withdrawnDate,
    this.superseded = false,
  });

  final String purposeCode;
  final String titleMn;
  final int documentId;
  final String? version;
  final bool? granted;
  final DateTime? grantedDate;
  final DateTime? withdrawnDate;

  /// Хуучин хувилбарт зөвшөөрсөн боловч шинэ текст гарсан.
  final bool superseded;

  bool get isGranted => granted == true;
  bool get isWithdrawn => granted == false;
  bool get isUnanswered => granted == null;

  /// Дахин асуух шаардлагатай эсэх — хэзээ ч асуугаагүй, эсвэл текст шинэчлэгдсэн.
  bool get needsDecision => isUnanswered || superseded;

  factory ConsentPurpose.fromJson(Map<String, dynamic> json) => ConsentPurpose(
        purposeCode: J.strOr(json, <String>['PurposeCode']),
        titleMn: J.strOr(json, <String>['TitleMn']),
        documentId: J.intOf(json, <String>['DocumentId']) ?? 0,
        version: J.str(json, <String>['Version']),
        granted: json['Granted'] == null
            ? null
            : J.boolOf(json, <String>['Granted']),
        grantedDate: J.date(json, <String>['GrantedDate']),
        withdrawnDate: J.date(json, <String>['WithdrawnDate']),
        superseded: J.boolOf(json, <String>['Superseded']),
      );
}

/// Зөвшөөрлийн бүрэн текст — `GET /api/patient/consents/:code/document`.
class ConsentDocument {
  const ConsentDocument({
    required this.id,
    required this.purposeCode,
    required this.titleMn,
    required this.bodyMn,
    this.version,
  });

  final int id;
  final String purposeCode;
  final String titleMn;
  final String bodyMn;
  final String? version;

  factory ConsentDocument.fromJson(Map<String, dynamic> json) =>
      ConsentDocument(
        id: J.intOf(json, <String>['Id']) ?? 0,
        purposeCode: J.strOr(json, <String>['PurposeCode']),
        titleMn: J.strOr(json, <String>['TitleMn']),
        bodyMn: J.strOr(json, <String>['BodyMn']),
        version: J.str(json, <String>['Version']),
      );
}
