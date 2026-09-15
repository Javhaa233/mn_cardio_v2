import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/app_navigator.dart';
import '../chat/chat_controller.dart';
import '../chat/chat_models.dart';
import '../chat/chat_room_screen.dart';
import '../reminders/reminders_screen.dart';

/// Төхөөрөмжийн мэдэгдэл дээр дарахад хаашаа очихыг шийднэ.
///
/// Ачаа (`payload`) нь `chat:<өрөөний дугаар>` эсвэл `reminder:<дугаар>`.
/// Виджетийн модноос гадуур дуудагддаг тул [appNavigatorKey]-ээр шилжинэ.
Future<void> routeNotificationPayload(String payload) async {
  final navigator = appNavigatorKey.currentState;
  if (navigator == null) return;
  final context = navigator.context;

  if (payload.startsWith('chat:')) {
    final id = int.tryParse(payload.substring(5)) ?? 0;
    if (id > 0) await _openChatRoom(navigator, context, id);
    return;
  }

  if (payload.startsWith('reminder')) {
    await navigator.push(
      MaterialPageRoute<void>(builder: (_) => const RemindersScreen()),
    );
  }
}

Future<void> _openChatRoom(
  NavigatorState navigator,
  BuildContext context,
  int chatRoomId,
) async {
  ChatRoomsController rooms;
  try {
    rooms = context.read<ChatRoomsController>();
  } catch (_) {
    // Нэвтрээгүй байхад мэдэгдэл дарагдсан — нэвтрэх дэлгэц хэвээр үлдэнэ.
    return;
  }

  ChatRoom? room = _find(rooms, chatRoomId);
  if (room == null) {
    // Апп сэргэж байхад жагсаалт хоосон байж болно.
    await rooms.load(refresh: true);
    room = _find(rooms, chatRoomId);
  }
  if (room == null) return;

  await navigator.push(
    MaterialPageRoute<void>(
      builder: (_) => ChatRoomScreen(room: room!, me: rooms.me),
    ),
  );
}

ChatRoom? _find(ChatRoomsController rooms, int chatRoomId) {
  for (final room in rooms.rooms) {
    if (room.chatRoomId == chatRoomId) return room;
  }
  return null;
}
