import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/mn_format.dart';
import '../../core/util/paged_controller.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/attachment_view.dart';
import '../../shared/widgets/state_views.dart';
import '../questions/question.dart';
import 'doctor_repository.dart';

/// 2.3 Эмчээс асуух асуулт — **эмчийн тал**.
///
/// Урьд нь эмч зөвхөн вебээс хариулдаг байв. Одоо хяналтдаа авсан
/// үйлчлүүлэгчийнхээ асуултыг апп дээрээ уншиж, зураг, баримт хавсаргаж
/// хариулна (API.md §9.4).
class DoctorQuestionsController extends PagedController<Question> {
  DoctorQuestionsController(this._repo, this.patientId);

  final DoctorRepository _repo;
  final int patientId;

  bool _sending = false;
  bool get sending => _sending;

  @override
  Future<Paged<Question>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPatientQuestions(
      patientId: patientId,
      limit: limit,
      offset: offset,
    );
  }

  Future<ApiException?> answer(
    String comment, {
    List<File> files = const <File>[],
  }) async {
    if (_sending) return null;
    _sending = true;
    notifyListeners();
    try {
      await _repo.answerQuestion(
        patientId: patientId,
        comment: comment,
        files: files,
      );
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }
}

class DoctorQuestionsScreen extends StatefulWidget {
  const DoctorQuestionsScreen({
    super.key,
    required this.patientId,
    this.patientName,
  });

  final int patientId;
  final String? patientName;

  @override
  State<DoctorQuestionsScreen> createState() => _DoctorQuestionsScreenState();
}

class _DoctorQuestionsScreenState extends State<DoctorQuestionsScreen> {
  static const List<String> _allowedExtensions = <String>[
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv',
    'mp3', 'm4a', 'aac', 'ogg', 'wav',
  ];

  late final DoctorQuestionsController _controller;
  final TextEditingController _input = TextEditingController();
  final List<File> _pending = <File>[];

  @override
  void initState() {
    super.initState();
    _controller = DoctorQuestionsController(
      context.read<DoctorRepository>(),
      widget.patientId,
    );
    _controller.load();
  }

  @override
  void dispose() {
    _controller.dispose();
    _input.dispose();
    super.dispose();
  }

  Future<void> _attach() async {
    try {
      final choice = await showModalBottomSheet<String>(
        context: context,
        builder: (BuildContext ctx) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Зургийн сангаас'),
                onTap: () => Navigator.of(ctx).pop('gallery'),
              ),
              ListTile(
                leading: const Icon(Icons.insert_drive_file_outlined),
                title: const Text('Баримт, дуу бичлэг'),
                onTap: () => Navigator.of(ctx).pop('file'),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      );
      if (choice == null || !mounted) return;

      if (choice == 'file') {
        final result = await FilePicker.platform.pickFiles(
          allowMultiple: true,
          type: FileType.custom,
          allowedExtensions: _allowedExtensions,
        );
        for (final f in result?.files ?? const <PlatformFile>[]) {
          final path = f.path;
          if (path != null) _add(File(path));
        }
      } else {
        final picked = await ImagePicker().pickImage(
          source: ImageSource.gallery,
          maxWidth: 2000,
          imageQuality: 85,
        );
        if (picked != null) _add(File(picked.path));
      }
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Файл сонгож чадсангүй.');
    }
  }

  void _add(File file) {
    if (_pending.length >= 5) {
      AppSnack.info(context, 'Нэг хариуд 5 хүртэл файл хавсаргана.');
      return;
    }
    if (file.lengthSync() > 20 * 1024 * 1024) {
      AppSnack.error(context, 'Файлын хэмжээ 20 MB-аас бага байх ёстой.');
      return;
    }
    setState(() => _pending.add(file));
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty && _pending.isEmpty) return;

    final error = await _controller.answer(
      text,
      files: List<File>.from(_pending),
    );
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
      return;
    }
    setState(() => _pending.clear());
    _input.clear();
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Асуулт, хариулт'),
        bottom: widget.patientName == null
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(22),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    widget.patientName!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ),
      ),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (BuildContext context, _) => Column(
          children: <Widget>[
            Expanded(child: _body()),
            _Composer(
              controller: _input,
              sending: _controller.sending,
              pending: _pending,
              onAttach: _attach,
              onRemove: (File file) => setState(() => _pending.remove(file)),
              onSend: _send,
            ),
          ],
        ),
      ),
    );
  }

  Widget _body() {
    final state = _controller.state;
    if (state.isFirstLoad) {
      return const LoadingView(label: 'Асуултууд уншиж байна…');
    }
    if (state.hasError && !state.hasData) {
      return ErrorView(
        error: state.error!,
        onRetry: () => _controller.load(refresh: true),
      );
    }
    final items = _controller.items;
    if (items.isEmpty) {
      return const EmptyView(
        title: 'Асуулт байхгүй байна',
        message: 'Энэ үйлчлүүлэгч одоогоор асуулт илгээгээгүй байна.',
        icon: Icons.forum_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: () => _controller.load(refresh: true),
      child: ListView.builder(
        reverse: true,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        itemCount: items.length,
        itemBuilder: (BuildContext context, int index) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _Bubble(item: items[index]),
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.item});

  final Question item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Эмчийн хариу баруун талд — энэ дэлгэцийг эмч хардаг.
    final mine = item.isDoctor;

    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.82,
        ),
        padding: const EdgeInsets.fromLTRB(14, 10, 14, 8),
        decoration: BoxDecoration(
          color: mine
              ? theme.colorScheme.primary.withValues(alpha: 0.08)
              : theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              mine ? (item.doctorName ?? 'Эмчийн хариу') : 'Үйлчлүүлэгчийн асуулт',
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: mine ? theme.colorScheme.primary : AppColors.cyanInk,
              ),
            ),
            const SizedBox(height: 6),
            if (item.comment.trim().isNotEmpty)
              Text(item.comment, style: theme.textTheme.bodyMedium),
            for (final file in item.files)
              AttachmentChip(
                attachment: file,
                api: context.read<ApiClient>(),
              ),
            const SizedBox(height: 4),
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
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.sending,
    required this.pending,
    required this.onAttach,
    required this.onRemove,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool sending;
  final List<File> pending;
  final VoidCallback onAttach;
  final void Function(File file) onRemove;
  final VoidCallback onSend;

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
                          avatar:
                              const Icon(Icons.attach_file_rounded, size: 16),
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
                      minLines: 1,
                      maxLines: 5,
                      maxLength: 2000,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        hintText: 'Хариултаа бичнэ үү…',
                        counterText: '',
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
