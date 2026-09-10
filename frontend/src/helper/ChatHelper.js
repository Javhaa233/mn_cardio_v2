import Helper from "helper";

/**
 * Chat API layer.
 *
 * Callback-style, matching every other helper in this directory
 * (BaseCrudHelper.CallService(Url, ReqData, callback)).
 *
 * Two things changed shape and both matter:
 *
 * 1. `SendMessage` used to POST /Chat/SendMessage, which did not exist in the
 *    backend. CallService swallowed the 404, Chat.jsx returned the message
 *    anyway, and the UI painted a delivered tick on something that was never
 *    saved. That endpoint now exists and is the authoritative write path.
 *
 * 2. Every call that names a person sends {UserType, UserId}, never a bare id.
 *    Patients live in PatientUsers and staff in Users, and both are IDENTITY
 *    columns starting at 1, so a bare id is ambiguous - doctor #5 and patient #5
 *    are indistinguishable without the type.
 *
 * AddChatRoom / CheckChatRoom are gone. StartChat is idempotent: it returns the
 * existing room or creates one, so there is no check-then-create round trip and
 * no race that produces two rooms.
 */

function ChatHelper() {}

const Call = (Url, ReqData, callback) =>
  Helper.BaseCrudHelper.CallService(
    Url,
    ReqData,
    (resData) => callback && callback(resData),
  );

ChatHelper.prototype.GetChatRoomList = async (callback) => {
  // No UserId in the body: the server takes identity from the token and ignores
  // anything the client claims.
  await Call("/Chat/GetChatRoomList", {}, callback);
};

ChatHelper.prototype.GetMessages = async (
  { ChatRoomId, PageSize, PageNumber, BeforeId },
  callback,
) => {
  await Call(
    "/Chat/GetMessages",
    { ChatRoomId, PageSize, PageNumber, BeforeId },
    callback,
  );
};

ChatHelper.prototype.SendMessage = async (
  { ChatRoomId, MessageText, ClientMsgId, HasAttachment },
  callback,
) => {
  await Call(
    "/Chat/SendMessage",
    { ChatRoomId, MessageText, ClientMsgId, HasAttachment: !!HasAttachment },
    callback,
  );
};

/**
 * Promote an attachment message to sent, once its files are uploaded. Until
 * this succeeds the message is visible to its author alone.
 */
ChatHelper.prototype.CommitMessage = async (
  { MessageId, ClientMsgId },
  callback,
) => {
  await Call("/Chat/CommitMessage", { MessageId, ClientMsgId }, callback);
};

ChatHelper.prototype.MarkRead = async (
  { ChatRoomId, LastMessageId },
  callback,
) => {
  await Call("/Chat/MarkRead", { ChatRoomId, LastMessageId }, callback);
};

ChatHelper.prototype.GetUnreadCount = async (callback) => {
  await Call("/Chat/GetUnreadCount", {}, callback);
};

/**
 * Idempotent. Returns { ChatRoomId, Created }.
 */
ChatHelper.prototype.StartChat = async ({ UserId, UserType }, callback) => {
  await Call(
    "/Chat/StartChat",
    { UserId, UserType: UserType || "S" },
    callback,
  );
};

ChatHelper.prototype.CreateGroupRoom = async (
  { RoomName, Members },
  callback,
) => {
  await Call("/Chat/CreateGroupRoom", { RoomName, Members }, callback);
};

ChatHelper.prototype.GetChatRoomUsers = async (ChatRoomId, callback) => {
  await Call("/Chat/GetChatRoomUsers", { ChatRoomId }, callback);
};

ChatHelper.prototype.AddUserToChatRoom = async (
  { ChatRoomId, UserId, UserType },
  callback,
) => {
  await Call(
    "/Chat/AddUserToChatRoom",
    { ChatRoomId, UserId, UserType: UserType || "S" },
    callback,
  );
};

ChatHelper.prototype.RemoveUserFromChatRoom = async (
  { ChatRoomId, UserId, UserType },
  callback,
) => {
  await Call(
    "/Chat/RemoveUserFromChatRoom",
    { ChatRoomId, UserId, UserType: UserType || "S" },
    callback,
  );
};

/**
 * The people you can start a chat with.
 *
 * Nationwide for doctors. For patients the server narrows this to their own care
 * team and strips contact details from the projection - the client does not, and
 * must not, decide that.
 *
 * Accepts the envelope BaseLookUpGridLoad sends, so the app's one typeahead can
 * point straight at it.
 */
ChatHelper.prototype.SearchUsers = async (ReqData, callback) => {
  await Call("/Chat/SearchUsers", ReqData || {}, callback);
};

/**
 * The aimag / soum lists for the directory filters.
 *
 * Built from doctors who actually exist, so the dropdowns contain no dead ends,
 * and keyed by NAME - the province id and the stored name disagree on real rows,
 * so the name is the only value that means the same thing to both ends.
 */
ChatHelper.prototype.GetDirectoryFilters = async (callback) => {
  await Call("/Chat/GetDirectoryFilters", {}, callback);
};

export default new ChatHelper();
