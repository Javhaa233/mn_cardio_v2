import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import ReplayIcon from "@mui/icons-material/Replay";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { durationLabel } from "customComponents/AdviceFeed/mediaUtils";
import useMediaRecorder from "./useMediaRecorder";

/**
 * Record a short video message.
 *
 * A DIALOG, not an inline row. A camera preview needs real estate the 550px
 * chat panel does not have, and someone recording themselves needs to see the
 * frame they are in before they commit to it.
 *
 * THREE STATES: live preview while recording, then a review of what was
 * captured, then send. The review step is the point - a video message is far
 * more likely than a voice note to catch something the sender did not intend to
 * send, and "record, watch, re-record" costs one screen and prevents that.
 */
export default function VideoRecorder({ Open, OnDone, OnClose }) {
  const { t } = useTranslation();
  const { recording, elapsedMs, maxMs, error, stream, start, stop, cancel } =
    useMediaRecorder({
      Kind: "video",
    });

  const previewRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Attach the live camera feed to the <video> element. srcObject cannot be set
  // through a src attribute, so it has to happen here.
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    if (stream && !captured) {
      el.srcObject = stream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [stream, captured]);

  useEffect(() => {
    let ignore = false;
    if (Open && !recording && !captured) {
      start().then((ok) => {
        if (!ok && !ignore) OnClose && OnClose();
      });
    }
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Open]);

  // Object URLs are a leak if they are not revoked; one per re-record adds up
  // over a long session.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const finishRecording = async () => {
    const file = await stop();
    if (!file) {
      OnClose && OnClose();
      return;
    }
    setCaptured(file);
    setPreviewUrl(URL.createObjectURL(file.File));
  };

  const discardAndClose = () => {
    cancel();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaptured(null);
    OnClose && OnClose();
  };

  const again = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaptured(null);
    const ok = await start();
    if (!ok) OnClose && OnClose();
  };

  const send = () => {
    if (!captured) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    const file = captured;
    setCaptured(null);
    OnDone && OnDone(file);
  };

  const remaining = Math.max(0, maxMs - elapsedMs);
  const nearlyDone = remaining <= 20000;

  return (
    <Dialog open={!!Open} onClose={discardAndClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h5" component="span">
          {t("Видео бичлэг")}
        </Typography>
        <IconButton
          size="small"
          onClick={discardAndClose}
          aria-label={t("Хаах")}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {error ? (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {t(error)}
          </Alert>
        ) : null}

        <Box
          sx={{
            position: "relative",
            borderRadius: radius.md,
            overflow: "hidden",
            bgcolor: colors.brand.ink,
          }}
        >
          {captured ? (
            <Box
              component="video"
              src={previewUrl || undefined}
              controls
              playsInline
              sx={{ display: "block", width: "100%", maxHeight: 360 }}
            />
          ) : (
            <Box
              component="video"
              ref={previewRef}
              muted
              playsInline
              // Mirrored, because an unmirrored self-view is disorienting -
              // every video-call client does the same. The RECORDING is not
              // mirrored; this is a CSS transform on the preview only.
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 360,
                transform: "scaleX(-1)",
              }}
            />
          )}

          {recording ? (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: radius.sm,
                bgcolor: "rgba(12,34,51,.66)",
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 12,
                  color: colors.brand.urgent,
                  animation: "mncardio-vid-pulse 1.2s ease-in-out infinite",
                  "@keyframes mncardio-vid-pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.25 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#fff", fontVariantNumeric: "tabular-nums" }}
              >
                {durationLabel(elapsedMs)}
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: space[1],
            color:
              nearlyDone && recording
                ? colors.brand.urgent
                : colors.brand.inkDim,
          }}
        >
          {captured
            ? t("Бичлэгээ шалгаад илгээнэ үү")
            : nearlyDone
              ? t("Үлдсэн хугацаа") + " " + durationLabel(remaining)
              : t("Дээд хугацаа") + " " + durationLabel(maxMs)}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {captured ? (
          <>
            <Button
              onClick={again}
              startIcon={<ReplayIcon />}
              sx={{ color: colors.brand.cyanInk }}
            >
              {t("Дахин бичих")}
            </Button>
            <Button
              onClick={send}
              variant="contained"
              startIcon={<SendIcon />}
              sx={{
                bgcolor: colors.brand.cyanInk,
                "&:hover": { bgcolor: colors.brand.cyanInkHover },
              }}
            >
              {t("Илгээх")}
            </Button>
          </>
        ) : (
          <Button
            onClick={finishRecording}
            disabled={!recording}
            variant="contained"
            startIcon={<StopIcon />}
            sx={{
              bgcolor: colors.brand.cyanInk,
              "&:hover": { bgcolor: colors.brand.cyanInkHover },
            }}
          >
            {t("Зогсоох")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
