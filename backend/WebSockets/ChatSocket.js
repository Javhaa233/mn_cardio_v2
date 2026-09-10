const socket = require('socket.io');

const SocketAuth = require('../helper/SocketAuth');
const ChatHelper = require('../helper/ChatHelper');
const { originCallback } = require('../config/CorsOrigin');

/**
 * Chat real-time transport.
 *
 * THIS SOCKET NO LONGER WRITES ANYTHING. Persisting a message is
 * POST /api/Chat/SendMessage, and the socket only fans out a row that is
 * already committed.
 *
 * That is not tidiness, it fixes two real defects:
 *
 *   1. The old handler did `await ChatHelper.SaveMessages(data)` and DISCARDED
 *      the result, then broadcast unconditionally. A 255-character overflow, a
 *      DB outage or a bad user id produced a message every participant saw and
 *      nobody's history contained.
 *   2. A socket emit has no response, so a client could never learn the row's
 *      Id or CreateDate. An optimistic message could never leave "sending", and
 *      a dropped socket lost the message outright.
 *
 * Fan-out targets PERSONAL rooms ('u:<Type>:<Id>') rather than the conversation
 * room, so a member whose chat window is closed still gets the unread bump.
 * Typing and read receipts go to the conversation room, where only people with
 * the thread open care.
 *
 * SINGLE-PROCESS CAVEAT: socket.join rooms are per-process, exactly like the
 * module-level array they replace. Under PM2 cluster mode with instances > 1,
 * fan-out silently misses everyone on another worker - "works in dev, half the
 * messages vanish in prod". Confirm the backend PM2 entry is instances: 1 /
 * fork before deploy, or add @socket.io/redis-adapter.
 */
class ChatSocket {
  static io;

  static SetServer(server) {
    this.io = socket(server, {
      path: '/chatmessage',
      // Socket.IO v4 does not inherit Express's cors(); without this the
      // cross-origin polling handshake gets no Access-Control-Allow-Origin and
      // the browser blocks it.
      cors: {
        origin: originCallback,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      // The socket carries no file bytes - attachments go over HTTP multipart.
      maxHttpBufferSize: 1e5,
    });

    this.io.use(SocketAuth.Handshake);

    this.io.on('connection', (socket) => {
      const Me = socket.data.Me;

      // Joined from the VERIFIED session. There is no setUser handler any more;
      // a client cannot name itself.
      socket.join(SocketAuth.PersonalRoom(Me));
      SocketAuth.ArmExpiry(socket);

      socket.on('joinRoom', async (data, ack) => {
        try {
          const ChatRoomId = data && parseInt(data.ChatRoomId, 10);
          if (!ChatRoomId) return typeof ack === 'function' && ack({ Ok: false });

          // Re-checked on every join, so someone removed from a room cannot
          // rejoin by replaying the emit.
          const Member = await ChatHelper.IsMember(Me, ChatRoomId);
          if (!Member) return typeof ack === 'function' && ack({ Ok: false });

          socket.join(SocketAuth.ConversationRoom(ChatRoomId));
          socket.data.Rooms.add(ChatRoomId);
          return typeof ack === 'function' && ack({ Ok: true });
        } catch (ex) {
          console.log('ChatSocket joinRoom error:', ex.message);
          return typeof ack === 'function' && ack({ Ok: false });
        }
      });

      socket.on('leaveRoom', (data) => {
        const ChatRoomId = data && parseInt(data.ChatRoomId, 10);
        if (!ChatRoomId) return;
        socket.leave(SocketAuth.ConversationRoom(ChatRoomId));
        socket.data.Rooms.delete(ChatRoomId);
      });

      // Ephemeral, never persisted, and only to rooms this socket actually
      // joined. socket.to() excludes the sender, so no self-echo.
      socket.on('typing', (data) => {
        const ChatRoomId = data && parseInt(data.ChatRoomId, 10);
        if (!ChatRoomId || !socket.data.Rooms.has(ChatRoomId)) return;

        socket.to(SocketAuth.ConversationRoom(ChatRoomId)).emit('typing', {
          ChatRoomId,
          UserId: Me.UserId,
          UserType: Me.UserType,
          IsTyping: !!data.IsTyping,
        });
      });

      // A client that refreshed its JWT stays connected instead of being
      // dropped mid-conversation.
      socket.on('reauth', async (data, ack) => {
        const Ok = await SocketAuth.Reauth(socket, data && data.token);
        if (typeof ack === 'function') ack({ Ok });
        if (!Ok) socket.disconnect(true);
      });

      socket.on('disconnect', () => {
        SocketAuth.ClearExpiry(socket);
      });
    });
  }

  /**
   * Deliver to every listed member's personal room.
   *
   * Members must come from the database (ChatHelper.GetRoomMembers), never from
   * a client payload.
   */
  static EmitToMembers(Members, Event, Payload) {
    if (!this.io || !Members) return;
    Members.forEach((M) => {
      this.io.to(SocketAuth.PersonalRoom(M)).emit(Event, Payload);
    });
  }

  /**
   * Deliver to everyone currently viewing one conversation.
   */
  static EmitToRoom(ChatRoomId, Event, Payload) {
    if (!this.io || !ChatRoomId) return;
    this.io.to(SocketAuth.ConversationRoom(ChatRoomId)).emit(Event, Payload);
  }
}

module.exports = ChatSocket;
