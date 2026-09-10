const socket = require('socket.io');

const SocketAuth = require('../helper/SocketAuth');
const { originCallback } = require('../config/CorsOrigin');

/**
 * Notification real-time transport.
 *
 * Had the identical hole ChatSocket did: `setUser` let a client assert its own
 * UserId, so emitting `{UserId: 7}` subscribed you to user 7's notifications.
 * There was no token in the socket path at all. Identity now comes from the JWT
 * handshake and `setUser` is gone.
 *
 * The module-level `sockets` array is replaced by socket.io rooms - see the
 * single-process caveat in WebSockets/ChatSocket.js, which applies here too.
 */
class NotificationSocket {
  static io;

  /**
   * UserType defaults to 'S' because every caller today
   * (helper/NotificationHelper.js:19, from AdviceController) notifies a staff
   * account. Patients get a UserType explicitly.
   */
  static SendNotification = ({ UserId, Data, UserType }) => {
    if (!this.io || !UserId || !Data) return;
    const Room = SocketAuth.PersonalRoom({ UserType: UserType || 'S', UserId });
    this.io.to(Room).emit('newNotification', Data);
  };

  static SetServer(server) {
    this.io = socket(server, {
      path: '/notification',
      // Socket.IO v4 does not inherit Express's cors() - see config/CorsOrigin.js.
      cors: {
        origin: originCallback,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      maxHttpBufferSize: 1e5,
    });

    this.io.use(SocketAuth.Handshake);

    this.io.on('connection', (socket) => {
      // Joined from the verified session, not from anything the client sends.
      socket.join(SocketAuth.PersonalRoom(socket.data.Me));
      SocketAuth.ArmExpiry(socket);

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
}

module.exports = NotificationSocket;
