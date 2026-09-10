import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'chat_controller.dart';
import 'chat_models.dart';
import 'chat_room_screen.dart';
import 'chat_socket.dart';
import 'doctor_directory_screen.dart';

/// Чатын өрөөнүүд.
class ChatRoomsScreen extends StatefulWidget {
  const ChatRoomsScreen({super.key});

  @override
  State<ChatRoomsScreen> createState() => _ChatRoomsScreenState();
}

class _ChatRoomsScreenState extends State<ChatRoomsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<ChatRoomsController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<ChatRoomsController>();
    final state = controller.state;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Чат'),
        actions: <Widget>[
          const _ConnectionDot(),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openDirectory,
        icon: const Icon(Icons.person_search_rounded),
        label: const Text('Эмч хайх'),
      ),
      body: Builder(
        builder: (BuildContext context) {
          if (state.isFirstLoad) {
            return const LoadingView(label: 'Чат уншиж байна…');
          }
          if (state.hasError && !state.hasData) {
            return ErrorView(
              error: state.error!,
              onRetry: () => controller.load(refresh: true),
            );
          }

          final rooms = controller.rooms;

          return RefreshIndicator(
            onRefresh: () => controller.load(refresh: true),
            child: rooms.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: <Widget>[
                      SizedBox(
                        height: MediaQuery.sizeOf(context).height * 0.6,
                        child: EmptyView(
                          title: 'Яриа байхгүй байна',
                          message: 'Эмчтэйгээ шууд харилцахын тулд доорх '
                              'товчоор эмчээ хайж яриа эхлүүлнэ үү.',
                          icon: Icons.chat_bubble_outline_rounded,
                          actionLabel: 'Эмч хайх',
                          onAction: _openDirectory,
                        ),
                      ),
                    ],
                  )
                : ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
                    itemCount: rooms.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (BuildContext context, int index) {
                      final room = rooms[index];
                      return _RoomTile(
                        room: room,
                        onTap: () => _openRoom(room),
                      );
                    },
                  ),
          );
        },
      ),
    );
  }

  Future<void> _openDirectory() async {
    final person = await Navigator.of(context).push<DirectoryPerson>(
      MaterialPageRoute<DirectoryPerson>(
        builder: (_) => const DoctorDirectoryScreen(),
      ),
    );
    if (person == null || !mounted) return;

    final controller = context.read<ChatRoomsController>();
    final roomId = await controller.startChat(person);
    if (!mounted || roomId == null) return;

    final room = controller.rooms.firstWhere(
      (ChatRoom r) => r.chatRoomId == roomId,
      orElse: () => ChatRoom(
        chatRoomId: roomId,
        name: person.name,
        roomType: 'DR',
      ),
    );
    _openRoom(room);
  }

  void _openRoom(ChatRoom room) {
    final rooms = context.read<ChatRoomsController>();
    rooms.clearUnread(room.chatRoomId);
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ChatRoomScreen(room: room, me: rooms.me),
      ),
    );
  }
}

class _ConnectionDot extends StatelessWidget {
  const _ConnectionDot();

  @override
  Widget build(BuildContext context) {
    final socket = context.read<ChatSocket>();
    return ValueListenableBuilder<bool>(
      valueListenable: socket.connected,
      builder: (BuildContext context, bool connected, _) {
        if (connected) return const SizedBox.shrink();
        return Tooltip(
          message: 'Шууд холболт тасарсан. Мессежүүд сэргээх үед ирнэ.',
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Icon(
              Icons.cloud_off_rounded,
              size: 20,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        );
      },
    );
  }
}

class _RoomTile extends StatelessWidget {
  const _RoomTile({required this.room, required this.onTap});

  final ChatRoom room;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final last = room.lastMessage;
    final unread = room.unreadCount;

    return SectionCard(
      onTap: onTap,
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          CircleAvatar(
            radius: 24,
            backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
            child: Icon(
              room.isGroup
                  ? Icons.groups_outlined
                  : Icons.medical_services_outlined,
              color: theme.colorScheme.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        room.displayName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      MnFormat.friendlyDateTime(room.lastActivityDate),
                      style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Row(
                  children: <Widget>[
                    if (last != null && last.attachmentCount > 0) ...<Widget>[
                      Icon(
                        Icons.attach_file_rounded,
                        size: 14,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                    ],
                    Expanded(
                      child: Text(
                        last == null
                            ? 'Мессеж байхгүй'
                            : '${last.isMine ? 'Та: ' : ''}${last.preview}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight:
                              unread > 0 ? FontWeight.w600 : FontWeight.w400,
                          color: unread > 0
                              ? theme.colorScheme.onSurface
                              : theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    if (unread > 0) ...<Widget>[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 7,
                          vertical: 2,
                        ),
                        constraints: const BoxConstraints(minWidth: 22),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          unread > 99 ? '99+' : '$unread',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
