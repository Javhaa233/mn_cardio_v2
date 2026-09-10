import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/state_views.dart';
import 'question.dart';
import 'questions_controller.dart';

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

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty) return;

    final controller = context.read<QuestionsController>();
    final error = await controller.ask(text);
    if (!mounted) return;

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

    final bubbleColor = isMine
        ? theme.colorScheme.primary.withValues(alpha: 0.10)
        : theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.6);
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
                          : theme.colorScheme.onSurfaceVariant,
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
                              : theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 7),
                Text(item.comment, style: theme.textTheme.bodyMedium),
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
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool sending;
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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
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
        ),
      ),
    );
  }
}
