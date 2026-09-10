import { format, isToday, isYesterday, isSameDay } from "date-fns";

/**
 * Pure helpers for the chat message list.
 *
 * Everything here is deliberately free of React and of the API layer, because
 * the ordering and de-duplication rules are the part that is easy to get subtly
 * wrong and hard to see going wrong.
 */

/* ------------------------------------------------------------------ *
 * Identity of an in-flight message
 * ------------------------------------------------------------------ */

let counter = 0;

/**
 * A client-side id for an optimistic message, echoed back by the server so the
 * real row can replace the placeholder instead of appearing beside it.
 *
 * Not crypto.randomUUID(): that requires a secure context, and this app is
 * reachable over plain HTTP in dev, where it is undefined.
 */
export function newClientMsgId(userId) {
  counter += 1;
  return `${userId || "me"}-${Date.now()}-${counter}`;
}

/* ------------------------------------------------------------------ *
 * Ordering
 * ------------------------------------------------------------------ */

/**
 * Sort key.
 *
 * Id, not CreateDate: the backend writes CreateDate with the app clock at
 * one-second resolution (ObjectHelper.getDateYMDHMS), so two messages in the
 * same second tie and the order becomes arbitrary. Id is an IDENTITY column and
 * is strictly increasing.
 *
 * A pending message has Id null and sorts last by construction, which is
 * exactly where an unsent message belongs.
 */
function sortKey(m) {
  return m && m.Id ? m.Id : Number.MAX_SAFE_INTEGER;
}

/**
 * Turn one server page into list order.
 *
 * The API returns newest-first because that is the page you want; state is
 * always OLDEST-first. Doing the flip in exactly one place is the whole point -
 * the old code fetched `Id desc`, never reversed, and then appended optimistic
 * sends to the bottom of a newest-first list, so a conversation read backwards
 * and your own new message landed at the wrong end of it.
 */
export function normalizePage(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.slice().reverse();
}

/* ------------------------------------------------------------------ *
 * Merge
 * ------------------------------------------------------------------ */

/**
 * Insert or replace one message in an oldest-first list.
 *
 * Matching order matters. The same message can arrive twice by two routes - the
 * HTTP response to our own send, and the socket fan-out - and either may land
 * first, because they are two channels from one server with no ordering between
 * them. Matching on Id first and ClientMsgId second closes the duplicate window
 * from both directions:
 *
 *   - same Id           -> the row we already have, updated (e.g. now "read")
 *   - same ClientMsgId  -> our optimistic placeholder; adopt the server's Id
 *   - neither           -> genuinely new; insert at its sorted position
 */
export function mergeMessage(list, incoming) {
  if (!incoming) return list;
  const next = Array.isArray(list) ? list.slice() : [];

  if (incoming.Id) {
    const byId = next.findIndex((m) => m.Id && m.Id === incoming.Id);
    if (byId > -1) {
      next[byId] = { ...next[byId], ...incoming };
      return next;
    }
  }

  if (incoming.ClientMsgId) {
    const byClient = next.findIndex(
      (m) => m.ClientMsgId && m.ClientMsgId === incoming.ClientMsgId,
    );
    if (byClient > -1) {
      next[byClient] = { ...next[byClient], ...incoming };
      return resort(next);
    }
  }

  next.push(incoming);
  return resort(next);
}

export function mergeMany(list, incomingList) {
  let next = Array.isArray(list) ? list : [];
  (incomingList || []).forEach((m) => {
    next = mergeMessage(next, m);
  });
  return next;
}

function resort(list) {
  return list.sort((a, b) => sortKey(a) - sortKey(b));
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

/**
 * The backend serialises dates as "YYYY-MM-DD HH:mm:ss.SSS" - a space, not the
 * "T" that ISO 8601 and Date.parse expect. Safari in particular returns Invalid
 * Date for that string, so normalise before parsing rather than trusting the
 * platform.
 */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  const d = new Date(String(value).replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * A day separator label.
 *
 * Built from numeric parts plus t(), NOT a date-fns locale: date-fns ships no
 * Mongolian locale, so format(d, "PPP") would silently render English month
 * names in a Mongolian UI.
 */
export function dayLabel(value, t) {
  const d = toDate(value);
  if (!d) return "";
  if (isToday(d)) return t("Өнөөдөр");
  if (isYesterday(d)) return t("Өчигдөр");
  return `${format(d, "yyyy")} оны ${format(d, "M")} сарын ${format(d, "d")}`;
}

export function timeLabel(value) {
  const d = toDate(value);
  return d ? format(d, "HH:mm") : "";
}

/**
 * Short relative stamp for a room row in the sidebar.
 */
export function roomStampLabel(value, t) {
  const d = toDate(value);
  if (!d) return "";
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return t("Өчигдөр");
  return format(d, "yy.MM.dd");
}

export function isNewDay(prev, cur) {
  const a = toDate(prev && prev.CreateDate);
  const b = toDate(cur && cur.CreateDate);
  if (!b) return false;
  if (!a) return true;
  return !isSameDay(a, b);
}

/* ------------------------------------------------------------------ *
 * Grouping
 * ------------------------------------------------------------------ */

const GROUP_WINDOW_MS = 5 * 60 * 1000;

/**
 * Should this message be drawn as a continuation of the one before it?
 *
 * Consecutive messages from one person within five minutes collapse: avatar and
 * name on the first of the run only. In a 550px-tall dock that is the single
 * biggest density win available.
 */
export function isSameRun(prev, cur) {
  if (!prev || !cur) return false;
  if (prev.UserId !== cur.UserId || prev.UserType !== cur.UserType)
    return false;
  if (isNewDay(prev, cur)) return false;

  const a = toDate(prev.CreateDate);
  const b = toDate(cur.CreateDate);
  if (!a || !b) return false;

  return b.getTime() - a.getTime() < GROUP_WINDOW_MS;
}

/* ------------------------------------------------------------------ *
 * Misc
 * ------------------------------------------------------------------ */

/** Stable React key: the server id once it exists, the client id before that. */
export function messageKey(m) {
  return m.Id ? `s${m.Id}` : `c${m.ClientMsgId}`;
}

/** One-line preview for a room row. */
export function messagePreview(msg, t) {
  if (!msg) return t("Мессеж алга");
  if (msg.MessageText) return msg.MessageText;
  if (msg.AttachmentCount > 0) return t("Хавсралт");
  return "";
}
