import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';

import '../../shared/widgets/app_snack.dart';
import 'chat_repository.dart';

/// Мессеж бичих, хавсралт хийх мөр.
///
/// Текстээс гадна зураг, дуу бичлэг, баримт бичиг хавсаргахыг дэмжинэ —
/// Техникийн шаардлагын "Эмчээс асуух асуулт / Зөвлөгөөний хэсэг нь текстээс
/// гадна зураг, дуу бичлэг, баримт бичиг хавсаргах" шаардлага.
class ChatComposer extends StatefulWidget {
  const ChatComposer({
    super.key,
    required this.onSendText,
    required this.onSendFiles,
    required this.onTyping,
    this.sending = false,
  });

  final Future<void> Function(String text) onSendText;
  final Future<void> Function(List<File> files, String caption) onSendFiles;
  final VoidCallback onTyping;
  final bool sending;

  @override
  State<ChatComposer> createState() => _ChatComposerState();
}

class _ChatComposerState extends State<ChatComposer> {
  final TextEditingController _input = TextEditingController();
  final FocusNode _focus = FocusNode();
  final AudioRecorder _recorder = AudioRecorder();

  final List<File> _pending = <File>[];
  bool _recording = false;
  Duration _recordedFor = Duration.zero;
  String? _recordPath;

  @override
  void dispose() {
    _input.dispose();
    _focus.dispose();
    _recorder.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(top: BorderSide(color: theme.dividerColor)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (_pending.isNotEmpty) _PendingStrip(
              files: _pending,
              onRemove: (File f) => setState(() => _pending.remove(f)),
            ),
            if (_recording) _RecordingBar(elapsed: _recordedFor),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  IconButton(
                    onPressed: widget.sending || _recording ? null : _openAttachSheet,
                    tooltip: 'Хавсралт нэмэх',
                    icon: const Icon(Icons.add_circle_outline_rounded),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _input,
                      focusNode: _focus,
                      minLines: 1,
                      maxLines: 5,
                      maxLength: 2000,
                      enabled: !_recording,
                      textCapitalization: TextCapitalization.sentences,
                      onChanged: (_) => widget.onTyping(),
                      decoration: const InputDecoration(
                        hintText: 'Мессеж бичих…',
                        counterText: '',
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  _ActionButton(
                    sending: widget.sending,
                    recording: _recording,
                    canSend: _input.text.trim().isNotEmpty || _pending.isNotEmpty,
                    onSend: _send,
                    onStartRecord: _startRecording,
                    onStopRecord: _stopRecording,
                    onCancelRecord: _cancelRecording,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------------
  // Хавсралт
  // -------------------------------------------------------------------

  Future<void> _openAttachSheet() async {
    final choice = await showModalBottomSheet<String>(
      context: context,
      builder: (BuildContext ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Зураг авах'),
              onTap: () => Navigator.of(ctx).pop('camera'),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Зургийн сангаас'),
              onTap: () => Navigator.of(ctx).pop('gallery'),
            ),
            ListTile(
              leading: const Icon(Icons.insert_drive_file_outlined),
              title: const Text('Баримт бичиг'),
              subtitle: const Text('PDF, Word, Excel, текст'),
              onTap: () => Navigator.of(ctx).pop('file'),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );

    switch (choice) {
      case 'camera':
        await _pickImage(ImageSource.camera);
      case 'gallery':
        await _pickImage(ImageSource.gallery);
      case 'file':
        await _pickFile();
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: source,
        // Эмнэлгийн сүлжээ удаан байж болзошгүй тул зургийг боломжийн хэмжээнд
        // оруулна. Эмнэлзүйн нарийвчлал шаардсан зураг биш, харилцааны зураг.
        maxWidth: 2000,
        imageQuality: 85,
      );
      if (picked == null) return;
      _addFile(File(picked.path));
    } catch (_) {
      if (mounted) {
        AppSnack.error(context, 'Зураг сонгож чадсангүй.');
      }
    }
  }

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ChatRepository.allowedExtensions.toList(),
      );
      if (result == null) return;
      for (final f in result.files) {
        final path = f.path;
        if (path != null) _addFile(File(path));
      }
    } catch (_) {
      if (mounted) {
        AppSnack.error(context, 'Файл сонгож чадсангүй.');
      }
    }
  }

  /// Сервер зөвшөөрөөгүй өргөтгөлийг шууд татгалздаг бөгөөд алдаа нь HTTP 200
  /// -оор ирдэг тул илгээхээс өмнө энд шүүнэ.
  void _addFile(File file) {
    if (!ChatRepository.isAllowedFile(file.path)) {
      AppSnack.error(
        context,
        'Энэ төрлийн файлыг хавсаргах боломжгүй: '
        '${p.extension(file.path).replaceAll('.', '')}',
      );
      return;
    }
    setState(() => _pending.add(file));
  }

  // -------------------------------------------------------------------
  // Дуу бичлэг
  // -------------------------------------------------------------------

  Future<void> _startRecording() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      if (mounted) {
        AppSnack.error(
          context,
          'Дуу бичихийн тулд микрофон ашиглах зөвшөөрөл өгнө үү.',
        );
      }
      return;
    }

    try {
      final dir = await getTemporaryDirectory();
      final path = p.join(
        dir.path,
        'mncardio_${DateTime.now().millisecondsSinceEpoch}.m4a',
      );
      // m4a (AAC) — серверийн зөвшөөрөгдсөн өргөтгөлийн жагсаалтад байгаа.
      await _recorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc),
        path: path,
      );
      if (!mounted) return;
      setState(() {
        _recording = true;
        _recordPath = path;
        _recordedFor = Duration.zero;
      });
      _tick();
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Дуу бичиж эхэлж чадсангүй.');
    }
  }

  Future<void> _tick() async {
    while (mounted && _recording) {
      await Future<void>.delayed(const Duration(seconds: 1));
      if (!mounted || !_recording) return;
      setState(() => _recordedFor += const Duration(seconds: 1));
    }
  }

  Future<void> _stopRecording() async {
    if (!_recording) return;
    final path = await _recorder.stop();
    if (!mounted) return;
    setState(() => _recording = false);
    final saved = path ?? _recordPath;
    if (saved == null) return;
    final file = File(saved);
    if (await file.exists() && await file.length() > 0) {
      _addFile(file);
    }
  }

  Future<void> _cancelRecording() async {
    if (!_recording) return;
    final path = await _recorder.stop();
    if (!mounted) return;
    setState(() => _recording = false);
    final saved = path ?? _recordPath;
    if (saved != null) {
      final file = File(saved);
      if (await file.exists()) await file.delete();
    }
  }

  // -------------------------------------------------------------------

  Future<void> _send() async {
    final text = _input.text.trim();
    final files = List<File>.from(_pending);

    if (files.isEmpty && text.isEmpty) return;

    _input.clear();
    setState(() => _pending.clear());

    if (files.isEmpty) {
      await widget.onSendText(text);
    } else {
      await widget.onSendFiles(files, text);
    }
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.sending,
    required this.recording,
    required this.canSend,
    required this.onSend,
    required this.onStartRecord,
    required this.onStopRecord,
    required this.onCancelRecord,
  });

  final bool sending;
  final bool recording;
  final bool canSend;
  final VoidCallback onSend;
  final VoidCallback onStartRecord;
  final VoidCallback onStopRecord;
  final VoidCallback onCancelRecord;

  @override
  Widget build(BuildContext context) {
    if (recording) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          IconButton(
            onPressed: onCancelRecord,
            tooltip: 'Болих',
            icon: const Icon(Icons.delete_outline_rounded),
          ),
          SizedBox(
            width: 48,
            height: 48,
            child: FilledButton(
              onPressed: onStopRecord,
              style: FilledButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: const Size(48, 48),
                shape: const CircleBorder(),
              ),
              child: const Icon(Icons.stop_rounded, size: 22),
            ),
          ),
        ],
      );
    }

    return SizedBox(
      width: 48,
      height: 48,
      child: FilledButton(
        onPressed: sending ? null : (canSend ? onSend : onStartRecord),
        style: FilledButton.styleFrom(
          padding: EdgeInsets.zero,
          minimumSize: const Size(48, 48),
          shape: const CircleBorder(),
        ),
        child: sending
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  color: Colors.white,
                ),
              )
            : Icon(
                canSend ? Icons.send_rounded : Icons.mic_rounded,
                size: 20,
              ),
      ),
    );
  }
}

class _PendingStrip extends StatelessWidget {
  const _PendingStrip({required this.files, required this.onRemove});

  final List<File> files;
  final void Function(File file) onRemove;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: theme.dividerColor)),
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: files.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (BuildContext context, int index) {
          final file = files[index];
          final name = p.basename(file.path);
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest
                  .withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: theme.dividerColor),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(
                  _iconFor(name),
                  size: 18,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 8),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 130),
                  child: Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                ),
                const SizedBox(width: 4),
                InkWell(
                  onTap: () => onRemove(file),
                  borderRadius: BorderRadius.circular(999),
                  child: const Padding(
                    padding: EdgeInsets.all(3),
                    child: Icon(Icons.close_rounded, size: 15),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  IconData _iconFor(String name) {
    final ext = p.extension(name).replaceAll('.', '').toLowerCase();
    if (const <String>['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic']
        .contains(ext)) {
      return Icons.image_outlined;
    }
    if (const <String>['mp3', 'm4a', 'aac', 'ogg', 'wav', 'webm']
        .contains(ext)) {
      return Icons.mic_rounded;
    }
    return Icons.insert_drive_file_outlined;
  }
}

class _RecordingBar extends StatelessWidget {
  const _RecordingBar({required this.elapsed});

  final Duration elapsed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final minutes = elapsed.inMinutes.toString().padLeft(2, '0');
    final seconds = (elapsed.inSeconds % 60).toString().padLeft(2, '0');

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: theme.dividerColor)),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 9,
            height: 9,
            decoration: const BoxDecoration(
              color: Color(0xFFD64550),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          Text('Дуу бичиж байна…', style: theme.textTheme.bodyMedium),
          const Spacer(),
          Text('$minutes:$seconds', style: theme.textTheme.titleSmall),
        ],
      ),
    );
  }
}
