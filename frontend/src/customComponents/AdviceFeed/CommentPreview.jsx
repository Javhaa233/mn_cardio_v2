import React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import AdviceAttachments from "./AdviceAttachments";

/**
 * The first few replies, rendered on the card itself.
 *
 * The feed used to show a reply COUNT and nothing else, so finding out whether
 * a ticket had actually been answered - and what the answer was - took a click
 * into the thread, on every card. Most threads here are two or three replies
 * long; at that length the click was pure overhead. The top two are shown
 * inline and the thread opens only when there is more than that to read.
 *
 * This is also what a body-less ticket shows instead of a body. 57% of live
 * tickets carry an empty Body because the doctor put the clinical content in
 * the first reply; that reply used to be lifted out and quoted under an
 * "Эхний хариулт" heading, which meant the card rendered a reply twice, in two
 * different shapes. A reply is a reply - it belongs here, in the same bubble as
 * every other one.
 *
 * Attachments render as photos, not as filenames. An answer on this feed is
 * very often an image - an ECG strip, an echo still - and a chip reading
 * "IMG_0431.jpg" is a second click hiding the actual content.
 *
 * Not a second comment component: the bubbles reuse AdviceAttachments, so reply
 * photos get the same grid, the same lightbox and the same lazy loading as post
 * photos, and a reply recorded as a voice note gets the same player. The full thread - liking, rating, the composer - stays in
 * ReplyThread; this is a preview and deliberately read-only.
 */

/**
 * How many replies, and how many photos each, the card shows inline.
 *
 * These MIRROR the server's FEED_COMMENT_LIMIT / FEED_COMMENT_PHOTO_LIMIT.
 * GetFeed already arrives trimmed to them, so nothing here re-slices the feed
 * payload - they exist because ReplyThread rebuilds this same preview from the
 * full thread after a reply is posted, and that list is NOT pre-trimmed. If the
 * server numbers change, change these with them.
 */
export const PREVIEW_LIMIT = 2;
export const PREVIEW_PHOTO_LIMIT = 2;

/**
 * One thread comment, as the card's inline preview wants it.
 *
 * GetComments and GetFeed describe the same reply with different field names -
 * one is the legacy per-record shape, the other is built for the feed - so the
 * translation lives here, next to the component that defines the target shape.
 */
export function toPreviewComment(c) {
  const dp = c.DoctorsProfile || {};
  const fromParts = [dp.lastname, dp.firstname].filter(Boolean).join(" ");
  const files = Array.isArray(c.Files) ? c.Files : [];
  return {
    Id: c.id_data,
    Text: c.adv_com_comment,
    Date: c.date_creation,
    AuthorName: dp.FullName || fromParts || (c.Users && c.Users.UserName) || "",
    AvatarSrc: (dp.Files && dp.Files[0] && dp.Files[0].FileSrc) || null,
    FileTotal: files.length,
    Files: files.slice(0, PREVIEW_PHOTO_LIMIT),
  };
}

// A reply longer than this is a consultation note, not a remark. Clamp it and
// let the reader open the thread; the alternative is one card eating the page.
const TEXT_CLAMP = 4;

// Reply photos are supporting evidence at this size, not the subject of the
// card. Bounding the media column keeps a single portrait X-ray from rendering
// taller than the post it answers.
const MEDIA_MAX_W = 340;

/** Date only. The time of a reply is detail the thread can carry. */
function dayOf(value) {
  if (!value) return "";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export default function CommentPreview({ Comments, CommentQty, onExpand }) {
  const { t } = useTranslation();

  const shown = Array.isArray(Comments) ? Comments : [];
  if (!shown.length) return null;

  const total = CommentQty || shown.length;
  const remaining = Math.max(0, total - shown.length);

  return (
    <Box
      data-stop
      onClick={(e) => e.stopPropagation()}
      sx={{
        backgroundColor: colors.background.surface,
        borderTop: `1px solid ${colors.brand.hairline}`,
        px: space[4],
        py: space[3],
        cursor: "default",
      }}
    >
      {shown.map((c) => (
        <Box
          key={c.Id}
          sx={{
            display: "flex",
            gap: space[2],
            alignItems: "flex-start",
            mb: space[3],
            "&:last-of-type": { mb: 0 },
          }}
        >
          <Avatar
            src={c.AvatarSrc || undefined}
            sx={{
              width: 28,
              height: 28,
              flex: "0 0 auto",
              mt: "2px",
              fontSize: "12px",
              border: `1px solid ${colors.brand.hairline}`,
              backgroundColor: colors.brand.tint,
              color: colors.brand.cyanInk,
            }}
          >
            {(c.AuthorName || "?").slice(0, 1).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            {/* The bubble carries name and text together, the way every chat
                surface a doctor already uses does. It is `inline-block` so a
                one-word reply gets a one-word bubble rather than a full-width
                bar with three words in it. */}
            <Box
              sx={{
                display: "inline-block",
                maxWidth: "100%",
                backgroundColor: colors.brand.tint,
                borderRadius: radius.md,
                px: space[3],
                py: space[2],
              }}
            >
              <Typography
                component="div"
                variant="subtitle2"
                sx={{ color: colors.brand.ink, lineHeight: 1.3 }}
              >
                {c.AuthorName ? "Dr. " + c.AuthorName : t("Нэргүй")}
              </Typography>
              {c.Text && String(c.Text).replace(/\s/g, "").length ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.brand.ink,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    display: "-webkit-box",
                    WebkitLineClamp: TEXT_CLAMP,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.Text}
                </Typography>
              ) : null}
            </Box>

            {c.Files && c.Files.length ? (
              <Box
                sx={{
                  maxWidth: MEDIA_MAX_W,
                  borderRadius: radius.md,
                  overflow: "hidden",
                }}
              >
                <AdviceAttachments
                  Files={c.Files}
                  FileTotal={c.FileTotal}
                  FullBleedMargin="0px"
                />
              </Box>
            ) : null}

            <Typography
              variant="caption"
              sx={{ display: "block", mt: "2px", color: colors.brand.inkDim }}
            >
              {dayOf(c.Date)}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Only offered when there is genuinely more to read. On a two-reply
          ticket the card already IS the whole thread, and a "show all" that
          reveals nothing new is the extra step this component exists to
          remove. */}
      {remaining > 0 ? (
        <Button
          data-stop
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onExpand && onExpand();
          }}
          sx={{
            mt: space[2],
            px: space[2],
            textTransform: "none",
            color: colors.brand.cyanInk,
            "&:hover": { backgroundColor: colors.brand.tint },
          }}
        >
          {t("Бүгдийг харах") + " (" + total + ")"}
        </Button>
      ) : null}
    </Box>
  );
}
