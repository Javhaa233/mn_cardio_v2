import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/network/api_exception.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/date_range_field.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';
import 'report_export.dart';

/// 1.4 Миний тайлан.
///
/// Гар утасны товч тайлан, Excel / CSV / TXT-ээр татах боломжтой (§1.8).
/// Батлагдсан маягтын дагуух тайлан нь ЗСҮТ маягтаа өгсний дараах тусдаа ажил.
class DoctorReportScreen extends StatefulWidget {
  const DoctorReportScreen({super.key});

  @override
  State<DoctorReportScreen> createState() => _DoctorReportScreenState();
}

class _DoctorReportScreenState extends State<DoctorReportScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<DoctorReportController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<DoctorReportController>();
    final state = controller.state;

    return Scaffold(
      appBar: AppBar(title: const Text('Миний тайлан')),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: DateRangeFilterBar(
              value: controller.range,
              onChanged: controller.setRange,
              presets: const <int>[7, 30, 90, 365],
            ),
          ),
          Expanded(
            child: Builder(
              builder: (BuildContext context) {
                if (state.isFirstLoad) {
                  return const LoadingView(label: 'Тайлан бэлдэж байна…');
                }
                if (state.hasError && !state.hasData) {
                  return ErrorView(
                    error: state.error!,
                    onRetry: () => controller.load(refresh: true),
                  );
                }

                final report = state.data ?? DoctorReport.empty;

                return RefreshIndicator(
                  onRefresh: () => controller.load(refresh: true),
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                    children: <Widget>[
                      _CountsCard(report: report),
                      const SizedBox(height: 12),
                      _TopDiagnosesCard(report: report),
                      const SizedBox(height: 12),
                      _SourceCard(report: report),
                      const SizedBox(height: 12),
                      _ExportCard(report: report, range: controller.range),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CountsCard extends StatelessWidget {
  const _CountsCard({required this.report});

  final DoctorReport report;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Тоон үзүүлэлт',
      icon: Icons.insights_outlined,
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: StatTile(
                  label: 'Миний үзлэг',
                  value: '${report.myVisits}',
                  icon: Icons.assignment_outlined,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatTile(
                  label: 'Байгууллагын үзлэг',
                  value: '${report.organizationVisits}',
                  color: AppColors.info,
                  icon: Icons.apartment_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              Expanded(
                child: StatTile(
                  label: 'Хяналтад буй',
                  value: '${report.monitoredPatients}',
                  color: AppColors.chartPulse,
                  icon: Icons.monitor_heart_outlined,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatTile(
                  label: 'Бичсэн зөвлөгөө',
                  value: '${report.adviceAuthored}',
                  color: AppColors.chartWeight,
                  icon: Icons.tips_and_updates_outlined,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TopDiagnosesCard extends StatelessWidget {
  const _TopDiagnosesCard({required this.report});

  final DoctorReport report;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final items = report.topDiagnoses;

    if (items.isEmpty) {
      return SectionCard(
        title: 'Түгээмэл онош',
        icon: Icons.medical_information_outlined,
        child: Text(
          'Сонгосон хугацаанд онош бүртгэгдээгүй байна.',
          style: theme.textTheme.bodySmall,
        ),
      );
    }

    final maxTotal = items
        .map((DiagnosisCount d) => d.total)
        .fold<int>(1, (int a, int b) => a > b ? a : b);

    return SectionCard(
      title: 'Түгээмэл онош',
      subtitle: 'Миний бүртгэсэн үзлэгээр',
      icon: Icons.medical_information_outlined,
      child: Column(
        children: <Widget>[
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          item.diagnosis,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        '${item.total}',
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: item.total / maxTotal,
                      minHeight: 6,
                      backgroundColor: theme.colorScheme.surfaceContainerHighest,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Техникийн шаардлага §29 — мэдээллийн эх сурвалжийн тэмдэглэгээ.
class _SourceCard extends StatelessWidget {
  const _SourceCard({required this.report});

  final DoctorReport report;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Эх сурвалж',
      icon: Icons.verified_outlined,
      child: Column(
        children: <Widget>[
          InfoRow(
            label: 'Хугацаа',
            value: report.from == null && report.to == null
                ? 'Бүх хугацаа'
                : '${report.from ?? '…'} – ${report.to ?? '…'}',
          ),
          InfoRow(
            label: 'Байгууллага',
            value: report.sourceOrganizationId == null
                ? 'Бүх байгууллага'
                : '№ ${report.sourceOrganizationId}',
          ),
          InfoRow(
            label: 'Гаргасан хугацаа',
            value: MnFormat.dateTime(report.generatedAt),
          ),
          InfoRow(
            label: 'Мэдээллийн сан',
            value: 'МнКардио',
          ),
        ],
      ),
    );
  }
}

/// Техникийн шаардлага §1.8 — тайланг XLS, TXT зэрэг форматаар татах.
class _ExportCard extends StatefulWidget {
  const _ExportCard({required this.report, required this.range});

  final DoctorReport report;
  final DateRange range;

  @override
  State<_ExportCard> createState() => _ExportCardState();
}

class _ExportCardState extends State<_ExportCard> {
  ReportFormat? _busy;

  Future<void> _export(ReportFormat format, BuildContext buttonContext) async {
    if (_busy != null) return;
    setState(() => _busy = format);

    // iPad дээр хуваалцах цонх товчны дэргэд гарахад байрлал хэрэгтэй.
    final box = buttonContext.findRenderObject() as RenderBox?;
    final origin =
        box == null ? null : box.localToGlobal(Offset.zero) & box.size;

    try {
      final exporter = DoctorReportExporter(context.read<DoctorRepository>());
      final file = await exporter.export(
        format: format,
        report: widget.report,
        range: widget.range,
        me: context.read<DoctorProfileController>().me,
      );
      if (!mounted) return;
      await SharePlus.instance.share(ShareParams(
        files: <XFile>[XFile(file.path)],
        subject: 'МнКардио — Миний тайлан (${widget.range.label})',
        sharePositionOrigin: origin,
      ));
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Тайлан үүсгэж чадсангүй.');
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      title: 'Тайлан татах',
      subtitle: widget.range.label,
      icon: Icons.download_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'Хураангуй ба сонгосон хугацааны үзлэгүүд. Файл бүр байгууллага, '
            'мэдээллийн сан, гаргасан хүн, огнооны тэмдэглэгээтэй.',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              for (final format in ReportFormat.values) ...<Widget>[
                if (format != ReportFormat.values.first)
                  const SizedBox(width: 8),
                Expanded(
                  child: Builder(
                    builder: (BuildContext buttonContext) => OutlinedButton.icon(
                      onPressed: _busy == null
                          ? () => _export(format, buttonContext)
                          : null,
                      icon: _busy == format
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Icon(_iconFor(format), size: 18),
                      label: Text(format.label),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  IconData _iconFor(ReportFormat format) => switch (format) {
        ReportFormat.xlsx => Icons.table_chart_outlined,
        ReportFormat.csv => Icons.grid_on_outlined,
        ReportFormat.txt => Icons.description_outlined,
      };
}
