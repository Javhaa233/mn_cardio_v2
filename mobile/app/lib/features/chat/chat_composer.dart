import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;

import '../../shared/widgets/app_snack.dart';
import 'chat_repository.dart';

/// Мессеж бичих, хавсралт хийх мөр.
///
/// Текстээс гадна зураг, баримт бичиг, аудио файл хавсаргахыг дэмжинэ —
/// Техникийн шаардлагын "текстээс гадна зураг, дуу бичлэг, баримт бичиг
/// хавсаргах" шаардлага.
///
/// Микрофоноор шууд дуу бичих боломжийг 2026-09-11-нд хассан. Аудио файл
/// "Баримт бичиг" цэсээр хавсаргагдсан хэвээр — шаардлагын "дуу бичлэг" хэсэг
/// тэгж хангагдана.
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

  final List<File> _pending = <File>[];

  /// Текст бичигдсэн эсэх — товч микрофон уу, "илгээх" үү гэдгийг шийднэ.
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    // Бичих үед товч микрофоноос "илгээх" рүү шилжих ёстой. Өмнө нь
    // `onChanged` зөвхөн "бичиж байна" дохиог socket руу илгээдэг байсан тул
    // товч дахин зурагдалгүй микрофон хэвээр үлддэг байв. Listener нь
    // илгээсний дараах `clear()`-ийг ч барьдаг — `onChanged` тэгдэггүй.
    _input.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    final hasText = _input.text.trim().isNotEmpty;
    if (hasText != _hasText) setState(() => _hasText = hasText);
  }

  @override
  void dispose() {
    _input
      ..removeListener(_onTextChanged)
      ..dispose();
    _focus.dispose();
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
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  IconButton(
                    onPressed: widget.sending ? null : _openAttachSheet,
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
                  _SendButton(
                    sending: widget.sending,
                    canSend: _hasText || _pending.isNotEmpty,
                    onSend: _send,
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
              subtitle: const Text('PDF, Word, Excel, текст, аудио'),
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

/// Илгээх товч. Текст ч, хавсралт ч байхгүй үед идэвхгүй.
class _SendButton extends StatelessWidget {
  const _SendButton({
    required this.sending,
    required this.canSend,
    required this.onSend,
  });

  final bool sending;
  final bool canSend;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 48,
      child: FilledButton(
        onPressed: sending || !canSend ? null : onSend,
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
            : const Icon(Icons.send_rounded, size: 20),
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
