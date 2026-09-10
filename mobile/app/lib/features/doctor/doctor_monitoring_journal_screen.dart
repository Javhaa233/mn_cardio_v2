import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/date_range_field.dart';
import '../../shared/widgets/measurement_chart.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import '../journal/journal_entry.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_patient_card_screen.dart';
import 'doctor_repository.dart';

/// Хяналтад буй үйлчлүүлэгчийн өдөр тутмын хэмжилт.
///
/// Хяналтад байхгүй хүнийг сервер `403 NOT_MONITORED` гэж татгалзана —
/// хяналтын жагсаалт утга агуулах учир нь энэ.
class DoctorMonitoringJournalScreen extends StatefulWidget {
  const DoctorMonitoringJournalScreen({
    super.key,
    required this.patientId,
    required this.patientName,
  });

  final int patientId;
  final String patientName;

  @override
  State<DoctorMonitoringJournalScreen> createState() =>
      _DoctorMonitoringJournalScreenState();
}

class _DoctorMonitoringJournalScreenState
    extends State<DoctorMonitoringJournalScreen> {
  late final MonitoringJournalController _controller;

  @override
  void initState() {
    super.initState();
    _controller = MonitoringJournalController(
      context.read<DoctorRepository>(),
      widget.patientId,
    );
    _controller.load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<MonitoringJournalController>.value(
      value: _controller,
      child: Scaffold(
        appBar: AppBar(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text('Хяналтын хэмжилт'),
              Text(
                widget.patientName,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(fontSize: 11.5),
              ),
            ],
          ),
          actions: <Widget>[
            IconButton(
              tooltip: 'Үйлчлүүлэгчийн карт',
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => DoctorPatientCardScreen(
                    patientId: widget.patientId,
                    initialName: widget.patientName,
                  ),
                ),
              ),
              icon: const Icon(Icons.badge_outlined),
            ),
          ],
        ),
        body: Consumer<MonitoringJournalController>(
          builder: (
            BuildContext context,
            MonitoringJournalController controller,
            _,
          ) {
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
                        return const LoadingView(
                          label: 'Хэмжилт уншиж байна…',
                        );
                      }
                      if (state.hasError && !state.hasData) {
                        return ErrorView(
                          error: state.error!,
                          onRetry: () => controller.load(refresh: true),
                        );
                      }

                      final bundle = state.data ?? PatientJournalBundle.empty;
                      if (bundle.isEmpty) {
                        return const EmptyView(
                          title: 'Хэмжилт байхгүй байна',
                          message: 'Энэ үйлчлүүлэгч сонгосон хугацаанд '
                              'хэмжилт бүртгээгүй байна.',
                          icon: Icons.monitor_heart_outlined,
                        );
                      }

                      return RefreshIndicator(
                        onRefresh: () => controller.load(refresh: true),
                        child: ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                          children: <Widget>[
                            if (bundle.summary.hasBloodPressure)
                              SectionCard(
                                title: 'Цусны даралт',
                                subtitle: 'мм.МУБ',
                                icon: Icons.monitor_heart_outlined,
                                child: MeasurementChart(
                                  labels: bundle.summary.labels,
                                  unit: 'мм.МУБ',
                                  series: <ChartSeries>[
                                    ChartSeries(
                                      name: 'Дээд (систол)',
                                      color: ChartPalette.systolic,
                                      values: bundle.summary.systolic,
                                    ),
                                    ChartSeries(
                                      name: 'Доод (диастол)',
                                      color: ChartPalette.diastolic,
                                      values: bundle.summary.diastolic,
                                    ),
                                  ],
                                ),
                              ),
                            if (bundle.summary.hasPulse) ...<Widget>[
                              const SizedBox(height: 12),
                              SectionCard(
                                title: 'Судасны цохилт',
                                subtitle: 'уд/мин',
                                icon: Icons.favorite_outline_rounded,
                                child: MeasurementChart(
                                  labels: bundle.summary.labels,
                                  unit: 'уд/мин',
                                  series: <ChartSeries>[
                                    ChartSeries(
                                      name: 'Судасны цохилт',
                                      color: ChartPalette.pulse,
                                      values: bundle.summary.pulse,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (bundle.summary.hasWeight) ...<Widget>[
                              const SizedBox(height: 12),
                              SectionCard(
                                title: 'Жин',
                                subtitle: 'кг',
                                icon: Icons.scale_outlined,
                                child: MeasurementChart(
                                  labels: bundle.summary.labels,
                                  unit: 'кг',
                                  series: <ChartSeries>[
                                    ChartSeries(
                                      name: 'Жин',
                                      color: ChartPalette.weight,
                                      values: bundle.summary.weight,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (bundle.rows.isNotEmpty) ...<Widget>[
                              const SizedBox(height: 18),
                              Text(
                                'Бүртгэлийн түүх',
                                style: Theme.of(context).textTheme.titleSmall,
                              ),
                              const SizedBox(height: 10),
                              // Сервер өсөх дарааллаар өгдөг тул шинэхнийг
                              // дээр нь харуулахын тулд эргүүлнэ.
                              for (final entry in bundle.rows.reversed)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: _JournalRow(entry: entry),
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
          },
        ),
      ),
    );
  }
}

class _JournalRow extends StatelessWidget {
  const _JournalRow({required this.entry});

  final JournalEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final comment = (entry.comment ?? '').trim();

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 11, 14, 11),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Text(entry.whenLabel, style: theme.textTheme.titleSmall),
              const Spacer(),
              Text(
                MnFormat.friendlyDate(entry.date),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          if (!entry.isEmptyReading) ...<Widget>[
            const SizedBox(height: 9),
            Wrap(
              spacing: 16,
              runSpacing: 6,
              children: <Widget>[
                if (entry.hasBloodPressure)
                  _Chip(
                    label: 'Даралт',
                    value: entry.bloodPressureLabel,
                    color: AppColors.chartSystolic,
                  ),
                if (entry.pulse != null)
                  _Chip(
                    label: 'Цохилт',
                    value: MnFormat.number(entry.pulse, decimals: 0),
                    color: AppColors.chartPulse,
                  ),
                if (entry.weight != null)
                  _Chip(
                    label: 'Жин',
                    value: MnFormat.number(entry.weight),
                    color: AppColors.chartWeight,
                  ),
                if (entry.inr != null)
                  _Chip(
                    label: 'INR',
                    value: MnFormat.number(entry.inr, decimals: 2),
                    color: AppColors.info,
                  ),
              ],
            ),
          ],
          if (comment.isNotEmpty) ...<Widget>[
            const SizedBox(height: 9),
            Text(comment, style: theme.textTheme.bodySmall),
          ],
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Text(
          '$label ',
          style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
        ),
        Text(
          value,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }
}
