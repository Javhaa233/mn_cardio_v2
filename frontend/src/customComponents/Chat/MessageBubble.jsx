import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Box, Button, LinearProgress, Typography } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import MessageAttachments from "customComponents/Chat/MessageAttachments";
import { timeLabel } from "customComponents/Chat/chatUtils";

/**
 * One message.
 *
 * The bubble used to render `m.MessageText` and nothing else - no sender, no
 * time, no avatar - even though the backend was already joining Users and
 * DoctorsProfile and carrying CreateDate. In a group room you could not tell
 * who had said what.
 *
 * COLOUR, and this is the contrast rule doing real work: mine is filled
 * `cyanInk` with white text (5.84:1, passes AA in both directions). It is NOT
 * `cyan` - that is 2.5:1 on white and fails AA for text, which is exactly what
 * the old hardcoded #3498db got wrong. `cyan` is legal for borders and large
 * icons only.
 */
export default function MessageBubble({
  Message,
  ShowAvatar,
  ShowName,
  ShowTime,
  OnRetry,
  UploadPercent,
}) {
  const { t } = useTranslation();
  const mine = !!Message.IsMine;
  const status = Message.Status;
  const failed = status === "failed";
  const sending = status === "sending";

  // While the bytes are still uploading, show the local previews the composer
  // built, so the sender sees their ECG strip immediately rather than a gap.
  const files =
    Message.PendingFiles && Message.PendingFiles.length
      ? Message.PendingFiles.map((f) => ({
          FileSrc: f.FileSrc,
          Type: f.Type,
          FileInfo: {
            ...f.FileInfo,
            ext: extOf(f.FileInfo && f.FileInfo.Name),
          },
        }))
      : Message.Attachment || [];

  // A plain render helper, not a component defined during render - declaring a
  // component inside the body gives it a new identity every render, so React
  // unmounts and remounts its subtree on each one.
  const renderStatus = () => {
    if (!mine) return null;
    if (failed) {
      return (
        <ErrorOutlineIcon
          sx={{ fontSize: 14, color: colors.brand.urgent }}
          aria-label={t("Илгээгдсэнгүй")}
        />
      );
    }
    if (sending) {
      // A clock, not a spinner: thirty spinners in a conversation is noise.
      return <ScheduleIcon sx={{ fontSize: 14, opacity: 0.7 }} />;
    }
    if (status === "read") return <DoneAllIcon sx={{ fontSize: 14 }} />;
    return <DoneIcon sx={{ fontSize: 14 }} />;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 0.75,
        mt: ShowName ? 1 : 0.25,
      }}
    >
      {!mine && (
        <Box sx={{ width: 28, flexShrink: 0 }}>
          {ShowAvatar ? (
            <Avatar
              src={Message.SenderImageSrc || undefined}
              sx={{ width: 28, height: 28 }}
            >
              {(Message.SenderName || "?").charAt(0)}
            </Avatar>
          ) : null}
        </Box>
      )}

      <Box sx={{ maxWidth: "72%", minWidth: 0 }}>
        {!mine && ShowName ? (
          <Typography
            variant="subtitle2"
            component="div"
            sx={{ color: colors.brand.inkMuted, mb: 0.25, ml: 0.5 }}
          >
            {Message.SenderName}
          </Typography>
        ) : null}

        <Box
          sx={{
            px: 1.25,
            py: 0.75,
            borderRadius: radius.lg,
            bgcolor: mine ? colors.brand.cyanInk : colors.brand.tint,
            color: mine ? "#fff" : colors.brand.ink,
            opacity: sending ? 0.85 : 1,
            border: failed ? `1px solid ${colors.brand.urgent}` : "none",
          }}
        >
          {Message.MessageText ? (
            <Typography
              variant="body2"
              component="div"
              sx={{
                // A pasted URL used to blow the bubble's max-width apart.
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {Message.MessageText}
            </Typography>
          ) : null}

          <MessageAttachments Files={files} />

          {sending && files.length > 0 ? (
            // Determinate once the browser reports bytes. A 50MB DICOM over an
            // aimag link needs to show that it is moving, not just spinning.
            <Box sx={{ mt: 0.75 }}>
              <LinearProgress
                variant={
                  typeof UploadPercent === "number"
                    ? "determinate"
                    : "indeterminate"
                }
                value={
                  typeof UploadPercent === "number" ? UploadPercent : undefined
                }
                sx={{ borderRadius: radius.xs }}
              />
              {typeof UploadPercent === "number" ? (
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    mt: 0.25,
                    color: mine ? "#fff" : colors.brand.inkMuted,
                  }}
                >
                  {UploadPercent}%
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Box>

        {ShowTime || failed ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: mine ? "flex-end" : "flex-start",
              mt: 0.25,
              px: 0.5,
              color: mine ? colors.brand.inkMuted : colors.brand.inkMuted,
            }}
          >
            <Typography variant="caption" component="span">
              {timeLabel(Message.CreateDate)}
            </Typography>
            {renderStatus()}
            {failed ? (
              <Button
                size="small"
                onClick={() => OnRetry && OnRetry(Message)}
                sx={{
                  minWidth: 0,
                  p: 0,
                  color: colors.brand.urgent,
                  textTransform: "none",
                }}
              >
                {t("Дахин илгээх")}
              </Button>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function extOf(name) {
  if (!name) return "";
  const i = String(name).lastIndexOf(".");
  return i > -1
    ? String(name)
        .slice(i + 1)
        .toLowerCase()
    : "";
}
