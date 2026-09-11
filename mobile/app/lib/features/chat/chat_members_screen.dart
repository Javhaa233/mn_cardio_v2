import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'chat_controller.dart';
import 'chat_models.dart';
import 'chat_repository.dart';
import 'doctor_picker.dart';

/// Өрөөний гишүүд — вебийн `customComponents/Chat/MembersPanel.jsx`.
///
/// Нэмэх, хасахыг зөвхөн **бүлэгт** санал болгоно. Одоо байгаа 1:1 өрөөнд
/// хүн нэмбэл тэр бүх өмнөх түүхийг авна — эмч, өвчтөний өрөөнд энэ нь
/// эмнэлзүйн ярианы задруулга — тиймээс сервер татгалзаж, дэлгэц ч дүр
/// эсгэхгүй.
///
/// Бусдыг хасах эрх зөвхөн бүлэг үүсгэгчид байдаг ба үүнийг сервер шалгана.
/// Вебийнх шиг товч бүх гишүүн дээр гарна; эрхгүй бол серверийн мессеж
/// харагдана.
class ChatMembersScreen extends StatefulWidget {
  const ChatMembersScreen({super.key, required this.room});

  final ChatRoom room;

  @override
  State<ChatMembersScreen> createState() => _ChatMembersScreenState();
}

class _ChatMembersScreenState extends State<ChatMembersScreen> {
  List<ChatMember> _members = const <ChatMember>[];
  bool _loading = true;
  ApiException? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _load();
    });
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final members = await context
          .read<ChatRepository>()
          .roomMembers(widget.room.chatRoomId);
      if (!mounted) return;
      setState(() {
        _members = members;
        _loading = false;
      });
    } on ApiException catch (e) {
      _loadFailed(e);
    } catch (_) {
      _loadFailed(ApiException('Алдаа гарлаа. Дахин оролдоно уу.'));
    }
  }

  void _loadFailed(ApiException error) {
    if (!mounted) return;
    setState(() {
      _error = error;
      _loading = false;
    });
  }

  Future<void> _add() async {
    final person = await Navigator.of(context).push<DirectoryPerson>(
      MaterialPageRoute<DirectoryPerson>(
        builder: (BuildContext pickerContext) => Scaffold(
          appBar: AppBar(title: const Text('Гишүүн нэмэх')),
          body: DoctorPicker(
            onPick: (DirectoryPerson p) => Navigator.of(pickerContext).pop(p),
          ),
        ),
      ),
    );
    if (person == null || !mounted) return;

    await _change(
      () => context.read<ChatRepository>().addMember(
            chatRoomId: widget.room.chatRoomId,
            person: person,
          ),
    );
  }

  Future<void> _remove(ChatMember member) async {
    final confirmed = await confirmDialog(
      context,
      title: 'Гишүүн хасах',
      message: 'Энэ хэрэглэгчийг хасах уу?',
      confirmLabel: 'Хасах',
      destructive: true,
    );
    if (!confirmed || !mounted) return;

    await _change(
      () => context.read<ChatRepository>().removeMember(
            chatRoomId: widget.room.chatRoomId,
            member: member,
          ),
    );
  }

  /// Нэмэх, хасах хоёрын нийтлэг зам: серверийн мессежийг харуулж, гишүүд
  /// болон чатын жагсаалтыг (толгой дахь "N гишүүн") дахин татна.
  Future<void> _change(Future<String> Function() action) async {
    final rooms = context.read<ChatRoomsController>();
    try {
      final message = await action();
      if (!mounted) return;
      AppSnack.success(context, message);
      await _load();
      await rooms.load(refresh: true);
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Алдаа гарлаа. Дахин оролдоно уу.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDoctor = context.watch<AuthController>().isDoctorSession;
    final canManage = widget.room.isGroup && isDoctor;

    return Scaffold(
      appBar: AppBar(title: const Text('Гишүүд')),
      floatingActionButton: canManage
          ? FloatingActionButton.extended(
              onPressed: _add,
              icon: const Icon(Icons.person_add_alt_1_rounded),
              label: const Text('Гишүүн нэмэх'),
            )
          : null,
      body: _buildBody(canManage),
    );
  }

  Widget _buildBody(bool canManage) {
    if (_loading && _members.isEmpty) {
      return const LoadingView(label: 'Гишүүд уншиж байна…');
    }

    final error = _error;
    if (error != null && _members.isEmpty) {
      return ErrorView(error: error, onRetry: _load);
    }

    final active =
        _members.where((ChatMember m) => m.isActive).toList(growable: false);
    if (active.isEmpty) {
      return const EmptyView(
        title: 'Гишүүн алга',
        message: 'Энэ чатад идэвхтэй гишүүн байхгүй байна.',
        icon: Icons.group_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
        itemCount: active.length,
        separatorBuilder: (BuildContext context, int index) =>
            const SizedBox(height: 10),
        itemBuilder: (BuildContext context, int index) {
          final member = active[index];
          return _MemberCard(
            member: member,
            onRemove: canManage && !member.isMe ? () => _remove(member) : null,
          );
        },
      ),
    );
  }
}

class _MemberCard extends StatelessWidget {
  const _MemberCard({required this.member, this.onRemove});

  final ChatMember member;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = member.name.trim().isEmpty ? 'Нэргүй' : member.name.trim();
    final subtitle = (member.organizationName ?? '').trim().isNotEmpty
        ? member.organizationName!.trim()
        : (member.profession ?? '').trim();

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            radius: 20,
            backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
            child: Text(
              name.characters.first.toUpperCase(),
              style: theme.textTheme.titleSmall?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  member.isMe ? '$name (Би)' : name,
                  style: theme.textTheme.titleSmall,
                ),
                if (subtitle.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
          if (onRemove != null)
            IconButton(
              tooltip: 'Хасах',
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: onRemove,
            )
          else
            const SizedBox(width: 8),
        ],
      ),
    );
  }
}
