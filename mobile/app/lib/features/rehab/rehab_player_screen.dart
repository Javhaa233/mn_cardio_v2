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

/// Дасгалын тоглуулагч (сонголтууд 2026-09-17, засвар 2026-09-18):
///  * бичлэг дэлгэцээ дүүргэж, нэр/цаг/товчнууд түүн дээр сууна
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
    final steps = step.movement?.steps ?? step.block.guideLines;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, Object? _) {
        if (!didPop) _confirmExit();
      },
      child: Scaffold(
        // Бичлэг дэлгэцээ дүүргэдэг тул бүхэлдээ бараан: цагаан текст
        // бичлэг дээр ч, хоосон дэвсгэр дээр ч ижил уншигдана.
        backgroundColor: AppColors.ink,
        body: Stack(
          fit: StackFit.expand,
          children: <Widget>[
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: KeyedSubtree(
                key: ValueKey<int>(c.index),
                child: switch (step.kind) {
                  RehabStepKind.preview => _PreviewView(controller: c),
                  RehabStepKind.movement => _MovementView(controller: c),
                  RehabStepKind.rest => _RestView(controller: c),
                  RehabStepKind.timed =>
                    _TimedView(controller: c, onCheckin: () => _openCheckin()),
                  RehabStepKind.vitals =>
                    _VitalsView(controller: c, onCheckin: () => _openCheckin()),
                  RehabStepKind.guide => _GuideView(controller: c),
                },
              ),
            ),
            Align(
              alignment: Alignment.topCenter,
              child: SafeArea(
                bottom: false,
                child: _PlayerChrome(controller: c, onClose: _confirmExit),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: SafeArea(
                top: false,
                child: Container(
                  decoration: _scrim(fromTop: false),
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      if (steps.isNotEmpty &&
                          step.kind != RehabStepKind.preview)
                        TextButton.icon(
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.white,
                            minimumSize: const Size(0, 44),
                          ),
                          onPressed: () =>
                              _openSteps(context, steps, step.title),
                          icon: const Icon(Icons.menu_book_outlined, size: 20),
                          label: const Text('Заавар'),
                        ),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.danger,
                            foregroundColor: Colors.white,
                            minimumSize: const Size(0, 52),
                          ),
                          onPressed: _openStop,
                          icon: const Icon(Icons.health_and_safety_outlined),
                          label: const Text('Биеийн байдал муу байна'),
                        ),
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

// ---------------------------------------------------------------------------
// Дэлгэцийн ерөнхий хэсгүүд
//
// Бүтэц (2026-09-18 сонголт): бичлэг дэлгэцээ дүүргэнэ, нэр ба товчнууд
// бичлэг дээрээ хар налуу дэвсгэр дээр сууна. Тиймээс тоглуулагч бүхэлдээ
// бараан — цагаан текст бичлэг дээр ч, дэвсгэр дээр ч уншигдана.
// ---------------------------------------------------------------------------

/// Тоглуулагчийн бүх алхамд нийтлэг зай: дээд ба доод давхаргад эзлэгдсэн хэсэг.
const double _kChromeTop = 92;
const double _kChromeBottom = 132;
const double _kTouch = 56;

/// Бичлэг дээрх текст уншигдахуйц болгох налуу дэвсгэр.
BoxDecoration _scrim({required bool fromTop}) => BoxDecoration(
      gradient: LinearGradient(
        begin: fromTop ? Alignment.topCenter : Alignment.bottomCenter,
        end: fromTop ? Alignment.bottomCenter : Alignment.topCenter,
        colors: const <Color>[Color(0xCC0C2233), Color(0x000C2233)],
      ),
    );

/// Дээд мөр: гарах, хэсгүүдийн явц, хөдөлгөөний дугаар, дуу.
class _PlayerChrome extends StatelessWidget {
  const _PlayerChrome({required this.controller, required this.onClose});

  final RehabPlayerController controller;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final counted = c.step.kind == RehabStepKind.movement ||
        c.step.kind == RehabStepKind.preview ||
        c.step.kind == RehabStepKind.rest;
    final label = counted && c.movementTotal > 0
        ? '${c.movementOrdinal}/${c.movementTotal} хөдөлгөөн'
        : c.step.block.title;

    return Container(
      decoration: _scrim(fromTop: true),
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Row(
            children: <Widget>[
              IconButton(
                tooltip: 'Дуусгах',
                color: Colors.white,
                iconSize: 28,
                constraints: const BoxConstraints.tightFor(
                    width: _kTouch, height: _kTouch),
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded),
              ),
              Expanded(
                child: Column(
                  children: <Widget>[
                    Text(
                      c.step.block.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.titleMedium
                          ?.copyWith(color: Colors.white),
                    ),
                    Text(
                      label,
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: c.muted ? 'Дуу асаах' : 'Дуу хаах',
                color: Colors.white,
                iconSize: 26,
                constraints: const BoxConstraints.tightFor(
                    width: _kTouch, height: _kTouch),
                onPressed: c.toggleMute,
                icon: Icon(c.muted
                    ? Icons.volume_off_rounded
                    : Icons.volume_up_rounded),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: List<Widget>.generate(c.blockCount, (int i) {
                final done = i < c.currentBlockOrdinal;
                final now = i == c.currentBlockOrdinal;
                return Expanded(
                  child: Container(
                    height: 5,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      color: done
                          ? Colors.white
                          : now
                              ? AppColors.cyan
                              : Colors.white24,
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

/// ⏮ · дунд · ⏭.
///
/// Дунд нь өргөн товч ("Дууссан") байсан ч ⏭ хэзээ ч дэлгэцнээс гарахгүй:
/// Expanded + FittedBox нь 320dp өргөнтэй утсанд ч гурвуулаа багтаана.
/// (2026-09-18: өмнө нь төвлөрүүлсэн Row байсан тул давталттай дасгал дээр
/// ⏭ товч дэлгэцийн гадна үлдэж, "дараагийн товч алга" болж харагдсан.)
class _ControlRow extends StatelessWidget {
  const _ControlRow({required this.controller, this.center});

  final RehabPlayerController controller;
  final Widget? center;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    return Row(
      children: <Widget>[
        _RoundControl(
          icon: Icons.skip_previous_rounded,
          tooltip: 'Өмнөх',
          onPressed: c.index == 0 ? null : c.previous,
        ),
        Expanded(
          child: Center(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: center ??
                  _RoundControl(
                    icon: c.paused
                        ? Icons.play_arrow_rounded
                        : Icons.pause_rounded,
                    tooltip: c.paused ? 'Үргэлжлүүлэх' : 'Түр зогсоох',
                    big: true,
                    onPressed: c.togglePause,
                  ),
            ),
          ),
        ),
        _RoundControl(
          icon: Icons.skip_next_rounded,
          tooltip: 'Алгасах',
          onPressed: c.next,
        ),
      ],
    );
  }
}

class _RoundControl extends StatelessWidget {
  const _RoundControl({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    this.big = false,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;
  final bool big;

  @override
  Widget build(BuildContext context) {
    final size = big ? 76.0 : _kTouch;
    return Tooltip(
      message: tooltip,
      child: Material(
        color: big ? AppColors.cyanInk : Colors.white24,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: size,
            height: size,
            child: Icon(
              icon,
              size: big ? 40 : 28,
              color: onPressed == null ? Colors.white38 : Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

/// Бүтэн дэлгэцийн бичлэг. Хаана ч дарвал зогсоно / үргэлжилнэ.
class _VideoLayer extends StatelessWidget {
  const _VideoLayer({
    required this.controller,
    required this.movement,
    this.tapToPause = true,
    this.radius = 0,
  });

  final RehabPlayerController controller;
  final RehabMovement? movement;
  final bool tapToPause;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final m = movement;
    return GestureDetector(
      onTap: tapToPause ? c.togglePause : null,
      child: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          RehabLoopVideo(
            file: m == null ? null : c.files[m.id],
            loopStartMs: m?.loopStartMs,
            loopEndMs: m?.loopEndMs,
            paused: c.paused && tapToPause,
            borderRadius: radius,
            background: AppColors.ink,
          ),
          if (c.paused && tapToPause)
            ColoredBox(
              color: const Color(0x990C2233),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    const Icon(Icons.play_circle_fill_rounded,
                        size: 84, color: Colors.white),
                    const SizedBox(height: 12),
                    Text(
                      'Үргэлжлүүлэх',
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Хөдөлгөөн: бичлэг дэлгэцийг дүүргэж, нэр ба товчнууд түүн дээр сууна.
class _MovementView extends StatelessWidget {
  const _MovementView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final m = c.step.movement!;
    final theme = Theme.of(context);
    final counted = c.step.durationSec == null;

    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        _VideoLayer(controller: c, movement: m),
        Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            decoration: _scrim(fromTop: false),
            padding: const EdgeInsets.fromLTRB(
                12, 24, 12, _kChromeBottom - _kTouch + 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  m.name,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 16),
                _ControlRow(
                  controller: c,
                  center: counted
                      ? FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.cyanInk,
                            foregroundColor: Colors.white,
                            minimumSize: const Size(0, _kTouch),
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            textStyle: theme.textTheme.titleMedium,
                          ),
                          onPressed: c.next,
                          icon: const Icon(Icons.check_rounded),
                          label: Text('${m.reps} удаа · Дууссан'),
                        )
                      : RehabCountdownRing(
                          size: 108,
                          progress: c.stepProgress,
                          label: '${c.remaining ?? 0}',
                          caption: 'сек',
                          onDark: true,
                        ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// "Дараагийн дасгал" — бүтэн дэлгэц, бэлтгэх хугацаа.
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
      padding: const EdgeInsets.fromLTRB(16, _kChromeTop, 16, _kChromeBottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'ДАРААГИЙН ДАСГАЛ',
            textAlign: TextAlign.center,
            style: theme.textTheme.labelLarge?.copyWith(
              color: AppColors.cyan,
              letterSpacing: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            flex: 5,
            child: m != null
                ? _VideoLayer(
                    controller: c,
                    movement: m,
                    tapToPause: false,
                    radius: 20,
                  )
                : Center(
                    child: Icon(
                      step.nextKind == RehabStepKind.timed
                          ? Icons.directions_walk_rounded
                          : Icons.self_improvement_rounded,
                      size: 110,
                      color: AppColors.cyan,
                    ),
                  ),
          ),
          const SizedBox(height: 16),
          Text(
            step.title,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          if (what != null) ...<Widget>[
            const SizedBox(height: 4),
            Text(
              what,
              textAlign: TextAlign.center,
              style:
                  theme.textTheme.titleMedium?.copyWith(color: Colors.white70),
            ),
          ],
          if (steps.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            Flexible(
              flex: 3,
              child: SingleChildScrollView(child: _StepList(steps: steps)),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              RehabCountdownRing(
                size: 92,
                progress: c.stepProgress,
                label: '${c.remaining ?? 0}',
                onDark: true,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white54),
                        minimumSize: const Size(0, 48),
                      ),
                      onPressed: c.addTenSeconds,
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('+10 сек'),
                    ),
                    const SizedBox(height: 8),
                    FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.cyanInk,
                        minimumSize: const Size(0, _kTouch),
                        textStyle: theme.textTheme.titleMedium,
                      ),
                      onPressed: c.next,
                      child: const Text('Одоо эхлэх'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Хөдөлгөөн хоорондын амралт.
class _RestView extends StatelessWidget {
  const _RestView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final next = c.step.movement;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, _kChromeTop, 20, _kChromeBottom),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(
            'АМРАХ',
            style: theme.textTheme.labelLarge?.copyWith(
              color: AppColors.cyan,
              letterSpacing: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          RehabCountdownRing(
            size: 190,
            progress: c.stepProgress,
            label: '${c.remaining ?? 0}',
            caption: 'сек',
            onDark: true,
          ),
          const SizedBox(height: 16),
          Text(
            'Амьсгалаа тайвшруулна уу',
            style: theme.textTheme.titleMedium?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 24),
          if (next != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: <Widget>[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 52,
                      height: 78,
                      child: _VideoLayer(
                        controller: c,
                        movement: next,
                        tapToPause: false,
                        radius: 10,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text('Дараагийнх',
                            style: theme.textTheme.bodySmall
                                ?.copyWith(color: Colors.white54)),
                        Text(
                          next.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleMedium
                              ?.copyWith(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.cyanInk,
                minimumSize: const Size(0, _kTouch),
                textStyle: theme.textTheme.titleMedium,
              ),
              onPressed: c.next,
              child: const Text('Алгасах'),
            ),
          ),
        ],
      ),
    );
  }
}

/// Алхах, дугуй жийх, шатаар алхах — том цаг, зорилтот пульсын бүс.
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
    final title = c.step.block.title;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, _kChromeTop, 20, _kChromeBottom),
      child: Column(
        children: <Widget>[
          const Spacer(),
          Icon(
            title.contains('Дугуй')
                ? Icons.pedal_bike_rounded
                : title.contains('Шат')
                    ? Icons.stairs_rounded
                    : Icons.directions_walk_rounded,
            size: 56,
            color: AppColors.cyan,
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: c.togglePause,
            child: RehabCountdownRing(
              size: 220,
              progress: c.stepProgress,
              label: rehabClock(c.remaining ?? 0),
              caption: c.paused ? 'түр зогссон' : 'үлдсэн',
              onDark: true,
            ),
          ),
          const SizedBox(height: 24),
          if (c.targetHr != null) ...<Widget>[
            RehabZoneBand(
                zone: last?.zone, pulse: last?.pulse, target: c.targetHr),
            const SizedBox(height: 8),
            Text(
              'Зорилтот пульс: ${c.targetHr}-аас дээш гаргахгүй',
              style:
                  theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
            ),
          ],
          const SizedBox(height: 12),
          TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: Colors.white,
              minimumSize: const Size(0, 48),
            ),
            onPressed: onCheckin,
            icon: const Icon(Icons.favorite_rounded, color: AppColors.urgent),
            label: Text('Пульс оруулах · дараагийнх ${rehabClock(nextIn)}'),
          ),
          const Spacer(),
          _ControlRow(controller: c),
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
      padding: const EdgeInsets.fromLTRB(20, _kChromeTop, 20, _kChromeBottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const Spacer(),
          const Icon(Icons.monitor_heart_outlined,
              size: 72, color: AppColors.cyan),
          const SizedBox(height: 16),
          Text(
            c.step.block.title,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          for (final line in c.step.block.guideLines)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Text(
                line,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium
                    ?.copyWith(color: Colors.white70),
              ),
            ),
          const SizedBox(height: 20),
          if (c.lastCheckin != null)
            Text(
              'Сүүлийн пульс: ${c.lastCheckin!.pulse ?? '—'}',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleLarge?.copyWith(color: Colors.white),
            ),
          const Spacer(),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: const BorderSide(color: Colors.white54),
              minimumSize: const Size(0, _kTouch),
            ),
            onPressed: onCheckin,
            icon: const Icon(Icons.favorite_rounded),
            label: const Text('Пульс оруулах'),
          ),
          const SizedBox(height: 12),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.cyanInk,
              minimumSize: const Size(0, _kTouch),
              textStyle: theme.textTheme.titleMedium,
            ),
            onPressed: c.next,
            child: const Text('Үргэлжлүүлэх'),
          ),
        ],
      ),
    );
  }
}

/// Бичлэггүй хэсэг: зураг эсвэл цаг бүхий заавар.
class _GuideView extends StatelessWidget {
  const _GuideView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final timed = c.step.durationSec != null;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, _kChromeTop, 20, _kChromeBottom),
      child: Column(
        children: <Widget>[
          const Spacer(),
          const Icon(Icons.self_improvement_rounded,
              size: 88, color: AppColors.cyan),
          const SizedBox(height: 16),
          Text(
            c.step.block.title,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          if (c.step.block.guideLines.isNotEmpty)
            _StepList(steps: c.step.block.guideLines),
          const SizedBox(height: 20),
          if (timed)
            RehabCountdownRing(
              size: 150,
              progress: c.stepProgress,
              label: rehabClock(c.remaining ?? 0),
              onDark: true,
            ),
          const Spacer(),
          _ControlRow(
            controller: c,
            center: timed
                ? null
                : FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.cyanInk,
                      minimumSize: const Size(0, _kTouch),
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      textStyle: theme.textTheme.titleMedium,
                    ),
                    onPressed: c.next,
                    child: const Text('Үргэлжлүүлэх'),
                  ),
          ),
        ],
      ),
    );
  }
}

/// Дугаарласан алхмууд — бэлтгэлийн дэлгэц дээр ч, "Заавар" хуудсан дээр ч.
class _StepList extends StatelessWidget {
  const _StepList({required this.steps, this.onDark = true});

  final List<String> steps;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                CircleAvatar(
                  radius: 14,
                  backgroundColor:
                      onDark ? Colors.white12 : AppColors.infoLight,
                  child: Text(
                    '${i + 1}',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: onDark ? Colors.white : AppColors.cyanInk,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    steps[i],
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: onDark ? Colors.white : AppColors.ink,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Дасгал хийж байх үед зааврыг дахин уншихад.
Future<void> _openSteps(
    BuildContext context, List<String> steps, String title) {
  return showModalBottomSheet<void>(
    context: context,
    useSafeArea: true,
    backgroundColor: AppColors.surface,
    builder: (_) => ListView(
      shrinkWrap: true,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      children: <Widget>[
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _StepList(steps: steps, onDark: false),
      ],
    ),
  );
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
