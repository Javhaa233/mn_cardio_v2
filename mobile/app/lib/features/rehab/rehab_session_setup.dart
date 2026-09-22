import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/media/media_cache.dart';
import '../../core/network/api_exception.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import 'rehab_controller.dart';
import 'rehab_models.dart';
import 'rehab_player_controller.dart';
import 'rehab_player_models.dart';
import 'rehab_player_screen.dart';
import 'rehab_player_widgets.dart';

/// Өнөөдрийн хөтөлбөрөөр дасгал эхлүүлэх: тайван пульс → зорилт → бичлэг татах
/// → тоглуулагч.
Future<void> startRehabToday(BuildContext context, RehabToday today) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _SetupSheet(today: today),
  );
}

/// Нэг дасгалыг хөтөлбөргүйгээр туршиж үзэх (каталогоос).
Future<void> tryRehabExercise(
    BuildContext context, RehabExercise exercise) async {
  final rehab = context.read<RehabController>();
  final navigator = Navigator.of(context);
  final messenger = ScaffoldMessenger.of(context);
  try {
    final movements = await rehab.repository.fetchMovements(exercise.id);
    if (movements.isEmpty) {
      AppSnack.infoOn(
          messenger, 'Энэ дасгалын бичлэг хараахан бэлтгэгдээгүй байна.');
      return;
    }
    final block = RehabBlock(
      id: 0,
      title: exercise.name,
      kind: 'video',
      locked: false,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      thumb: RehabMedia.none,
      movements: movements,
    );
    final session =
        await rehab.repository.startSession(exerciseId: exercise.id);
    final files = await _download(rehab, <RehabBlock>[block], null);
    await navigator.push(
      MaterialPageRoute<void>(
        builder: (_) => RehabPlayerScreen(
          controller: RehabPlayerController(
            rehab: rehab,
            session: session,
            blocks: <RehabBlock>[block],
            files: files,
          ),
        ),
      ),
    );
  } on ApiException catch (e) {
    AppSnack.errorOn(messenger, e.message);
  }
}

/// Нээлттэй хэсгүүдийн бүх бичлэгийг урьдчилан татна (сонголт §12).
/// Татаж чадаагүй бичлэг нь тоглуулагчид "бэлтгэгдэж байна" гэж харагдана —
/// дасгалыг зогсоохгүй.
Future<Map<int, File>> _download(
  RehabController rehab,
  List<RehabBlock> blocks,
  void Function(int done, int total)? onProgress,
) async {
  final todo = <RehabMovement>[
    for (final b in blocks)
      if (!b.locked)
        for (final m in b.movements)
          if (m.media.isAvailable) m,
  ];
  final files = <int, File>{};
  // Нэг файлыг хэд хэдэн хөдөлгөөн хуваалцаж болно (жишээ бичлэгийн хэсгүүд).
  final byUrl = <String, File>{};
  var done = 0;
  onProgress?.call(0, todo.length);
  for (final m in todo) {
    final url = m.media.url!;
    try {
      final file = byUrl[url] ??
          await MediaCache.instance
              .file(rehab.repository.api, url, name: 'rehab_${url.hashCode}');
      byUrl[url] = file;
      files[m.id] = file;
    } catch (_) {}
    done++;
    onProgress?.call(done, todo.length);
  }
  return files;
}

class _SetupSheet extends StatefulWidget {
  const _SetupSheet({required this.today});

  final RehabToday today;

  @override
  State<_SetupSheet> createState() => _SetupSheetState();
}

class _SetupSheetState extends State<_SetupSheet> {
  late String _rest = widget.today.lastRestingHr?.toString() ?? '';
  bool _busy = false;
  int _done = 0;
  int _total = 0;
  RehabSessionStart? _session;

  RehabPlanInfo get _plan => widget.today.plan!;

  int? get _restValue {
    final v = int.tryParse(_rest);
    return v != null && v >= 30 && v <= 150 ? v : null;
  }

  /// Урьдчилсан тооцоо — баталгаат тоог сервер эхлэх үед буцаана.
  int? get _previewTarget {
    final max = widget.today.maxHr;
    final rest = _restValue;
    final pct = _plan.intensityPct;
    if (max == null || rest == null || pct == null || rest >= max) return null;
    return ((max - rest) * pct / 100 + rest).round();
  }

  Future<void> _start() async {
    final rehab = context.read<RehabController>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _busy = true);
    try {
      final session = _session ??
          await rehab.repository
              .startSession(restingHr: _plan.hasHrTarget ? _restValue : null);
      setState(() => _session = session);

      if (_plan.hasHrTarget && session.targetHr != null) {
        if (!mounted) return;
        final go = await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext ctx) => AlertDialog(
            icon: const Icon(Icons.favorite_rounded, color: AppColors.danger),
            title: Text('Өнөөдрийн зорилт: ${session.targetHr}'),
            content: Text(
              session.warning ??
                  'Дасгалын туршид пульсаа ${session.targetHr}-аас дээш гаргахгүй байна уу.',
            ),
            actions: <Widget>[
              FilledButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('Ойлголоо')),
            ],
          ),
        );
        if (go != true) return;
      }

      final blocks = widget.today.openBlocks;
      final files = await _download(rehab, blocks, (int d, int t) {
        if (mounted) {
          setState(() {
            _done = d;
            _total = t;
          });
        }
      });
      if (!mounted) return;
      navigator.pop();
      await navigator.push(
        MaterialPageRoute<void>(
          builder: (_) => RehabPlayerScreen(
            controller: RehabPlayerController(
              rehab: rehab,
              session: session,
              blocks: blocks,
              files: files,
            ),
          ),
        ),
      );
    } on ApiException catch (e) {
      AppSnack.errorOn(messenger, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final needHr = _plan.hasHrTarget;
    final canStart = !_busy && (!needHr || _restValue != null);
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, 24 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text('Дасгал эхлэхийн өмнө', style: theme.textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(
            '${_plan.programName} · ${_plan.dayNo ?? '—'} дэх өдөр · ${widget.today.totalMinutes} минут',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          if (needHr) ...<Widget>[
            Text('Тайван үеийн пульс', style: theme.textTheme.titleSmall),
            const SizedBox(height: 4),
            Text(
              '5 минут тайван суусны дараа хэмжинэ.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            RehabPulseCountHelper(
                onResult: (int v) => setState(() => _rest = '$v')),
            const SizedBox(height: 10),
            Center(
              child: Text(
                _rest.isEmpty ? '—' : _rest,
                style: theme.textTheme.displaySmall
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            if (_rest.isNotEmpty && _restValue == null)
              const Center(
                child: Text('30-150 хооронд байна',
                    style: TextStyle(color: AppColors.danger)),
              ),
            if (_previewTarget != null)
              Center(
                child: Text(
                  'Зорилтот пульс ойролцоогоор $_previewTarget',
                  style: theme.textTheme.bodyMedium
                      ?.copyWith(color: AppColors.cyanInk),
                ),
              ),
            const SizedBox(height: 8),
            RehabNumberPad(
                value: _rest,
                onChanged: (String v) => setState(() => _rest = v)),
            const SizedBox(height: 16),
          ],
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.warningLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Дасгал хийх үед цээж өвдөх, толгой эргэх, амьсгаадах шинж илэрвэл '
              '"Биеийн байдал муу байна" товчийг дарж зогсооно уу. Ус ойрхон байлгаарай.',
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: const Color(0xFF6B4A00)),
            ),
          ),
          const SizedBox(height: 16),
          if (_busy && _total > 0) ...<Widget>[
            LinearProgressIndicator(value: _total == 0 ? null : _done / _total),
            const SizedBox(height: 6),
            Text('Бичлэг бэлтгэж байна $_done/$_total',
                textAlign: TextAlign.center),
            const SizedBox(height: 10),
          ],
          FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.cyanInk,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: canStart ? _start : null,
            icon: _busy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.2, color: Colors.white),
                  )
                : const Icon(Icons.play_arrow_rounded),
            label: Text(needHr && _restValue == null
                ? 'Пульсаа оруулна уу'
                : 'Дасгал эхлэх'),
          ),
        ],
      ),
    );
  }
}
