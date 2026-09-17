import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../shared/theme/app_colors.dart';
import '../chat/chat_rooms_screen.dart';
import 'rehab_controller.dart';
import 'rehab_player_controller.dart';
import 'rehab_player_models.dart';
import 'rehab_player_widgets.dart';
import 'rehab_session_summary.dart';

/// Дасгалын тоглуулагч (сонголтууд 2026-09-17):
///  * бичлэг картан дотор, доор нь том цагираг цаг (§1, §2)
///  * хөдөлгөөн бүрийн өмнө бүтэн дэлгэцийн "Дараагийн дасгал" (§3)
///  * хаана ч дарж зогсоох, ⏮ ⏭, гарахад баталгаажуулах (§4)
///  * 3-2-1 дохио (§5), 2 минут тутам пульс + CR10 (§6), өнгөт бүс (§7)
///  * "Биеийн байдал муу байна" → шинж тэмдгийн жагсаалт → чат (§9)
class RehabPlayerScreen extends StatefulWidget {
  const RehabPlayerScreen({super.key, required this.controller});

  final RehabPlayerController controller;

  @override
  State<RehabPlayerScreen> createState() => _RehabPlayerScreenState();
}

class _RehabPlayerScreenState extends State<RehabPlayerScreen> {
  RehabPlayerController get c => widget.controller;
  bool _sheetOpen = false;
  bool _closing = false;

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    c.addListener(_onChange);
    WidgetsBinding.instance.addPostFrameCallback((_) => c.start());
  }

  @override
  void dispose() {
    c.removeListener(_onChange);
    WakelockPlus.disable();
    c.dispose();
    super.dispose();
  }

  void _onChange() {
    if (!mounted || _closing) return;
    if (c.finished) {
      _finish(status: 'completed');
      return;
    }
    if (c.checkinDue && !_sheetOpen) _openCheckin(auto: true);
    setState(() {});
  }

  // ------------------------------------------------------------ дуусгах
  Future<void> _finish({
    required String status,
    List<String> symptoms = const <String>[],
    String? note,
  }) async {
    if (_closing) return;
    _closing = true;
    c.halt();
    final draft = c.buildFinish(status: status, symptoms: symptoms, note: note);
    final rehab = context.read<RehabController>();
    final navigator = Navigator.of(context);
    final detail = await rehab.finishSession(draft);
    if (!mounted) return;
    if (status == 'abandoned') {
      navigator.pop();
      return;
    }
    await navigator.pushReplacement(
      MaterialPageRoute<void>(
        builder: (_) => RehabSessionSummaryScreen(
          detail: detail,
          fallback: draft,
          targetHr: c.targetHr,
        ),
      ),
    );
  }

  Future<bool> _confirmExit() async {
    c.pause();
    final yes = await showDialog<bool>(
      context: context,
      builder: (BuildContext ctx) => AlertDialog(
        title: const Text('Дасгалаа дуусгах уу?'),
        content: const Text('Одоог хүртэл хийсэн хэсэг тань хадгалагдана.'),
        actions: <Widget>[
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Үгүй, үргэлжлүүлэх')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Тийм, дуусгах')),
        ],
      ),
    );
    if (yes == true) {
      await _finish(status: 'abandoned');
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------ хүснэгтүүд
  Future<void> _openCheckin({bool auto = false}) async {
    _sheetOpen = true;
    if (!auto) c.pause();
    final result = await showModalBottomSheet<_CheckinResult>(
      context: context,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      useSafeArea: true,
      builder: (_) => _CheckinSheet(lastPulse: c.lastCheckin?.pulse),
    );
    _sheetOpen = false;
    if (!mounted) return;
    if (result == null) {
      c.skipCheckin();
    } else {
      c.submitCheckin(pulse: result.pulse, borg: result.borg);
    }
    if (!auto && c.paused) c.togglePause();
  }

  Future<void> _openStop() async {
    c.pause();
    final result = await showModalBottomSheet<_StopResult>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => const _StopSheet(),
    );
    if (!mounted || result == null) return;
    await _finish(
        status: 'stopped', symptoms: result.symptoms, note: result.note);
  }

  // ------------------------------------------------------------ дэлгэц
  @override
  Widget build(BuildContext context) {
    if (!c.hasSteps) {
      return Scaffold(
        appBar: AppBar(title: const Text('Дасгал')),
        body: const Center(child: Text('Өнөөдөр хийх дасгал алга.')),
      );
    }
    final step = c.step;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, Object? _) {
        if (!didPop) _confirmExit();
      },
      child: Scaffold(
        backgroundColor: AppColors.canvas,
        body: SafeArea(
          child: Column(
            children: <Widget>[
              _TopBar(controller: c, onClose: _confirmExit),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: KeyedSubtree(
                    key: ValueKey<int>(c.index),
                    child: switch (step.kind) {
                      RehabStepKind.preview => _PreviewView(controller: c),
                      RehabStepKind.movement => _MovementView(controller: c),
                      RehabStepKind.timed => _TimedView(
                          controller: c, onCheckin: () => _openCheckin()),
                      RehabStepKind.vitals => _VitalsView(
                          controller: c, onCheckin: () => _openCheckin()),
                      RehabStepKind.guide => _GuideView(controller: c),
                    },
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: const BorderSide(color: AppColors.danger),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: _openStop,
                    icon: const Icon(Icons.health_and_safety_outlined),
                    label: const Text('Биеийн байдал муу байна'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------

class _TopBar extends StatelessWidget {
  const _TopBar({required this.controller, required this.onClose});

  final RehabPlayerController controller;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 4, 8, 4),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              IconButton(
                tooltip: 'Дуусгах',
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded),
              ),
              Expanded(
                child: Text(
                  c.step.block.title,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall,
                ),
              ),
              IconButton(
                tooltip: c.muted ? 'Дуу асаах' : 'Дуу хаах',
                onPressed: c.toggleMute,
                icon: Icon(c.muted
                    ? Icons.volume_off_rounded
                    : Icons.volume_up_rounded),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: List<Widget>.generate(c.blockCount, (int i) {
                final on = i < c.currentBlockOrdinal;
                final now = i == c.currentBlockOrdinal;
                return Expanded(
                  child: Container(
                    height: 5,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      color: on
                          ? AppColors.cyanInk
                          : now
                              ? AppColors.cyan
                              : AppColors.hairlineStrong,
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _Controls extends StatelessWidget {
  const _Controls({required this.controller, this.center});

  final RehabPlayerController controller;
  final Widget? center;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        IconButton.filledTonal(
          iconSize: 28,
          tooltip: 'Өмнөх',
          onPressed: c.index == 0 ? null : c.previous,
          icon: const Icon(Icons.skip_previous_rounded),
        ),
        const SizedBox(width: 18),
        center ??
            IconButton.filled(
              iconSize: 40,
              tooltip: c.paused ? 'Үргэлжлүүлэх' : 'Түр зогсоох',
              style: IconButton.styleFrom(
                backgroundColor: AppColors.cyanInk,
                minimumSize: const Size(72, 72),
              ),
              onPressed: c.togglePause,
              icon: Icon(
                  c.paused ? Icons.play_arrow_rounded : Icons.pause_rounded),
            ),
        const SizedBox(width: 18),
        IconButton.filledTonal(
          iconSize: 28,
          tooltip: 'Алгасах',
          onPressed: c.next,
          icon: const Icon(Icons.skip_next_rounded),
        ),
      ],
    );
  }
}

/// Бичлэгийн карт — хаана ч дарвал зогсоно / үргэлжилнэ.
class _VideoCard extends StatelessWidget {
  const _VideoCard(
      {required this.controller,
      required this.movement,
      this.tapToPause = true});

  final RehabPlayerController controller;
  final RehabMovement? movement;
  final bool tapToPause;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final m = movement;
    final video = RehabLoopVideo(
      file: m == null ? null : c.files[m.id],
      loopStartMs: m?.loopStartMs,
      loopEndMs: m?.loopEndMs,
      paused: c.paused && tapToPause,
    );
    return GestureDetector(
      onTap: tapToPause ? c.togglePause : null,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.hairline),
          boxShadow: const <BoxShadow>[
            BoxShadow(
                color: Color(0x140C2233), blurRadius: 18, offset: Offset(0, 6)),
          ],
        ),
        padding: const EdgeInsets.all(6),
        child: Stack(
          fit: StackFit.expand,
          children: <Widget>[
            video,
            if (c.paused && tapToPause)
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: ColoredBox(
                  color: const Color(0x990C2233),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        const Icon(Icons.play_circle_fill_rounded,
                            size: 72, color: Colors.white),
                        const SizedBox(height: 8),
                        Text(
                          'Үргэлжлүүлэх',
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _MovementView extends StatelessWidget {
  const _MovementView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final m = c.step.movement!;
    final theme = Theme.of(context);
    final counted = c.step.durationSec == null;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: <Widget>[
          const SizedBox(height: 8),
          Expanded(child: _VideoCard(controller: c, movement: m)),
          const SizedBox(height: 12),
          Text(m.name,
              textAlign: TextAlign.center, style: theme.textTheme.titleLarge),
          const SizedBox(height: 10),
          if (counted)
            RehabCountdownRing(
                progress: 0, label: '${m.reps ?? ''}', caption: 'удаа')
          else
            RehabCountdownRing(
              progress: c.stepProgress,
              label: '${c.remaining ?? 0}',
              caption: 'сек',
            ),
          const SizedBox(height: 12),
          _Controls(
            controller: c,
            center: counted
                ? FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.cyanInk,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 16),
                    ),
                    onPressed: c.next,
                    icon: const Icon(Icons.check_rounded),
                    label: const Text('Дууссан'),
                  )
                : null,
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _PreviewView extends StatelessWidget {
  const _PreviewView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final step = c.step;
    final theme = Theme.of(context);
    final m = step.movement;
    final steps = m?.steps ?? step.block.guideLines;
    final what = m != null
        ? (m.isCounted ? '${m.reps} удаа' : '${m.workSec ?? 30} секунд')
        : step.block.durationSec != null
            ? '${(step.block.durationSec! / 60).round()} минут'
            : null;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const SizedBox(height: 6),
          Text(
            'ДАРААГИЙН ДАСГАЛ',
            textAlign: TextAlign.center,
            style: theme.textTheme.labelLarge?.copyWith(
              color: AppColors.cyanInk,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            flex: 5,
            child: m != null
                ? _VideoCard(controller: c, movement: m, tapToPause: false)
                : Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: Icon(
                      step.nextKind == RehabStepKind.timed
                          ? Icons.directions_walk_rounded
                          : Icons.self_improvement_rounded,
                      size: 96,
                      color: AppColors.cyanDeep,
                    ),
                  ),
          ),
          const SizedBox(height: 10),
          Text(step.title,
              textAlign: TextAlign.center, style: theme.textTheme.titleLarge),
          if (what != null)
            Text(what,
                textAlign: TextAlign.center, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 8),
          if (steps.isNotEmpty)
            Flexible(
              flex: 3,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    for (var i = 0; i < steps.length; i++)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 3),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            CircleAvatar(
                              radius: 12,
                              backgroundColor: AppColors.infoLight,
                              child: Text(
                                '${i + 1}',
                                style: theme.textTheme.labelMedium
                                    ?.copyWith(color: AppColors.cyanInk),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                                child: Text(steps[i],
                                    style: theme.textTheme.bodyLarge)),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 8),
          Row(
            children: <Widget>[
              RehabCountdownRing(
                size: 84,
                progress: c.stepProgress,
                label: '${c.remaining ?? 0}',
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    OutlinedButton.icon(
                      onPressed: c.addTenSeconds,
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('+10 сек'),
                    ),
                    const SizedBox(height: 6),
                    FilledButton(
                      style: FilledButton.styleFrom(
                          backgroundColor: AppColors.cyanInk),
                      onPressed: c.next,
                      child: const Text('Одоо эхлэх'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _TimedView extends StatelessWidget {
  const _TimedView({required this.controller, required this.onCheckin});

  final RehabPlayerController controller;
  final VoidCallback onCheckin;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final last = c.lastCheckin;
    final every = c.step.block.checkInEverySec ?? 120;
    final nextIn = every - (c.elapsedInStep % every);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: <Widget>[
          const Spacer(),
          Icon(
            c.step.block.title.contains('Дугуй')
                ? Icons.pedal_bike_rounded
                : c.step.block.title.contains('Шат')
                    ? Icons.stairs_rounded
                    : Icons.directions_walk_rounded,
            size: 56,
            color: AppColors.cyanDeep,
          ),
          const SizedBox(height: 8),
          Text(c.step.block.title, style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: c.togglePause,
            child: RehabCountdownRing(
              size: 200,
              progress: c.stepProgress,
              label: rehabClock(c.remaining ?? 0),
              caption: c.paused ? 'түр зогссон' : 'үлдсэн',
            ),
          ),
          const SizedBox(height: 16),
          if (c.targetHr != null) ...<Widget>[
            RehabZoneBand(
                zone: last?.zone, pulse: last?.pulse, target: c.targetHr),
            const SizedBox(height: 6),
            Text(
              'Зорилтот пульс: ${c.targetHr}-аас дээш гаргахгүй',
              style: theme.textTheme.bodySmall,
            ),
          ],
          const SizedBox(height: 8),
          TextButton.icon(
            onPressed: onCheckin,
            icon: const Icon(Icons.favorite_rounded, color: AppColors.danger),
            label: Text('Пульс оруулах · дараагийнх ${rehabClock(nextIn)}'),
          ),
          const Spacer(),
          _Controls(controller: c),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _VitalsView extends StatelessWidget {
  const _VitalsView({required this.controller, required this.onCheckin});

  final RehabPlayerController controller;
  final VoidCallback onCheckin;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const Spacer(),
          const Icon(Icons.monitor_heart_outlined,
              size: 64, color: AppColors.cyanDeep),
          const SizedBox(height: 10),
          Text(c.step.block.title,
              textAlign: TextAlign.center, style: theme.textTheme.titleLarge),
          const SizedBox(height: 8),
          for (final line in c.step.block.guideLines)
            Text(line,
                textAlign: TextAlign.center, style: theme.textTheme.bodyLarge),
          const SizedBox(height: 16),
          if (c.lastCheckin != null)
            Text(
              'Сүүлийн пульс: ${c.lastCheckin!.pulse ?? '—'}',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium,
            ),
          const Spacer(),
          OutlinedButton.icon(
            onPressed: onCheckin,
            icon: const Icon(Icons.favorite_rounded),
            label: const Text('Пульс оруулах'),
          ),
          const SizedBox(height: 8),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.cyanInk),
            onPressed: c.next,
            child: const Text('Үргэлжлүүлэх'),
          ),
        ],
      ),
    );
  }
}

class _GuideView extends StatelessWidget {
  const _GuideView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final timed = c.step.durationSec != null;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: <Widget>[
          const SizedBox(height: 8),
          Expanded(
              child:
                  _VideoCard(controller: c, movement: null, tapToPause: timed)),
          const SizedBox(height: 12),
          Text(c.step.block.title,
              textAlign: TextAlign.center, style: theme.textTheme.titleLarge),
          for (final line in c.step.block.guideLines)
            Text(line,
                textAlign: TextAlign.center, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 10),
          if (timed)
            RehabCountdownRing(
              size: 110,
              progress: c.stepProgress,
              label: rehabClock(c.remaining ?? 0),
            ),
          const SizedBox(height: 10),
          _Controls(
            controller: c,
            center: timed
                ? null
                : FilledButton(
                    style: FilledButton.styleFrom(
                        backgroundColor: AppColors.cyanInk),
                    onPressed: c.next,
                    child: const Text('Үргэлжлүүлэх'),
                  ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Пульс + CR10 хуудас
// ---------------------------------------------------------------------------

class _CheckinResult {
  const _CheckinResult(this.pulse, this.borg);
  final int? pulse;
  final int? borg;
}

class _CheckinSheet extends StatefulWidget {
  const _CheckinSheet({this.lastPulse});

  final int? lastPulse;

  @override
  State<_CheckinSheet> createState() => _CheckinSheetState();
}

class _CheckinSheetState extends State<_CheckinSheet> {
  String _pulse = '';
  int? _borg;

  int? get _pulseValue {
    final v = int.tryParse(_pulse);
    return v != null && v >= 30 && v <= 250 ? v : null;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canSave = _pulseValue != null || _borg != null;
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text('Пульс, ачааллаа оруулна уу', style: theme.textTheme.titleLarge),
          const SizedBox(height: 4),
          Text('Цаг түр зогссон. Оруулсны дараа үргэлжилнэ.',
              style: theme.textTheme.bodySmall),
          const SizedBox(height: 12),
          RehabPulseCountHelper(
              onResult: (int v) => setState(() => _pulse = '$v')),
          const SizedBox(height: 12),
          Center(
            child: Text(
              _pulse.isEmpty
                  ? (widget.lastPulse == null
                      ? '—'
                      : 'өмнө: ${widget.lastPulse}')
                  : _pulse,
              style: theme.textTheme.displaySmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: _pulse.isEmpty ? AppColors.textMuted : null,
              ),
            ),
          ),
          const Center(child: Text('цохилт / минут')),
          if (_pulse.isNotEmpty && _pulseValue == null)
            const Center(
              child: Text('30-250 хооронд байна',
                  style: TextStyle(color: AppColors.danger)),
            ),
          const SizedBox(height: 8),
          RehabNumberPad(
              value: _pulse,
              onChanged: (String v) => setState(() => _pulse = v)),
          const SizedBox(height: 16),
          Text('Ачааллын мэдрэмж (0–10)', style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          RehabCr10Picker(
              value: _borg, onChanged: (int v) => setState(() => _borg = v)),
          const SizedBox(height: 18),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.cyanInk,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: canSave
                ? () =>
                    Navigator.pop(context, _CheckinResult(_pulseValue, _borg))
                : null,
            child: const Text('Хадгалаад үргэлжлүүлэх'),
          ),
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Алгасах')),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Зогсоох — шинж тэмдгийн жагсаалт
// ---------------------------------------------------------------------------

class _StopResult {
  const _StopResult(this.symptoms, this.note);
  final List<String> symptoms;
  final String? note;
}

class _StopSheet extends StatefulWidget {
  const _StopSheet();

  @override
  State<_StopSheet> createState() => _StopSheetState();
}

class _StopSheetState extends State<_StopSheet> {
  final Set<String> _picked = <String>{};
  final TextEditingController _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
          20, 16, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'Дасгалаа зогсоож, амарна уу',
            style:
                theme.textTheme.titleLarge?.copyWith(color: AppColors.danger),
          ),
          const SizedBox(height: 4),
          Text('Юу мэдрэгдэж байна вэ?', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 8),
          for (final s in rehabStopSymptoms)
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              value: _picked.contains(s.key),
              title: Text(s.value),
              onChanged: (bool? v) => setState(() {
                v == true ? _picked.add(s.key) : _picked.remove(s.key);
              }),
            ),
          TextField(
            controller: _note,
            maxLines: 2,
            maxLength: 500,
            decoration: const InputDecoration(
              hintText: 'Нэмэлт тайлбар (заавал биш)',
              counterText: '',
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.dangerLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Icon(Icons.emergency_rounded, color: AppColors.danger),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Цээж өвдөх, шахах мэдрэмж амарсны дараа 5 минутаас удаан үргэлжилбэл '
                    'даруй 103 руу залгана уу.',
                    style: theme.textTheme.bodyMedium
                        ?.copyWith(color: const Color(0xFF8E1F2A)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.danger,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () => Navigator.pop(
              context,
              _StopResult(_picked.toList(), _note.text),
            ),
            child: const Text('Дасгалыг зогсоох'),
          ),
          const SizedBox(height: 6),
          OutlinedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                    builder: (_) => const ChatRoomsScreen()),
              );
            },
            icon: const Icon(Icons.chat_bubble_outline_rounded),
            label: const Text('Эмчтэйгээ холбогдох'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Буцах, үргэлжлүүлэх'),
          ),
        ],
      ),
    );
  }
}
