import 'dart:async';
import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:uuid/uuid.dart';

import '../../core/network/api_exception.dart';
import '../../core/notifications/local_notifications.dart';
import '../../core/util/async_state.dart';
import 'chat_models.dart';
import 'chat_repository.dart';
import 'chat_socket.dart';

final Uuid _uuid = Uuid();

/// Хэрэглэгч яг одоо аль өрөөг нээж харж байгаа.
///
/// Харж буй яриандаа мэдэгдэл авах нь утгагүй — Messenger ч тэгдэггүй. Гэхдээ
/// апп ар талдаа орсон бол нээлттэй өрөөнийх нь мэдэгдэл хэрэгтэй, тиймээс
/// аппын төлөвийг хамт шалгана.
class ChatPresence {
  ChatPresence._();

  static int? activeRoomId;

  static bool shouldNotify(int chatRoomId) {
    if (activeRoomId != chatRoomId) return true;
    return WidgetsBinding.instance.lifecycleState != AppLifecycleState.resumed;
  }
}

/// Чатын өрөөнүүдийн жагсаалт ба нийт уншаагүйн тоо.
class ChatRoomsController extends ChangeNotifier {
  ChatRoomsController(this._repo, this._socket) {
    _sub = _socket.messages.listen(_onIncoming);
    // Токен хуучирахад socket өөрөө сэргээж чадахгүй: сервер тэр дороо
    // салгадаг. HTTP дуудлага хийж токеноо шинэчлээд (interceptor хийнэ)
    // шинэ токеноор дахин холбогдоно.
    _socket.onTokenExpired = _refreshSession;
  }

  Future<void> _refreshSession() async {
    await load(refresh: true);
    await _socket.reconnectWithFreshToken();
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

  bool _askedPermission = false;

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
      // Мэдэгдлийн зөвшөөрлийг чат бэлэн болмогц нэг л удаа асууна: шинэ
      // мессежийг мэдэгдэх цорын ганц зам энэ (push түлхүүр ирээгүй).
      if (!_askedPermission) {
        _askedPermission = true;
        unawaited(LocalNotifications.requestPermission());
      }
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
      if (!(_me?.matches(message.userType, message.userId) ?? message.isMine)) {
        _notify(
          chatRoomId: message.chatRoomId,
          title: message.senderName.trim().isEmpty
              ? 'Шинэ мессеж'
              : message.senderName.trim(),
          body: _preview(message),
        );
      }
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

    if (!isMine && !room.isMuted) {
      final sender = message.senderName.trim();
      final preview = _preview(message);
      _notify(
        chatRoomId: room.chatRoomId,
        title: room.isGroup
            ? room.name
            : (sender.isNotEmpty ? sender : room.name),
        body: room.isGroup && sender.isNotEmpty ? '$sender: $preview' : preview,
      );
    }
  }

  /// Өөр дэлгэц дээр байхад ирсэн мессежийг төхөөрөмжийн мэдэгдлээр хэлнэ.
  ///
  /// Дарахад яг тэр өрөө нээгдэнэ — ачаанд өрөөний дугаар явна
  /// (features/notifications/notification_router.dart).
  void _notify({
    required int chatRoomId,
    required String title,
    required String body,
  }) {
    if (!ChatPresence.shouldNotify(chatRoomId)) return;
    unawaited(
      LocalNotifications.showChat(
        chatRoomId: chatRoomId,
        title: title,
        body: body,
      ),
    );
  }

  /// Түгжээний дэлгэц дээр эмнэлгийн бичвэр харуулахгүй байх нь зөв ч
  /// хавсралт бүхий мессежид харуулах текст огт байхгүй — юу ирснийг нь
  /// хэлэхгүй бол мэдэгдэл хоосон болно (серверийн PushPreview-тэй нэг ёсон).
  String _preview(ChatMessage message) {
    final text = message.text.trim();
    if (text.isNotEmpty) {
      return text.length > 120 ? '${text.substring(0, 119)}…' : text;
    }
    for (final a in message.attachments) {
      if (a.isAudio) return '🎤 Дуут мессеж';
      if (a.isVideo) return '🎬 Видео бичлэг';
      if (a.isImage) return '📷 Зураг';
    }
    if (message.hasAttachments) return '📎 Файл';
    return 'Шинэ мессеж';
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

  /// Эмчтэй 1:1 яриа эхлүүлэх. Давхар дуудахад шинэ өрөө үүсгэхгүй.
  ///
  /// Алдааг залгихгүй: серверийн мессежийг ("Хандах эрхгүй байна" гэх мэт)
  /// дэлгэц харуулна. Өмнө нь `null` буцааж, дарсан ч юу ч болохгүй байв.
  Future<int> startChat(DirectoryPerson person) async {
    final roomId = await _repo.startChat(
      userType: person.userType,
      userId: person.userId,
    );
    if (roomId == 0) throw ApiException('Чат үүсгэж чадсангүй.');
    await load(refresh: true);
    return roomId;
  }

  /// Бүлгийн чат үүсгэх — зөвхөн эмч (серверийн бодлого).
  Future<int> createGroup(String name, List<DirectoryPerson> members) async {
    final roomId = await _repo.createGroupRoom(name: name, members: members);
    if (roomId == 0) throw ApiException('Бүлэг үүсгэж чадсангүй.');
    await load(refresh: true);
    return roomId;
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
    _typingSub = _socket.typingEvents.listen(_onTyping);
    _socket.joinRoom(chatRoomId);
  }

  final ChatRepository _repo;
  final ChatSocket _socket;
  final int chatRoomId;
  ChatMe? _me;

  late final StreamSubscription<ChatMessage> _sub;
  late final StreamSubscription<TypingEvent> _typingSub;

  /// Илгээж чадаагүй мессежийн файлууд — дахин оролдоход хэрэгтэй.
  final Map<String, List<File>> _failedFiles = <String, List<File>>{};

  DateTime? _typingSentAt;
  Timer? _typingStop;
  Timer? _peerTypingClear;
  bool _peerTyping = false;

  /// Нөгөө тал бичиж байгаа эсэх.
  bool get peerTyping => _peerTyping;

  void _onTyping(TypingEvent event) {
    if (event.chatRoomId != chatRoomId) return;
    // Өөрийн эвентийг үл тоомсорлоно — сервер илгээгчид ч тарааж болно.
    if (_me?.matches(event.userType, event.userId) ?? false) return;

    _peerTypingClear?.cancel();
    if (!event.isTyping) {
      if (_peerTyping) {
        _peerTyping = false;
        notifyListeners();
      }
      return;
    }
    if (!_peerTyping) {
      _peerTyping = true;
      notifyListeners();
    }
    // Нөгөө тал аппаа хаавал `false` ирэхгүй тул өөрөө унтраана.
    _peerTypingClear = Timer(const Duration(seconds: 6), () {
      _peerTyping = false;
      notifyListeners();
    });
  }

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

    // Сервер `newMessage`-ийг HTTP хариунаас ӨМНӨ тарааж, илгээгч өөрөө ч
    // хүлээн авагчдын дунд байдаг. Түр бөмбөлгийн `id` нь 0 тул зөвхөн
    // id-аар шалгавал ижил мессеж хоёр удаа харагдана. Иймд эхлээд
    // `ClientMsgId`-аар тааруулж, түр бөмбөлгөө "илгээгдсэн" болгоно.
    final clientId = message.clientMsgId;
    if (clientId != null && clientId.isNotEmpty) {
      final index = _messages.indexWhere(
        (ChatMessage m) => m.clientMsgId == clientId,
      );
      if (index != -1) {
        _messages[index] = message.copyWith(sendState: ChatSendState.sent);
        _emit(AsyncState<List<ChatMessage>>.ready(messages));
        _markRead();
        return;
      }
    }

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
    int? durationMs,
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
        durationMs: durationMs,
      );
      _replaceOptimistic(clientMsgId, saved);
      _failedFiles.remove(clientMsgId);
      return null;
    } on ApiException catch (e) {
      _markOptimisticFailed(clientMsgId);
      // Дахин оролдоход хавсралт алга болохгүйн тулд хадгална.
      _failedFiles[clientMsgId] = List<File>.from(files);
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }

  void _replaceOptimistic(String clientMsgId, ChatMessage saved) {
    // Socket хувилбар нь HTTP хариунаас өмнө ирсэн байж болно. Тэр тохиолдолд
    // ижил id-тай мөр аль хэдийн жагсаалтад байгаа тул түр бөмбөлгийг зүгээр
    // л хасна — эс бөгөөс хоёр хуулбар үлдэнэ.
    final existing =
        _messages.indexWhere((ChatMessage m) => m.id == saved.id && m.id != 0);
    final index =
        _messages.indexWhere((ChatMessage m) => m.clientMsgId == clientMsgId);

    if (existing != -1 && existing != index) {
      if (index != -1) _messages.removeAt(index);
      _messages[_messages.indexWhere(
        (ChatMessage m) => m.id == saved.id && m.id != 0,
      )] = saved.copyWith(sendState: ChatSendState.sent);
    } else if (index == -1) {
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
  /// Дахин оролдоход илгээх файлууд.
  List<File> failedFilesFor(String clientMsgId) =>
      _failedFiles[clientMsgId] ?? const <File>[];

  void discardFailed(String clientMsgId) {
    _messages.removeWhere((ChatMessage m) => m.clientMsgId == clientMsgId);
    _emit(AsyncState<List<ChatMessage>>.ready(messages));
  }

  /// "Бичиж байна" — 2 секундэд нэгээс олонгүй илгээж, 4 секунд бичихгүй бол
  /// өөрөө унтраана. Сервер төлөвийг дамжуулдаг тул `false`-ыг заавал явуулна.
  void typing() {
    final now = DateTime.now();
    final last = _typingSentAt;
    if (last == null || now.difference(last) > const Duration(seconds: 2)) {
      _typingSentAt = now;
      _socket.typing(chatRoomId, isTyping: true);
    }
    _typingStop?.cancel();
    _typingStop = Timer(const Duration(seconds: 4), stopTyping);
  }

  void stopTyping() {
    _typingStop?.cancel();
    _typingStop = null;
    _typingSentAt = null;
    _socket.typing(chatRoomId, isTyping: false);
  }

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
    _typingStop?.cancel();
    _peerTypingClear?.cancel();
    _typingSub.cancel();
    _socket.leaveRoom(chatRoomId);
    super.dispose();
  }
}
