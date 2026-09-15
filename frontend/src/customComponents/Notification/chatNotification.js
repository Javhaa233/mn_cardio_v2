import Helper from "helper";

/**
 * Chat messages land in the bell as ONE row per room (LinkObjectName
 * 'ChatRoom', LinkObjectId = ChatRoomId) - see NotifyMembersInBell in the
 * backend ChatController. They have no Url: the chat is a dock, not a route, so
 * every notification list opens them through the chat context instead.
 */
export const CHAT_NOTIFICATION_LINK = "ChatRoom";

export function IsChatNotification(item) {
  return !!item && item.LinkObjectName === CHAT_NOTIFICATION_LINK;
}

/**
 * Mark seen and open the room in the dock. Opening the room also calls
 * MarkRead, which marks the row seen server-side; the explicit Seen covers a
 * room that fails to open (left the group, deleted).
 */
export function OpenChatNotification(chat, item, done) {
  Helper.NotificationHelper.Seen(item, () => done && done());
  const ChatRoomId = parseInt(item.LinkObjectId, 10);
  if (!chat || !ChatRoomId) return;
  chat.setIsOpen(true);
  chat.OpenRoom(ChatRoomId);
}
