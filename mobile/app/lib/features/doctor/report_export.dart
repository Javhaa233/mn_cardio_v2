import 'dart:convert';
import 'dart:io';

import 'package:excel/excel.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';

import '../../core/config/app_config.dart';
import '../../core/util/mn_format.dart';
import '../../shared/widgets/date_range_field.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';

/// Тайлан татах формат — Техникийн шаардлага §1.8 "XLS, TXT гм олон төрлийн
/// файлын форматаар татан авах".
enum ReportFormat {
  xlsx('Excel', 'xlsx'),
  csv('CSV', 'csv'),
  txt('Текст', 'txt');

  const ReportFormat(this.label, this.extension);

  final String label;
  final String extension;
}

/// "Миний тайлан"-г файл болгоно.
///
/// Серверт шинэ endpoint хэрэггүй: хураангуйг `/api/doctor/reports/summary`,
/// үзлэгийн мөрүүдийг `/api/doctor/visits`-ээс (тэр хамрах хүрээ, тэр хугацаа)
/// аваад файлыг **утсан дээр** үүсгэнэ.
///
/// Файл бүр §1.8-ийн эх сурвалжийн тэмдэглэгээтэй: аль байгууллага, аль
/// мэдээллийн сан, хэн, хэзээ, ямар хугацаагаар гаргасан.
class DoctorReportExporter {
  DoctorReportExporter(this._repo);

  final DoctorRepository _repo;

  /// Утсан дээр нэг дор бэлдэх үзлэгийн дээд тоо. Түүнээс их бол файлд
  /// "хасагдсан" гэж тодорхой бичнэ — чимээгүй тасалбал тайлан худлаа болно.
  static const int maxVisitRows = 5000;
  static const int _page = 100;

  Future<File> export({
    required ReportFormat format,
    required DoctorReport report,
    required DateRange range,
    DoctorMe? me,
  }) async {
    final visits = <DoctorVisit>[];
    var total = 0;
    while (visits.length < maxVisitRows) {
      final page = await _repo.fetchVisits(
        limit: _page,
        offset: visits.length,
        range: range,
      );
      total = page.total;
      visits.addAll(page.items);
      if (!page.hasMore || page.items.isEmpty) break;
    }

    final generatedAt = DateTime.now();
    final source = _Provenance(
      organization: me?.organizationName ??
          (report.sourceOrganizationId == null
              ? 'Бүх байгууллага'
              : '№ ${report.sourceOrganizationId}'),
      author: me?.fullName ?? '',
      range: range.label,
      generatedAt: generatedAt,
      server: Uri.tryParse(AppConfig.baseUrl)?.host ?? AppConfig.baseUrl,
      rows: visits.length,
      totalRows: total,
    );

    final bytes = switch (format) {
      ReportFormat.xlsx => _xlsx(report, visits, source),
      ReportFormat.csv => _csv(visits, source),
      ReportFormat.txt => _txt(report, visits, source),
    };

    final dir = await getTemporaryDirectory();
    final stamp = DateFormat('yyyyMMdd_HHmm').format(generatedAt);
    final file = File('${dir.path}/MnCardio_tailan_$stamp.${format.extension}');
    return file.writeAsBytes(bytes, flush: true);
  }

  // ------------------------------------------------------------------ xlsx

  List<int> _xlsx(
    DoctorReport report,
    List<DoctorVisit> visits,
    _Provenance source,
  ) {
    final book = Excel.createExcel();
    const summaryName = 'Хураангуй';
    const visitsName = 'Үзлэгүүд';
    book.rename(book.getDefaultSheet() ?? 'Sheet1', summaryName);

    final summary = book[summaryName];
    TextCellValue t(String v) => TextCellValue(v);

    summary.appendRow(<CellValue>[t('МнКардио — Миний тайлан')]);
    summary.appendRow(<CellValue>[]);
    for (final line in source.lines) {
      summary.appendRow(<CellValue>[t(line.$1), t(line.$2)]);
    }
    summary.appendRow(<CellValue>[]);
    summary.appendRow(<CellValue>[t('Үзүүлэлт'), t('Тоо')]);
    for (final row in _counts(report)) {
      summary.appendRow(<CellValue>[t(row.$1), IntCellValue(row.$2)]);
    }
    summary.appendRow(<CellValue>[]);
    summary.appendRow(<CellValue>[t('Түгээмэл онош'), t('Тоо')]);
    for (final d in report.topDiagnoses) {
      summary.appendRow(<CellValue>[t(d.diagnosis), IntCellValue(d.total)]);
    }
    summary.setColumnWidth(0, 42);
    summary.setColumnWidth(1, 36);

    final sheet = book[visitsName];
    sheet.appendRow(_visitHeader.map(t).toList());
    for (final v in visits) {
      sheet.appendRow(_visitRow(v).map(t).toList());
    }
    const widths = <double>[12, 14, 16, 16, 40, 10, 40, 10];
    for (var i = 0; i < widths.length; i++) {
      sheet.setColumnWidth(i, widths[i]);
    }

    return book.encode() ?? const <int>[];
  }

  // ------------------------------------------------------------------- csv

  List<int> _csv(List<DoctorVisit> visits, _Provenance source) {
    final b = StringBuffer();
    // Эх сурвалжийг эхний мөрүүдэд — CSV-д тусдаа хуудас байхгүй.
    for (final line in source.lines) {
      b.writeln(_csvRow(<String>[line.$1, line.$2]));
    }
    b.writeln();
    b.writeln(_csvRow(_visitHeader));
    for (final v in visits) {
      b.writeln(_csvRow(_visitRow(v)));
    }
    // UTF-8 BOM: үгүй бол Excel кирилл үсгийг эвдэж нээнэ.
    return <int>[0xEF, 0xBB, 0xBF, ...utf8.encode(b.toString())];
  }

  String _csvRow(List<String> cells) => cells.map((String c) {
        final v = c.replaceAll('\r', ' ').replaceAll('\n', ' ');
        return v.contains(RegExp(r'[",;]')) ? '"${v.replaceAll('"', '""')}"' : v;
      }).join(',');

  // ------------------------------------------------------------------- txt

  List<int> _txt(
    DoctorReport report,
    List<DoctorVisit> visits,
    _Provenance source,
  ) {
    final b = StringBuffer()
      ..writeln('МнКардио — Миний тайлан')
      ..writeln('=' * 40);
    for (final line in source.lines) {
      b.writeln('${line.$1}: ${line.$2}');
    }
    b
      ..writeln()
      ..writeln('ТООН ҮЗҮҮЛЭЛТ')
      ..writeln('-' * 40);
    for (final row in _counts(report)) {
      b.writeln('${row.$1}: ${row.$2}');
    }
    b
      ..writeln()
      ..writeln('ТҮГЭЭМЭЛ ОНОШ')
      ..writeln('-' * 40);
    if (report.topDiagnoses.isEmpty) b.writeln('Бүртгэгдээгүй');
    for (final d in report.topDiagnoses) {
      b.writeln('${d.total}\t${d.diagnosis}');
    }
    b
      ..writeln()
      ..writeln('ҮЗЛЭГҮҮД (${visits.length})')
      ..writeln('-' * 40)
      ..writeln(_visitHeader.join('\t'));
    for (final v in visits) {
      b.writeln(_visitRow(v)
          .map((String c) => c.replaceAll(RegExp(r'[\t\r\n]+'), ' '))
          .join('\t'));
    }
    return utf8.encode(b.toString());
  }

  // ---------------------------------------------------------------- shared

  List<(String, int)> _counts(DoctorReport r) => <(String, int)>[
        ('Миний үзлэг', r.myVisits),
        ('Байгууллагын үзлэг', r.organizationVisits),
        ('Хяналтад буй үйлчлүүлэгч', r.monitoredPatients),
        ('Бичсэн зөвлөгөө', r.adviceAuthored),
      ];

  static const List<String> _visitHeader = <String>[
    'Огноо',
    'Регистр',
    'Овог',
    'Нэр',
    'Онош',
    'ICD-10',
    'Гомдол',
    'Хүндрэл',
  ];

  List<String> _visitRow(DoctorVisit v) => <String>[
        MnFormat.date(v.visitDate),
        v.patient?.registration ?? v.patRegNo ?? '',
        v.patient?.lastName ?? '',
        v.patient?.firstName ?? '',
        v.diagnosisLabel,
        v.icd10 ?? '',
        v.chiefComplaint ?? '',
        v.hasComplication ? 'Тийм' : 'Үгүй',
      ];
}

/// §1.8 — "ямар байгууллагын аль мэдээллийн сангаас мэдээлэл татагдсан талаарх
/// тэмдэглэгээ, хугацааны хамт".
class _Provenance {
  const _Provenance({
    required this.organization,
    required this.author,
    required this.range,
    required this.generatedAt,
    required this.server,
    required this.rows,
    required this.totalRows,
  });

  final String organization;
  final String author;
  final String range;
  final DateTime generatedAt;
  final String server;
  final int rows;
  final int totalRows;

  List<(String, String)> get lines => <(String, String)>[
        ('Байгууллага', organization),
        ('Мэдээллийн сан', 'МнКардио ($server)'),
        if (author.isNotEmpty) ('Гаргасан', author),
        ('Гаргасан огноо', MnFormat.dateTime(generatedAt)),
        ('Тайлангийн хугацаа', range),
        (
          'Үзлэгийн мөр',
          rows < totalRows
              ? '$rows / $totalRows — утсан дээр дээд тал нь '
                  '${DoctorReportExporter.maxVisitRows}; бүрэн жагсаалтыг вэбээс'
              : '$rows',
        ),
      ];
}
