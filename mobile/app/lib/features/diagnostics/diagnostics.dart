import '../../core/network/api_client.dart';
import '../../core/network/envelope.dart';
import '../../core/util/json_read.dart';

/// Шинжилгээ, оношлогооны нэг мөр — API.md §9.7.
class DiagnosticSummary {
  const DiagnosticSummary({
    required this.type,
    required this.id,
    this.date,
    this.title,
    this.summary,
    this.organization,
  });

  /// `lab` · `echo` · `cathlab` · `ecg`.
  final String type;
  final int id;
  final DateTime? date;
  final String? title;
  final String? summary;
  final String? organization;

  String get typeLabel => switch (type) {
        'lab' => 'Лабораторийн шинжилгээ',
        'echo' => 'Эхо',
        'cathlab' => 'Ангиографи',
        'ecg' => 'ЗЦБ',
        _ => 'Шинжилгээ',
      };

  factory DiagnosticSummary.fromJson(Map<String, dynamic> json) =>
      DiagnosticSummary(
        type: J.strOr(json, <String>['type']),
        id: J.intOf(json, <String>['id']) ?? 0,
        date: J.date(json, <String>['date']),
        title: J.str(json, <String>['title']),
        summary: J.str(json, <String>['summary']),
        organization: J.str(json, <String>['organization']),
      );
}

/// Лабораторийн нэг үзүүлэлт.
///
/// [unit], [refRange], [flag] нь **одоогоор үргэлж `null`** — `LaboratoryTest`
/// хүснэгтэд нэгж ч, лавлах хэмжээ ч багана байхгүй. Тэдгээр нь `CodeMapping`
/// баталгаажсаны дараа ирнэ. Хоосон лавлах хэмжээг "хэвийн" гэж харуулж
/// **болохгүй** (API.md §9.7).
class LabResult {
  const LabResult({
    required this.name,
    required this.label,
    this.value,
    this.unit,
    this.refRange,
    this.flag,
  });

  final String name;
  final String label;
  final String? value;
  final String? unit;
  final String? refRange;
  final String? flag;

  factory LabResult.fromJson(Map<String, dynamic> json) => LabResult(
        name: J.strOr(json, <String>['name']),
        label: J.strOr(json, <String>['label']),
        value: J.str(json, <String>['value']),
        unit: J.str(json, <String>['unit']),
        refRange: J.str(json, <String>['refRange']),
        flag: J.str(json, <String>['flag']),
      );
}

/// Хэвлэмэл тайланд ордогтой ижил бүлэг.
class LabPanel {
  const LabPanel({
    required this.code,
    required this.label,
    required this.results,
    this.date,
    this.confidential = false,
    this.restricted = false,
  });

  final String code;
  final String label;
  final List<LabResult> results;
  final DateTime? date;

  /// Нууцад хамаарах бүлэг (ДОХ, В, С вирус, тэмбүү).
  final bool confidential;

  /// Эрх хүрэхгүй тул үр дүнг нууссан. Бүлгийг **алга болгохгүй**: шинжилгээ
  /// хийгдээгүй гэж эмч андуурч болохгүй.
  final bool restricted;

  factory LabPanel.fromJson(Map<String, dynamic> json) => LabPanel(
        code: J.strOr(json, <String>['code']),
        label: J.strOr(json, <String>['label']),
        date: J.date(json, <String>['date']),
        confidential: J.boolOf(json, <String>['confidential']),
        restricted: J.boolOf(json, <String>['restricted']),
        results: Envelope.asList(json['results'])
            .map(LabResult.fromJson)
            .toList(growable: false),
      );
}

/// Дэлгэрэнгүй.
class DiagnosticDetail {
  const DiagnosticDetail({
    required this.type,
    required this.id,
    this.date,
    this.organization,
    this.complaint,
    this.diagnosis,
    this.disorders,
    this.regularMedication,
    this.panels = const <LabPanel>[],
  });

  final String type;
  final int id;
  final DateTime? date;
  final String? organization;
  final String? complaint;
  final String? diagnosis;
  final String? disorders;
  final String? regularMedication;
  final List<LabPanel> panels;

  factory DiagnosticDetail.fromJson(Map<String, dynamic> json) =>
      DiagnosticDetail(
        type: J.strOr(json, <String>['type']),
        id: J.intOf(json, <String>['id']) ?? 0,
        date: J.date(json, <String>['date']),
        organization: J.str(json, <String>['organization']),
        complaint: J.str(json, <String>['complaint']),
        diagnosis: J.str(json, <String>['diagnosis']),
        disorders: J.str(json, <String>['disorders']),
        regularMedication: J.str(json, <String>['regular_medication']),
        panels: Envelope.asList(json['panels'])
            .map(LabPanel.fromJson)
            .toList(growable: false),
      );
}

/// Үйлчлүүлэгч өөрийнхөө, эмч үйлчлүүлэгчийн шинжилгээг харах — нэг зам.
class DiagnosticsRepository {
  DiagnosticsRepository(this._api, {this.patientId});

  final ApiClient _api;

  /// `null` бол үйлчлүүлэгч өөрийнхөө шинжилгээг харж байна.
  final int? patientId;

  String get _listPath => patientId == null
      ? '/api/patient/diagnostics'
      : '/api/doctor/patients/$patientId/diagnostics';

  String _detailPath(String type, int id) => patientId == null
      ? '/api/patient/diagnostics/$type/$id'
      : '/api/doctor/diagnostics/$type/$id';

  Future<Paged<DiagnosticSummary>> fetchPage({
    required int limit,
    required int offset,
    String type = '',
  }) {
    return _api.getPaged<DiagnosticSummary>(
      _listPath,
      DiagnosticSummary.fromJson,
      limit: limit,
      offset: offset,
      query: <String, dynamic>{if (type.isNotEmpty) 'type': type},
    );
  }

  Future<DiagnosticDetail> fetchDetail(String type, int id) async {
    final data = await _api.getObject(_detailPath(type, id));
    return DiagnosticDetail.fromJson(data);
  }
}
