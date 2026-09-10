import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../core/config/app_config.dart';
import '../../core/storage/secure_store.dart';
import 'chat_models.dart';

/// Чатын бодит цагийн холболт.
///
/// Гурван зарчим (API.md §5, FLUTTER.md § "Sockets"):
///
///  * **Бичих үйлдэл HTTP-ээр явна, socket зөвхөн тараана.** Socket-оор мессеж
///    илгээхгүй — тасарсан холболт мессеж алдахгүй, зөвхөн шууд мэдэгдэл алдана.
///  * Дахин холбогдох үед `GetMessages`-ээр эргэж татна. "Юу ч алдаагүй" гэж
///    найдахгүй.
///  * **Ард ажиллаж буй апп юу ч хүлээж авахгүй.** Backend-д FCM/APNs байхгүй
///    тул үйлдлийн систем socket-ыг таслана. Иймд эргэж нээгдэх үед дахин
///    татах нь заавал.
class ChatSocket {
  ChatSocket(this._store);

  final SecureStore _store;

  io.Socket? _socket;
  final Set<int> _joinedRooms = <int>{};

  /// Шинэ мессеж ирэх урсгал.
  final StreamController<ChatMessage> _messages =
      StreamController<ChatMessage>.broadcast();

  /// Уншсан тэмдэглэгээ өөрчлөгдөх урсгал.
  final StreamController<int> _readRooms = StreamController<int>.broadcast();

  /// Холболтын төлөв.
  final ValueNotifier<bool> connected = ValueNotifier<bool>(false);

  Stream<ChatMessage> get messages => _messages.stream;
  Stream<int> get readRooms => _readRooms.stream;

  ChatMe? me;

  Future<void> connect() async {
    if (_socket != null) return;

    final token = await _store.readAccessToken();
    if (token == null || token.isEmpty) return;

    final socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          // Backend Socket.IO-г энэ зам дээр холбосон. Түүхий WebSocket клиент
          // энэ протоколыг ойлгохгүй.
          .setPath('/chatmessage')
          .setTransports(<String>['websocket'])
          // Токеныг query string-д **тавихгүй**: тэнд орсон токен nginx-ийн
          // хандалтын лог руу бичигдэнэ (helper/SocketAuth.js).
          .setAuth(<String, dynamic>{'token': token})
          .enableReconnection()
          .setReconnectionDelay(2000)
          .setReconnectionDelayMax(15000)
          .disableAutoConnect()
          .build(),
    );

    socket.onConnect((_) {
      connected.value = true;
      // Холболт сэргэхэд өмнө нэгдсэн өрөөнүүдэд дахин нэгдэнэ.
      for (final roomId in _joinedRooms.toList()) {
        socket.emit('joinRoom', <String, dynamic>{'ChatRoomId': roomId});
      }
    });

    socket.onDisconnect((_) => connected.value = false);

    socket.on('newMessage', (dynamic payload) {
      if (payload is! Map) return;
      _messages.add(
        ChatMessage.fromJson(Map<String, dynamic>.from(payload), me: me),
      );
    });

    socket.on('messageRead', (dynamic payload) {
      if (payload is! Map) return;
      final roomId = payload['ChatRoomId'];
      if (roomId is num) _readRooms.add(roomId.toInt());
    });

    // Токен хугацаа дуусахад сервер холболтыг тасалдаг тул шинэ токеноор
    // дахин баталгаажуулна.
    socket.on('authExpired', (_) => _reauth());

    socket.onConnectError((Object? error) {
      if (kDebugMode) debugPrint('[socket] холбогдож чадсангүй: $error');
      connected.value = false;
    });

    _socket = socket;
    socket.connect();
  }

  Future<void> _reauth() async {
    final socket = _socket;
    if (socket == null) return;
    final token = await _store.readAccessToken();
    if (token == null || token.isEmpty) {
      await disconnect();
      return;
    }
    socket.emit('reauth', <String, dynamic>{'token': token});
  }

  void joinRoom(int chatRoomId) {
    _joinedRooms.add(chatRoomId);
    _socket?.emit('joinRoom', <String, dynamic>{'ChatRoomId': chatRoomId});
  }

  void leaveRoom(int chatRoomId) {
    _joinedRooms.remove(chatRoomId);
    _socket?.emit('leaveRoom', <String, dynamic>{'ChatRoomId': chatRoomId});
  }

  void typing(int chatRoomId) {
    _socket?.emit('typing', <String, dynamic>{'ChatRoomId': chatRoomId});
  }

  Future<void> disconnect() async {
    final socket = _socket;
    _socket = null;
    _joinedRooms.clear();
    connected.value = false;
    socket?.dispose();
  }

  /// Токен сэргээгдсэний дараа холболтыг шинэчилнэ.
  Future<void> reconnectWithFreshToken() async {
    await disconnect();
    await connect();
  }

  void dispose() {
    // `disconnect()` нь `connected.value`-д бичдэг тул түүнийг дуудаад дараа нь
    // notifier-ыг устгавал "устгасны дараа бичсэн" алдаа гарна. Иймд энд
    // талбаруудыг шууд цэвэрлэнэ.
    final socket = _socket;
    _socket = null;
    _joinedRooms.clear();
    socket?.dispose();
    _messages.close();
    _readRooms.close();
    connected.dispose();
  }
}
