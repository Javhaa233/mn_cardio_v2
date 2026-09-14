import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import { fileName } from "./mediaUtils";

/**
 * Full-screen photo viewer.
 *
 * Written rather than reused: AdviceFileInfo's viewer sets
 * `disableEscapeKeyDown` and has no next/previous, so it cannot serve a post
 * with several photos.
 *
 * The feed carries small thumbnails to keep the page under a couple of
 * megabytes; this is where the reader gets the real image. Auth is
 * header-based, so a bare <img src> to the download endpoint cannot work - the
 * bytes are fetched with the bearer token and turned into an object URL.
 */
export default function Lightbox({
  Files,
  StartIndex = 0,
  onClose,
  DownloadSource,
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(StartIndex);
  const [fullSrc, setFullSrc] = useState(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [failure, setFailure] = useState("");

  const count = Files.length;
  const file = Files[index];

  const go = useCallback(
    (delta) => {
      setFullSrc(null);
      setFailure("");
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
      else if (e.key === "ArrowRight" && count > 1) go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, count]);

  // Fetch the original for the photo currently on screen. The thumbnail stays
  // visible underneath until it arrives, so there is never an empty frame.
  useEffect(() => {
    let revoked = null;
    let cancelled = false;
    const info = file && file.FileInfo;
    if (!info || !info.generated_name) return undefined;

    // Deferred so the effect body itself performs no state write; the flag is
    // only a "the original is on its way" hint for the blur, and setting it a
    // tick late is invisible.
    const flag = setTimeout(() => setLoadingFull(true), 0);

    Helper.BaseCrudHelper.BaseDownloadFileBlob(
      file,
      (blob, message) => {
        clearTimeout(flag);
        if (cancelled || !blob) {
          // Say why. Without this the reader stares at a permanently blurred
          // thumbnail with no idea the original is missing from the server.
          if (!cancelled) setFailure(message || "");
          setLoadingFull(false);
          return;
        }
        setFailure("");
        revoked = URL.createObjectURL(blob);
        setFullSrc(revoked);
        setLoadingFull(false);
      },
      // Chat passes a membership-checked endpoint here; the feed passes nothing
      // and keeps the default. Intentionally not in the dependency array - it is
      // a new closure every render and would restart the fetch on each one.
      DownloadSource && DownloadSource(file),
    );

    return () => {
      cancelled = true;
      clearTimeout(flag);
      if (revoked) URL.revokeObjectURL(revoked);
    };
    // DownloadSource is omitted on purpose - see the comment above. Callers pass
    // an inline arrow, so including it would re-fetch the image on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  if (!file) return null;

  return (
    <Box
      data-stop
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 13000,
        backgroundColor: "rgba(8, 22, 34, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconButton
        aria-label={t("Хаах")}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        sx={{ position: "absolute", top: 12, right: 12, color: "#fff" }}
      >
        <CloseIcon />
      </IconButton>

      <IconButton
        aria-label={t("Татах")}
        onClick={(e) => {
          e.stopPropagation();
          Helper.BaseCrudHelper.BaseDownloadFile(
            file,
            null,
            DownloadSource && DownloadSource(file),
          );
        }}
        sx={{ position: "absolute", top: 12, right: 60, color: "#fff" }}
      >
        <DownloadOutlinedIcon />
      </IconButton>

      {count > 1 ? (
        <>
          <IconButton
            aria-label={t("Өмнөх")}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            sx={{ position: "absolute", left: 12, color: "#fff" }}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
          <IconButton
            aria-label={t("Дараах")}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            sx={{ position: "absolute", right: 12, color: "#fff" }}
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        </>
      ) : null}

      <Box
        component="img"
        src={fullSrc || file.FileSrc}
        alt={fileName(file)}
        onClick={(e) => e.stopPropagation()}
        sx={{
          maxWidth: "94vw",
          maxHeight: "88vh",
          objectFit: "contain",
          // The thumbnail is upscaled while the original is in flight; a slight
          // blur is a more honest "loading" signal than a crisp low-res image.
          filter: loadingFull && !fullSrc ? "blur(1px)" : "none",
          transition: "filter 180ms ease",
        }}
      />

      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          bottom: 16,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {fileName(file)}
        {count > 1 ? `  ·  ${index + 1} / ${count}` : ""}
        {failure ? `  ·  ${failure}` : ""}
      </Typography>
    </Box>
  );
}
