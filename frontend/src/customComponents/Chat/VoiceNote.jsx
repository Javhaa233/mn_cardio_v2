import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  IconButton,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import MicIcon from "@mui/icons-material/Mic";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { durationLabel } from "customComponents/AdviceFeed/mediaUtils";
import useMediaLink from "./useMediaLink";

/**
 * A voice message.
 *
 * Used by the chat bubble and by an Advice reply. `FetchLink` is which minting
 * endpoint to ask for a playable URL - chat's by default - because the two
 * surfaces authorize differently and must not share one endpoint. `Mine` is the
 * chat bubble's outgoing colour regime and is simply left off elsewhere, where
 * a reply is not "mine" or "theirs" in that sense.
 *
 * NO WAVEFORM, deliberately. Drawing one means decoding the whole clip in the
 * browser - the bytes a stream exists to avoid pulling - and it tells the
 * listener nothing a scrub bar does not. A ten-minute note would decode ten
 * minutes of audio to draw a picture of it.
 *
 * DURATION COMES FROM THE SERVER when it can (File.duration_ms, filled by
 * ffprobe), so the bubble shows a length before a single byte is fetched. When
 * that column is not there yet the element reports its own duration once
 * metadata arrives, and until then the label reads as a dash rather than 0:00 -
 * an honest "unknown" rather than a wrong number.
 */
export default function VoiceNote({ File: F, Mine, FetchLink }) {
  const { t } = useTranslation();

  /*
   * THE PLAYER IS THE BUBBLE.
   *
   * It used to draw its own bordered, tinted surface and then sit inside the
   * message bubble's coloured one, which produced a heavy double ring - and on
   * an outgoing message put a light player on a dark blue ground.
   * MessageBubble now drops its chrome for a media-only message and this paints
   * the surface instead, in the same two colours every other bubble uses.
   *
   * `mine` is filled cyanInk with white content, matching MessageBubble's own
   * contrast note: cyanInk on white is 5.84:1 and passes AA in both directions,
   * which plain `cyan` does not.
   */
  const onDark = !!Mine;
  const surface = onDark ? colors.brand.cyanInk : colors.brand.tint;
  const ink = onDark ? "#fff" : colors.brand.ink;
  const dim = onDark ? "rgba(255,255,255,.78)" : colors.brand.inkDim;
  const control = onDark ? "#fff" : colors.brand.cyanInk;
  const onControl = onDark ? colors.brand.cyanInk : "#fff";
  const FileId = F && F.FileInfo && F.FileInfo.id_data;
  const ServerMs = F && F.FileInfo && F.FileInfo.DurationMs;
  const State = F && F.FileInfo && F.FileInfo.MediaState;

  const { url, loading, error, load, refresh } = useMediaLink(
    FileId,
    FetchLink,
  );

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(ServerMs ? ServerMs / 1000 : 0);
  const [rate, setRate] = useState(1);
  const [failed, setFailed] = useState(false);

  // Play as soon as the src lands, but only when the press is what asked for
  // it. Without this flag a component that already had a url would start
  // playing on mount whenever React re-ran the effect.
  const wantPlay = useRef(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;
    if (!wantPlay.current) return;

    wantPlay.current = false;
    el.play().catch(() => {
      setPlaying(false);
      setFailed(true);
    });
  }, [url]);

  const toggle = useCallback(() => {
    const el = audioRef.current;

    if (!url) {
      wantPlay.current = true;
      setFailed(false);
      load();
      return;
    }
    if (!el) return;

    if (el.paused) {
      el.play().catch(() => setFailed(true));
    } else {
      el.pause();
    }
  }, [url, load]);

  const onLoadedMetadata = (e) => {
    const d = e.target.duration;
    // An unseekable stream reports Infinity. Keep whatever the server said
    // rather than replacing a real number with one that cannot be rendered.
    if (Number.isFinite(d) && d > 0) setDuration(d);
  };

  const onError = () => {
    // A ticket is good for an hour; a bubble left open longer than that fails
    // exactly once and then recovers on its own.
    if (url && !failed) {
      setFailed(true);
      refresh();
      return;
    }
    setFailed(true);
    setPlaying(false);
  };

  const seek = (_, value) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(duration) || duration <= 0) return;
    el.currentTime = (Number(value) / 100) * duration;
    setPosition(Number(value));
  };

  const cycleRate = () => {
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const shown =
    playing || position > 0 ? (position / 100) * duration : duration;
  const label = duration > 0 ? durationLabel(shown * 1000) : "–:--";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: space[2],
        px: space[2],
        py: space[1],
        mt: 0.5,
        minWidth: 232,
        maxWidth: 320,
        borderRadius: radius.lg,
        bgcolor: surface,
        color: ink,
      }}
    >
      <audio
        ref={audioRef}
        src={url || undefined}
        preload="none"
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setPosition(0);
        }}
        onTimeUpdate={(e) => {
          const d = e.target.duration;
          if (Number.isFinite(d) && d > 0) {
            setPosition((e.target.currentTime / d) * 100);
          }
        }}
        onError={onError}
      />

      <Tooltip title={playing ? t("Түр зогсоох") : t("Сонсох")}>
        <span>
          <IconButton
            size="small"
            onClick={toggle}
            aria-label={playing ? t("Түр зогсоох") : t("Сонсох")}
            sx={{
              bgcolor: control,
              color: onControl,
              "&:hover": { bgcolor: control, opacity: 0.88 },
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: onControl }} />
            ) : playing ? (
              <PauseIcon fontSize="small" />
            ) : (
              <PlayArrowIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Slider
          size="small"
          value={Number.isFinite(position) ? position : 0}
          onChange={seek}
          disabled={!url || duration <= 0}
          aria-label={t("Байрлал")}
          sx={{
            py: 0.5,
            color: control,
            "& .MuiSlider-thumb": { width: 10, height: 10 },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: -0.5 }}>
          <MicIcon sx={{ fontSize: 13, color: dim }} />
          <Typography variant="caption" sx={{ color: dim }}>
            {label}
          </Typography>
          {State === "pending" ? (
            <Typography variant="caption" sx={{ color: dim, ml: 0.5 }}>
              · {t("боловсруулж байна")}
            </Typography>
          ) : null}
          {failed && !loading ? (
            <Tooltip title={error ? t(error) : t("Сонсох боломжгүй байна")}>
              <ErrorOutlineIcon
                sx={{ fontSize: 14, color: colors.brand.urgent, ml: 0.5 }}
              />
            </Tooltip>
          ) : null}
        </Box>
      </Box>

      <Tooltip title={t("Хурд")}>
        <IconButton
          size="small"
          onClick={cycleRate}
          aria-label={t("Хурд")}
          sx={{ color: control, minWidth: 34 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {rate}×
          </Typography>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
