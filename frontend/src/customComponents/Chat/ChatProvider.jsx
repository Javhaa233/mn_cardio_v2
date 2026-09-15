import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Helper from "helper";
import { PlayNotificationSound } from "helper/NotificationSound";
import { ChatContext } from "customComponents/Chat/ChatContext";
import {
  mergeMany,
  mergeMessage,
  newClientMsgId,
  normalizePage,
} from "customComponents/Chat/chatUtils";

const PAGE_SIZE = 30;

/**
 * Is this message/event authored by me?
 *
 * A participant is only an identity as the PAIR (UserType, UserId) - staff and
 * patient ids both start at 1 in their own tables and collide. `Me` comes from
 * the server (GetChatRoomList's Option.Me); it is never derived in the browser.
 */
function isMine(Me, row) {
  if (!Me || !row) return false;
  return (
    Me.UserType === row.UserType && String(Me.UserId) === String(row.UserId)
  );
}

/**
 * All chat state, mounted once per layout.
 *
 * Why a provider rather than state inside Chat.jsx: the unread badge has to keep
 * counting while the panel is closed, and anything else that can start a
 * conversation (UserProfile's "Чат бичих") needs to open the dock on a specific
 * room. ChatSocketHelper being a module singleton prevents two sockets, but not
 * two divergent message caches - one provider prevents both.
 *
 * REMOVED HERE, deliberately: the CHAT_CACHE_V1 localStorage cache. It kept
 * optimistic rows stamped Status:"sent" for messages that were never sent (the
 * send endpoint did not exist), so a reload showed a doctor a delivered-looking
 * message that did not exist. It was also unbounded clinical text in
 * localStorage, unencrypted, surviving logout on shared ward workstations, and
 * nothing cleared it. Its only benefit - instant paint when reopening a room -
 * is bought properly by messagesByRoom living here for the session.
 */
export default function ChatProvider({ children }) {
  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const MyUserId = LogedUser ? LogedUser.Id : null;

  const [isOpen, setIsOpen] = useState(false);
  // The caller's chat identity {UserType, UserId}, as the SERVER sees it.
  //
  // Never derived here. For a doctor it equals LogedUser.Id, but for a patient
  // the server keys on Patient.id_data while the browser's LogedUser holds the
  // PatientUsers row - so guessing gets every patient's "is this mine?" wrong.
  const [me, setMe] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreByRoom, setHasMoreByRoom] = useState({});
  const [typingByRoom, setTypingByRoom] = useState({});
  // The most recent incoming message worth announcing, or null.
  const [toast, setToast] = useState(null);
  // Live socket state. A doctor who does not know the stream is down assumes
  // silence means "nobody has replied" - which in a clinical conversation is
  // the most dangerous thing this component can imply.
  const [connected, setConnected] = useState(false);
  // Half-typed messages, per room, so switching conversations does not discard
  // them. Same instinct as the draft autosave CLAUDE.md §6 requires of the long
  // clinical forms, at a fraction of the cost.
  const [draftsByRoom, setDraftsByRoom] = useState({});
  // Upload percentage per in-flight message, keyed by ClientMsgId.
  const [uploadProgress, setUploadProgress] = useState({});

  // Read inside socket callbacks, which close over their first render.
  const activeRoomIdRef = useRef(null);
  activeRoomIdRef.current = activeRoomId;
  const meRef = useRef(null);
  // Retry is declared before Send; a ref breaks the ordering dependency without
  // making either callback depend on the other's identity.
  const sendRef = useRef(null);
  // The socket handler is registered once and closes over its first render, so
  // anything it reads at event time has to come through a ref.
  const isOpenRef = useRef(false);
  const OpenRoomRef = useRef(() => {});
  meRef.current = me;
  isOpenRef.current = isOpen;

  /**
   * The browser knows the network dropped immediately; socket.io only finds out
   * via its heartbeat (25s ping + 20s timeout), so on its own it can leave a
   * doctor believing they are connected for the better part of a minute. These
   * two events close that window; the socket's own connect/disconnect still
   * covers the case where the network is fine but the server is not.
   */
  useEffect(() => {
    const goOffline = () => setConnected(false);
    const goOnline = () => setConnected(Helper.ChatSocketHelper.IsConnected());
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  /* ----------------------------------------------------------------- *
   * One-time cleanup of the retired cache
   * ----------------------------------------------------------------- */
  useEffect(() => {
    try {
      localStorage.removeItem("CHAT_CACHE_V1");
    } catch (ex) {
      // Private window or blocked site data - nothing to clean up.
    }
  }, []);

  /* ----------------------------------------------------------------- *
   * Rooms
   * ----------------------------------------------------------------- */

  const LoadRooms = useCallback(() => {
    if (!MyUserId) return;
    setRoomsLoading(true);
    Helper.ChatHelper.GetChatRoomList((res) => {
      setRoomsLoading(false);
      if (!res || !res.Success) return;
      setRooms(Array.isArray(res.Data) ? res.Data : []);
      if (res.Option && res.Option.Me) setMe(res.Option.Me);
    });
  }, [MyUserId]);

  useEffect(() => {
    LoadRooms();
  }, [LoadRooms]);

  /**
   * Room-list refresh for socket traffic.
   *
   * A busy conversation used to trigger one full GetChatRoomList per arriving
   * message - a query with two OUTER APPLYs per room plus an identity resolve,
   * for a sidebar the reader may not even be looking at. Coalescing a burst
   * into one refresh keeps the ordering and unread counts honest without
   * hammering the server.
   */
  const roomsTimer = useRef(null);
  const LoadRoomsSoon = useCallback(() => {
    if (roomsTimer.current) clearTimeout(roomsTimer.current);
    roomsTimer.current = setTimeout(() => {
      roomsTimer.current = null;
      LoadRooms();
    }, 600);
  }, [LoadRooms]);

  useEffect(
    () => () => {
      if (roomsTimer.current) clearTimeout(roomsTimer.current);
    },
    [],
  );

  /* ----------------------------------------------------------------- *
   * Messages
   * ----------------------------------------------------------------- */

  const LoadMessages = useCallback((ChatRoomId) => {
    if (!ChatRoomId) return;
    setMessagesLoading(true);
    Helper.ChatHelper.GetMessages(
      { ChatRoomId, PageSize: PAGE_SIZE },
      (res) => {
        setMessagesLoading(false);
        if (!res || !res.Success) return;

        const page = normalizePage(res.Data);
        setMessagesByRoom((prev) => ({ ...prev, [ChatRoomId]: page }));
        setHasMoreByRoom((prev) => ({
          ...prev,
          [ChatRoomId]: (res.Option && res.Option.Total) > page.length,
        }));
      },
    );
  }, []);

  /**
   * Older messages, by keyset rather than page number: BeforeId is stable while
   * new messages arrive at the other end, which an OFFSET is not.
   */
  const LoadOlder = useCallback(
    (ChatRoomId) => {
      if (!ChatRoomId || loadingOlder) return;
      const current = messagesByRoom[ChatRoomId] || [];
      const oldest = current.find((m) => m.Id);
      if (!oldest) return;

      setLoadingOlder(true);
      Helper.ChatHelper.GetMessages(
        { ChatRoomId, PageSize: PAGE_SIZE, BeforeId: oldest.Id },
        (res) => {
          setLoadingOlder(false);
          if (!res || !res.Success) return;

          const page = normalizePage(res.Data);
          if (page.length === 0) {
            setHasMoreByRoom((prev) => ({ ...prev, [ChatRoomId]: false }));
            return;
          }
          setMessagesByRoom((prev) => ({
            ...prev,
            [ChatRoomId]: mergeMany(prev[ChatRoomId] || [], page),
          }));
          setHasMoreByRoom((prev) => ({
            ...prev,
            [ChatRoomId]: page.length >= PAGE_SIZE,
          }));
        },
      );
    },
    [loadingOlder, messagesByRoom],
  );

  const OpenRoom = useCallback(
    (ChatRoomId) => {
      if (!ChatRoomId) return;
      setActiveRoomId(ChatRoomId);
      Helper.ChatSocketHelper.JoinRoom(ChatRoomId);
      LoadMessages(ChatRoomId);
    },
    [LoadMessages],
  );

  /**
   * Resend a message that failed.
   *
   * Drops the failed row and sends its content again under a fresh ClientMsgId,
   * rather than mutating the old one - the failed send may still be in flight,
   * and reusing the id would let a late response resurrect it.
   */
  const Retry = useCallback((msg) => {
    if (!msg || !msg.ChatRoomId) return;
    setMessagesByRoom((prev) => ({
      ...prev,
      [msg.ChatRoomId]: (prev[msg.ChatRoomId] || []).filter(
        (m) => m.ClientMsgId !== msg.ClientMsgId,
      ),
    }));
    sendRef.current({
      ChatRoomId: msg.ChatRoomId,
      MessageText: msg.MessageText,
      Files: msg.PendingFiles || [],
    });
  }, []);

  OpenRoomRef.current = OpenRoom;

  /**
   * Open the conversation a notification came from, and dismiss it.
   */
  const OpenFromToast = useCallback(() => {
    setToast((t) => {
      if (t) {
        setIsOpen(true);
        OpenRoomRef.current(t.ChatRoomId);
      }
      return null;
    });
  }, []);

  const DismissToast = useCallback(() => setToast(null), []);

  /** Remember a half-typed message against its room. */
  const SetDraft = useCallback((ChatRoomId, text) => {
    if (!ChatRoomId) return;
    setDraftsByRoom((prev) => {
      if ((prev[ChatRoomId] || "") === text) return prev;
      return { ...prev, [ChatRoomId]: text };
    });
  }, []);

  /**
   * Ask for OS notification permission.
   *
   * Called from a user gesture (opening the chat dock), never on page load -
   * a permission prompt that appears unprompted the moment an EMR loads is the
   * kind of thing people deny once and never revisit.
   */
  const RequestNotifyPermission = useCallback(() => {
    try {
      if (typeof window.Notification === "undefined") return;
      if (window.Notification.permission === "default")
        window.Notification.requestPermission();
    } catch (ex) {
      // Unsupported or insecure context - the in-app toast still works.
    }
  }, []);

  /** Used by the narrow-viewport back arrow, which returns to the room list. */
  const CloseRoom = useCallback(() => {
    setActiveRoomId((prev) => {
      if (prev) Helper.ChatSocketHelper.LeaveRoom(prev);
      return null;
    });
  }, []);

  /* ----------------------------------------------------------------- *
   * Sending
   * ----------------------------------------------------------------- */

  const applyToRoom = useCallback((ChatRoomId, msg) => {
    setMessagesByRoom((prev) => ({
      ...prev,
      [ChatRoomId]: mergeMessage(prev[ChatRoomId] || [], msg),
    }));
  }, []);

  /**
   * HTTP is the write path. The socket only echoes what is already committed.
   *
   * Files are a two-step: the message row must exist before File rows can point
   * at it (they are keyed by LinkedObjectId), so the carrier row is created
   * Status='P', the upload attaches to its Id, and CommitMessage then promotes
   * it and fans it out. Until commit, nobody but the author can see it - which
   * is what stops a recipient seeing an empty bubble a second before the image.
   */
  const Send = useCallback(
    ({ ChatRoomId, MessageText, Files }) => {
      if (!ChatRoomId || !MyUserId) return;

      const text = (MessageText || "").trim();
      const files = Files || [];
      if (!text && files.length === 0) return;

      const ClientMsgId = newClientMsgId(MyUserId);
      const optimistic = {
        // Id stays null. The old code put "tmp_..." here and then de-duplicated
        // on Id, which is why that de-duplication could never fire.
        Id: null,
        ClientMsgId,
        ChatRoomId,
        // From the server's own answer, not guessed - a patient's chat UserId is
        // Patient.id_data, which is not LogedUser.Id. Getting this wrong would
        // break run-grouping on every patient's own messages.
        UserId: me ? me.UserId : MyUserId,
        UserType: me ? me.UserType : "S",
        MessageText: text,
        CreateDate: new Date().toISOString(),
        Status: "sending",
        IsMine: true,
        AttachmentCount: files.length,
        PendingFiles: files,
      };
      applyToRoom(ChatRoomId, optimistic);
      // The draft has become a real message; stop remembering it.
      setDraftsByRoom((prev) => {
        if (!(ChatRoomId in prev)) return prev;
        const next = { ...prev };
        delete next[ChatRoomId];
        return next;
      });

      Helper.ChatHelper.SendMessage(
        {
          ChatRoomId,
          MessageText: text,
          ClientMsgId,
          HasAttachment: files.length > 0,
        },
        (res) => {
          if (!res || !res.Success || !res.Data) {
            // Keep the row and mark it failed. Never silently drop a message a
            // doctor believes they sent.
            applyToRoom(ChatRoomId, { ClientMsgId, Status: "failed" });
            return;
          }

          const saved = { ...res.Data, ClientMsgId, IsMine: true };

          if (files.length === 0) {
            applyToRoom(ChatRoomId, saved);
            LoadRooms();
            return;
          }

          // Keep showing the local previews while the bytes upload.
          applyToRoom(ChatRoomId, {
            ...saved,
            Status: "sending",
            PendingFiles: files,
          });

          Helper.BaseCrudHelper.BaseUploadFile(
            {
              Value: files,
              LinkedObjectInfo: {
                LinkedObjectName: "ChatMessages",
                LinkedObjectId: saved.Id,
                FieldName: "Attachment",
              },
            },
            (up) => {
              setUploadProgress((prev) => {
                const next = { ...prev };
                delete next[ClientMsgId];
                return next;
              });
              if (!up || !up.Success) {
                applyToRoom(ChatRoomId, {
                  ClientMsgId,
                  Id: saved.Id,
                  Status: "failed",
                });
                return;
              }
              Helper.ChatHelper.CommitMessage(
                { MessageId: saved.Id, ClientMsgId },
                (done) => {
                  if (done && done.Success && done.Data) {
                    applyToRoom(ChatRoomId, {
                      ...done.Data,
                      ClientMsgId,
                      IsMine: true,
                      PendingFiles: null,
                    });
                    LoadRooms();
                  } else {
                    applyToRoom(ChatRoomId, { ClientMsgId, Status: "failed" });
                  }
                },
              );
            },
            // Real percentage, not a spinner. A chest X-ray or a .dcm can be
            // tens of megabytes over an aimag connection, and "is this moving
            // or has it hung?" is the only question the sender has.
            (percent) =>
              setUploadProgress((prev) => ({
                ...prev,
                [ClientMsgId]: percent,
              })),
          );
        },
      );
    },
    [MyUserId, me, applyToRoom, LoadRooms],
  );

  // Retry, declared above, reaches Send through this.
  sendRef.current = Send;

  /* ----------------------------------------------------------------- *
   * Read state
   * ----------------------------------------------------------------- */

  const MarkRead = useCallback((ChatRoomId, LastMessageId) => {
    if (!ChatRoomId) return;
    Helper.ChatHelper.MarkRead({ ChatRoomId, LastMessageId }, (res) => {
      if (!res || !res.Success) return;
      setRooms((prev) =>
        prev.map((r) =>
          r.ChatRoomId === ChatRoomId ? { ...r, UnreadCount: 0 } : r,
        ),
      );
    });
  }, []);

  /* ----------------------------------------------------------------- *
   * Starting a conversation
   * ----------------------------------------------------------------- */

  const StartChat = useCallback(
    ({ UserId, UserType }, done) => {
      Helper.ChatHelper.StartChat({ UserId, UserType }, (res) => {
        if (res && res.Success && res.Data && res.Data.ChatRoomId) {
          const id = res.Data.ChatRoomId;
          LoadRooms();
          setIsOpen(true);
          OpenRoom(id);
          done && done(true, id);
        } else {
          done && done(false, null, res && res.Message);
        }
      });
    },
    [LoadRooms, OpenRoom],
  );

  /* ----------------------------------------------------------------- *
   * Socket
   * ----------------------------------------------------------------- */

  useEffect(() => {
    if (!MyUserId) return undefined;

    Helper.ChatSocketHelper.Connect();
    setConnected(Helper.ChatSocketHelper.IsConnected());

    const offUp = Helper.ChatSocketHelper.On("connect", () =>
      setConnected(true),
    );
    const offDown = Helper.ChatSocketHelper.On("disconnect", () =>
      setConnected(false),
    );
    const offFail = Helper.ChatSocketHelper.On("connect_error", () =>
      setConnected(false),
    );

    const offNew = Helper.ChatSocketHelper.On("newMessage", (msg) => {
      if (!msg || !msg.ChatRoomId) return;

      const mine = isMine(meRef.current, msg);

      setMessagesByRoom((prev) => {
        // Only merge into a room we already hold, or the active one. Otherwise
        // a busy room we have never opened would accumulate messages in memory
        // that nobody is looking at.
        if (
          !prev[msg.ChatRoomId] &&
          msg.ChatRoomId !== activeRoomIdRef.current
        ) {
          return prev;
        }
        return {
          ...prev,
          [msg.ChatRoomId]: mergeMessage(prev[msg.ChatRoomId] || [], {
            ...msg,
            IsMine: mine,
          }),
        };
      });

      // Refresh the sidebar so ordering, preview and unread stay honest -
      // coalesced, so a burst of messages is one refresh, not one each.
      LoadRoomsSoon();

      // Announce it, unless the reader is demonstrably already looking at this
      // very conversation. A doctor is usually deep in a clinical form when a
      // colleague messages them; the dock badge is bottom-right and easy to
      // miss entirely.
      if (mine) return;
      const watchingThisRoom =
        isOpenRef.current &&
        activeRoomIdRef.current === msg.ChatRoomId &&
        typeof document !== "undefined" &&
        document.visibilityState === "visible";
      if (watchingThisRoom) return;

      // The chime for chat lives here, not in the bell, because only this
      // handler knows whether the reader is already looking at the room. The
      // bell stays silent for its ChatRoom rows so nobody hears it twice.
      PlayNotificationSound();

      setToast({
        Key: msg.Id || Date.now(),
        ChatRoomId: msg.ChatRoomId,
        SenderName: msg.SenderName || "",
        Text: msg.MessageText || "",
        HasFiles: (msg.AttachmentCount || 0) > 0,
      });

      // A background tab cannot show an in-app toast, so use the OS one there -
      // and only there, so a focused user never gets two notifications for one
      // message.
      try {
        if (
          typeof window.Notification !== "undefined" &&
          window.Notification.permission === "granted" &&
          document.visibilityState !== "visible"
        ) {
          const n = new window.Notification(msg.SenderName || "MnCardio", {
            body: msg.MessageText || "Хавсралт",
            // Same tag per room: a burst of messages replaces itself rather
            // than stacking one banner per message.
            tag: "chat-" + msg.ChatRoomId,
          });
          n.onclick = () => {
            window.focus();
            setIsOpen(true);
            OpenRoomRef.current(msg.ChatRoomId);
            n.close();
          };
        }
      } catch (ex) {
        // Notification can throw in insecure contexts and some embedded views.
      }
    });

    const offRead = Helper.ChatSocketHelper.On("messageRead", (evt) => {
      if (!evt || !evt.ChatRoomId) return;
      // My own read receipt tells me nothing - it is the OTHER side reading
      // that promotes my ticks.
      if (isMine(meRef.current, evt)) return;

      // The other side read up to LastReadMessageId - promote my ticks.
      setMessagesByRoom((prev) => {
        const list = prev[evt.ChatRoomId];
        if (!list) return prev;
        return {
          ...prev,
          [evt.ChatRoomId]: list.map((m) =>
            m.IsMine && m.Id && m.Id <= evt.LastReadMessageId
              ? { ...m, Status: "read" }
              : m,
          ),
        };
      });
    });

    const offTyping = Helper.ChatSocketHelper.On("typing", (evt) => {
      if (!evt || !evt.ChatRoomId) return;
      setTypingByRoom((prev) => ({
        ...prev,
        [evt.ChatRoomId]: !!evt.IsTyping,
      }));
    });

    return () => {
      offUp();
      offDown();
      offFail();
      offNew();
      offRead();
      offTyping();
    };
  }, [MyUserId, LoadRooms, LoadRoomsSoon]);

  /* ----------------------------------------------------------------- *
   * Resync on reconnect
   * ----------------------------------------------------------------- */
  useEffect(() => {
    if (!MyUserId) return undefined;

    // socket.io handles the backoff; this is what to do once it is back.
    const off = Helper.ChatSocketHelper.On("connect", () => {
      LoadRooms();
      const id = activeRoomIdRef.current;
      if (id) {
        Helper.ChatSocketHelper.JoinRoom(id);
        LoadMessages(id);
      }
    });
    return off;
  }, [MyUserId, LoadRooms, LoadMessages]);

  const unreadTotal = useMemo(
    () => rooms.reduce((n, r) => n + (r.UnreadCount || 0), 0),
    [rooms],
  );

  const activeRoom = useMemo(
    () => rooms.find((r) => r.ChatRoomId === activeRoomId) || null,
    [rooms, activeRoomId],
  );

  /**
   * Unread count in the tab title.
   *
   * The dock badge is invisible when the browser tab is in the background,
   * which is most of the time - MnCardio is one tab among many on a ward
   * machine. This is the only unread signal that survives that.
   */
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${base}` : base;
    return () => {
      document.title = document.title.replace(/^\(\d+\)\s*/, "");
    };
  }, [unreadTotal]);

  const value = useMemo(
    () => ({
      LogedUser,
      me,
      MyUserId,
      isOpen,
      setIsOpen,
      rooms,
      roomsLoading,
      activeRoomId,
      activeRoom,
      messages: messagesByRoom[activeRoomId] || [],
      messagesLoading,
      loadingOlder,
      hasMore: !!hasMoreByRoom[activeRoomId],
      isTypingRemote: !!typingByRoom[activeRoomId],
      unreadTotal,
      OpenRoom,
      CloseRoom,
      toast,
      OpenFromToast,
      DismissToast,
      RequestNotifyPermission,
      connected,
      draft: draftsByRoom[activeRoomId] || "",
      SetDraft,
      uploadProgress,
      LoadRooms,
      LoadOlder,
      Send,
      Retry,
      MarkRead,
      StartChat,
    }),
    [
      LogedUser,
      me,
      MyUserId,
      isOpen,
      rooms,
      roomsLoading,
      activeRoomId,
      activeRoom,
      messagesByRoom,
      messagesLoading,
      loadingOlder,
      hasMoreByRoom,
      typingByRoom,
      unreadTotal,
      OpenRoom,
      CloseRoom,
      toast,
      OpenFromToast,
      DismissToast,
      RequestNotifyPermission,
      connected,
      draftsByRoom,
      SetDraft,
      uploadProgress,
      LoadRooms,
      LoadOlder,
      Send,
      Retry,
      MarkRead,
      StartChat,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
