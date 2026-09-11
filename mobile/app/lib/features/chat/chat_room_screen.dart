import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../core/util/mn_format.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/state_views.dart';
import 'chat_composer.dart';
import 'chat_controller.dart';
import 'chat_members_screen.dart';
import 'chat_models.dart';
import 'chat_repository.dart';
import 'chat_socket.dart';

/// Нэг өрөөний яриа.
class ChatRoomScreen extends StatefulWidget {
  const ChatRoomScreen({super.key, required this.room, this.me});

  final ChatRoom room;
  final ChatMe? me;

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen>
    with WidgetsBindingObserver {
  late final ChatConversationController _controller;
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = ChatConversationController(
      repo: context.read<ChatRepository>(),
      socket: context.read<ChatSocket>(),
      chatRoomId: widget.room.chatRoomId,
      me: widget.me,
    );
    _scroll.addListener(_onScroll);
    _controller.load();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scroll
      ..removeListener(_onScroll)
      ..dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Ард ажиллаж буй апп socket-оор юу ч хүлээж авахгүй (push мэдэгдэл
    // backend-д байхгүй) тул эргэж нээгдэх бүрд түүхийг дахин татна.
    if (state == AppLifecycleState.resumed) {
      _controller.refreshAfterResume();
    }
  }

  void _onScroll() {
    if (!_scroll.hasClients) return;
    final remaining = _scroll.position.maxScrollExtent - _scroll.position.pixels;
    if (remaining < 400) _controller.loadOlder();
  }

  void _openMembers(ChatRoom room) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => ChatMembersScreen(room: room)),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Жагсаалтаас хамгийн сүүлийн төлөв — гишүүн нэмэгдэж, хасагдахад
    // толгой дахь тоо шинэчлэгдэнэ. `select` тул зөвхөн энэ өрөө өөрчлөгдөхөд
    // л дахин зурна.
    final room = context.select<ChatRoomsController, ChatRoom>(
      (ChatRoomsController c) {
        for (final ChatRoom r in c.rooms) {
          if (r.chatRoomId == widget.room.chatRoomId) return r;
        }
        return widget.room;
      },
    );

    return ChangeNotifierProvider<ChatConversationController>.value(
      value: _controller,
      child: Scaffold(
        appBar: AppBar(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(room.displayName),
              // Вебийнх шиг: бүлгийн нэрний доор гишүүдийн тоо.
              if (room.isGroup)
                Text(
                  '${room.members.length} гишүүн',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              const _ConnectionSubtitle(),
            ],
          ),
          actions: <Widget>[
            IconButton(
              tooltip: 'Гишүүд',
              icon: const Icon(Icons.group_outlined),
              onPressed: () => _openMembers(room),
            ),
          ],
        ),
        body: Column(
          children: <Widget>[
            Expanded(
              child: Consumer<ChatConversationController>(
                builder: (
                  BuildContext context,
                  ChatConversationController controller,
                  _,
                ) {
                  final state = controller.state;

                  if (state.isFirstLoad) {
                    return const LoadingView(label: 'Мессежүүд уншиж байна…');
                  }
                  if (state.hasError && !state.hasData) {
                    return ErrorView(
                      error: state.error!,
                      onRetry: controller.load,
                    );
                  }

                  final messages = controller.messages;
                  if (messages.isEmpty) {
                    return const EmptyView(
                      title: 'Яриа эхлээгүй байна',
                      message: 'Доор мессежээ бичиж эхлүүлнэ үү.',
                      icon: Icons.chat_bubble_outline_rounded,
                    );
                  }

                  return ListView.builder(
                    controller: _scroll,
                    reverse: true,
                    padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
                    itemCount:
                        messages.length + (controller.loadingOlder ? 1 : 0),
                    itemBuilder: (BuildContext context, int index) {
                      if (index >= messages.length) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2.2),
                            ),
                          ),
                        );
                      }
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _MessageBubble(
                          message: messages[index],
                          onRetry: _resend,
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            Consumer<ChatConversationController>(
              builder: (
                BuildContext context,
                ChatConversationController controller,
                _,
              ) {
                return ChatComposer(
                  sending: controller.sending,
                  onTyping: controller.typing,
                  onSendText: (String text) async {
                    final error = await controller.sendText(text);
                    _afterSend(error);
                  },
                  onSendFiles: (List<File> files, String caption) async {
                    final error = await controller.sendAttachments(
                      files: files,
                      text: caption,
                    );
                    _afterSend(error);
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _afterSend(ApiException? error) {
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
      return;
    }
    if (_scroll.hasClients) {
      _scroll.animateTo(
        0,
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _resend(ChatMessage message) async {
    final clientMsgId = message.clientMsgId;
    if (clientMsgId == null) return;
    _controller.discardFailed(clientMsgId);
    if (message.text.trim().isNotEmpty) {
      final error = await _controller.sendText(message.text);
      _afterSend(error);
    }
  }
}

class _ConnectionSubtitle extends StatelessWidget {
  const _ConnectionSubtitle();

  @override
  Widget build(BuildContext context) {
    final socket = context.read<ChatSocket>();
    return ValueListenableBuilder<bool>(
      valueListenable: socket.connected,
      builder: (BuildContext context, bool connected, _) {
        if (connected) return const SizedBox.shrink();
        return Text(
          'Шууд холболт байхгүй',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 11.5),
        );
      },
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message, required this.onRetry});

  final ChatMessage message;
  final Future<void> Function(ChatMessage message) onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMine = message.isMine;
    final failed = message.sendState == ChatSendState.failed;
    final sending = message.sendState == ChatSendState.sending;

    return Row(
      mainAxisAlignment:
          isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: <Widget>[
        Flexible(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.80,
            ),
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
            decoration: BoxDecoration(
              color: failed
                  ? theme.colorScheme.errorContainer.withValues(alpha: 0.5)
                  : isMine
                      ? theme.colorScheme.primary.withValues(alpha: 0.10)
                      : theme.colorScheme.surfaceContainerHighest
                          .withValues(alpha: 0.6),
              border: Border.all(
                color: isMine
                    ? theme.colorScheme.primary.withValues(alpha: 0.20)
                    : theme.dividerColor,
              ),
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
                if (!isMine && message.senderName.trim().isNotEmpty) ...<Widget>[
                  Text(
                    message.senderName.trim(),
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 5),
                ],
                if (message.attachments.isNotEmpty) ...<Widget>[
                  for (final attachment in message.attachments)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: _AttachmentView(attachment: attachment),
                    ),
                ] else if (message.hasAttachments && sending) ...<Widget>[
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${message.attachmentCount} файл илгээж байна…',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                ],
                if (message.text.trim().isNotEmpty)
                  Text(message.text.trim(), style: theme.textTheme.bodyMedium),
                const SizedBox(height: 5),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: <Widget>[
                    if (failed) ...<Widget>[
                      InkWell(
                        onTap: () => onRetry(message),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            Icon(
                              Icons.refresh_rounded,
                              size: 14,
                              color: theme.colorScheme.error,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Илгээгдсэнгүй · дахин оролдох',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontSize: 11.5,
                                color: theme.colorScheme.error,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else ...<Widget>[
                      Text(
                        MnFormat.time(message.createDate),
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontSize: 11,
                        ),
                      ),
                      if (isMine) ...<Widget>[
                        const SizedBox(width: 4),
                        Icon(
                          sending
                              ? Icons.schedule_rounded
                              : Icons.done_rounded,
                          size: 13,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ],
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Хавсралт — зураг бол урьдчилан харагдац, бусад нь татаж нээх мөр.
class _AttachmentView extends StatefulWidget {
  const _AttachmentView({required this.attachment});

  final ChatAttachment attachment;

  @override
  State<_AttachmentView> createState() => _AttachmentViewState();
}

class _AttachmentViewState extends State<_AttachmentView> {
  bool _busy = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final attachment = widget.attachment;
    final thumbnail = _decodeThumbnail(attachment.thumbnailSrc);

    return InkWell(
      onTap: _busy ? null : _openAttachment,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: theme.dividerColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (thumbnail != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(7),
                child: Image.memory(
                  thumbnail,
                  width: 42,
                  height: 42,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) =>
                      const Icon(Icons.image_outlined, size: 24),
                ),
              )
            else
              Icon(
                attachment.isAudio
                    ? Icons.play_circle_outline_rounded
                    : attachment.isImage
                        ? Icons.image_outlined
                        : Icons.insert_drive_file_outlined,
                size: 26,
                color: theme.colorScheme.primary,
              ),
            const SizedBox(width: 10),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    attachment.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _busy ? 'Татаж байна…' : 'Нээхийн тулд дарна уу',
                    style: theme.textTheme.bodySmall?.copyWith(fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Сервер зурган хавсралтын жижиг хувилбарыг data URI хэлбэрээр өгдөг.
  Uint8List? _decodeThumbnail(String? src) {
    if (src == null || src.trim().isEmpty) return null;
    try {
      final value = src.contains(',') ? src.split(',').last : src;
      return base64Decode(value);
    } catch (_) {
      return null;
    }
  }

  Future<void> _openAttachment() async {
    setState(() => _busy = true);
    try {
      final file = await context.read<ChatRepository>().downloadAttachment(
            fileId: widget.attachment.fileId,
            fileName: widget.attachment.name,
          );
      if (!mounted) return;
      final result = await OpenFilex.open(file.path);
      if (!mounted) return;
      if (result.type != ResultType.done) {
        AppSnack.info(
          context,
          'Энэ файлыг нээх програм төхөөрөмж дээр олдсонгүй.',
        );
      }
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }
}
