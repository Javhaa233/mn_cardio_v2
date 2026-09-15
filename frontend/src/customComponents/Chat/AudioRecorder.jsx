import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { durationLabel } from "customComponents/AdviceFeed/mediaUtils";
import useMediaRecorder from "./useMediaRecorder";

/**
 * The in-composer voice recording row.
 *
 * Replaces the text field while recording rather than sitting beside it. The
 * composer is 550px of panel at most, and a recorder squeezed in next to the
 * input would leave neither usable - and there is nothing to type during a
 * recording anyway.
 *
 * Tap to start, tap to send - NOT hold-to-talk. A ten-minute clinical
 * explanation is the case this exists for, and holding a mouse button down for
 * ten minutes is not something to ask of anyone.
 */
export default function AudioRecorder({ Active, OnDone, OnCancel, OnError }) {
  const { t } = useTranslation();
  const { recording, elapsedMs, maxMs, error, start, stop, cancel } =
    useMediaRecorder({
      Kind: "audio",
    });

  // Starting is an effect of becoming Active, so the parent decides when the
  // row appears and the permission prompt happens at that same moment - one
  // user action, one prompt.
  useEffect(() => {
    let ignore = false;
    if (Active && !recording) {
      start().then((ok) => {
        if (!ok && !ignore) OnCancel && OnCancel();
      });
    }
    return () => {
      ignore = true;
    };
    // Intentionally keyed on Active alone: re-running on `recording` would
    // restart the recorder the moment it began.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Active]);

  useEffect(() => {
    if (error && OnError) OnError(error);
  }, [error, OnError]);

  const finish = async () => {
    const file = await stop();
    if (file) OnDone && OnDone(file);
    else OnCancel && OnCancel();
  };

  const abandon = () => {
    cancel();
    OnCancel && OnCancel();
  };

  if (!Active) return null;

  const remaining = Math.max(0, maxMs - elapsedMs);
  const nearlyDone = remaining <= 30000;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: space[2],
        flex: 1,
        px: space[2],
        py: space[1],
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.md,
        bgcolor: colors.brand.tintSolid,
      }}
    >
      <Tooltip title={t("Болих")}>
        <IconButton size="small" onClick={abandon} aria-label={t("Болих")}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <FiberManualRecordIcon
        sx={{
          fontSize: 14,
          // The one saturated colour, on the one thing that is urgent: a live
          // microphone. It is also the only place in the composer using it.
          color: colors.brand.urgent,
          animation: "mncardio-rec-pulse 1.2s ease-in-out infinite",
          "@keyframes mncardio-rec-pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.25 },
          },
        }}
      />

      <Typography
        variant="body2"
        sx={{ color: colors.brand.ink, fontVariantNumeric: "tabular-nums" }}
      >
        {durationLabel(elapsedMs)}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          flex: 1,
          color: nearlyDone ? colors.brand.urgent : colors.brand.inkDim,
        }}
      >
        {nearlyDone
          ? t("Үлдсэн хугацаа") + " " + durationLabel(remaining)
          : t("Бичиж байна...")}
      </Typography>

      <Tooltip title={t("Илгээх")}>
        <span>
          <IconButton
            size="small"
            onClick={finish}
            disabled={!recording}
            aria-label={t("Илгээх")}
            sx={{
              bgcolor: colors.brand.cyanInk,
              color: "#fff",
              "&:hover": { bgcolor: colors.brand.cyanInkHover },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
