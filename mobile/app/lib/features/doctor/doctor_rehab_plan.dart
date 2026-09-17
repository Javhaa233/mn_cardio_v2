import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/measurement_chart.dart';
import '../../shared/widgets/section_card.dart';
import '../rehab/rehab_player_models.dart';

/// Эмч үйлчлүүлэгчид сэргээн засах хөтөлбөр оноох, дасгалын бүртгэлийг харах
/// (API.md §2.7c, сонголт §14 — гар утас ба веб хоёуланд).
///
/// `DoctorPatientRehabScreen`-ийн дээд хэсэгт суудаг.
class DoctorRehabPlanCard extends StatefulWidget {
  const DoctorRehabPlanCard({super.key, required this.patientId});

  final int patientId;

  @override
  State<DoctorRehabPlanCard> createState() => _DoctorRehabPlanCardState();
}

class _DoctorRehabPlanCardState extends State<DoctorRehabPlanCard> {
  Map<String, dynamic>? _data;
  ApiException? _error;
  bool _loading = true;

  String get _base => '/api/doctor/patients/${widget.patientId}/rehab';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await context.read<ApiClient>().getObject('$_base/plan');
      if (!mounted) return;
      setState(() {
        _data = data;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  Future<void> _assign() async {
    final api = context.read<ApiClient>();
    final plan = _data == null ? null : J.obj(_data!, <String>['plan']);
    try {
      final programs = await api.getRaw('/api/doctor/rehab/programs');
      if (!mounted) return;
      final list = programs is List
          ? programs
              .whereType<Map<dynamic, dynamic>>()
              .map(Map<String, dynamic>.from)
              .toList()
          : <Map<String, dynamic>>[];
      final body = await showModalBottomSheet<Map<String, dynamic>>(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        builder: (_) => _AssignSheet(programs: list, current: plan),
      );
      if (body == null || !mounted) return;
      await api.postObject('$_base/plan', body: body);
      if (!mounted) return;
      AppSnack.success(
          context, 'Хөтөлбөр оноолоо. Үйлчлүүлэгчид мэдэгдэл очлоо.');
      await _load();
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    }
  }

  Future<void> _setStatus(String status) async {
    try {
      await context
          .read<ApiClient>()
          .postObject('$_base/plan', body: <String, dynamic>{'Status': status});
      if (!mounted) return;
      await _load();
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    }
  }

  Future<void> _openSession(int id) async {
    try {
      final data =
          await context.read<ApiClient>().getObject('$_base/sessions/$id');
      if (!mounted) return;
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        builder: (_) =>
            _SessionSheet(detail: RehabSessionDetail.fromJson(data)),
      );
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    Widget body;
    if (_loading) {
      body = const Padding(
        padding: EdgeInsets.all(12),
        child: Center(child: CircularProgressIndicator()),
      );
    } else if (_error != null) {
      body = Text(
        _error!.statusCode == 404 || _error!.statusCode == 500
            ? 'Хөтөлбөрийн хэсэг энэ сервер дээр идэвхжээгүй байна.'
            : _error!.message,
        style: theme.textTheme.bodySmall,
      );
    } else {
      final data = _data!;
      final plan = J.obj(data, <String>['plan']);
      final blocks = J.list(data, <String>['blocks']);
      final sessions = J.list(data, <String>['sessions']);
      final maxHr = J.intOf(data, <String>['maxHr']);
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (plan == null)
            Text('Хөтөлбөр оноогоогүй байна.', style: theme.textTheme.bodySmall)
          else ...<Widget>[
            _PlanSummary(plan: plan, maxHr: maxHr, blocks: blocks),
          ],
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              FilledButton.icon(
                style:
                    FilledButton.styleFrom(backgroundColor: AppColors.cyanInk),
                onPressed: _assign,
                icon: Icon(plan == null
                    ? Icons.add_task_rounded
                    : Icons.edit_calendar_rounded),
                label: Text(plan == null ? 'Хөтөлбөр оноох' : 'Өөрчлөх'),
              ),
              if (plan != null)
                OutlinedButton(
                  onPressed: () => _setStatus('ended'),
                  child: const Text('Дуусгах'),
                ),
            ],
          ),
          if (sessions.isNotEmpty) ...<Widget>[
            const SizedBox(height: 16),
            Text('Дасгалын бүртгэл', style: theme.textTheme.titleSmall),
            const SizedBox(height: 6),
            for (final s in sessions.take(10))
              _SessionRow(row: s, onTap: _openSession),
          ],
        ],
      );
    }

    return SectionCard(
      title: 'Сэргээн засах хөтөлбөр',
      icon: Icons.event_repeat_rounded,
      trailing: IconButton(
        tooltip: 'Шинэчлэх',
        onPressed: _loading ? null : _load,
        icon: const Icon(Icons.refresh_rounded),
      ),
      child: body,
    );
  }
}

class _PlanSummary extends StatelessWidget {
  const _PlanSummary({
    required this.plan,
    required this.maxHr,
    required this.blocks,
  });

  final Map<String, dynamic> plan;
  final int? maxHr;
  final List<Map<String, dynamic>> blocks;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final program = J.obj(plan, <String>['Program']) ?? <String, dynamic>{};
    final pct = J.dbl(plan, <String>['IntensityPct']);
    final open = blocks.where((b) => !J.boolOf(b, <String>['Locked']));
    final minutes = open.fold<int>(
            0, (int s, b) => s + (J.intOf(b, <String>['DurationSec']) ?? 0)) ~/
        60;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        InfoRow(
          label: 'Хөтөлбөр',
          value: J.strOr(program, <String>['Name'], fallback: '—'),
        ),
        InfoRow(
          label: 'Эхэлсэн',
          value: '${MnFormat.date(J.date(plan, <String>[
                'StartDate'
              ]))} · ${J.intOf(plan, <String>['DayNo']) ?? '—'} дэх өдөр',
        ),
        if (pct != null)
          InfoRow(
              label: 'Эрчим', value: '${MnFormat.number(pct, decimals: 0)}%'),
        if (maxHr != null) InfoRow(label: 'Дээд пульс', value: '$maxHr'),
        InfoRow(
            label: 'Өнөөдөр', value: '$minutes минут · ${open.length} хэсэг'),
        if ((J.str(plan, <String>['Notes']) ?? '').isNotEmpty)
          InfoRow(label: 'Тэмдэглэл', value: J.str(plan, <String>['Notes'])!),
        if (J.strOr(program, <String>['Name'], fallback: '').isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              'Хөтөлбөрийн агуулга эмнэлзүйн багаар батлагдаагүй (төсөл).',
              style:
                  theme.textTheme.bodySmall?.copyWith(color: AppColors.warning),
            ),
          ),
      ],
    );
  }
}

class _SessionRow extends StatelessWidget {
  const _SessionRow({required this.row, required this.onTap});

  final Map<String, dynamic> row;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = J.strOr(row, <String>['Status'], fallback: '');
    final stopped = status == 'stopped';
    final label = switch (status) {
      'completed' => 'Дууссан',
      'stopped' => 'Биеийн байдлаас зогсоосон',
      'abandoned' => 'Дундуур орхисон',
      _ => 'Эхэлсэн',
    };
    final color = switch (status) {
      'completed' => AppColors.success,
      'stopped' => AppColors.danger,
      _ => AppColors.inkMuted,
    };
    return InkWell(
      onTap: () => onTap(J.intOf(row, <String>['Id']) ?? 0),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: <Widget>[
            Icon(
              stopped
                  ? Icons.warning_amber_rounded
                  : status == 'completed'
                      ? Icons.check_circle_outline_rounded
                      : Icons.timelapse_rounded,
              color: color,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    MnFormat.friendlyDateTime(
                        J.date(row, <String>['StartedAt'])),
                    style: theme.textTheme.bodyMedium,
                  ),
                  Text(
                    '$label · ${MnFormat.duration(J.intOf(row, <String>[
                          'DurationSec'
                        ]))}',
                    style: theme.textTheme.bodySmall?.copyWith(color: color),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, size: 20),
          ],
        ),
      ),
    );
  }
}

class _SessionSheet extends StatelessWidget {
  const _SessionSheet({required this.detail});

  final RehabSessionDetail detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final names = <String, String>{
      for (final e in rehabStopSymptoms) e.key: e.value,
    };
    return ListView(
      shrinkWrap: true,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: <Widget>[
        Text('Дасгалын дэлгэрэнгүй', style: theme.textTheme.titleLarge),
        const SizedBox(height: 8),
        InfoRow(
            label: 'Огноо', value: MnFormat.friendlyDateTime(detail.startedAt)),
        InfoRow(label: 'Хөтөлбөрийн өдөр', value: '${detail.dayNo ?? '—'}'),
        InfoRow(label: 'Хугацаа', value: MnFormat.duration(detail.durationSec)),
        InfoRow(label: 'Тайван пульс', value: '${detail.restingHr ?? '—'}'),
        InfoRow(label: 'Зорилтот пульс', value: '${detail.targetHr ?? '—'}'),
        InfoRow(label: 'Дундаж пульс', value: '${detail.averagePulse ?? '—'}'),
        InfoRow(
            label: 'Хамгийн их ачаалал (0–10)',
            value: '${detail.maxBorg ?? '—'}'),
        InfoRow(
            label: 'Алгассан хөдөлгөөн',
            value: '${detail.skippedMovements ?? 0}'),
        if (detail.status == 'stopped') ...<Widget>[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.dangerLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              detail.symptoms.isEmpty
                  ? 'Биеийн байдлаас зогсоосон (шинж тэмдэг сонгоогүй).'
                  : 'Зогсоосон: ${detail.symptoms.map((String s) => names[s] ?? s).join(', ')}',
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: const Color(0xFF8E1F2A)),
            ),
          ),
        ],
        const SizedBox(height: 12),
        MeasurementChart(
          height: 200,
          labels: detail.checkins
              .map((RehabCheckin c) =>
                  '${(c.atSec ~/ 60).toString().padLeft(2, '0')}:${(c.atSec % 60).toString().padLeft(2, '0')}')
              .toList(),
          series: <ChartSeries>[
            ChartSeries(
              name: 'Пульс',
              color: AppColors.chartPulse,
              values: detail.checkins
                  .map((RehabCheckin c) => c.pulse?.toDouble())
                  .toList(),
            ),
            if (detail.targetHr != null)
              ChartSeries(
                name: 'Зорилт',
                color: AppColors.cyanInk,
                values: detail.checkins
                    .map((_) => detail.targetHr!.toDouble())
                    .toList(),
              ),
          ],
        ),
      ],
    );
  }
}

class _AssignSheet extends StatefulWidget {
  const _AssignSheet({required this.programs, this.current});

  final List<Map<String, dynamic>> programs;
  final Map<String, dynamic>? current;

  @override
  State<_AssignSheet> createState() => _AssignSheetState();
}

class _AssignSheetState extends State<_AssignSheet> {
  int? _programId;
  DateTime _start = DateTime.now();
  final TextEditingController _pct = TextEditingController();
  final TextEditingController _maxHr = TextEditingController();
  final TextEditingController _notes = TextEditingController();

  @override
  void initState() {
    super.initState();
    final c = widget.current;
    if (c != null) {
      final program = J.obj(c, <String>['Program']);
      _programId = program == null ? null : J.intOf(program, <String>['Id']);
      _start = J.date(c, <String>['StartDate']) ?? DateTime.now();
      final pct = J.dbl(c, <String>['IntensityPct']);
      if (pct != null) _pct.text = MnFormat.number(pct, decimals: 0);
      final max = J.intOf(c, <String>['MaxHrOverride']);
      if (max != null) _maxHr.text = '$max';
      _notes.text = J.str(c, <String>['Notes']) ?? '';
    }
  }

  @override
  void dispose() {
    _pct.dispose();
    _maxHr.dispose();
    _notes.dispose();
    super.dispose();
  }

  Map<String, dynamic>? get _selected {
    for (final p in widget.programs) {
      if (J.intOf(p, <String>['Id']) == _programId) return p;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selected = _selected;
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, 24 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text('Хөтөлбөр оноох', style: theme.textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(
            'Өмнөх хөтөлбөр дуусгавар болж, шинэ нь эхэлнэ. Үйлчлүүлэгчид мэдэгдэл очно.',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 14),
          RadioGroup<int>(
            groupValue: _programId,
            onChanged: (int? v) => setState(() => _programId = v),
            child: Column(
              children: <Widget>[
                for (final p in widget.programs)
                  RadioListTile<int>(
                    contentPadding: EdgeInsets.zero,
                    value: J.intOf(p, <String>['Id']) ?? 0,
                    title: Text(J.strOr(p, <String>['Name'], fallback: '—')),
                    subtitle: J.boolOf(p, <String>['HasHrTarget'])
                        ? null
                        : const Text('Зорилтот пульсгүй'),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.event_outlined),
            title: const Text('Эхлэх огноо'),
            subtitle: Text(MnFormat.date(_start)),
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _start,
                firstDate: DateTime.now().subtract(const Duration(days: 120)),
                lastDate: DateTime.now().add(const Duration(days: 60)),
              );
              if (picked != null) setState(() => _start = picked);
            },
          ),
          if (selected == null ||
              J.boolOf(selected, <String>['HasHrTarget'])) ...<Widget>[
            TextField(
              controller: _pct,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Эрчим, %',
                hintText: selected == null
                    ? '30'
                    : MnFormat.number(
                        J.dbl(selected, <String>['DefaultIntensityPct']),
                        decimals: 0),
                helperText: 'Хоосон бол хөтөлбөрийн үндсэн утга',
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _maxHr,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Дээд пульс (заавал биш)',
                helperText:
                    'Хоосон бол 220 − нас. Бета-хориглогч хэрэглэдэг бол эмч тохируулна.',
                helperMaxLines: 2,
              ),
            ),
          ],
          const SizedBox(height: 8),
          TextField(
            controller: _notes,
            maxLines: 3,
            decoration:
                const InputDecoration(labelText: 'Тэмдэглэл (заавал биш)'),
          ),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.cyanInk,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: _programId == null
                ? null
                : () => Navigator.pop(context, <String, dynamic>{
                      'ProgramId': _programId,
                      'StartDate': MnFormat.apiDate(_start),
                      if (_pct.text.trim().isNotEmpty)
                        'IntensityPct': num.tryParse(_pct.text.trim()),
                      if (_maxHr.text.trim().isNotEmpty)
                        'MaxHrOverride': int.tryParse(_maxHr.text.trim()),
                      if (_notes.text.trim().isNotEmpty)
                        'Notes': _notes.text.trim(),
                    }),
            child: const Text('Хадгалах'),
          ),
        ],
      ),
    );
  }
}
