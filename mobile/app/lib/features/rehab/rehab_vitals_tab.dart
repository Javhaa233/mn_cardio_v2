import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../core/util/validators.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/date_range_field.dart';
import '../../shared/widgets/measurement_chart.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'rehab_controller.dart';
import 'rehab_models.dart';
import 'rehab_screen.dart';

/// Шаардлага §44 — Амин үзүүлэлт.
class RehabVitalsTab extends StatelessWidget {
  const RehabVitalsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<RehabController>();
    final state = controller.vitals;

    if (state.isFirstLoad) {
      return const LoadingView(label: 'Амин үзүүлэлт уншиж байна…');
    }

    if (state.hasError && !state.hasData) {
      if (controller.moduleDisabled) return const RehabDisabledView();
      return ErrorView(
        error: state.error!,
        onRetry: () => controller.loadVitals(refresh: true),
      );
    }

    final bundle = state.data ?? RehabVitalsBundle.empty;

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'rehab-vitals-add',
        onPressed: () => _addVital(context),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Хэмжилт нэмэх'),
      ),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: DateRangeFilterBar(
              value: controller.vitalsRange,
              onChanged: controller.setVitalsRange,
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => controller.loadVitals(refresh: true),
              child: bundle.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: <Widget>[
                        SizedBox(
                          height: MediaQuery.sizeOf(context).height * 0.5,
                          child: const EmptyView(
                            title: 'Хэмжилт бүртгэгдээгүй байна',
                            message: 'Дасгалын өмнө болон дараа судасны '
                                'цохилт, даралтаа хэмжиж бүртгэснээр эмч '
                                'тань ачааллыг тохируулах боломжтой болно.',
                            icon: Icons.monitor_heart_outlined,
                          ),
                        ),
                      ],
                    )
                  : ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 90),
                      children: <Widget>[
                        SectionCard(
                          title: 'Судасны цохилт ба хүчилтөрөгчийн ханалт',
                          icon: Icons.show_chart_rounded,
                          child: MeasurementChart(
                            labels: bundle.labels,
                            series: <ChartSeries>[
                              ChartSeries(
                                name: 'Судасны цохилт (уд/мин)',
                                color: ChartPalette.pulse,
                                values: bundle.pulse,
                              ),
                              ChartSeries(
                                name: 'SpO₂ (%)',
                                color: ChartPalette.spo2,
                                values: bundle.spo2,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'Хэмжилтийн түүх',
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                        const SizedBox(height: 10),
                        for (final vital in bundle.rows.reversed)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _VitalTile(vital: vital),
                          ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _addVital(BuildContext context) async {
    final controller = context.read<RehabController>();
    final draft = await showModalBottomSheet<RehabVitalDraft>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => const _VitalFormSheet(),
    );
    if (draft == null) return;

    final error = await controller.addVital(draft);
    if (!context.mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.success(context, 'Хэмжилт бүртгэгдлээ.');
    }
  }
}

class _VitalTile extends StatelessWidget {
  const _VitalTile({required this.vital});

  final RehabVital vital;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  vital.phaseLabel,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                MnFormat.friendlyDateTime(vital.measuredAt),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: <Widget>[
              if (vital.pulse != null)
                _VitalValue(
                  label: 'Цохилт',
                  value: '${vital.pulse}',
                  unit: 'уд/мин',
                  color: AppColors.chartPulse,
                ),
              if ((vital.bloodPressure ?? '').trim().isNotEmpty)
                _VitalValue(
                  label: 'Даралт',
                  value: vital.bloodPressure!.trim(),
                  unit: 'мм.МУБ',
                  color: AppColors.chartSystolic,
                ),
              if (vital.spo2 != null)
                _VitalValue(
                  label: 'SpO₂',
                  value: '${vital.spo2}',
                  unit: '%',
                  color: AppColors.chartSpo2,
                ),
              if (vital.borg != null)
                _VitalValue(
                  label: 'Ачаалал',
                  value: '${vital.borg}',
                  unit: vital.borgScale == 'CR10' ? '/ 10' : '/ 20',
                  color: AppColors.info,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _VitalValue extends StatelessWidget {
  const _VitalValue({
    required this.label,
    required this.value,
    required this.unit,
    required this.color,
  });

  final String label;
  final String value;
  final String unit;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Text(label, style: theme.textTheme.bodySmall?.copyWith(fontSize: 12)),
        const SizedBox(height: 2),
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              value,
              style: theme.textTheme.titleMedium?.copyWith(
                color: color,
                fontWeight: FontWeight.w700,
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
      ],
    );
  }
}

// ---------------------------------------------------------------------------

class _VitalFormSheet extends StatefulWidget {
  const _VitalFormSheet();

  @override
  State<_VitalFormSheet> createState() => _VitalFormSheetState();
}

class _VitalFormSheetState extends State<_VitalFormSheet> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _pulse = TextEditingController();
  final TextEditingController _systolic = TextEditingController();
  final TextEditingController _diastolic = TextEditingController();
  final TextEditingController _spo2 = TextEditingController();
  final TextEditingController _notes = TextEditingController();

  String _phase = 'before';
  int? _borg;
  int? _exerciseId;

  @override
  void dispose() {
    _pulse.dispose();
    _systolic.dispose();
    _diastolic.dispose();
    _spo2.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final exercises = context.read<RehabController>().exercises.data ??
        const <RehabExercise>[];

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (BuildContext context, ScrollController scroll) {
          return Form(
            key: _formKey,
            child: ListView(
              controller: scroll,
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              children: <Widget>[
                Text('Амин үзүүлэлт нэмэх',
                    style: theme.textTheme.titleMedium),
                const SizedBox(height: 16),
                Text('Дасгалын үе шат', style: theme.textTheme.titleSmall),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: <Widget>[
                    for (final entry in const <(String, String)>[
                      ('before', 'Дасгалын өмнө'),
                      ('during', 'Дасгалын үеэр'),
                      ('after', 'Дасгалын дараа'),
                    ])
                      ChoiceChip(
                        label: Text(entry.$2),
                        selected: _phase == entry.$1,
                        onSelected: (_) => setState(() => _phase = entry.$1),
                      ),
                  ],
                ),
                if (exercises.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 18),
                  DropdownButtonFormField<int?>(
                    value: _exerciseId,
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    decoration: const InputDecoration(
                      labelText: 'Холбогдох дасгал (заавал биш)',
                    ),
                    items: <DropdownMenuItem<int?>>[
                      const DropdownMenuItem<int?>(
                        value: null,
                        child: Text('Сонгоогүй'),
                      ),
                      for (final exercise in exercises)
                        DropdownMenuItem<int?>(
                          value: exercise.id,
                          child: Text(
                            exercise.name,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                    ],
                    onChanged: (int? value) =>
                        setState(() => _exerciseId = value),
                  ),
                ],
                const SizedBox(height: 18),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: _NumField(
                        controller: _pulse,
                        label: 'Судасны цохилт',
                        hint: '72',
                        validator: (String? v) => Validators.pulse(v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _NumField(
                        controller: _spo2,
                        label: 'SpO₂ (%)',
                        hint: '98',
                        validator: (String? v) => Validators.spo2(v),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: _NumField(
                        controller: _systolic,
                        label: 'Дээд даралт',
                        hint: '120',
                        validator: (String? v) => Validators.systolic(v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _NumField(
                        controller: _diastolic,
                        label: 'Доод даралт',
                        hint: '80',
                        validator: (String? v) => Validators.diastolic(v),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  'Ачааллын мэдрэмж (0–10)',
                  style: theme.textTheme.titleSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  _borg == null
                      ? 'Сонгоогүй'
                      : 'Сонгосон утга: $_borg',
                  style: theme.textTheme.bodySmall,
                ),
                Slider(
                  value: (_borg ?? 0).toDouble(),
                  min: 0,
                  max: 10,
                  divisions: 10,
                  label: '${_borg ?? 0}',
                  onChanged: (double value) =>
                      setState(() => _borg = value.round()),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _notes,
                  minLines: 2,
                  maxLines: 4,
                  maxLength: 500,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    labelText: 'Тэмдэглэл (заавал биш)',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Болих'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: _submit,
                        child: const Text('Хадгалах'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  int? _int(TextEditingController c) {
    final raw = c.text.trim();
    if (raw.isEmpty) return null;
    return int.tryParse(raw);
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final systolic = _int(_systolic);
    final diastolic = _int(_diastolic);
    // Backend `BloodPressure`-ыг текстээр хадгалдаг тул "120/80" хэлбэрээр
    // нэгтгэнэ (`RehabVitalSign.BloodPressure` — STRING).
    final bp = systolic == null && diastolic == null
        ? null
        : '${systolic ?? ''}/${diastolic ?? ''}';

    final draft = RehabVitalDraft(
      exerciseId: _exerciseId,
      phase: _phase,
      pulse: _int(_pulse),
      bloodPressure: bp,
      spo2: _int(_spo2),
      borg: _borg,
      notes: _notes.text,
    );

    final hasAnything = draft.pulse != null ||
        draft.spo2 != null ||
        draft.borg != null ||
        (draft.bloodPressure ?? '').replaceAll('/', '').isNotEmpty;
    if (!hasAnything) {
      AppSnack.error(context, 'Дор хаяж нэг хэмжилт оруулна уу.');
      return;
    }

    Navigator.of(context).pop(draft);
  }
}

class _NumField extends StatelessWidget {
  const _NumField({
    required this.controller,
    required this.label,
    required this.hint,
    this.validator,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      inputFormatters: <TextInputFormatter>[
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(3),
      ],
      decoration: InputDecoration(labelText: label, hintText: hint),
      validator: validator,
    );
  }
}
