import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../shared/theme/app_theme.dart';
import '../../shared/widgets/app_snack.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';
import 'feed_widgets.dart';

/// Нэг асуумж ба түүний бүх хариулт — вебийн `view/AdviceComment.jsx`.
///
/// Урсгалын картаас ирсэн мэдээллээр шууд харагдаж, дараа нь `GetTicket`
/// (илүү том зурагтай) ба `GetComments`-оор бүрэн болно. Нээх бүрт "үзсэн"
/// тоолуур нэмэгдэнэ — вебийнх шиг.
class TicketDetailScreen extends StatefulWidget {
  const TicketDetailScreen({
    super.key,
    required this.ticket,
    this.focusReply = false,
  });

  final FeedTicket ticket;

  /// Картын "Хариулах" товчоор нээгдвэл бичих талбар шууд идэвхжинэ.
  final bool focusReply;

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  late FeedTicket _ticket = widget.ticket;

  List<FeedComment> _comments = const <FeedComment>[];
  bool _loadingComments = true;
  String? _commentsError;

  final TextEditingController _reply = TextEditingController();
  final FocusNode _replyFocus = FocusNode();
  final List<File> _replyFiles = <File>[];
  bool _sending = false;
  bool _closing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _load();
      _markViewed();
      if (widget.focusReply) _replyFocus.requestFocus();
    });
  }

  @override
  void dispose() {
    _reply.dispose();
    _replyFocus.dispose();
    super.dispose();
  }

  DoctorRepository get _repo => context.read<DoctorRepository>();

  Future<void> _load() async {
    await Future.wait<void>(<Future<void>>[_loadTicket(), _loadComments()]);
  }

  Future<void> _loadTicket() async {
    try {
      final fresh = await _repo.fetchTicket(_ticket.id);
      if (fresh != null && mounted) setState(() => _ticket = fresh);
    } catch (_) {
      // Урсгалаас ирсэн хувилбар хангалттай — зөвхөн томруулсан зураг алга.
    }
  }

  Future<void> _loadComments() async {
    setState(() {
      _loadingComments = true;
      _commentsError = null;
    });
    try {
      final comments = await _repo.fetchComments(_ticket.id);
      if (!mounted) return;
      setState(() {
        _comments = comments;
        _loadingComments = false;
      });
    } on ApiException catch (e) {
      _commentsFailed(e.message);
    } catch (_) {
      _commentsFailed('Хариултыг ачаалж чадсангүй.');
    }
  }

  void _commentsFailed(String message) {
    if (!mounted) return;
    setState(() {
      _loadingComments = false;
      _commentsError = message;
    });
  }

  void _markViewed() {
    final me = context.read<DoctorProfileController>().me;
    if (me == null) return;
    unawaited(_repo.markViewed(adviceId: _ticket.id, userId: me.userId));
  }

  bool get _canSend =>
      !_sending && (_reply.text.trim().isNotEmpty || _replyFiles.isNotEmpty);

  Future<void> _pickPhoto() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (BuildContext ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Зураг авах'),
              onTap: () => Navigator.of(ctx).pop(ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Зургийн сангаас'),
              onTap: () => Navigator.of(ctx).pop(ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    try {
      final picked = await ImagePicker().pickImage(
        source: source,
        maxWidth: 2000,
        imageQuality: 85,
      );
      if (picked == null || !mounted) return;
      final file = File(picked.path);
      if (await file.length() > DoctorRepository.maxTicketFileBytes) {
        if (mounted) {
          AppSnack.error(context, 'Файлын хэмжээ 10 МБ-аас хэтэрсэн байна.');
        }
        return;
      }
      if (mounted) setState(() => _replyFiles.add(file));
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Зураг сонгож чадсангүй.');
    }
  }

  Future<void> _send() async {
    if (!_canSend) return;
    setState(() => _sending = true);
    final feed = context.read<DoctorFeedController>();
    try {
      final id = await _repo.postComment(
        adviceId: _ticket.id,
        text: _reply.text,
      );
      if (id == 0) throw ApiException('Хариулт хадгалагдсангүй.');

      String? attachFailure;
      if (_replyFiles.isNotEmpty) {
        try {
          await _repo.uploadCommentFiles(
            commentId: id,
            files: List<File>.of(_replyFiles),
          );
        } on ApiException catch (e) {
          attachFailure = e.message;
        } catch (_) {
          attachFailure = 'зураг илгээж чадсангүй';
        }
      }

      if (!mounted) return;
      _reply.clear();
      setState(() {
        _replyFiles.clear();
        _sending = false;
      });
      FocusScope.of(context).unfocus();
      if (attachFailure != null) {
        AppSnack.error(
          context,
          'Хариулт илгээгдсэн ч зураг очсонгүй: $attachFailure',
        );
      } else {
        AppSnack.success(context, 'Хариулт илгээлээ.');
      }
      unawaited(_loadComments());
      unawaited(_loadTicket());
      unawaited(feed.load(refresh: true));
    } on ApiException catch (e) {
      _sendFailed(e.message);
    } catch (_) {
      _sendFailed('Хариулт илгээж чадсангүй. Дахин оролдоно уу.');
    }
  }

  void _sendFailed(String message) {
    if (!mounted) return;
    setState(() => _sending = false);
    AppSnack.error(context, message);
  }

  Future<void> _close() async {
    final confirmed = await confirmDialog(
      context,
      title: 'Асуумж хаах',
      message: 'Хаасан асуумж урсгалд "Хаагдсан" гэж харагдана.',
      confirmLabel: 'Хаах',
    );
    if (!confirmed || !mounted) return;

    setState(() => _closing = true);
    final feed = context.read<DoctorFeedController>();
    try {
      await _repo.closeTicket(_ticket.id);
      if (!mounted) return;
      AppSnack.success(context, 'Асуумжийг хаалаа.');
      await _loadTicket();
      unawaited(feed.load(refresh: true));
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Хааж чадсангүй.');
    } finally {
      if (mounted) setState(() => _closing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canClose = _ticket.isMine && _ticket.isOpen;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Асуумж'),
        actions: <Widget>[
          if (canClose)
            TextButton(
              onPressed: _closing ? null : _close,
              child: const Text('Хаах'),
            ),
        ],
        bottom: _sending || _closing
            ? const PreferredSize(
                preferredSize: Size.fromHeight(2),
                child: LinearProgressIndicator(minHeight: 2),
              )
            : null,
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                children: <Widget>[
                  FeedTicketCard(ticket: _ticket, full: true),
                  const SizedBox(height: 18),
                  Text(
                    _loadingComments
                        ? 'Хариултууд'
                        : 'Хариултууд (${_comments.length})',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 10),
                  ..._buildThread(theme),
                ],
              ),
            ),
          ),
          _buildReplyBar(theme),
        ],
      ),
    );
  }

  List<Widget> _buildThread(ThemeData theme) {
    if (_loadingComments && _comments.isEmpty) {
      return const <Widget>[
        Padding(
          padding: EdgeInsets.symmetric(vertical: 20),
          child: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
        ),
      ];
    }
    if (_commentsError != null && _comments.isEmpty) {
      return <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: Text(
                _commentsError!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.error,
                ),
              ),
            ),
            TextButton(
              onPressed: _loadComments,
              child: const Text('Дахин оролдох'),
            ),
          ],
        ),
      ];
    }
    if (_comments.isEmpty) {
      return <Widget>[
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(
            'Хариулт алга. Эхний хариултыг та бичээрэй.',
            style: theme.textTheme.bodySmall,
          ),
        ),
      ];
    }
    return <Widget>[
      for (final FeedComment c in _comments)
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: FeedCommentTile(comment: c),
        ),
    ];
  }

  Widget _buildReplyBar(ThemeData theme) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(top: BorderSide(color: theme.dividerColor)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (_replyFiles.isNotEmpty)
                SizedBox(
                  height: 64,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
                    itemCount: _replyFiles.length,
                    separatorBuilder: (BuildContext context, int index) =>
                        const SizedBox(width: 8),
                    itemBuilder: (BuildContext context, int index) => Stack(
                      children: <Widget>[
                        ClipRRect(
                          borderRadius:
                              BorderRadius.circular(AppTheme.cardRadius),
                          child: Image.file(
                            _replyFiles[index],
                            width: 56,
                            height: 56,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: _sending
                                ? null
                                : () => setState(
                                      () => _replyFiles.removeAt(index),
                                    ),
                            child: const CircleAvatar(
                              radius: 10,
                              backgroundColor: Colors.black54,
                              child: Icon(
                                Icons.close_rounded,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  IconButton(
                    tooltip: 'Зураг хавсаргах',
                    onPressed: _sending ? null : _pickPhoto,
                    icon: const Icon(Icons.add_photo_alternate_outlined),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _reply,
                      focusNode: _replyFocus,
                      enabled: !_sending,
                      minLines: 1,
                      maxLines: 5,
                      textCapitalization: TextCapitalization.sentences,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        hintText: 'Хариулт бичих…',
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton.filled(
                    tooltip: 'Илгээх',
                    onPressed: _canSend ? _send : null,
                    icon: _sending
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
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
