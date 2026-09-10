import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../../core/network/api_exception.dart';
import '../../core/util/async_state.dart';
import 'chat_models.dart';
import 'chat_repository.dart';
import 'chat_socket.dart';

final Uuid _uuid = Uuid();

/// Чатын өрөөнүүдийн жагсаалт ба нийт уншаагүйн тоо.
class ChatRoomsController extends ChangeNotifier {
  ChatRoomsController(this._repo, this._socket) {
    _sub = _socket.messages.listen(_onIncoming);
  }

  final ChatRepository _repo;
  final ChatSocket _socket;
  late final StreamSubscription<ChatMessage> _sub;

  AsyncState<List<ChatRoom>> _state = const AsyncState<List<ChatRoom>>.idle();
  ChatMe? _me;

  AsyncState<List<ChatRoom>> get state => _state;
  List<ChatRoom> get rooms => _state.data ?? const <ChatRoom>[];
  ChatMe? get me => _me;

  int get totalUnread =>
      rooms.fold<int>(0, (int sum, ChatRoom r) => sum + r.unreadCount);

  Future<void> load({bool refresh = false}) async {
    _emit(refresh && _state.hasData
        ? _state.toRefreshing()
        : const AsyncState<List<ChatRoom>>.loading());
    try {
      final result = await _repo.fetchRooms();
      _me = result.me;
      _socket.me = result.me;
      _emit(AsyncState<List<ChatRoom>>.ready(result.rooms));
      await _socket.connect();
    } on ApiException catch (e) {
      _emit(AsyncState<List<ChatRoom>>.error(e, data: _state.data));
    }
  }

  /// Socket-оор ирсэн мессежээр жагсаалтыг шинэчилнэ.
  ///
  /// Бүх жагсаалтыг дахин татахгүй — зөвхөн холбогдох өрөөг өөрчилж, дээш нь
  /// зөөнө. Ингэснээр яриа идэвхтэй байхад сүлжээ чирэгдэхгүй.
  void _onIncoming(ChatMessage message) {
    if (!_state.isReady) return;
    final current = rooms;
    final index =
        current.indexWhere((ChatRoom r) => r.chatRoomId == message.chatRoomId);
    if (index == -1) {
      // Танихгүй өрөө — шинэ яриа эхэлсэн байж болно.
      load(refresh: true);
      return;
    }

    final room = current[index];
    final isMine = _me?.matches(message.userType, message.userId) ?? message.isMine;

    final updated = room.copyWith(
      unreadCount: isMine ? room.unreadCount : room.unreadCount + 1,
      lastMessage: ChatLastMessage(
        id: message.id,
        text: message.text,
        createDate: message.createDate,
        attachmentCount: message.attachmentCount,
        isMine: isMine,
      ),
      lastActivityDate: message.createDate ?? DateTime.now(),
    );

    final next = <ChatRoom>[updated, ...current]..removeWhere(
        (ChatRoom r) => r.chatRoomId == room.chatRoomId && !identical(r, updated),
      );
    _emit(AsyncState<List<ChatRoom>>.ready(next));
  }

  /// Өрөө уншигдсаныг жагсаалтад тусгана.
  void clearUnread(int chatRoomId) {
    if (!_state.isReady) return;
    final next = rooms
        .map((ChatRoom r) =>
            r.chatRoomId == chatRoomId ? r.copyWith(unreadCount: 0) : r)
        .toList(growable: false);
    _emit(AsyncState<List<ChatRoom>>.ready(next));
  }

  /// Эмчтэй шинэ яриа эхлүүлэх. Өрөөний дугаарыг буцаана.
  Future<int?> startChat(DirectoryPerson person) async {
    try {
      final roomId = await _repo.startChat(
        userType: person.userType,
        userId: person.userId,
      );
      if (roomId != 0) await load(refresh: true);
      return roomId == 0 ? null : roomId;
    } on ApiException {
      return null;
    }
  }

  void _emit(AsyncState<List<ChatRoom>> next) {
    _state = next;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

/// Нэг өрөөний яриа.
class ChatConversationController extends ChangeNotifier {
  ChatConversationController({
    required ChatRepository repo,
    required ChatSocket socket,
    required this.chatRoomId,
    ChatMe? me,
  })  : _repo = repo,
        _socket = socket,
        _me = me {
    _sub = _socket.messages.listen(_onIncoming);
    _socket.joinRoom(chatRoomId);
  }

  final ChatRepository _repo;
  final ChatSocket _socket;
  final int chatRoomId;
  ChatMe? _me;

  late final StreamSubscription<ChatMessage> _sub;

  /// Шинэхнээс нь хуучин руу эрэмбэлэгдсэн — `reverse: true` жагсаалтад тохирно.
  final List<ChatMessage> _messages = <ChatMessage>[];

  AsyncState<List<ChatMessage>> _state =
      const AsyncState<List<ChatMessage>>.idle();
  bool _loadingOlder = false;
  bool _hasOlder = true;
  bool _sending = false;

  AsyncState<List<ChatMessage>> get state => _state;
  List<ChatMessage> get messages => List<ChatMessage>.unmodifiable(_messages);
  bool get loadingOlder => _loadingOlder;
  bool get hasOlder => _hasOlder;
  bool get sending => _sending;
  bool get isConnected => _socket.connected.value;

  Future<void> load() async {
    _emit(const AsyncState<List<ChatMessage>>.loading());
    try {
      final rows = await _repo.fetchMessages(chatRoomId: chatRoomId, me: _me);
      _messages
        ..clear()
        ..addAll(rows);
      _hasOlder = rows.length >= 30;
      _emit(AsyncState<List<ChatMessage>>.ready(messages));
      await _markRead();
    } on ApiException catch (e) {
      _emit(AsyncState<List<ChatMessage>>.error(e));
    }
  }

  /// Дахин холбогдох, эсвэл апп эргэж нээгдэх үед бүрэн сэргээнэ.
  ///
  /// Socket тасарсан хугацаанд ирсэн мессежийг "алдаагүй байх" гэж найдахын
  /// оронд эргэж татна (FLUTTER.md § "Sockets").
  Future<void> refreshAfterResume() async {
    if (_state.isLoading) return;
    try {
      final rows = await _repo.fetchMessages(chatRoomId: chatRoomId, me: _me);
      final pending = _messages
          .where((ChatMessage m) => m.sendState != ChatSendState.sent)
          .toList();
      _messages
        ..clear()
        ..addAll(rows)
        ..insertAll(0, pending);
      _emit(AsyncState<List<ChatMessage>>.ready(messages));
      await _markRead();
    } on ApiException {
      // Сэргээж чадсангүй — одоо байгаа түүх хэвээр үлдэнэ.
    }
  }

  /// Хуучин мессежүүд. Keyset — хамгийн бага `Id`-аас өмнөх.
  Future<void> loadOlder() async {
    if (_loadingOlder || !_hasOlder || _messages.isEmpty) return;
    _loadingOlder = true;
    notifyListeners();
    try {
      final oldest = _messages
          .where((ChatMessage m) => m.id > 0)
          .fold<int?>(null, (int? min, ChatMessage m) =>
              min == null || m.id < min ? m.id : min);
      if (oldest == null) {
        _hasOlder = false;
        return;
      }
      final rows = await _repo.fetchMessages(
        chatRoomId: chatRoomId,
        beforeId: oldest,
        me: _me,
      );
      if (rows.isEmpty) {
        _hasOlder = false;
      } else {
        _messages.addAll(rows);
        _emit(AsyncState<List<ChatMessage>>.ready(messages));
      }
    } on ApiException {
      _hasOlder = false;
    } finally {
      _loadingOlder = false;
      notifyListeners();
    }
  }

  void _onIncoming(ChatMessage message) {
    if (message.chatRoomId != chatRoomId) return;
    // Өөрийн илгээсэн мессеж socket-оор эргэж ирвэл давхардуулахгүй.
    if (_messages.any((ChatMessage m) => m.id == message.id && m.id != 0)) {
      return;
    }
    _messages.insert(0, message);
    _emit(AsyncState<List<ChatMessage>>.ready(messages));
    _markRead();
  }

  /// Текст мессеж — өөдрөг харагдацтай.
  Future<ApiException?> sendText(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return null;

    final clientMsgId = _uuid.v4();
    final optimistic = ChatMessage(
      id: 0,
      chatRoomId: chatRoomId,
      text: trimmed,
      isMine: true,
      createDate: DateTime.now(),
      clientMsgId: clientMsgId,
      sendState: ChatSendState.sending,
    );
    _messages.insert(0, optimistic);
    _emit(AsyncState<List<ChatMessage>>.ready(messages));

    try {
      final saved = await _repo.sendText(
        chatRoomId: chatRoomId,
        text: trimmed,
        clientMsgId: clientMsgId,
        me: _me,
      );
      _replaceOptimistic(clientMsgId, saved);
      return null;
    } on ApiException catch (e) {
      _markOptimisticFailed(clientMsgId);
      return e;
    }
  }

  /// Хавсралттай мессеж — гурван алхмыг [ChatRepository] гүйцэтгэнэ.
  Future<ApiException?> sendAttachments({
    required List<File> files,
    String text = '',
    void Function(int sent, int total)? onProgress,
  }) async {
    if (files.isEmpty) return null;
    _sending = true;
    notifyListeners();

    final clientMsgId = _uuid.v4();
    final optimistic = ChatMessage(
      id: 0,
      chatRoomId: chatRoomId,
      text: text.trim(),
      isMine: true,
      createDate: DateTime.now(),
      attachmentCount: files.length,
      clientMsgId: clientMsgId,
      sendState: ChatSendState.sending,
    );
    _messages.insert(0, optimistic);
    _emit(AsyncState<List<ChatMessage>>.ready(messages));

    try {
      final saved = await _repo.sendWithAttachment(
        chatRoomId: chatRoomId,
        text: text.trim(),
        clientMsgId: clientMsgId,
        files: files,
        me: _me,
        onProgress: onProgress,
      );
      _replaceOptimistic(clientMsgId, saved);
      return null;
    } on ApiException catch (e) {
      _markOptimisticFailed(clientMsgId);
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }

  void _replaceOptimistic(String clientMsgId, ChatMessage saved) {
    final index =
        _messages.indexWhere((ChatMessage m) => m.clientMsgId == clientMsgId);
    if (index == -1) {
      _messages.insert(0, saved);
    } else {
      _messages[index] = saved.copyWith(sendState: ChatSendState.sent);
    }
    _emit(AsyncState<List<ChatMessage>>.ready(messages));
  }

  void _markOptimisticFailed(String clientMsgId) {
    final index =
        _messages.indexWhere((ChatMessage m) => m.clientMsgId == clientMsgId);
    if (index == -1) return;
    _messages[index] =
        _messages[index].copyWith(sendState: ChatSendState.failed);
    _emit(AsyncState<List<ChatMessage>>.ready(messages));
  }

  /// Илгээгдээгүй мессежийг жагсаалтаас хасна.
  void discardFailed(String clientMsgId) {
    _messages.removeWhere((ChatMessage m) => m.clientMsgId == clientMsgId);
    _emit(AsyncState<List<ChatMessage>>.ready(messages));
  }

  void typing() => _socket.typing(chatRoomId);

  Future<void> _markRead() async {
    final newest = _messages
        .where((ChatMessage m) => m.id > 0)
        .fold<int>(0, (int max, ChatMessage m) => m.id > max ? m.id : max);
    if (newest == 0) return;
    try {
      await _repo.markRead(chatRoomId: chatRoomId, lastMessageId: newest);
    } on ApiException {
      // Уншсан тэмдэглэгээ амжилтгүй болох нь яриаг тасалдуулах шалтгаан биш.
    }
  }

  void _emit(AsyncState<List<ChatMessage>> next) {
    _state = next;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub.cancel();
    _socket.leaveRoom(chatRoomId);
    super.dispose();
  }
}
