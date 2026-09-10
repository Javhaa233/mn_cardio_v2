import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/date_range_field.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';

/// 1.4 Миний тайлан.
///
/// Энэ бол **гар утасны товч тайлан**. Батлагдсан маягтын дагуух тайлан,
/// XLS/TXT экспорт нь тендерийн тусдаа ажил бөгөөд одоо байгаа Excel, PDF
/// замаар гардаг (API.md §4, мөр 31).
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
                      const PendingModuleNotice(
                        title: 'Тайлан татаж авах',
                        message: 'Батлагдсан маягтын дагуух тайлан, XLS/TXT '
                            'форматаар татах, хэвлэх боломж МнКардио '
                            'системийн вэб хувилбарт байна. Гар утасны '
                            'хувилбар нь товч үзүүлэлт харуулна.',
                        icon: Icons.download_outlined,
                      ),
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
