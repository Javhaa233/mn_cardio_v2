import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideocamIcon from "@mui/icons-material/Videocam";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import {
  durationLabel,
  fileName,
} from "customComponents/AdviceFeed/mediaUtils";
import useMediaLink from "./useMediaLink";

/**
 * The bubble's outer frame. Defined at module scope, NOT inside VideoNote.
 *
 * A component declared in a render body is a new type on every render, so React
 * unmounts and remounts its whole subtree - which for the <video> below would
 * restart playback on any parent re-render. This project's eslint config makes
 * that an error rather than a warning, for exactly this reason.
 */
function Frame({ children }) {
  return (
    <Box
      sx={{
        mt: 0.5,
        width: 260,
        maxWidth: "100%",
        borderRadius: radius.md,
        overflow: "hidden",
        border: `1px solid ${colors.brand.hairline}`,
        bgcolor: colors.brand.ink,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * A video message inside a chat bubble.
 *
 * TWO STATES, AND THE FIRST ONE MATTERS MOST. Before anyone presses play this
 * is a still placeholder that has fetched nothing at all - no ticket, no bytes,
 * no <video> element. A room whose history holds a dozen clips would otherwise
 * have a dozen players each pulling metadata the moment it scrolled into view,
 * which on a hospital connection is tens of megabytes nobody asked for.
 *
 * After the press it is a plain <video controls>, pointed at the streaming URL.
 * Native controls on purpose: they are keyboard accessible, they already speak
 * the user's language, and they support picture-in-picture and fullscreen for
 * free. A hand-built control bar here would be a worse copy of all of that.
 *
 * playsInline is REQUIRED, not cosmetic - without it iOS Safari takes every
 * video fullscreen on play, which in the middle of a conversation is jarring.
 */
export default function VideoNote({ File: F }) {
  const { t } = useTranslation();
  const FileId = F && F.FileInfo && F.FileInfo.id_data;
  const ServerMs = F && F.FileInfo && F.FileInfo.DurationMs;
  const State = F && F.FileInfo && F.FileInfo.MediaState;

  const { url, loading, error, load, refresh } = useMediaLink(FileId);
  const [opened, setOpened] = useState(false);
  const [failed, setFailed] = useState(false);

  const open = () => {
    setOpened(true);
    setFailed(false);
    load();
  };

  const onError = () => {
    // The ticket lasts an hour; a bubble open longer than that fails once and
    // then recovers by minting a new one.
    if (url && !failed) {
      setFailed(true);
      refresh();
      return;
    }
    setFailed(true);
  };

  if (!opened) {
    return (
      <Frame>
        <Box
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          aria-label={t("Видео тоглуулах")}
          sx={{
            position: "relative",
            height: 146,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            // A poster frame would need a server-side thumbnail; until there is
            // one, a flat brand ground reads as "video" better than a broken
            // image does.
            background: `linear-gradient(140deg, ${colors.brand.ink}, ${colors.brand.cyanInk})`,
          }}
        >
          <IconButton
            component="span"
            aria-hidden
            sx={{
              bgcolor: "rgba(255,255,255,.92)",
              color: colors.brand.cyanInk,
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <PlayArrowIcon />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              left: 8,
              bottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.75,
              py: 0.25,
              borderRadius: radius.sm,
              bgcolor: "rgba(12,34,51,.66)",
            }}
          >
            <VideocamIcon sx={{ fontSize: 13, color: "#fff" }} />
            <Typography variant="caption" sx={{ color: "#fff" }}>
              {ServerMs ? durationLabel(ServerMs) : t("Видео")}
            </Typography>
          </Box>
        </Box>
      </Frame>
    );
  }

  return (
    <Frame>
      {loading && !url ? (
        <Box
          sx={{
            height: 146,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={22} sx={{ color: "#fff" }} />
        </Box>
      ) : url ? (
        <Box
          component="video"
          src={url}
          controls
          autoPlay
          playsInline
          preload="metadata"
          onError={onError}
          aria-label={fileName(F)}
          sx={{
            display: "block",
            width: "100%",
            maxHeight: 320,
            bgcolor: colors.brand.ink,
          }}
        />
      ) : (
        <Box
          sx={{
            height: 146,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            color: "#fff",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">
            {error ? t(error) : t("Тоглуулах боломжгүй байна")}
          </Typography>
        </Box>
      )}

      {State === "pending" ? (
        <Typography
          variant="caption"
          sx={{ display: "block", px: 1, py: 0.5, color: "#fff", opacity: 0.8 }}
        >
          {t("боловсруулж байна")}
        </Typography>
      ) : null}
    </Frame>
  );
}
