import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
 *
 * IT RENDERS THROUGH A PORTAL, and that is load-bearing rather than tidiness.
 * The viewer is mounted deep inside whatever it was opened from - on the feed
 * that is PostMedia inside a reply inside FeedCard - and FeedCard carries
 * `overflow: hidden` plus `&:hover { transform: translateY(-1px) }`. A non-none
 * transform makes that card the CONTAINING BLOCK for every position:fixed
 * descendant, and the card's overflow then clips it. The result oscillated: the
 * pointer is on the card so the transform is on, the viewer is clipped away to
 * card size, nothing is under the pointer any more so :hover drops, the
 * transform goes, the viewer snaps back to the viewport under the pointer, the
 * card is hovered again - open, close, open, close at the transition's rate.
 * document.body has no transformed ancestor, so this cannot come back, here or
 * in any of the other three screens that mount this viewer.
 */
export default function Lightbox({
  Files,
  StartIndex = 0,
  onClose,
  DownloadSource,
}) {
  const { t } = useTranslation();
  const [rawIndex, setIndex] = useState(StartIndex);
  const [loadingFull, setLoadingFull] = useState(false);

  /*
   * The fetched original, TAGGED with the photo it belongs to.
   *
   * It used to be a bare `fullSrc` cleared by hand on every path that changed
   * the photo. The effect's cleanup revokes the object URL, and one path never
   * cleared it: a refetch under an open viewer - liking a reply calls
   * ChangeLike -> GetComments, which hands back brand new file objects - left
   * the <img> pointing at a revoked blob, a blank frame for the whole of the
   * next download. Tagging makes a stale URL unrepresentable: it is only used
   * while it still matches the photo on screen. It also keeps the clearing out
   * of the effect BODY, which has to stay free of state writes.
   */
  const [full, setFull] = useState({ File: null, Src: null, Failure: "" });

  const count = Files.length;
  // Files is re-derived by the caller on every render, and a refetch can
  // shorten it - an attachment removed, or its bytes gone from the server so
  // the caller routes it to the chip row instead. Clamp rather than index past
  // the end: Files[index] would be undefined and this would render nothing at
  // all, while the caller still believes the viewer is open.
  const index = count ? Math.min(rawIndex, count - 1) : 0;
  const file = Files[index];
  const fullSrc = full.File === file ? full.Src : null;
  const failure = full.File === file ? full.Failure : "";

  const go = useCallback(
    (delta) => {
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
          if (!cancelled)
            setFull({ File: file, Src: null, Failure: message || "" });
          setLoadingFull(false);
          return;
        }
        revoked = URL.createObjectURL(blob);
        setFull({ File: file, Src: revoked, Failure: "" });
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

  // data-stop and stopPropagation stay even though the overlay is portalled
  // out: React events bubble through the REACT tree, not the DOM tree, so a
  // click in here still reaches FeedCard's card-wide onClick without them.
  return createPortal(
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
    </Box>,
    document.body,
  );
}
