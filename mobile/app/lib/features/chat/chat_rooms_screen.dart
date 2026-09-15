import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/util/mn_format.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'chat_controller.dart';
import 'doctor_search_hero.dart';
import 'chat_models.dart';
import 'chat_room_screen.dart';
import 'chat_socket.dart';
import 'new_chat_screen.dart';

/// Чатын өрөөнүүд.
///
/// Эмчид хоёр хэсэгтэй: **Ганцаарчилсан** ба **Бүлэг** — вебийн чатын хоёр
/// хэсэгтэй ижил. Вебэд жагсаалт нь нэг, хоёр хэсэг нь "Шинэ яриа" цонхонд
/// байдаг; гар утасны нарийн дэлгэц дээр бүлгийн чат ганцаарчилсан ярианы
/// дунд алга болохгүйн тулд жагсаалтыг ч хувааж, таб бүр дээр уншаагүйн тоог
/// харуулав.
///
/// Үйлчлүүлэгч бүлгийн гишүүн байх боломжгүй (серверийн бодлого), тиймээс
/// түүнд хуваалтгүй нэг жагсаалт.
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
    final isDoctor = context.watch<AuthController>().isDoctorSession;

    final rooms = controller.rooms;
    final direct =
        rooms.where((ChatRoom r) => !r.isGroup).toList(growable: false);
    final groups =
        rooms.where((ChatRoom r) => r.isGroup).toList(growable: false);

    final scaffold = Scaffold(
      appBar: AppBar(
        title: const Text('Чат'),
        actions: const <Widget>[_ConnectionDot(), SizedBox(width: 8)],
        bottom: isDoctor
            ? TabBar(
                tabs: <Widget>[
                  _TabLabel(label: 'Ганцаарчилсан', unread: _unreadOf(direct)),
                  _TabLabel(label: 'Бүлэг', unread: _unreadOf(groups)),
                ],
              )
            : null,
      ),
      // Builder: сонгосон табыг мэдэхийн тулд DefaultTabController-оос доош
      // байх context хэрэгтэй.
      floatingActionButton: Builder(
        builder: (BuildContext inner) => FloatingActionButton.extended(
          // Доод цэсний табууд IndexedStack дотор нэг route-д хамт амьдардаг.
          // Анхдагч hero tag-тай хоёр FAB тэнд мөргөлдөж, шилжилт бүрт
          // "multiple heroes share the same tag" алдаа шиднэ.
          heroTag: null,
          onPressed: () => _newChat(
            group: isDoctor && DefaultTabController.of(inner).index == 1,
          ),
          icon: Icon(
            isDoctor ? Icons.add_comment_rounded : Icons.person_search_rounded,
          ),
          label: Text(isDoctor ? 'Шинэ яриа' : 'Эмч хайх'),
        ),
      ),
      body: isDoctor
          ? Column(
              children: <Widget>[
                // Эмч хайх — урьд нь нүүр хуудсан дээр байсан. Хайлтын үр дүн
                // нь яриа эхлүүлэх тул чатын дээд талд байх нь зөв.
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 12, 16, 4),
                  child: DoctorSearchHero(),
                ),
                Expanded(
                  child: _buildBody(controller, isDoctor, direct, groups),
                ),
              ],
            )
          : _buildBody(controller, isDoctor, direct, groups),
    );

    return isDoctor
        ? DefaultTabController(length: 2, child: scaffold)
        : scaffold;
  }

  static int _unreadOf(List<ChatRoom> rooms) =>
      rooms.fold<int>(0, (int sum, ChatRoom r) => sum + r.unreadCount);

  Widget _buildBody(
    ChatRoomsController controller,
    bool isDoctor,
    List<ChatRoom> direct,
    List<ChatRoom> groups,
  ) {
    final state = controller.state;
    if (state.isIdle || state.isFirstLoad) {
      return const LoadingView(label: 'Чат уншиж байна…');
    }
    if (state.hasError && !state.hasData) {
      return ErrorView(
        error: state.error!,
        onRetry: () => controller.load(refresh: true),
      );
    }

    Future<void> refresh() => controller.load(refresh: true);

    if (!isDoctor) {
      return _RoomList(
        rooms: controller.rooms,
        emptyTitle: 'Яриа байхгүй байна',
        emptyMessage: 'Эмчтэйгээ шууд харилцахын тулд доорх товчоор эмчээ '
            'хайж яриа эхлүүлнэ үү.',
        emptyActionLabel: 'Эмч хайх',
        onEmptyAction: () => _newChat(),
        onRefresh: refresh,
        onOpen: _openRoom,
      );
    }

    return TabBarView(
      children: <Widget>[
        _RoomList(
          rooms: direct,
          emptyTitle: 'Ганцаарчилсан яриа алга',
          emptyMessage: 'Эмч хайж яриа эхлүүлнэ үү.',
          emptyActionLabel: 'Шинэ яриа',
          onEmptyAction: () => _newChat(),
          onRefresh: refresh,
          onOpen: _openRoom,
        ),
        _RoomList(
          rooms: groups,
          emptyTitle: 'Бүлгийн чат алга',
          emptyMessage: 'Хэд хэдэн эмчтэй нэг дор ярилцахын тулд бүлэг '
              'үүсгэнэ үү.',
          emptyActionLabel: 'Бүлэг үүсгэх',
          onEmptyAction: () => _newChat(group: true),
          onRefresh: refresh,
          onOpen: _openRoom,
        ),
      ],
    );
  }

  Future<void> _newChat({bool group = false}) async {
    final roomId = await Navigator.of(context).push<int>(
      MaterialPageRoute<int>(
        builder: (_) => NewChatScreen(initialTab: group ? 1 : 0),
      ),
    );
    if (roomId == null || !mounted) return;

    // Шинэ яриа эхлэхэд controller жагсаалтыг аль хэдийн дахин татсан.
    ChatRoom? room;
    for (final ChatRoom r in context.read<ChatRoomsController>().rooms) {
      if (r.chatRoomId == roomId) {
        room = r;
        break;
      }
    }
    _openRoom(
      room ??
          ChatRoom(
            chatRoomId: roomId,
            name: '',
            roomType: group ? 'GR' : 'DR',
          ),
    );
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

/// Табын нэр, уншаагүй мессеж байвал тоотой — нөгөө таб дээрх шинэ мессеж
/// харагдахгүй үлдэхгүйн тулд.
class _TabLabel extends StatelessWidget {
  const _TabLabel({required this.label, required this.unread});

  final String label;
  final int unread;

  @override
  Widget build(BuildContext context) {
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(label),
          if (unread > 0) ...<Widget>[
            const SizedBox(width: 6),
            Badge(label: Text(unread > 99 ? '99+' : '$unread')),
          ],
        ],
      ),
    );
  }
}

class _RoomList extends StatelessWidget {
  const _RoomList({
    required this.rooms,
    required this.emptyTitle,
    required this.emptyMessage,
    required this.emptyActionLabel,
    required this.onEmptyAction,
    required this.onRefresh,
    required this.onOpen,
  });

  final List<ChatRoom> rooms;
  final String emptyTitle;
  final String emptyMessage;
  final String emptyActionLabel;
  final VoidCallback onEmptyAction;
  final Future<void> Function() onRefresh;
  final ValueChanged<ChatRoom> onOpen;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: rooms.isEmpty
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: <Widget>[
                SizedBox(
                  height: MediaQuery.sizeOf(context).height * 0.55,
                  child: EmptyView(
                    title: emptyTitle,
                    message: emptyMessage,
                    icon: Icons.chat_bubble_outline_rounded,
                    actionLabel: emptyActionLabel,
                    onAction: onEmptyAction,
                  ),
                ),
              ],
            )
          : ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
              itemCount: rooms.length,
              separatorBuilder: (BuildContext context, int index) =>
                  const SizedBox(height: 10),
              itemBuilder: (BuildContext context, int index) {
                final room = rooms[index];
                return _RoomTile(room: room, onTap: () => onOpen(room));
              },
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
                if (room.isGroup) ...<Widget>[
                  const SizedBox(height: 2),
                  Text(
                    '${room.members.length} гишүүн',
                    style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
                  ),
                ],
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
