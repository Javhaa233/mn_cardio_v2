import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import '../risk/risk_assessment.dart';

/// Эмч үйлчлүүлэгчийн **эрсдэлийн үзүүлэлт**-ийг харах — тендерийн "эмч
/// үйлчлүүлэгчийн модулийг харах боломжтой байна" мөр.
///
/// Үйлчлүүлэгчийнхтэй яг ижил өгөгдөл, ижил хэлбэр: сервер нэг функцээр
/// үйлчилдэг тул ЗСӨ-ийн аргачлал батлагдахад оноо хоёр талд зэрэг гарна.
class DoctorPatientRiskScreen extends StatefulWidget {
  const DoctorPatientRiskScreen({
    super.key,
    required this.patientId,
    this.patientName,
  });

  final int patientId;
  final String? patientName;

  @override
  State<DoctorPatientRiskScreen> createState() =>
      _DoctorPatientRiskScreenState();
}

class _DoctorPatientRiskScreenState extends State<DoctorPatientRiskScreen> {
  RiskAssessment? _risk;
  ApiException? _error;
  bool _loading = true;

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
      final data = await context
          .read<ApiClient>()
          .getObject('/api/doctor/patients/${widget.patientId}/risk');
      if (!mounted) return;
      setState(() {
        _risk = RiskAssessment.fromJson(data);
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final risk = _risk;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Эрсдэл үнэлгээ'),
        bottom: widget.patientName == null
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(20),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    widget.patientName!,
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              ),
      ),
      body: Builder(
        builder: (BuildContext context) {
          if (_loading) return const LoadingView(label: 'Үзүүлэлт уншиж байна…');
          if (_error != null) return ErrorView(error: _error!, onRetry: _load);
          if (risk == null || risk.isEmpty) {
            return const EmptyView(
              title: 'Үзүүлэлт бүртгэгдээгүй байна',
              message: 'Энэ үйлчлүүлэгчид биеийн хэмжилт, өвчний түүх '
                  'бүртгэгдээгүй байна.',
              icon: Icons.assignment_outlined,
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: <Widget>[
              // Оноо тооцохгүй: аргачлалыг ЗСҮТ батлаагүй (API.md §2.5).
              const PendingModuleNotice(
                title: 'Эрсдэлийн оноо тооцоологдоогүй',
                message: 'ЗСӨ-ийн эрсдэл тооцох аргачлал, ангилал '
                    'батлагдаагүй тул зөвхөн бүртгэгдсэн үзүүлэлтийг '
                    'харуулж байна.',
                icon: Icons.calculate_outlined,
              ),
              const SizedBox(height: 14),
              if (risk.bodySizeFields.isNotEmpty)
                SectionCard(
                  title: 'Амин үзүүлэлт, хэмжилт',
                  subtitle: risk.measuredAt == null
                      ? null
                      : 'Сүүлд бүртгэсэн: ${MnFormat.date(risk.measuredAt)}',
                  icon: Icons.monitor_heart_outlined,
                  child: Column(
                    children: <Widget>[
                      for (final field in risk.bodySizeFields)
                        InfoRow(label: field.label, value: field.displayValue),
                    ],
                  ),
                ),
              if (risk.historyFields.isNotEmpty) ...<Widget>[
                const SizedBox(height: 12),
                SectionCard(
                  title: 'Өвчний түүх, эрсдэлт хүчин зүйл',
                  icon: Icons.history_edu_outlined,
                  child: Column(
                    children: <Widget>[
                      for (final field in risk.historyFields)
                        InfoRow(
                          label: field.label,
                          value: field.displayValue,
                        ),
                    ],
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

/// Сэргээн засахын нэг үнэлгээ — `RehabAssessment`.
class RehabAssessmentRow {
  const RehabAssessmentRow({
    required this.id,
    this.assessmentDate,
    this.riskLevel,
    this.riskLevelLabel,
    this.toleranceScore,
    this.toleranceUnit,
    this.notes,
  });

  final int id;
  final DateTime? assessmentDate;
  final String? riskLevel;
  final String? riskLevelLabel;
  final double? toleranceScore;
  final String? toleranceUnit;
  final String? notes;

  factory RehabAssessmentRow.fromJson(Map<String, dynamic> json) =>
      RehabAssessmentRow(
        id: J.intOf(json, <String>['Id']) ?? 0,
        assessmentDate: J.date(json, <String>['AssessmentDate']),
        riskLevel: J.str(json, <String>['RiskLevel']),
        riskLevelLabel: J.str(json, <String>['RiskLevelLabel']),
        toleranceScore: J.dbl(json, <String>['ToleranceScore']),
        toleranceUnit: J.str(json, <String>['ToleranceUnit']),
        notes: J.str(json, <String>['Notes']),
      );
}

/// Эмч үйлчлүүлэгчийн **сэргээн засах**-ыг харах, үнэлгээ бичих — §4.1.
class DoctorPatientRehabScreen extends StatefulWidget {
  const DoctorPatientRehabScreen({
    super.key,
    required this.patientId,
    this.patientName,
  });

  final int patientId;
  final String? patientName;

  @override
  State<DoctorPatientRehabScreen> createState() =>
      _DoctorPatientRehabScreenState();
}

class _DoctorPatientRehabScreenState extends State<DoctorPatientRehabScreen> {
  RehabAssessmentRow? _assessment;
  List<Map<String, dynamic>> _vitals = const <Map<String, dynamic>>[];
  int _progressCount = 0;
  ApiException? _error;
  bool _loading = true;
  bool _saving = false;

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
      final data = await context
          .read<ApiClient>()
          .getObject('/api/doctor/patients/${widget.patientId}/rehab');
      if (!mounted) return;
      final assessment = J.obj(data, <String>['assessment']);
      final vitals = J.obj(data, <String>['vitals']) ?? <String, dynamic>{};
      setState(() {
        _assessment =
            assessment == null ? null : RehabAssessmentRow.fromJson(assessment);
        _progressCount = Envelope.asList(data['progress']).length;
        _vitals = Envelope.asList(vitals['rows']);
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

  Future<void> _write() async {
    final draft = await showModalBottomSheet<_AssessmentDraft>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _AssessmentSheet(),
    );
    if (draft == null || !mounted) return;

    setState(() => _saving = true);
    try {
      await context.read<ApiClient>().postObject(
        '/api/doctor/patients/${widget.patientId}/rehab/assessment',
        body: <String, dynamic>{
          if (draft.score != null) 'ToleranceScore': draft.score,
          if (draft.unit.isNotEmpty) 'ToleranceUnit': draft.unit,
          if (draft.notes.isNotEmpty) 'Notes': draft.notes,
        },
      );
      if (!mounted) return;
      AppSnack.success(context, 'Үнэлгээг хадгаллаа.');
      await _load();
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final assessment = _assessment;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Сэргээн засах'),
        bottom: widget.patientName == null
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(20),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    widget.patientName!,
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: null,
        onPressed: _saving ? null : _write,
        icon: const Icon(Icons.edit_note_rounded),
        label: const Text('Үнэлгээ бичих'),
      ),
      body: Builder(
        builder: (BuildContext context) {
          if (_loading) return const LoadingView(label: 'Уншиж байна…');
          if (_error != null) return ErrorView(error: _error!, onRetry: _load);

          return RefreshIndicator(
            onRefresh: _load,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
              children: <Widget>[
                SectionCard(
                  title: 'Сүүлийн үнэлгээ',
                  icon: Icons.assignment_turned_in_outlined,
                  child: assessment == null
                      ? Text(
                          'Үнэлгээ бичигдээгүй байна.',
                          style: theme.textTheme.bodySmall,
                        )
                      : Column(
                          children: <Widget>[
                            InfoRow(
                              label: 'Огноо',
                              value: MnFormat.date(assessment.assessmentDate),
                            ),
                            if ((assessment.riskLevelLabel ??
                                    assessment.riskLevel ??
                                    '')
                                .isNotEmpty)
                              InfoRow(
                                label: 'Эрсдэлийн түвшин',
                                value: assessment.riskLevelLabel ??
                                    assessment.riskLevel!,
                              ),
                            if (assessment.toleranceScore != null)
                              InfoRow(
                                label: 'Ачааллын үнэлгээ',
                                value: <String>[
                                  MnFormat.number(assessment.toleranceScore),
                                  assessment.toleranceUnit ?? '',
                                ].where((String s) => s.isNotEmpty).join(' '),
                              ),
                            if ((assessment.notes ?? '').isNotEmpty)
                              InfoRow(
                                label: 'Зөвлөгөө',
                                value: assessment.notes!,
                              ),
                          ],
                        ),
                ),
                const SizedBox(height: 12),
                SectionCard(
                  title: 'Дасгалын биелэлт',
                  icon: Icons.self_improvement_outlined,
                  child: Text(
                    _progressCount == 0
                        ? 'Дасгал хийсэн тэмдэглэл алга.'
                        : 'Сүүлийн хугацаанд $_progressCount удаа дасгал '
                            'хийснээ тэмдэглэсэн байна.',
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
                const SizedBox(height: 12),
                SectionCard(
                  title: 'Амин үзүүлэлт',
                  icon: Icons.monitor_heart_outlined,
                  child: _vitals.isEmpty
                      ? Text(
                          'Хэмжилт бүртгэгдээгүй байна.',
                          style: theme.textTheme.bodySmall,
                        )
                      : Column(
                          children: <Widget>[
                            for (final row in _vitals.take(10))
                              InfoRow(
                                label: MnFormat.date(
                                  J.date(row, <String>['MeasuredAt']),
                                ),
                                value: <String>[
                                  if (J.str(row, <String>['PhaseLabel']) !=
                                      null)
                                    J.strOr(row, <String>['PhaseLabel']),
                                  if (J.intOf(row, <String>['Pulse']) != null)
                                    'Судас ${J.intOf(row, <String>['Pulse'])}',
                                  if ((J.str(row, <String>['BloodPressure']) ??
                                          '')
                                      .isNotEmpty)
                                    J.strOr(row, <String>['BloodPressure']),
                                ].join(' · '),
                              ),
                          ],
                        ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Эрсдэлийн түвшний жагсаалт эмчийн гадаргуунд хараахан '
                  'нээгдээгүй тул одоогоор ачааллын үнэлгээ, зөвлөгөөг '
                  'бичнэ.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.inkDim,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _AssessmentDraft {
  const _AssessmentDraft(this.score, this.unit, this.notes);

  final double? score;
  final String unit;
  final String notes;
}

class _AssessmentSheet extends StatefulWidget {
  const _AssessmentSheet();

  @override
  State<_AssessmentSheet> createState() => _AssessmentSheetState();
}

class _AssessmentSheetState extends State<_AssessmentSheet> {
  final TextEditingController _score = TextEditingController();
  final TextEditingController _unit = TextEditingController(text: 'МЕТ');
  final TextEditingController _notes = TextEditingController();

  @override
  void dispose() {
    _score.dispose();
    _unit.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text('Сэргээн засахын үнэлгээ',
                  style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              Row(
                children: <Widget>[
                  Expanded(
                    flex: 2,
                    child: TextField(
                      controller: _score,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Ачааллын үнэлгээ',
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _unit,
                      decoration: const InputDecoration(labelText: 'Нэгж'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _notes,
                minLines: 3,
                maxLines: 6,
                maxLength: 500,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  labelText: 'Зөвлөгөө, тэмдэглэл',
                ),
              ),
              const SizedBox(height: 8),
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
                      onPressed: () => Navigator.of(context).pop(
                        _AssessmentDraft(
                          double.tryParse(_score.text.trim()),
                          _unit.text.trim(),
                          _notes.text.trim(),
                        ),
                      ),
                      child: const Text('Хадгалах'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
