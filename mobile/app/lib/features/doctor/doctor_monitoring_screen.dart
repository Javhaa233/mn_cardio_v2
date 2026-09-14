import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_monitoring_journal_screen.dart';
import 'doctor_patients_screen.dart';

/// 1.2 Миний хяналт.
class DoctorMonitoringScreen extends StatefulWidget {
  const DoctorMonitoringScreen({super.key});

  @override
  State<DoctorMonitoringScreen> createState() => _DoctorMonitoringScreenState();
}

class _DoctorMonitoringScreenState extends State<DoctorMonitoringScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<DoctorMonitoringController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<DoctorMonitoringController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Миний хяналт')),
      floatingActionButton: FloatingActionButton.extended(
        // Доод цэсний табууд IndexedStack дотор нэг route-д хамт амьдардаг.
        // Анхдагч hero tag-тай хоёр FAB тэнд мөргөлдөж, шилжилт бүрт
        // "multiple heroes share the same tag" алдаа шиднэ.
        heroTag: null,
        onPressed: _addPatient,
        icon: const Icon(Icons.person_add_alt_rounded),
        label: const Text('Хяналтад авах'),
      ),
      body: PagedListView<MonitoringRow>(
        controller: controller,
        loadingLabel: 'Хяналтын жагсаалт уншиж байна…',
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 90),
        itemBuilder: (BuildContext context, MonitoringRow row, _) =>
            _MonitoringTile(
          row: row,
          onOpen: () => _openJournal(row),
          onRemove: () => _remove(row),
        ),
        empty: EmptyView(
          title: 'Хяналтад хэн ч байхгүй байна',
          message: 'Үйлчлүүлэгчийг хувийн хяналтад авснаар тэдний өдөр '
              'тутмын хэмжилтийг эндээс хянах боломжтой болно.',
          icon: Icons.monitor_heart_outlined,
          actionLabel: 'Үйлчлүүлэгч хайх',
          onAction: _addPatient,
        ),
      ),
    );
  }

  Future<void> _addPatient() async {
    final patient = await Navigator.of(context).push<PatientBrief>(
      MaterialPageRoute<PatientBrief>(
        builder: (_) => const DoctorPatientsScreen(pickMode: true),
      ),
    );
    if (patient == null || !mounted) return;

    final error =
        await context.read<DoctorMonitoringController>().add(patient.idData);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.success(context, '${patient.fullName} хяналтад нэмэгдлээ.');
    }
  }

  void _openJournal(MonitoringRow row) {
    final patientId = row.patientId;
    if (patientId == null) return;
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DoctorMonitoringJournalScreen(
          patientId: patientId,
          patientName: row.patient?.fullName ?? 'Үйлчлүүлэгч',
        ),
      ),
    );
  }

  Future<void> _remove(MonitoringRow row) async {
    final patientId = row.patientId;
    if (patientId == null) return;

    final confirmed = await confirmDialog(
      context,
      title: 'Хяналтаас хасах',
      message: '${row.patient?.fullName ?? 'Энэ үйлчлүүлэгч'}-ийг хувийн '
          'хяналтаас хасах уу? Үйлчлүүлэгчийн бүртгэл устахгүй.',
      confirmLabel: 'Хасах',
      destructive: true,
    );
    if (!confirmed || !mounted) return;

    final error =
        await context.read<DoctorMonitoringController>().remove(patientId);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.info(context, 'Хяналтаас хаслаа.');
    }
  }
}

class _MonitoringTile extends StatelessWidget {
  const _MonitoringTile({
    required this.row,
    required this.onOpen,
    required this.onRemove,
  });

  final MonitoringRow row;
  final VoidCallback onOpen;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final patient = row.patient;
    final reading = row.latestReading;

    return SectionCard(
      onTap: onOpen,
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              CircleAvatar(
                radius: 21,
                backgroundColor:
                    theme.colorScheme.primary.withValues(alpha: 0.12),
                child: Text(
                  patient?.initials ?? '—',
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      patient?.fullName ?? 'Үйлчлүүлэгч',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleSmall,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      patient?.subtitle ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: onRemove,
                tooltip: 'Хяналтаас хасах',
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.person_remove_outlined, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (reading == null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest
                    .withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Хэмжилт бүртгээгүй байна',
                style: theme.textTheme.bodySmall,
              ),
            )
          else
            Row(
              children: <Widget>[
                Expanded(
                  child: _Reading(
                    label: 'Даралт',
                    value: reading.bloodPressureLabel,
                    color: AppColors.chartSystolic,
                  ),
                ),
                Expanded(
                  child: _Reading(
                    label: 'Цохилт',
                    value: MnFormat.number(reading.pulse, decimals: 0),
                    color: AppColors.chartPulse,
                  ),
                ),
                Expanded(
                  child: _Reading(
                    label: 'Жин',
                    value: MnFormat.number(reading.weight),
                    color: AppColors.chartWeight,
                  ),
                ),
                Expanded(
                  child: _Reading(
                    label: 'Огноо',
                    value: MnFormat.friendlyDate(reading.date),
                    color: theme.colorScheme.onSurfaceVariant,
                    small: true,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _Reading extends StatelessWidget {
  const _Reading({
    required this.label,
    required this.value,
    required this.color,
    this.small = false,
  });

  final String label;
  final String value;
  final Color color;
  final bool small;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: (small ? theme.textTheme.bodySmall : theme.textTheme.titleSmall)
              ?.copyWith(
            color: color,
            fontWeight: small ? FontWeight.w500 : FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
