import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/date_range_field.dart';
import '../../shared/widgets/measurement_chart.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'journal_controller.dart';
import 'journal_entry.dart';
import 'journal_form_screen.dart';

/// 2.2 Миний тэмдэглэл — жагсаалт ба график.
class JournalScreen extends StatefulWidget {
  const JournalScreen({super.key});

  @override
  State<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends State<JournalScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final list = context.read<JournalController>();
      if (list.state.isIdle) list.load();
      final summary = context.read<JournalSummaryController>();
      if (summary.state.isIdle) summary.load();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Миний тэмдэглэл'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const <Widget>[
            Tab(text: 'Бүртгэл'),
            Tab(text: 'График'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        // Доод цэсний табууд IndexedStack дотор нэг route-д хамт амьдардаг.
        // Анхдагч hero tag-тай хоёр FAB тэнд мөргөлдөж, шилжилт бүрт
        // "multiple heroes share the same tag" алдаа шиднэ.
        heroTag: null,
        onPressed: _openForm,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Нэмэх'),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const <Widget>[
          _JournalListTab(),
          _JournalChartTab(),
        ],
      ),
    );
  }

  Future<void> _openForm() async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => const JournalFormScreen(),
      ),
    );
    if (saved == true && mounted) {
      // Шинэ хэмжилт нэмэгдсэн тул график ч мөн шинэчлэгдэнэ.
      context.read<JournalSummaryController>().load(refresh: true);
    }
  }
}

// ---------------------------------------------------------------------------
// Бүртгэлийн жагсаалт
// ---------------------------------------------------------------------------

class _JournalListTab extends StatelessWidget {
  const _JournalListTab();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<JournalController>();

    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: DateRangeFilterBar(
            value: controller.range,
            onChanged: controller.setRange,
          ),
        ),
        Expanded(
          child: PagedListView<JournalEntry>(
            controller: controller,
            loadingLabel: 'Тэмдэглэл уншиж байна…',
            itemBuilder: (BuildContext context, JournalEntry entry, _) =>
                _JournalTile(entry: entry),
            empty: EmptyView(
              title: controller.range.isEmpty
                  ? 'Тэмдэглэл байхгүй байна'
                  : 'Энэ хугацаанд тэмдэглэл алга',
              message: controller.range.isEmpty
                  ? 'Даралт, судасны цохилт, жингээ өдөр бүр бүртгэснээр '
                      'эмч тань биеийн байдлыг тань хянах боломжтой болно.'
                  : 'Өөр хугацаа сонгож үзнэ үү.',
              icon: Icons.event_note_outlined,
            ),
          ),
        ),
      ],
    );
  }
}

class _JournalTile extends StatelessWidget {
  const _JournalTile({required this.entry});

  final JournalEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final comment = (entry.comment ?? '').trim();

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                Icons.event_outlined,
                size: 17,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  entry.whenLabel,
                  style: theme.textTheme.titleSmall,
                ),
              ),
              Text(
                MnFormat.friendlyDate(entry.date),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          if (!entry.isEmptyReading) ...<Widget>[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: <Widget>[
                if (entry.hasBloodPressure)
                  _Reading(
                    icon: Icons.monitor_heart_outlined,
                    label: 'Даралт',
                    value: entry.bloodPressureLabel,
                    unit: 'мм.МУБ',
                    color: AppColors.chartSystolic,
                  ),
                if (entry.pulse != null)
                  _Reading(
                    icon: Icons.favorite_outline_rounded,
                    label: 'Цохилт',
                    value: MnFormat.number(entry.pulse, decimals: 0),
                    unit: 'уд/мин',
                    color: AppColors.chartPulse,
                  ),
                if (entry.weight != null)
                  _Reading(
                    icon: Icons.scale_outlined,
                    label: 'Жин',
                    value: MnFormat.number(entry.weight),
                    unit: 'кг',
                    color: AppColors.chartWeight,
                  ),
                if (entry.inr != null)
                  _Reading(
                    icon: Icons.science_outlined,
                    label: 'INR',
                    value: MnFormat.number(entry.inr, decimals: 2),
                    unit: '',
                    color: AppColors.info,
                  ),
              ],
            ),
          ],
          if (comment.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest
                    .withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(comment, style: theme.textTheme.bodySmall),
            ),
          ],
        ],
      ),
    );
  }
}

class _Reading extends StatelessWidget {
  const _Reading({
    required this.icon,
    required this.label,
    required this.value,
    required this.unit,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final String unit;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 15, color: color),
          const SizedBox(width: 7),
          Text(
            '$label ',
            style: theme.textTheme.bodySmall?.copyWith(fontSize: 12.5),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          if (unit.isNotEmpty) ...<Widget>[
            const SizedBox(width: 3),
            Text(
              unit,
              style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// График
// ---------------------------------------------------------------------------

class _JournalChartTab extends StatelessWidget {
  const _JournalChartTab();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<JournalSummaryController>();
    final state = controller.state;

    return Column(
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
                return const LoadingView(label: 'График бэлдэж байна…');
              }
              if (state.hasError && !state.hasData) {
                return ErrorView(
                  error: state.error!,
                  onRetry: () => controller.load(refresh: true),
                );
              }

              final summary = state.data ?? JournalSummary.empty;
              if (summary.isEmpty) {
                return const EmptyView(
                  title: 'Харуулах өгөгдөл алга',
                  message: 'Тэмдэглэл нэмсний дараа график энд харагдана.',
                  icon: Icons.show_chart_rounded,
                );
              }

              return RefreshIndicator(
                onRefresh: () => controller.load(refresh: true),
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                  children: <Widget>[
                    if (summary.hasBloodPressure)
                      SectionCard(
                        title: 'Цусны даралт',
                        subtitle: 'мм.МУБ',
                        icon: Icons.monitor_heart_outlined,
                        child: MeasurementChart(
                          labels: summary.labels,
                          unit: 'мм.МУБ',
                          series: <ChartSeries>[
                            ChartSeries(
                              name: 'Дээд (систол)',
                              color: ChartPalette.systolic,
                              values: summary.systolic,
                            ),
                            ChartSeries(
                              name: 'Доод (диастол)',
                              color: ChartPalette.diastolic,
                              values: summary.diastolic,
                            ),
                          ],
                        ),
                      ),
                    if (summary.hasPulse) ...<Widget>[
                      const SizedBox(height: 12),
                      SectionCard(
                        title: 'Судасны цохилт',
                        subtitle: 'уд/мин',
                        icon: Icons.favorite_outline_rounded,
                        child: MeasurementChart(
                          labels: summary.labels,
                          unit: 'уд/мин',
                          series: <ChartSeries>[
                            ChartSeries(
                              name: 'Судасны цохилт',
                              color: ChartPalette.pulse,
                              values: summary.pulse,
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (summary.hasWeight) ...<Widget>[
                      const SizedBox(height: 12),
                      SectionCard(
                        title: 'Жин',
                        subtitle: 'кг',
                        icon: Icons.scale_outlined,
                        child: MeasurementChart(
                          labels: summary.labels,
                          unit: 'кг',
                          series: <ChartSeries>[
                            ChartSeries(
                              name: 'Жин',
                              color: ChartPalette.weight,
                              values: summary.weight,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
