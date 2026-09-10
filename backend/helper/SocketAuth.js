const jwt = require('jsonwebtoken');

const Auth = require('./Auth');
const ChatIdentity = require('./ChatIdentity');

/**
 * Socket.IO handshake authentication, shared by ChatSocket and
 * NotificationSocket.
 *
 * WHAT THIS REPLACED. Both sockets used to trust a client-emitted
 * `setUser({UserId})`:
 *
 *     socket.on('setUser', (data) => {
 *       if (data.UserId) this.sockets.push({ UserId: data.UserId, ... });
 *     });
 *
 * The client asserted its own identity. Anyone who could reach the port could
 * register as any user id and receive that user's messages and notifications -
 * and, in ChatSocket's case, persist messages authored by them. There was no
 * token anywhere in the socket path.
 *
 * Now identity comes from the JWT, exactly as it does over HTTP, and `setUser`
 * is gone.
 *
 * DELIBERATE ASYMMETRY WITH HTTP, DO NOT "FIX" IT: Auth.getUserData always calls
 * jwt.verify, whereas Auth.verifyToken falls back to jwt.decode() when
 * NODE_ENV === 'development' (helper/Auth.js:227-237). The socket is therefore
 * STRICTER than HTTP in dev. That is the correct direction to be wrong in.
 */

const TokenFromHandshake = (socket) => {
  const Handshake = socket.handshake || {};

  // Preferred: socket.io's own auth payload.
  if (Handshake.auth && Handshake.auth.token) return String(Handshake.auth.token);

  // Fallback for a native client that can only set headers.
  const Header = Handshake.headers && Handshake.headers['authorization'];
  if (Header) {
    const Parts = String(Header).split(' ');
    return Parts.length > 1 ? Parts[1] : Parts[0];
  }

  // Deliberately NOT the query string: a token there lands in nginx access logs
  // and in any proxy in between.
  return null;
};

class SocketAuth {
  /**
   * io.use(...) middleware. Rejects the connection outright rather than letting
   * an unauthenticated socket linger.
   */
  Handshake = async (socket, next) => {
    try {
      const Token = TokenFromHandshake(socket);
      if (!Token) return next(new Error('UNAUTHORIZED'));

      const Session = await new Promise((resolve) => Auth.getUserData(Token, resolve));
      if (!Session || !Session.user) return next(new Error('UNAUTHORIZED'));

      const Me = ChatIdentity.Me(Session.user);
      if (!Me) return next(new Error('IDENTITY_UNRESOLVED'));

      socket.data.LogedUser = Session.user;
      socket.data.Me = Me;
      socket.data.Rooms = new Set();

      // Socket.IO does not re-run io.use on an established connection, so
      // without this a socket authenticated with a 10-hour token would outlive
      // the token indefinitely.
      const Decoded = jwt.decode(Token);
      socket.data.ExpiresAt = Decoded && Decoded.exp ? Decoded.exp * 1000 : null;

      return next();
    } catch (ex) {
      console.log('SocketAuth.Handshake error:', ex.message);
      return next(new Error('UNAUTHORIZED'));
    }
  };

  /**
   * Personal room name. Every device a person is signed in on joins this, so a
   * fan-out reaches all of them and none of anyone else's.
   */
  PersonalRoom = (Me) => 'u:' + Me.UserType + ':' + Me.UserId;

  ConversationRoom = (ChatRoomId) => 'r:' + ChatRoomId;

  /**
   * Disconnect the socket when its token expires, and allow a client that has
   * silently refreshed its JWT to stay connected.
   *
   * Wire both the timer and a 'reauth' handler from the socket's connection
   * handler.
   */
  ArmExpiry = (socket) => {
    this.ClearExpiry(socket);
    if (!socket.data.ExpiresAt) return;

    const Delay = socket.data.ExpiresAt - Date.now();
    if (Delay <= 0) {
      socket.emit('authExpired');
      return socket.disconnect(true);
    }

    socket.data.ExpiryTimer = setTimeout(() => {
      socket.emit('authExpired');
      socket.disconnect(true);
      // Node would otherwise hold the process open for a 10-hour timer.
    }, Delay);
    if (socket.data.ExpiryTimer.unref) socket.data.ExpiryTimer.unref();
  };

  ClearExpiry = (socket) => {
    if (socket.data && socket.data.ExpiryTimer) {
      clearTimeout(socket.data.ExpiryTimer);
      socket.data.ExpiryTimer = null;
    }
  };

  /**
   * Re-validate a refreshed token on a live socket. Returns true on success.
   *
   * Refuses to switch the socket to a DIFFERENT person - that would silently
   * hand one user's open subscriptions to another.
   */
  Reauth = async (socket, Token) => {
    if (!Token) return false;

    const Session = await new Promise((resolve) => Auth.getUserData(String(Token), resolve));
    if (!Session || !Session.user) return false;

    const Me = ChatIdentity.Me(Session.user);
    if (!Me) return false;
    if (!ChatIdentity.Same(Me, socket.data.Me)) return false;

    socket.data.LogedUser = Session.user;
    const Decoded = jwt.decode(String(Token));
    socket.data.ExpiresAt = Decoded && Decoded.exp ? Decoded.exp * 1000 : null;
    this.ArmExpiry(socket);

    return true;
  };
}

module.exports = new SocketAuth();
