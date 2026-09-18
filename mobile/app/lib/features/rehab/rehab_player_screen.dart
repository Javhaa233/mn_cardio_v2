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

/// Дасгалын тоглуулагч.
///
/// Загварыг хэрэглэгч 2026-09-18-нд "Rehab Player Screens" хуудсан дээр сонгосон:
///
///  * ГЭРЭЛТЭЙ — апп-ын бусад дэлгэцтэй ижил (өмнө нь бараан байсан).
///  * Хөдөлгөөн дээр бичлэг дэлгэцээ дүүргэж, УДИРДЛАГА НЬ НЭГ ХӨВӨГЧ ЗУРВАС
///    (pill) дотор: ⏮ · цаг/товч · ⏭ · ≡.
///  * ТОВЧ ЦӨӨН, ҮГ БАГА: дүрс хангалттай бол бичиггүй. Үг зөвхөн "Одоо эхлэх",
///    "Дууссан", "Үргэлжлүүлэх", "Алгасах" дээр ба хуудсууд дотор.
///  * Яаралтай тусламж нь дээд мөрний УЛААН ДҮРС. Дархад бүтэн бичигтэй
///    шинж тэмдгийн хуудас нээгдэнэ.
///
/// БҮТЭЦ: Column(дээд мөр, Expanded(агуулга)). Хэсэг бүр өөрийн зайтай тул
/// 2026-09-18-нд гарсан шиг товчнууд бие бие дээрээ давхцах боломжгүй — өмнө нь
/// доод зурвас ба удирдлагын мөр нэг зайг хуваалцаж байсан.
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
            child: const Text('Үгүй'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Тийм, дуусгах'),
          ),
        ],
      ),
    );
    if (yes == true) {
      await _finish(status: 'abandoned');
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------ хуудсууд
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
      status: 'stopped',
      symptoms: result.symptoms,
      note: result.note,
    );
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
              _TopBar(controller: c, onClose: _confirmExit, onStop: _openStop),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: KeyedSubtree(
                    key: ValueKey<int>(c.index),
                    child: switch (step.kind) {
                      RehabStepKind.preview => _PreviewView(controller: c),
                      RehabStepKind.movement => _MovementView(controller: c),
                      RehabStepKind.rest => _RestView(controller: c),
                      RehabStepKind.timed => _TimedView(
                          controller: c, onCheckin: () => _openCheckin()),
                      RehabStepKind.vitals => _VitalsView(
                          controller: c, onCheckin: () => _openCheckin()),
                      RehabStepKind.guide => _GuideView(controller: c),
                    },
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
// Нийтлэг хэсгүүд
// ---------------------------------------------------------------------------

/// Хүрэх товчны доод хэмжээ. Өвчтөн 50-80 настай, гар чичирч болно.
const double _kTouch = 52;

/// Дээд мөр: гарах · явц · хөдөлгөөний дугаар · дуу · яаралтай тусламж.
class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.controller,
    required this.onClose,
    required this.onStop,
  });

  final RehabPlayerController controller;
  final VoidCallback onClose;
  final VoidCallback onStop;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final counted = c.step.kind == RehabStepKind.movement ||
        c.step.kind == RehabStepKind.preview ||
        c.step.kind == RehabStepKind.rest;

    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(4, 4, 8, 8),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              IconButton(
                tooltip: 'Дуусгах',
                iconSize: 26,
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded),
              ),
              Expanded(
                child: Text(
                  c.step.block.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleMedium,
                ),
              ),
              if (counted && c.movementTotal > 0)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    '${c.movementOrdinal}/${c.movementTotal}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.inkMuted,
                      fontFeatures: const <FontFeature>[
                        FontFeature.tabularFigures(),
                      ],
                    ),
                  ),
                ),
              IconButton(
                tooltip: c.muted ? 'Дуу асаах' : 'Дуу хаах',
                iconSize: 24,
                onPressed: c.toggleMute,
                icon: Icon(c.muted
                    ? Icons.volume_off_rounded
                    : Icons.volume_up_rounded),
              ),
              // Яаралтай тусламж: улаан дүрс, бичиггүй. Дархад шинж тэмдгийн
              // жагсаалт бүтэн бичигтэйгээ нээгдэнэ.
              Tooltip(
                message: 'Биеийн байдал муу байна',
                child: Semantics(
                  button: true,
                  label: 'Биеийн байдал муу байна',
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: onStop,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: AppColors.danger,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.emergency_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: List<Widget>.generate(c.blockCount, (int i) {
              final done = i < c.currentBlockOrdinal;
              final now = i == c.currentBlockOrdinal;
              return Expanded(
                child: Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3),
                    color: done
                        ? AppColors.cyanInk
                        : now
                            ? AppColors.cyan
                            : AppColors.hairlineStrong,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

/// Дугуй товч. Дүрс дангаараа ойлгомжтой үед бичиг байхгүй.
class _RoundButton extends StatelessWidget {
  const _RoundButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    this.primary = false,
    this.size = _kTouch,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;
  final bool primary;
  final double size;

  @override
  Widget build(BuildContext context) {
    final disabled = onPressed == null;
    return Tooltip(
      message: tooltip,
      child: Semantics(
        button: true,
        label: tooltip,
        child: Material(
          color: primary ? AppColors.cyanInk : AppColors.surface,
          shape: primary
              ? const CircleBorder()
              : const CircleBorder(
                  side: BorderSide(color: AppColors.hairlineStrong),
                ),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onPressed,
            child: SizedBox(
              width: size,
              height: size,
              child: Icon(
                icon,
                size: primary ? size * 0.46 : size * 0.42,
                color: primary
                    ? Colors.white
                    : disabled
                        ? AppColors.textMuted
                        : AppColors.cyanInk,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// ⏮ · дунд · ⏭ · ≡ — тоглуулагчийн цорын ганц удирдлагын мөр.
///
/// Дунд нь өргөн товч ("Дууссан") байсан ч ⏭ хэзээ ч гарахгүй: Expanded +
/// FittedBox гурвуулаа 320dp-д багтаана.
class _ControlBar extends StatelessWidget {
  const _ControlBar({
    required this.controller,
    this.center,
    this.steps,
    this.floating = false,
  });

  final RehabPlayerController controller;
  final Widget? center;
  final List<String>? steps;
  final bool floating;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final list = steps ?? const <String>[];
    final row = Row(
      children: <Widget>[
        _RoundButton(
          icon: Icons.skip_previous_rounded,
          tooltip: 'Өмнөх',
          onPressed: c.index == 0 ? null : c.previous,
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: center ??
                    _RoundButton(
                      icon: c.paused
                          ? Icons.play_arrow_rounded
                          : Icons.pause_rounded,
                      tooltip: c.paused ? 'Үргэлжлүүлэх' : 'Түр зогсоох',
                      primary: true,
                      size: 64,
                      onPressed: c.togglePause,
                    ),
              ),
            ),
          ),
        ),
        _RoundButton(
          icon: Icons.skip_next_rounded,
          tooltip: 'Алгасах',
          onPressed: c.next,
        ),
        if (list.isNotEmpty) ...<Widget>[
          const SizedBox(width: 6),
          _RoundButton(
            icon: Icons.menu_book_outlined,
            tooltip: 'Заавар',
            size: 44,
            onPressed: () => _openSteps(context, list, c.step.title),
          ),
        ],
      ],
    );

    if (!floating) return row;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(22),
        boxShadow: const <BoxShadow>[
          BoxShadow(
              color: Color(0x2E0C2233), blurRadius: 18, offset: Offset(0, 6)),
        ],
      ),
      child: row,
    );
  }
}

/// Бичлэг. Хаана ч дарвал зогсоно / үргэлжилнэ.
class _Video extends StatelessWidget {
  const _Video({
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
          ),
          if (c.paused && tapToPause)
            ColoredBox(
              color: const Color(0x66EAF2F8),
              child: Center(
                child: _RoundButton(
                  icon: Icons.play_arrow_rounded,
                  tooltip: 'Үргэлжлүүлэх',
                  primary: true,
                  size: 76,
                  onPressed: c.togglePause,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Алхмууд
// ---------------------------------------------------------------------------

/// Хөдөлгөөн: бичлэг дэлгэцээ дүүргэж, удирдлага нэг хөвөгч зурваст (сонголт B).
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
        _Video(controller: c, movement: m),
        // Нэр — бичлэгийн дээд хэсэгт, бага зайтай.
        Positioned(
          left: 12,
          right: 12,
          top: 10,
          child: Align(
            alignment: Alignment.topCenter,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: AppColors.surface.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                m.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ),
        Positioned(
          left: 12,
          right: 12,
          bottom: 12,
          child: _ControlBar(
            controller: c,
            floating: true,
            steps: m.steps,
            center: counted
                ? FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.cyanInk,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(0, _kTouch),
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      textStyle: theme.textTheme.titleMedium,
                    ),
                    onPressed: c.next,
                    icon: const Icon(Icons.check_rounded),
                    label: Text('${m.reps} удаа'),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      RehabCountdownRing(
                        size: 56,
                        progress: c.stepProgress,
                        label: '${c.remaining ?? 0}',
                      ),
                      const SizedBox(width: 10),
                      _RoundButton(
                        icon: c.paused
                            ? Icons.play_arrow_rounded
                            : Icons.pause_rounded,
                        tooltip: c.paused ? 'Үргэлжлүүлэх' : 'Түр зогсоох',
                        primary: true,
                        size: 56,
                        onPressed: c.togglePause,
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}

/// "Дараагийн дасгал" — юу ирэхийг харуулж, бэлтгэх хугацаа тоолно.
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
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'ДАРААГИЙН ДАСГАЛ',
            textAlign: TextAlign.center,
            style: theme.textTheme.labelLarge?.copyWith(
              color: AppColors.cyanInk,
              letterSpacing: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            flex: 5,
            child: m != null
                ? _Video(
                    controller: c,
                    movement: m,
                    tapToPause: false,
                    radius: 16,
                  )
                : Center(
                    child: Icon(
                      step.nextKind == RehabStepKind.timed
                          ? Icons.directions_walk_rounded
                          : Icons.self_improvement_rounded,
                      size: 96,
                      color: AppColors.cyanDeep,
                    ),
                  ),
          ),
          const SizedBox(height: 12),
          Text(
            step.title,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          if (what != null)
            Text(
              what,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium
                  ?.copyWith(color: AppColors.inkMuted),
            ),
          if (steps.isNotEmpty) ...<Widget>[
            const SizedBox(height: 8),
            Flexible(
              flex: 3,
              child: SingleChildScrollView(child: _StepList(steps: steps)),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              RehabCountdownRing(
                size: 64,
                progress: c.stepProgress,
                label: '${c.remaining ?? 0}',
              ),
              const SizedBox(width: 10),
              _RoundButton(
                icon: Icons.add_rounded,
                tooltip: '+10 секунд',
                onPressed: c.addTenSeconds,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.cyanInk,
                    minimumSize: const Size(0, _kTouch),
                    textStyle: theme.textTheme.titleMedium,
                  ),
                  onPressed: c.next,
                  child: const Text('Одоо эхлэх'),
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
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Column(
        children: <Widget>[
          const Spacer(),
          Text(
            'АМРАХ',
            style: theme.textTheme.labelLarge?.copyWith(
              color: AppColors.cyanInk,
              letterSpacing: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          RehabCountdownRing(
            size: 160,
            progress: c.stepProgress,
            label: rehabClock(c.remaining ?? 0),
          ),
          const SizedBox(height: 12),
          Text(
            'Амьсгалаа тайвшруулна уу',
            style: theme.textTheme.titleMedium
                ?.copyWith(color: AppColors.inkMuted),
          ),
          const SizedBox(height: 20),
          if (next != null)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border.all(color: AppColors.hairline),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: <Widget>[
                  SizedBox(
                    width: 44,
                    height: 62,
                    child: _Video(
                      controller: c,
                      movement: next,
                      tapToPause: false,
                      radius: 10,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'ДАРААГИЙНХ',
                          style: theme.textTheme.labelSmall
                              ?.copyWith(color: AppColors.inkMuted),
                        ),
                        Text(
                          next.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleMedium,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          const Spacer(),
          _ControlBar(
            controller: c,
            center: OutlinedButton(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, _kTouch),
                side: const BorderSide(color: AppColors.hairlineStrong),
                foregroundColor: AppColors.cyanInk,
                padding: const EdgeInsets.symmetric(horizontal: 20),
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

/// Алхах, дугуй жийх, шатаар алхах.
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
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Column(
        children: <Widget>[
          const Spacer(),
          Icon(
            title.contains('Дугуй')
                ? Icons.pedal_bike_rounded
                : title.contains('Шат')
                    ? Icons.stairs_rounded
                    : Icons.directions_walk_rounded,
            size: 44,
            color: AppColors.cyanDeep,
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: c.togglePause,
            child: RehabCountdownRing(
              size: 180,
              progress: c.stepProgress,
              label: rehabClock(c.remaining ?? 0),
              caption: c.paused ? 'түр зогссон' : 'үлдсэн',
            ),
          ),
          const SizedBox(height: 20),
          if (c.targetHr != null)
            RehabZoneBand(
              zone: last?.zone,
              pulse: last?.pulse,
              target: c.targetHr,
            ),
          const SizedBox(height: 10),
          // Пульс оруулах — дүрс + богино хугацаа, бүтэн өгүүлбэр биш.
          Material(
            color: AppColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: AppColors.hairline),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: onCheckin,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: <Widget>[
                    const Icon(Icons.favorite_rounded,
                        color: AppColors.danger, size: 26),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Пульс оруулах',
                        style: theme.textTheme.titleSmall,
                      ),
                    ),
                    Text(
                      rehabClock(nextIn),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: AppColors.inkMuted,
                        fontFeatures: const <FontFeature>[
                          FontFeature.tabularFigures(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Spacer(),
          _ControlBar(controller: c, steps: c.step.block.guideLines),
        ],
      ),
    );
  }
}

/// Амин үзүүлэлт хэмжих хэсэг (тархины харвалтын хөтөлбөр).
class _VitalsView extends StatelessWidget {
  const _VitalsView({required this.controller, required this.onCheckin});

  final RehabPlayerController controller;
  final VoidCallback onCheckin;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const Spacer(),
          const Icon(Icons.monitor_heart_outlined,
              size: 64, color: AppColors.cyanDeep),
          const SizedBox(height: 14),
          Text(
            c.step.block.title,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          for (final line in c.step.block.guideLines)
            Text(
              line,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium
                  ?.copyWith(color: AppColors.inkMuted),
            ),
          if (c.lastCheckin != null) ...<Widget>[
            const SizedBox(height: 16),
            Text(
              'Сүүлийн пульс: ${c.lastCheckin!.pulse ?? '—'}',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleLarge,
            ),
          ],
          const Spacer(),
          _ControlBar(
            controller: c,
            center: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                _RoundButton(
                  icon: Icons.favorite_rounded,
                  tooltip: 'Пульс оруулах',
                  onPressed: onCheckin,
                ),
                const SizedBox(width: 10),
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.cyanInk,
                    minimumSize: const Size(0, _kTouch),
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    textStyle: theme.textTheme.titleMedium,
                  ),
                  onPressed: c.next,
                  child: const Text('Үргэлжлүүлэх'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Бичлэггүй хэсэг: зураг эсвэл цагтай заавар.
class _GuideView extends StatelessWidget {
  const _GuideView({required this.controller});

  final RehabPlayerController controller;

  @override
  Widget build(BuildContext context) {
    final c = controller;
    final theme = Theme.of(context);
    final timed = c.step.durationSec != null;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Column(
        children: <Widget>[
          const Spacer(),
          const Icon(Icons.self_improvement_rounded,
              size: 72, color: AppColors.cyanDeep),
          const SizedBox(height: 14),
          Text(
            c.step.block.title,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          if (c.step.block.guideLines.isNotEmpty) ...<Widget>[
            const SizedBox(height: 10),
            _StepList(steps: c.step.block.guideLines),
          ],
          if (timed) ...<Widget>[
            const SizedBox(height: 18),
            RehabCountdownRing(
              size: 140,
              progress: c.stepProgress,
              label: rehabClock(c.remaining ?? 0),
            ),
          ],
          const Spacer(),
          _ControlBar(
            controller: c,
            center: timed
                ? null
                : FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.cyanInk,
                      minimumSize: const Size(0, _kTouch),
                      padding: const EdgeInsets.symmetric(horizontal: 18),
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

/// Дугаарласан алхмууд.
class _StepList extends StatelessWidget {
  const _StepList({required this.steps});

  final List<String> steps;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                CircleAvatar(
                  radius: 13,
                  backgroundColor: AppColors.infoLight,
                  child: Text(
                    '${i + 1}',
                    style: theme.textTheme.labelLarge
                        ?.copyWith(color: AppColors.cyanInk),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    steps[i],
                    style: theme.textTheme.titleMedium?.copyWith(height: 1.35),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Дасгал хийж байх үед зааврыг дахин уншихад (≡ товч).
Future<void> _openSteps(
  BuildContext context,
  List<String> steps,
  String title,
) {
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
        _StepList(steps: steps),
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
