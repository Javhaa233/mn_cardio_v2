import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/state_views.dart';
import '../../core/network/api_client.dart';
import '../../shared/widgets/attachment_view.dart';
import 'question.dart';
import 'questions_controller.dart';
import '../../shared/theme/app_colors.dart';

/// 2.3 Эмчээс асуух асуулт.
///
/// Харилцан яриа хэлбэрээр — асуулт баруун талд, эмчийн хариу зүүн талд.
/// Сервер шинэхнээс нь эрэмбэлж өгдөг тул жагсаалтыг `reverse: true`-ээр
/// буулгаж, хамгийн сүүлийн бичлэг доор харагдана.
class QuestionsScreen extends StatefulWidget {
  const QuestionsScreen({super.key});

  @override
  State<QuestionsScreen> createState() => _QuestionsScreenState();
}

class _QuestionsScreenState extends State<QuestionsScreen> {
  final TextEditingController _input = TextEditingController();
  final ScrollController _scroll = ScrollController();
  final FocusNode _focus = FocusNode();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<QuestionsController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  /// Сервер хүлээн авдаг өргөтгөлүүд (BaseController-ийн allowlist).
  static const List<String> _allowedExtensions = <String>[
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv',
    'mp3', 'm4a', 'aac', 'ogg', 'wav',
  ];

  /// Илгээхээр сонгосон, хараахан явуулаагүй файлууд.
  final List<File> _pending = <File>[];

  @override
  void dispose() {
    _scroll
      ..removeListener(_onScroll)
      ..dispose();
    _input.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scroll.hasClients) return;
    // reverse: true үед дээш гүйлгэх нь maxScrollExtent руу ойртоно —
    // өөрөөр хэлбэл хуучин бичлэгүүд рүү.
    final remaining = _scroll.position.maxScrollExtent - _scroll.position.pixels;
    if (remaining < 400) {
      context.read<QuestionsController>().loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<QuestionsController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Эмчээс асуух асуулт')),
      body: Column(
        children: <Widget>[
          Expanded(child: _buildBody(controller)),
          _Composer(
            controller: _input,
            focusNode: _focus,
            sending: controller.sending,
            onSend: _send,
            pending: _pending,
            onAttach: _attach,
            onRemove: (File file) => setState(() => _pending.remove(file)),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(QuestionsController controller) {
    final state = controller.state;

    if (state.isFirstLoad) {
      return const LoadingView(label: 'Асуултууд уншиж байна…');
    }

    if (state.hasError && !state.hasData) {
      return ErrorView(
        error: state.error!,
        onRetry: () => controller.load(refresh: true),
      );
    }

    final items = controller.items;
    if (items.isEmpty) {
      return const EmptyView(
        title: 'Асуулт байхгүй байна',
        message: 'Эмчээсээ асуумаар зүйлээ доор бичиж илгээнэ үү. '
            'Эмч тань хариулсан үед энд харагдана.',
        icon: Icons.forum_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: () => controller.load(refresh: true),
      child: ListView.builder(
        controller: _scroll,
        reverse: true,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        itemCount: items.length + (controller.loadingMore ? 1 : 0),
        itemBuilder: (BuildContext context, int index) {
          if (index >= items.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 18),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2.2),
                ),
              ),
            );
          }
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _QuestionBubble(item: items[index]),
          );
        },
      ),
    );
  }

  /// Зураг, дуу бичлэг, баримт хавсаргах — Техникийн шаардлага §2.3.
  Future<void> _attach() async {
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
              title: const Text('Баримт, дуу бичлэг'),
              subtitle: const Text('PDF, Word, зураг, аудио'),
              onTap: () => Navigator.of(ctx).pop('file'),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (choice == null || !mounted) return;

    try {
      if (choice == 'file') {
        final result = await FilePicker.platform.pickFiles(
          allowMultiple: true,
          type: FileType.custom,
          allowedExtensions: _allowedExtensions,
        );
        for (final f in result?.files ?? const <PlatformFile>[]) {
          final path = f.path;
          if (path != null) _addFile(File(path));
        }
      } else {
        final picked = await ImagePicker().pickImage(
          source: choice == 'camera' ? ImageSource.camera : ImageSource.gallery,
          maxWidth: 2000,
          imageQuality: 85,
        );
        if (picked != null) _addFile(File(picked.path));
      }
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Файл сонгож чадсангүй.');
    }
  }

  void _addFile(File file) {
    // Сервер 5 файл, тус бүр 20 MB хүртэл авна — илүүг нь эндээс зогсооно.
    if (_pending.length >= 5) {
      AppSnack.info(context, 'Нэг асуултад 5 хүртэл файл хавсаргана.');
      return;
    }
    final bytes = file.lengthSync();
    if (bytes > 20 * 1024 * 1024) {
      AppSnack.error(context, 'Файлын хэмжээ 20 MB-аас бага байх ёстой.');
      return;
    }
    setState(() => _pending.add(file));
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    // Зөвхөн зурагтай асуулт ч бодит асуулт — сервер аль нэгийг нь шаардана.
    if (text.isEmpty && _pending.isEmpty) return;

    final controller = context.read<QuestionsController>();
    final files = List<File>.from(_pending);
    final error = await controller.ask(text, files: files);
    if (!mounted) return;

    if (error == null) setState(() => _pending.clear());
    if (error != null) {
      AppSnack.error(context, error.message);
      return;
    }

    _input.clear();
    _focus.unfocus();
    if (_scroll.hasClients) {
      _scroll.animateTo(
        0,
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOut,
      );
    }
  }
}

class _QuestionBubble extends StatelessWidget {
  const _QuestionBubble({required this.item});

  final Question item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMine = !item.isDoctor;

    // Вебийн "Асуултын түүх" дээр эмчийн хариу нь ЦАГААН карт, дээрээ цэнхэр
    // "Эмч" шошготой. Саарал бөмбөлөг биш.
    final bubbleColor = isMine
        ? theme.colorScheme.primary.withValues(alpha: 0.10)
        : theme.colorScheme.surface;
    final borderColor = isMine
        ? theme.colorScheme.primary.withValues(alpha: 0.22)
        : theme.dividerColor;

    return Row(
      mainAxisAlignment:
          isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: <Widget>[
        Flexible(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.82,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: bubbleColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(14),
                topRight: const Radius.circular(14),
                bottomLeft: Radius.circular(isMine ? 14 : 4),
                bottomRight: Radius.circular(isMine ? 4 : 14),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Icon(
                      isMine
                          ? Icons.person_outline_rounded
                          : Icons.medical_services_outlined,
                      size: 14,
                      color: isMine
                          ? theme.colorScheme.primary
                          : AppColors.cyanInk,
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        item.authorLabel,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isMine
                              ? theme.colorScheme.primary
                              : AppColors.cyanInk,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 7),
                if (item.comment.trim().isNotEmpty)
                  Text(item.comment, style: theme.textTheme.bodyMedium),
                if (item.files.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 4),
                  for (final file in item.files)
                    AttachmentChip(
                      attachment: file,
                      api: context.read<ApiClient>(),
                    ),
                ],
                const SizedBox(height: 6),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    MnFormat.friendlyDateTime(item.dateCreation),
                    style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
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

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.focusNode,
    required this.sending,
    required this.onSend,
    required this.pending,
    required this.onAttach,
    required this.onRemove,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool sending;
  final VoidCallback onSend;
  final List<File> pending;
  final VoidCallback onAttach;
  final void Function(File file) onRemove;

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
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (pending.isNotEmpty)
                Align(
                  alignment: Alignment.centerLeft,
                  child: Wrap(
                    spacing: 8,
                    children: <Widget>[
                      for (final file in pending)
                        InputChip(
                          avatar: const Icon(Icons.attach_file_rounded, size: 16),
                          label: Text(
                            file.path.split(Platform.pathSeparator).last,
                            overflow: TextOverflow.ellipsis,
                          ),
                          onDeleted: () => onRemove(file),
                        ),
                    ],
                  ),
                ),
              Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              IconButton(
                tooltip: 'Хавсралт',
                onPressed: sending ? null : onAttach,
                icon: const Icon(Icons.attach_file_rounded),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  focusNode: focusNode,
                  minLines: 1,
                  maxLines: 5,
                  maxLength: 2000,
                  textCapitalization: TextCapitalization.sentences,
                  textInputAction: TextInputAction.newline,
                  decoration: const InputDecoration(
                    hintText: 'Асуултаа бичнэ үү…',
                    counterText: '',
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 48,
                height: 48,
                child: FilledButton(
                  onPressed: sending ? null : onSend,
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
