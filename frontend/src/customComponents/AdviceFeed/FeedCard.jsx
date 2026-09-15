import React, { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import customHistory from "customHistory";
import { colors } from "@/theme/colors";
import { radius, space, elevation, motion } from "@/theme/tokens";
import CommentPreview from "./CommentPreview";
import { statusAccent, statusLabel } from "./ticketStatus";
import AdviceAttachments from "./AdviceAttachments";
import ReplyThread from "./ReplyThread";

const CARD_PAD = space[4]; // 16px

/** Author name, falling through every shape the API can return. */
function authorName(Data) {
  const dp = Data.DoctorsProfile || {};
  const fromProfile = [dp.firstname, dp.lastname].filter(Boolean).join(" ");
  return (
    (Data.Users && Data.Users.UserName) || dp.FullName || fromProfile || "—"
  );
}

export default function FeedCard({ Data, onPatch }) {
  const { t } = useTranslation();
  const [showReplies, setShowReplies] = useState(false);

  // The old AdviceTicket dereferences Data.Users.UserName unguarded and throws
  // on a null author. In an infinite feed a single bad row must never blank the
  // whole page, so every field below is read defensively.
  const avatarSrc =
    Data.DoctorsProfile &&
    Data.DoctorsProfile.Files &&
    Data.DoctorsProfile.Files[0] &&
    Data.DoctorsProfile.Files[0].FileSrc;

  const patient = Data.Patient || null;
  const patientBits = [];
  if (patient && patient.p_birthday) {
    patientBits.push(Helper.ObjectHelper.GetAgeDateStr(patient.p_birthday));
  }
  if (patient && patient.p_gender) {
    patientBits.push(Helper.ObjectHelper.getGenderLabel(patient.p_gender));
  }

  const place = [
    Data.DictProvinceCity && Data.DictProvinceCity.name,
    Data.DictSoumDistrict && Data.DictSoumDistrict.name,
  ]
    .filter(Boolean)
    .map((s) => t(s))
    .join(" · ");

  const hasComments = !!(Data.Comments && Data.Comments.length);
  const hasBody = !!(Data.Body && String(Data.Body).replace(/\s/g, "").length);

  const openDetail = () =>
    customHistory.push("/admin/AdviceComment?AdviceId=" + Data.id_data);

  return (
    <Box
      component="article"
      tabIndex={0}
      aria-label={
        statusLabel(Data, t) + ": " + String(Data.Body || "").slice(0, 80)
      }
      onClick={(e) => {
        // Anything interactive inside the card handles its own click. Without
        // this guard, replying or opening a photo would also navigate away.
        if (
          e.target.closest(
            'a,button,input,textarea,[role="button"],[data-stop]',
          )
        )
          return;
        openDetail();
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      sx={{
        position: "relative",
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
        mb: space[4],
        overflow: "hidden",
        cursor: "pointer",
        transition: `box-shadow ${motion.base}, border-color ${motion.base}, transform ${motion.base}`,
        "&:hover": {
          borderColor: colors.brand.hairlineStrong,
          boxShadow: elevation[3],
          transform: "translateY(-1px)",
        },
        // An outline rather than a ring shadow, so focus stays visible on top
        // of the hover shadow instead of being swallowed by it.
        "&:focus-visible": {
          outline: `2px solid ${colors.brand.focus}`,
          outlineOffset: "2px",
        },
      }}
    >
      <Box sx={{ height: "3px", backgroundColor: statusAccent(Data) }} />

      <Box sx={{ p: CARD_PAD }}>
        {/* Author */}
        <Box sx={{ display: "flex", alignItems: "center", gap: space[3] }}>
          <Avatar
            src={avatarSrc || undefined}
            sx={{
              width: 40,
              height: 40,
              border: `1px solid ${colors.brand.hairline}`,
              backgroundColor: colors.brand.tint,
              color: colors.brand.cyanInk,
            }}
          >
            {authorName(Data).slice(0, 1).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: space[2],
                flexWrap: "wrap",
              }}
            >
              <Typography
                component="div"
                variant="subtitle1"
                sx={{ color: colors.brand.ink }}
                noWrap
              >
                Dr. {authorName(Data)}
              </Typography>
              <Box
                component="span"
                sx={{
                  px: space[2],
                  py: "1px",
                  borderRadius: radius.pill,
                  backgroundColor: colors.brand.tint,
                  color: colors.brand.cyanInk,
                  fontSize: "11px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {statusLabel(Data, t)}
              </Box>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: colors.brand.inkDim }}
              noWrap
            >
              {Data.date_creation}
              {place ? "  ·  " + place : ""}
            </Typography>
          </Box>
        </Box>

        {/* Patient. Pulling this out of the body string is most of why the card
            reads as a post rather than as a log line - the old component
            concatenated "45, Эрэгтэй: " onto the front of the text. */}
        {patientBits.length ? (
          <Box
            sx={{
              display: "inline-block",
              mt: space[3],
              px: space[3],
              py: "3px",
              borderRadius: radius.pill,
              backgroundColor: colors.brand.tint,
              color: colors.brand.cyanInk,
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {patientBits.join(" · ")}
          </Box>
        ) : null}

        {/* Body.
            Most tickets in the live data have an empty Body - the doctor opened
            the ticket and put the clinical content in the first reply. This used
            to fall back to that reply, quoted under an "Эхний хариулт" label,
            which said the same thing twice in two different visual languages:
            once as a pseudo-body, then again as a reply below. The replies
            section is now the only place a reply is rendered, so a body-less
            ticket simply starts at its replies. */}
        {hasBody ? (
          <Typography
            variant="body1"
            sx={{
              mt: space[3],
              color: colors.brand.ink,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {Data.Body}
          </Typography>
        ) : hasComments ? null : (
          <Typography
            variant="body2"
            sx={{
              mt: space[3],
              color: colors.brand.inkDim,
              fontStyle: "italic",
            }}
          >
            {t("Тайлбар бичээгүй")}
          </Typography>
        )}

        <AdviceAttachments
          Files={Data.Files}
          FileTotal={Data.FileTotal}
          FullBleedMargin={`-${CARD_PAD}`}
        />

        {/* Metrics as words. Icons at this size are noise; the numbers are the
            point, and they are what a doctor scans for. */}
        <Typography
          variant="caption"
          sx={{ display: "block", mt: space[3], color: colors.brand.inkDim }}
        >
          {(Data.CommentQty || 0) + " " + t("хариулт")}
          {"  ·  "}
          {(Data.ViewQty || 0) + " " + t("үзсэн")}
        </Typography>
      </Box>

      <Box
        sx={{
          borderTop: `1px solid ${colors.brand.hairline}`,
          display: "flex",
        }}
      >
        <Button
          data-stop
          fullWidth
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setShowReplies((v) => !v);
          }}
          sx={{
            py: space[2],
            borderRadius: 0,
            color: showReplies ? colors.brand.cyanInk : colors.brand.inkDim,
            "&:hover": { backgroundColor: colors.brand.tint },
          }}
        >
          {t("Хариулах")}
        </Button>
        <Box sx={{ width: "1px", backgroundColor: colors.brand.hairline }} />
        <Button
          data-stop
          fullWidth
          startIcon={<VisibilityOutlinedIcon />}
          disabled
          sx={{ py: space[2], borderRadius: 0, color: colors.brand.inkDim }}
        >
          {Data.ViewQty || 0}
        </Button>
        <Box sx={{ width: "1px", backgroundColor: colors.brand.hairline }} />
        <Button
          data-stop
          fullWidth
          startIcon={<OpenInNewIcon />}
          // The canonical control. The whole card is clickable as a
          // convenience, but a focusable container full of buttons is not
          // honest ARIA, so this is what a screen reader is pointed at.
          aria-label={
            t("Дэлгэрэнгүй") + ": " + String(Data.Body || "").slice(0, 60)
          }
          onClick={(e) => {
            e.stopPropagation();
            openDetail();
          }}
          sx={{
            py: space[2],
            borderRadius: 0,
            color: colors.brand.inkDim,
            "&:hover": { backgroundColor: colors.brand.tint },
          }}
        >
          {t("Дэлгэрэнгүй")}
        </Button>
      </Box>

      {/* Replies are on the card by default - the count alone never told the
          reader whether a ticket had been answered, and most threads here are
          short enough to read in place. Opening the thread swaps the preview
          for the real one rather than stacking both. */}
      {showReplies ? (
        <ReplyThread AdviceId={Data.id_data} Advice={Data} onPatch={onPatch} />
      ) : (
        <CommentPreview
          Comments={Data.Comments}
          CommentQty={Data.CommentQty}
          onExpand={() => setShowReplies(true)}
        />
      )}
    </Box>
  );
}
