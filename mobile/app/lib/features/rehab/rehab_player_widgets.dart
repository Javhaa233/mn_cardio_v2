import 'dart:async';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';

import '../../shared/theme/app_colors.dart';
import 'rehab_player_models.dart';

// ---------------------------------------------------------------------------
// Давтагдах бичлэг
// ---------------------------------------------------------------------------

/// Дуугүй, байнга давтагдах бичлэг ("gif" мэт).
///
/// [loopStartMs]/[loopEndMs] өгвөл бүтэн файлын зөвхөн тэр хэсгийг давтана
/// (зүсээгүй жишээ бичлэг). Файлгүй бол ойлгомжтой орлуулагч харуулна.
class RehabLoopVideo extends StatefulWidget {
  const RehabLoopVideo({
    super.key,
    required this.file,
    this.loopStartMs,
    this.loopEndMs,
    this.paused = false,
    this.borderRadius = 20,
  });

  final File? file;
  final int? loopStartMs;
  final int? loopEndMs;
  final bool paused;
  final double borderRadius;

  @override
  State<RehabLoopVideo> createState() => _RehabLoopVideoState();
}

class _RehabLoopVideoState extends State<RehabLoopVideo> {
  VideoPlayerController? _controller;
  bool _failed = false;

  bool get _segment =>
      widget.loopStartMs != null &&
      widget.loopEndMs != null &&
      widget.loopEndMs! > widget.loopStartMs!;

  @override
  void initState() {
    super.initState();
    _open();
  }

  @override
  void didUpdateWidget(covariant RehabLoopVideo old) {
    super.didUpdateWidget(old);
    if (old.file?.path != widget.file?.path ||
        old.loopStartMs != widget.loopStartMs ||
        old.loopEndMs != widget.loopEndMs) {
      _close();
      _open();
      return;
    }
    if (old.paused != widget.paused) _syncPlay();
  }

  Future<void> _open() async {
    final file = widget.file;
    if (file == null) return;
    final controller = VideoPlayerController.file(file);
    _controller = controller;
    try {
      await controller.initialize();
      await controller.setVolume(0);
      if (_segment) {
        await controller.seekTo(Duration(milliseconds: widget.loopStartMs!));
        controller.addListener(_segmentGuard);
      } else {
        await controller.setLooping(true);
      }
      if (!mounted || _controller != controller) return;
      setState(() {});
      _syncPlay();
    } catch (_) {
      if (mounted) setState(() => _failed = true);
    }
  }

  void _segmentGuard() {
    final c = _controller;
    if (c == null || !c.value.isInitialized) return;
    final end = Duration(milliseconds: widget.loopEndMs!);
    if (c.value.position >= end ||
        (!c.value.isPlaying && !widget.paused && c.value.isCompleted)) {
      c.seekTo(Duration(milliseconds: widget.loopStartMs!));
      if (!widget.paused) c.play();
    }
  }

  void _syncPlay() {
    final c = _controller;
    if (c == null || !c.value.isInitialized) return;
    widget.paused ? c.pause() : c.play();
  }

  void _close() {
    final c = _controller;
    _controller = null;
    c?.removeListener(_segmentGuard);
    c?.dispose();
  }

  @override
  void dispose() {
    _close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = _controller;
    Widget child;
    if (widget.file == null || _failed) {
      child = Container(
        color: AppColors.canvas,
        alignment: Alignment.center,
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.self_improvement_rounded,
                size: 56, color: AppColors.cyanDeep),
            const SizedBox(height: 10),
            Text(
              _failed
                  ? 'Бичлэгийг тоглуулж чадсангүй'
                  : 'Бичлэг бэлтгэгдэж байна',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: AppColors.inkMuted),
            ),
          ],
        ),
      );
    } else if (c == null || !c.value.isInitialized) {
      child = const ColoredBox(
        color: AppColors.canvas,
        child: Center(child: CircularProgressIndicator()),
      );
    } else {
      // 9:16 бичлэгийг хүрээнд нь багтааж, хүнийг огтлохгүй.
      child = ColoredBox(
        color: AppColors.canvas,
        child: FittedBox(
          fit: BoxFit.contain,
          child: SizedBox(
            width: c.value.size.width,
            height: c.value.size.height,
            child: VideoPlayer(c),
          ),
        ),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: child,
    );
  }
}

// ---------------------------------------------------------------------------
// Цагийн цагираг
// ---------------------------------------------------------------------------

/// Хоосорч буй цагираг, дунд нь секунд эсвэл давталт.
class RehabCountdownRing extends StatelessWidget {
  const RehabCountdownRing({
    super.key,
    required this.progress,
    required this.label,
    this.caption,
    this.size = 132,
    this.color = AppColors.cyan,
  });

  final double progress;
  final String label;
  final String? caption;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _RingPainter(
          progress: progress,
          color: color,
          track: theme.dividerColor.withValues(alpha: 0.35),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                label,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontFeatures: const <FontFeature>[
                    FontFeature.tabularFigures()
                  ],
                ),
              ),
              if (caption != null)
                Text(caption!, style: theme.textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter(
      {required this.progress, required this.color, required this.track});

  final double progress;
  final Color color;
  final Color track;

  @override
  void paint(Canvas canvas, Size size) {
    const stroke = 10.0;
    final rect = Offset.zero & size;
    final arcRect = rect.deflate(stroke / 2);
    canvas.drawArc(
      arcRect,
      0,
      math.pi * 2,
      false,
      Paint()
        ..color = track
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke,
    );
    // Үлдсэн хэсгийг зурна: цаг явах тусам цагираг хоосорно.
    final left = (1 - progress).clamp(0.0, 1.0);
    canvas.drawArc(
      arcRect,
      -math.pi / 2,
      math.pi * 2 * left,
      false,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeWidth = stroke,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) =>
      old.progress != progress || old.color != color;
}

String rehabClock(int seconds) {
  final s = seconds < 0 ? 0 : seconds;
  return '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';
}

// ---------------------------------------------------------------------------
// Зорилтот пульсын өнгөт бүс
// ---------------------------------------------------------------------------

/// Өнгөт бүс — өнгө дангаараа биш: дотор нь нэг үг, дүрс (өнгө ялгадаггүй
/// хүмүүст, AppColors-ийн контрастын дүрэм).
class RehabZoneBand extends StatelessWidget {
  const RehabZoneBand({super.key, required this.zone, this.pulse, this.target});

  final HrZone? zone;
  final int? pulse;
  final int? target;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    late final Color bg;
    late final Color fg;
    late final IconData icon;
    late final String word;
    switch (zone) {
      case HrZone.above:
        bg = AppColors.warningLight;
        fg = const Color(0xFF7A5200);
        icon = Icons.arrow_downward_rounded;
        word = 'Хэт өндөр — удаашруулна уу';
      case HrZone.inRange:
        bg = AppColors.successLight;
        fg = AppColors.success;
        icon = Icons.check_rounded;
        word = 'Зөв';
      case HrZone.below:
        bg = AppColors.infoLight;
        fg = AppColors.cyanInk;
        icon = Icons.arrow_upward_rounded;
        word = 'Бага — хурдаа нэмж болно';
      case null:
        bg = AppColors.surfaceAlt;
        fg = AppColors.inkMuted;
        icon = Icons.favorite_border_rounded;
        word = 'Пульс оруулаагүй';
    }
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: <Widget>[
          Icon(icon, color: fg),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              word,
              style: theme.textTheme.titleSmall
                  ?.copyWith(color: fg, fontWeight: FontWeight.w700),
            ),
          ),
          if (pulse != null)
            Text(
              '$pulse',
              style: theme.textTheme.titleLarge
                  ?.copyWith(color: fg, fontWeight: FontWeight.w700),
            ),
          if (target != null)
            Padding(
              padding: const EdgeInsets.only(left: 6),
              child: Text('/ $target',
                  style: theme.textTheme.bodySmall?.copyWith(color: fg)),
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Пульс оруулах товчлуур, 15 секундийн тоолуур
// ---------------------------------------------------------------------------

/// Том товчтой тоон гар — хуруу чичирхийлсэн ч дарахад амар.
class RehabNumberPad extends StatelessWidget {
  const RehabNumberPad(
      {super.key,
      required this.value,
      required this.onChanged,
      this.maxLength = 3});

  final String value;
  final ValueChanged<String> onChanged;
  final int maxLength;

  @override
  Widget build(BuildContext context) {
    final keys = <String>[
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '⌫',
      '0',
      'C'
    ];
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 2.2,
      children: keys.map((String k) {
        return FilledButton.tonal(
          style: FilledButton.styleFrom(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: Theme.of(context).textTheme.titleLarge,
          ),
          onPressed: () {
            HapticFeedback.selectionClick();
            if (k == '⌫') {
              if (value.isNotEmpty)
                onChanged(value.substring(0, value.length - 1));
            } else if (k == 'C') {
              onChanged('');
            } else if (value.length < maxLength) {
              onChanged(value == '0' ? k : value + k);
            }
          },
          child: Semantics(
            label: k == '⌫'
                ? 'Устгах'
                : k == 'C'
                    ? 'Цэвэрлэх'
                    : k,
            child: Text(k),
          ),
        );
      }).toList(),
    );
  }
}

/// "15 сек тоолох × 4" — бугуйн пульсыг хэмжих туслах.
class RehabPulseCountHelper extends StatefulWidget {
  const RehabPulseCountHelper({super.key, required this.onResult});

  /// Тоолсон тоо × 4.
  final ValueChanged<int> onResult;

  @override
  State<RehabPulseCountHelper> createState() => _RehabPulseCountHelperState();
}

class _RehabPulseCountHelperState extends State<RehabPulseCountHelper> {
  Timer? _timer;
  int _left = 0;
  bool _counting = false;
  bool _askCount = false;
  String _count = '';

  void _start() {
    HapticFeedback.mediumImpact();
    setState(() {
      _counting = true;
      _askCount = false;
      _left = 15;
      _count = '';
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) {
      if (!mounted) return;
      setState(() => _left--);
      if (_left <= 0) {
        t.cancel();
        HapticFeedback.heavyImpact();
        setState(() {
          _counting = false;
          _askCount = true;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (_askCount) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text('15 секундэд хэдэн удаа цохилсон бэ?',
              style: theme.textTheme.titleSmall),
          const SizedBox(height: 6),
          Text(
            _count.isEmpty ? '—' : _count,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineMedium
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          RehabNumberPad(
              value: _count,
              maxLength: 2,
              onChanged: (String v) => setState(() => _count = v)),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: (int.tryParse(_count) ?? 0) > 0
                ? () {
                    widget.onResult(int.parse(_count) * 4);
                    setState(() => _askCount = false);
                  }
                : null,
            child: Text(_count.isEmpty
                ? 'Тоогоо оруулна уу'
                : '${int.parse(_count) * 4} болгож оруулах'),
          ),
        ],
      );
    }
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.infoLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: <Widget>[
          const Icon(Icons.back_hand_outlined, color: AppColors.cyanInk),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _counting
                  ? 'Бугуйн пульсаа тоолж байна… $_left'
                  : 'Эрхий хурууны доод талын бугуйнд 2 хуруугаа тавьж 15 секунд тоолно.',
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: AppColors.cyanInk),
            ),
          ),
          if (!_counting)
            TextButton(onPressed: _start, child: const Text('15 сек тоолох')),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// CR10 сонгогч
// ---------------------------------------------------------------------------

/// Ачааллын мэдрэмж 0–10 (CR10, сонголт §6).
class RehabCr10Picker extends StatelessWidget {
  const RehabCr10Picker(
      {super.key, required this.value, required this.onChanged});

  final int? value;
  final ValueChanged<int> onChanged;

  static Color colorFor(int v) {
    if (v <= 3) return AppColors.success;
    if (v <= 6) return AppColors.warning;
    return AppColors.danger;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: List<Widget>.generate(11, (int i) {
            final selected = value == i;
            final c = colorFor(i);
            return Semantics(
              selected: selected,
              label: '$i, ${cr10Labels[i]}',
              child: InkWell(
                borderRadius: BorderRadius.circular(10),
                onTap: () {
                  HapticFeedback.selectionClick();
                  onChanged(i);
                },
                child: Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected ? c : c.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: c.withValues(alpha: selected ? 1 : 0.35)),
                  ),
                  child: Text(
                    '$i',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: selected ? Colors.white : c,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 6),
        Text(
          value == null
              ? 'Ачаалал хэр санагдаж байна вэ?'
              : '$value — ${cr10Labels[value!]}',
          style: theme.textTheme.bodyMedium,
        ),
      ],
    );
  }
}
