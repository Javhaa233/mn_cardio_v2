import '../../core/util/json_read.dart';

/// Нэг үзүүлэлт — монгол шошго ба утга.
class RiskField {
  const RiskField({
    required this.label,
    required this.value,
    this.unit,
    this.isYesNo = false,
  });

  final String label;
  final String value;
  final String? unit;
  final bool isYesNo;

  String get displayValue {
    if (unit == null || unit!.isEmpty) return value;
    return '$value $unit';
  }
}

/// 2.5 Эрсдэл үнэлгээ (ЗСӨ) — `GET /api/patient/risk`.
///
/// **Оноо, эрсдэлийн ангилал энд тооцоологдохгүй.** Аргачлал ба эрсдэлийн
/// ангиллыг ЗСҮТ батлах хүртэл сервер зөвхөн оруулсан үзүүлэлтүүдийг буцаана
/// (API.md §3, 2.5; BLOCKERS.md §"Already sent" мөр 5). Зүрх судасны эрсдэлийн
/// буруу тоог өвчтөнд харуулах нь эмнэлзүйн аюулгүй байдлын асуудал тул
/// клиент талд томьёо зохиохыг хориглоно.
class RiskAssessment {
  const RiskAssessment({
    required this.bodySizeFields,
    required this.historyFields,
    this.measuredAt,
    this.note,
  });

  final List<RiskField> bodySizeFields;
  final List<RiskField> historyFields;
  final DateTime? measuredAt;
  final String? note;

  bool get isEmpty => bodySizeFields.isEmpty && historyFields.isEmpty;

  static const RiskAssessment empty = RiskAssessment(
    bodySizeFields: <RiskField>[],
    historyFields: <RiskField>[],
  );

  /// `PatientBodySize` баганын нэр → монгол шошго, хэмжих нэгж.
  ///
  /// Багана бүрийг гараар буулгасан нь санаатай: буулгаагүй багана дэлгэц дээр
  /// **огт гарахгүй**. Ингэснээр өгөгдлийн сангийн англи/галиг нэр хэрэглэгчид
  /// хэзээ ч харагдахгүй (Техникийн шаардлага §1.3.11).
  static const Map<String, (String, String?)> _bodySizeLabels =
      <String, (String, String?)>{
    'Height': ('Өндөр', 'см'),
    'Weigth': ('Жин', 'кг'),
    'BJI': ('Биеийн жингийн индекс (БЖИ)', null),
    'Buselkhii': ('Бүсэлхийн тойрог', 'см'),
    'DaraltDeed': ('Дээд даралт', 'мм.МУБ'),
    'DaraltDood': ('Доод даралт', 'мм.МУБ'),
    'HeartRate': ('Зүрхний цохилт', 'уд/мин'),
    'RespiratoryRate': ('Амьсгалын тоо', 'уд/мин'),
    'Temperature': ('Биеийн халуун', '°C'),
    'Saturatsi': ('Хүчилтөрөгчийн ханалт', '%'),
    'Sahar': ('Цусны сахар', null),
    'UlunGlucose': ('Өлөн үеийн глюкоз', null),
    'SanamsarguiGlucose': ('Санамсаргүй үеийн глюкоз', null),
    'Cholesterol': ('Холестерин', null),
    'Tailbar': ('Тайлбар', null),
  };

  /// `PatientOwnHistory` баганын нэр → монгол шошго.
  ///
  /// Эдгээр нь бүгд тийм/үгүй хэлбэрийн асуулт.
  static const Map<String, String> _historyLabels = <String, String>{
    'TamkhiTatdag': ('Тамхи татдаг эсэх'),
    'Holestrin': ('Холестерин ихэссэн эсэх'),
    'TsusniiSahar': ('Цусны сахар ихэссэн эсэх'),
    'IsDaraltEm': ('Даралтын эм хэрэглэдэг эсэх'),
    'IsDiabeticEm': ('Чихрийн шижингийн эм хэрэглэдэг эсэх'),
    'ZurkhShigdees': ('Зүрхний шигдээс тохиолдсон эсэх'),
    'Stenokardi': ('Стенокарди оноштой эсэх'),
    'TarkhiHarvalt': ('Тархины харвалт тохиолдсон эсэх'),
    'TsusHomsroh': ('Цус хомсрох өвчтэй эсэх'),
    'ZahiinSudas': ('Захын судасны өвчтэй эсэх'),
    'BuurniiArhagUwchin': ('Бөөрний архаг өвчтэй эсэх'),
    'GerbulNasbaralt': ('Гэр бүлд эрт нас баралт тохиолдсон эсэх'),
  };

  factory RiskAssessment.fromJson(Map<String, dynamic> json) {
    final bodySize = J.obj(json, <String>['bodySize']);
    final history = J.obj(json, <String>['history']);

    return RiskAssessment(
      bodySizeFields: _readBodySize(bodySize),
      historyFields: _readHistory(history),
      measuredAt:
          bodySize == null ? null : J.date(bodySize, <String>['CreatedDate']),
    );
  }

  static List<RiskField> _readBodySize(Map<String, dynamic>? row) {
    if (row == null) return const <RiskField>[];
    final fields = <RiskField>[];
    _bodySizeLabels.forEach((String column, (String, String?) meta) {
      final raw = _clean(row[column]);
      if (raw == null) return;
      fields.add(RiskField(label: meta.$1, value: raw, unit: meta.$2));
    });
    return fields;
  }

  static List<RiskField> _readHistory(Map<String, dynamic>? row) {
    if (row == null) return const <RiskField>[];
    final fields = <RiskField>[];
    _historyLabels.forEach((String column, String label) {
      final raw = _clean(row[column]);
      if (raw == null) return;
      fields.add(
        RiskField(label: label, value: _yesNo(raw), isYesNo: true),
      );
    });
    return fields;
  }

  /// Хоосон, `null`, `0`-той тэнцэх утгыг хасна.
  static String? _clean(dynamic value) {
    if (value == null) return null;
    final text = value.toString().trim();
    if (text.isEmpty) return null;
    if (text.toLowerCase() == 'null') return null;
    return text;
  }

  /// Түүхийн талбарууд `'1'` / `'0'` эсвэл текстээр ирж болно.
  static String _yesNo(String raw) {
    final lower = raw.toLowerCase();
    if (lower == '1' || lower == 'true' || lower == 'y' || lower == 'yes') {
      return 'Тийм';
    }
    if (lower == '0' || lower == 'false' || lower == 'n' || lower == 'no') {
      return 'Үгүй';
    }
    return raw;
  }
}
