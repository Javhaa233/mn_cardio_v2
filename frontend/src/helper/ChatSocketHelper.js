import { io } from "socket.io-client";

/**
 * The app's real-time connections: chat (default export) and the notification
 * bell (named export NotificationSocket). Same class, different socket.io path.
 *
 * This is the ONLY file in the app that imports socket.io-client - the same
 * containment rule CLAUDE.md applies to axios in config/Server.js. If a second
 * file needs live events, it subscribes through On() rather than opening its own
 * socket.
 *
 * The socket is READ-ONLY. Messages are sent over HTTP
 * (/Chat/SendMessage), because a socket emit has no response: the client could
 * never learn a message's Id or CreateDate, so an optimistic bubble could never
 * leave "sending", and a dropped socket would lose the message outright. The
 * socket only delivers rows the server has already committed.
 *
 * Connected same-origin with no host, so dev goes through the Vite proxy and
 * production through the reverse proxy - exactly as config/Server.js does with
 * baseURL = "/api".
 */

const SOCKET_PATH = "/chatmessage";
const NOTIFICATION_SOCKET_PATH = "/notification";

function ChatSocketHelper(Path) {
  this.path = Path || SOCKET_PATH;
  this.socket = null;
  // event name -> Set<handler>. A local registry so several components can
  // subscribe to one connection, and so we attach exactly one listener per
  // event to the socket itself.
  this.handlers = new Map();
  this.bound = new Set();
}

ChatSocketHelper.prototype.GetToken = function () {
  try {
    return localStorage.getItem("MnCardioToken");
  } catch (ex) {
    // Private windows and locked-down browsers throw on access.
    return null;
  }
};

ChatSocketHelper.prototype.IsConnected = function () {
  return !!(this.socket && this.socket.connected);
};

ChatSocketHelper.prototype.Connect = function () {
  if (this.socket) return this.socket;

  const token = this.GetToken();
  if (!token) return null;

  this.socket = io({
    path: this.path,
    // The server reads this in its handshake middleware. Never a query-string
    // token - that lands in nginx access logs.
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    // Polling first, then upgrade. Forcing websocket-only breaks behind proxies
    // that do not pass the upgrade through.
    transports: ["polling", "websocket"],
  });

  // The server drops the socket when the JWT expires. A full document load is
  // the app's existing answer to an expired session (config/Server.js does
  // window.location.assign on 401), so do not try to be cleverer here.
  this.socket.on("authExpired", () => {
    this.Disconnect();
  });

  // Re-attach every handler that was registered before the socket existed.
  this.handlers.forEach((_set, Event) => this.BindEvent(Event));

  return this.socket;
};

ChatSocketHelper.prototype.Disconnect = function () {
  if (!this.socket) return;
  try {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  } catch (ex) {
    // Already gone.
  }
  this.socket = null;
  this.bound.clear();
};

ChatSocketHelper.prototype.BindEvent = function (Event) {
  if (!this.socket || this.bound.has(Event)) return;
  this.bound.add(Event);
  this.socket.on(Event, (payload) => {
    const set = this.handlers.get(Event);
    if (!set) return;
    set.forEach((fn) => {
      try {
        fn(payload);
      } catch (ex) {
        console.error("ChatSocketHelper handler error", Event, ex);
      }
    });
  });
};

/**
 * Subscribe. Returns an unsubscribe function - call it from the effect cleanup.
 */
ChatSocketHelper.prototype.On = function (Event, handler) {
  if (!this.handlers.has(Event)) this.handlers.set(Event, new Set());
  this.handlers.get(Event).add(handler);
  this.BindEvent(Event);

  return () => {
    const set = this.handlers.get(Event);
    if (set) set.delete(handler);
  };
};

ChatSocketHelper.prototype.JoinRoom = function (ChatRoomId) {
  if (!this.socket || !ChatRoomId) return;
  this.socket.emit("joinRoom", { ChatRoomId });
};

ChatSocketHelper.prototype.LeaveRoom = function (ChatRoomId) {
  if (!this.socket || !ChatRoomId) return;
  this.socket.emit("leaveRoom", { ChatRoomId });
};

ChatSocketHelper.prototype.EmitTyping = function (ChatRoomId, IsTyping) {
  if (!this.socket || !ChatRoomId) return;
  this.socket.emit("typing", { ChatRoomId, IsTyping: !!IsTyping });
};

/** The bell's connection. The server emits `newNotification` with a row Id. */
export const NotificationSocket = new ChatSocketHelper(
  NOTIFICATION_SOCKET_PATH,
);

export default new ChatSocketHelper(SOCKET_PATH);
