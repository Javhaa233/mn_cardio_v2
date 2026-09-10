import { colors } from "@/theme/colors";

/**
 * What state a ticket is in, as a colour and as a word.
 *
 * Its own module because BOTH the feed card and the ticket detail page ask the
 * question, and two definitions of "open" is how a card and the page you reach
 * by clicking it end up disagreeing in front of a doctor. Kept out of
 * FeedCard.jsx so the detail page can import the answer without pulling the
 * whole card - and its thread, and its media grid - into its bundle.
 */

/**
 * The grace period before an unanswered ticket turns urgent.
 *
 * `urgent` is reserved for one condition: an open ticket that has gone a day
 * without an answer. A single strong colour used rarely reads as urgent; used
 * everywhere it reads as decoration, and a doctor stops seeing it by the second
 * hour of a shift.
 *
 * Without the grace period every ticket is born red, including the one the
 * reader just posted, which is exactly how an alert colour becomes furniture.
 */
const UNANSWERED_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * The accent colour for a ticket's state.
 *
 * NON-TEXT ONLY. It returns `brand.cyan` and `brand.urgent`, neither of which
 * meets AA as a text colour - use it for a stripe, a dot or a border, and put
 * any accompanying word in `brand.cyanInk`.
 */
export function statusAccent(Data) {
  const st = Data.adv_ticket_closed;
  if (st === "n") {
    if (Data.CommentQty) return colors.brand.cyan;
    // date_creation is stored date-only, so this resolves to midnight and the
    // real threshold lands somewhere between 24 and 48 hours. Close enough for
    // "nobody has looked at this since yesterday", and it never fires on a
    // ticket posted moments ago.
    const created = Data.date_creation
      ? new Date(Data.date_creation).getTime()
      : NaN;
    const stale =
      !Number.isNaN(created) && Date.now() - created > UNANSWERED_GRACE_MS;
    return stale ? colors.brand.urgent : colors.brand.cyan;
  }
  if (st === "y") return colors.status.normal;
  return colors.brand.hairlineStrong;
}

export function statusLabel(Data, t) {
  const st = Data.adv_ticket_closed;
  if (st === "n") return t("Нээлттэй");
  if (st === "y") return t("Хаагдсан");
  if (st === "3") return t("Ноорог");
  return "";
}
