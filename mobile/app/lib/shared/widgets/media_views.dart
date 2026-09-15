import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:video_player/video_player.dart';

import '../../core/media/media_cache.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../theme/app_colors.dart';

/// Эрхийн шалгалттай зургийг **шууд** харуулна.
///
/// `Image.network` ажиллахгүй: `/api/Media/stream/*` токеныг толгойгоор
/// шаарддаг. Байтыг нь татаад кэшлэнэ — дахин харахад шууд гарна.
class AuthedImage extends StatefulWidget {
  const AuthedImage({
    super.key,
    required this.api,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
  });

  final ApiClient api;
  final String url;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  @override
  State<AuthedImage> createState() => _AuthedImageState();
}

class _AuthedImageState extends State<AuthedImage> {
  Uint8List? _bytes;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _bytes = MediaCache.instance.peek(widget.url);
    if (_bytes == null) _load();
  }

  @override
  void didUpdateWidget(covariant AuthedImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _bytes = MediaCache.instance.peek(widget.url);
      _failed = false;
      if (_bytes == null) _load();
    }
  }

  Future<void> _load() async {
    try {
      final data = await MediaCache.instance.bytes(widget.api, widget.url);
      if (!mounted) return;
      setState(() => _bytes = data);
    } on ApiException {
      if (mounted) setState(() => _failed = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final radius = widget.borderRadius ?? BorderRadius.circular(12);
    final bytes = _bytes;

    Widget child;
    if (bytes != null) {
      child = Image.memory(
        bytes,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        errorBuilder: (_, __, ___) => _placeholder(broken: true),
      );
    } else {
      child = _placeholder(broken: _failed);
    }

    return ClipRRect(borderRadius: radius, child: child);
  }

  Widget _placeholder({bool broken = false}) {
    return Container(
      width: widget.width,
      height: widget.height ?? 160,
      color: AppColors.primaryLight,
      alignment: Alignment.center,
      child: broken
          ? const Icon(Icons.broken_image_outlined,
              color: AppColors.inkDim, size: 26)
          : const SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2.2),
            ),
    );
  }
}

/// Зургийг бүтэн дэлгэцээр харах.
class FullScreenImage extends StatelessWidget {
  const FullScreenImage({
    super.key,
    required this.api,
    required this.url,
    this.title,
  });

  final ApiClient api;
  final String url;
  final String? title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(title ?? 'Зураг'),
      ),
      body: Center(
        child: InteractiveViewer(
          maxScale: 5,
          child: AuthedImage(
            api: api,
            url: url,
            fit: BoxFit.contain,
            borderRadius: BorderRadius.zero,
          ),
        ),
      ),
    );
  }
}

/// Нэг зэрэг нэг л бичлэг тоглоно.
///
/// Чатад олон дуут мессеж байхад хоёр нь зэрэг тоглох нь хэрэглэгчийн алдаа
/// биш, аппын алдаа. Тиймээс тоглуулагч нэг л ширхэг.
class _AudioBus {
  _AudioBus._();

  static final _AudioBus instance = _AudioBus._();

  final AudioPlayer player = AudioPlayer();
  String? currentUrl;

  Future<void> stopOthers(String url) async {
    if (currentUrl != null && currentUrl != url) {
      await player.stop();
    }
    currentUrl = url;
  }
}

/// Дуут мессежийг **бөмбөлөг дотроос шууд** тоглуулна.
class AudioMessagePlayer extends StatefulWidget {
  const AudioMessagePlayer({
    super.key,
    required this.api,
    required this.url,
    required this.fileName,
    this.durationMs,
    this.tint,
  });

  final ApiClient api;
  final String url;
  final String fileName;
  final int? durationMs;
  final Color? tint;

  @override
  State<AudioMessagePlayer> createState() => _AudioMessagePlayerState();
}

class _AudioMessagePlayerState extends State<AudioMessagePlayer> {
  AudioPlayer get _player => _AudioBus.instance.player;

  bool _loading = false;
  bool _mine = false;
  Duration _position = Duration.zero;
  Duration? _total;

  @override
  void initState() {
    super.initState();
    if (widget.durationMs != null) {
      _total = Duration(milliseconds: widget.durationMs!);
    }
    _player.positionStream.listen((Duration value) {
      if (!mounted || !_mine) return;
      setState(() => _position = value);
    });
    _player.playerStateStream.listen((PlayerState state) {
      if (!mounted || !_mine) return;
      if (state.processingState == ProcessingState.completed) {
        setState(() => _position = Duration.zero);
      } else {
        setState(() {});
      }
    });
  }

  Future<void> _toggle() async {
    if (_mine && _player.playing) {
      await _player.pause();
      if (mounted) setState(() {});
      return;
    }

    setState(() => _loading = true);
    try {
      if (!_mine) {
        await _AudioBus.instance.stopOthers(widget.url);
        // Токен толгойгоор явдаг тул урсгалыг шууд өгөх боломжгүй: файлыг
        // татаад тоглуулна. Дуут мессеж богино тул хүлээлт мэдэгдэхгүй.
        final file = await MediaCache.instance.file(
          widget.api,
          widget.url,
          name: widget.fileName,
        );
        final total = await _player.setFilePath(file.path);
        if (!mounted) return;
        _mine = true;
        if (total != null) _total = total;
      }
      await _player.play();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } catch (e) {
      // Шалтгааныг богиноор нь харуулна — "болохгүй байна" гэдэг мэдээлэл
      // тестийн явцад хэрэггүй.
      final reason = e.toString().replaceAll('\n', ' ');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Бичлэгийг тоглуулж чадсангүй: '
              '${reason.length > 80 ? '${reason.substring(0, 80)}…' : reason}',
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _clock(Duration d) {
    final minutes = d.inMinutes;
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tint = widget.tint ?? theme.colorScheme.primary;
    final playing = _mine && _player.playing;
    final total = _total;
    final progress = (total == null || total.inMilliseconds == 0)
        ? 0.0
        : (_position.inMilliseconds / total.inMilliseconds).clamp(0.0, 1.0);

    return SizedBox(
      width: 210,
      child: Row(
        children: <Widget>[
          SizedBox(
            width: 36,
            height: 36,
            child: IconButton(
              padding: EdgeInsets.zero,
              onPressed: _loading ? null : _toggle,
              icon: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2.2),
                    )
                  : Icon(
                      playing
                          ? Icons.pause_circle_filled_rounded
                          : Icons.play_circle_fill_rounded,
                      size: 32,
                      color: tint,
                    ),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 4,
                    backgroundColor: tint.withValues(alpha: 0.18),
                    valueColor: AlwaysStoppedAnimation<Color>(tint),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  total == null
                      ? '–:--'
                      : '${_clock(_mine ? _position : Duration.zero)}'
                          ' / ${_clock(total)}',
                  style: theme.textTheme.bodySmall?.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Видео мессежийг бүтэн дэлгэцээр тоглуулна.
///
/// Урсгалаар тоглуулна (`Range` дэмжигддэг) тул бүтнээр нь татахгүй — 50 МБ
/// хүртэл бичлэгийг хүлээлгүй үзэж эхэлнэ.
class VideoMessageScreen extends StatefulWidget {
  const VideoMessageScreen({
    super.key,
    required this.api,
    required this.url,
    required this.token,
    this.title,
  });

  final ApiClient api;
  final String url;
  final String? token;
  final String? title;

  @override
  State<VideoMessageScreen> createState() => _VideoMessageScreenState();
}

class _VideoMessageScreenState extends State<VideoMessageScreen> {
  VideoPlayerController? _controller;
  String? _error;

  @override
  void initState() {
    super.initState();
    _open();
  }

  Future<void> _open() async {
    try {
      final controller = VideoPlayerController.networkUrl(
        Uri.parse('${widget.api.baseUrl}${widget.url}'),
        httpHeaders: <String, String>{
          if (widget.token != null) 'Authorization': 'Bearer ${widget.token}',
        },
      );
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() => _controller = controller);
      await controller.play();
    } catch (_) {
      if (mounted) {
        setState(() => _error = 'Бичлэгийг тоглуулж чадсангүй.');
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(widget.title ?? 'Видео'),
      ),
      body: Center(
        child: _error != null
            ? Text(_error!, style: const TextStyle(color: Colors.white))
            : controller == null
                ? const CircularProgressIndicator()
                : AspectRatio(
                    aspectRatio: controller.value.aspectRatio == 0
                        ? 16 / 9
                        : controller.value.aspectRatio,
                    child: Stack(
                      alignment: Alignment.bottomCenter,
                      children: <Widget>[
                        VideoPlayer(controller),
                        VideoProgressIndicator(controller, allowScrubbing: true),
                        GestureDetector(
                          onTap: () async {
                            controller.value.isPlaying
                                ? await controller.pause()
                                : await controller.play();
                            if (mounted) setState(() {});
                          },
                          child: Container(
                            color: Colors.transparent,
                            alignment: Alignment.center,
                            child: controller.value.isPlaying
                                ? const SizedBox.shrink()
                                : const Icon(
                                    Icons.play_circle_fill_rounded,
                                    size: 64,
                                    color: Colors.white70,
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
