import React, { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { partitionFiles, fileName, isMissing } from "./mediaUtils";
import Lightbox from "./Lightbox";

/**
 * Exported so the chat composer can chip a pending attachment with the same
 * glyph the feed uses for a sent one. It lives here rather than in
 * mediaUtils.js because that file is `.js` and this returns JSX.
 */
export const docIcon = (ext) => {
  const e = String(ext || "").toLowerCase();
  if (e === "pdf") return <PictureAsPdfOutlinedIcon fontSize="small" />;
  if (["doc", "docx", "txt", "rtf"].includes(e))
    return <DescriptionOutlinedIcon fontSize="small" />;
  return <InsertDriveFileOutlinedIcon fontSize="small" />;
};

/**
 * A photo that fails politely.
 *
 * `isMissing()` already moves an attachment to the chip row when the SERVER
 * says the bytes are gone (`FileInfo.Available === false`). It cannot catch
 * the other case: the server believes the file is there and the fetch fails
 * anyway - a file restored without its bytes, a permission change, a dead
 * mount. Then the browser draws its broken-image glyph and, because `alt`
 * carries the filename, a wall of text like
 * "image_picker_2F4BF875-7975-4EE6-84AE-5ADE6965C0EC.jpg" inside the bubble.
 *
 * On error this becomes the same muted placeholder a missing file gets
 * elsewhere, so a patient sees "зураг үзэх боломжгүй" rather than debris.
 */
function MediaImage({ Src, Name, Sx }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  // An EMPTY src is the case that actually turned up, and it needs catching
  // before render rather than in onError: Chrome treats `<img src="">` as
  // already complete, makes no request and fires no error event, so it just
  // sits there as the broken glyph forever. Measured: complete=true,
  // naturalWidth=0, zero network requests.
  if (!Src || failed) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 96,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: space[1],
          color: colors.brand.inkMuted,
          backgroundColor: colors.brand.tintSolid,
          padding: space[2],
          textAlign: "center",
        }}
      >
        <InsertDriveFileOutlinedIcon fontSize="small" />
        <Box sx={{ fontSize: "12.5px" }}>{t("Зураг үзэх боломжгүй")}</Box>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={Src}
      // A generic alt, with the filename on hover instead. These names are
      // device-generated - image_picker_2F4BF875-7975-4EE6-84AE-... - so
      // reading one aloud tells a screen-reader user nothing about the photo
      // and buries the rest of the message.
      alt={t("Хавсралт зураг")}
      title={Name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      sx={Sx}
    />
  );
}

/**
 * A single photo tile.
 *
 * `aspectRatio` is declared before the image loads and never removed, so the
 * card reserves its final height immediately. Without that, an infinite feed
 * reflows under the reader's cursor every time a photo resolves - which is the
 * single most irritating thing a feed can do.
 */
function Tile({ file, ratio, onOpen, overlay, index }) {
  return (
    <Box
      data-stop
      role="button"
      tabIndex={0}
      aria-label={fileName(file)}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(index);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onOpen(index);
        }
      }}
      sx={{
        position: "relative",
        aspectRatio: ratio,
        overflow: "hidden",
        cursor: "pointer",
        backgroundColor: "rgba(13, 58, 92, 0.04)",
        "&:focus-visible": {
          outline: `2px solid ${colors.brand.focus}`,
          outlineOffset: "-2px",
        },
      }}
    >
      <MediaImage
        Src={file.FileSrc}
        Name={fileName(file)}
        Sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {overlay ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(12, 34, 51, 0.55)",
            color: "#fff",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          +{overlay}
        </Box>
      ) : null}
    </Box>
  );
}

/**
 * Facebook-style media for one post.
 *
 *   1 photo  - full width, NEVER cropped. This is the case that matters
 *              clinically: a portrait chest X-ray must be shown whole, so the
 *              tile uses `contain` against a faint plate and bounds by height
 *              rather than cropping to a fixed ratio.
 *   2        - side by side, square
 *   3        - one large left, two stacked right
 *   4+       - 2x2 with a "+N" overlay on the last tile
 *
 * The 2/3/4+ grids DO crop, deliberately: their job is to say how many and
 * roughly what, and one click gives the uncropped original in the lightbox.
 *
 * Gaps are 2px and the container background shows through them, so the seams
 * read as hairlines rather than as white gutters.
 */
export default function PostMedia({
  Files,
  FileTotal,
  FullBleedMargin = "-16px",
  // Optional (file) => ({ Url, Body }) override for where bytes are fetched
  // from. Chat passes a membership-checked endpoint; the feed passes nothing.
  DownloadSource,
}) {
  const { t } = useTranslation();
  const [openAt, setOpenAt] = useState(-1);
  const { photos: allPhotos, docs } = partitionFiles(Files);

  /*
   * An attachment whose bytes are gone from the server cannot be a tile: there
   * is no thumbnail either, so it rendered as a broken <img> and clicking it
   * opened an empty lightbox. Route it into the chip row instead, where it can
   * say what it is and that it is unavailable.
   */
  const photos = allPhotos.filter((f) => !isMissing(f));
  const chips = [...docs, ...allPhotos.filter(isMissing)];
  const extra = Math.max(0, (FileTotal || allPhotos.length) - allPhotos.length);

  if (!photos.length && !chips.length) return null;

  /*
   * `openAt` is an index into `photos`, and `photos` is re-derived from the
   * incoming Files on every render. A thread that refetches under an open
   * viewer can hand back a shorter list - a reply's attachment removed, or its
   * bytes gone from the server so isMissing() moves it to the chip row - and
   * the index would then point past the end. Clamping keeps an open viewer on
   * a photo that exists, and closes it outright once there are none left,
   * rather than leaving openAt >= 0 with nothing on screen.
   */
  const openIndex = openAt < 0 ? -1 : Math.min(openAt, photos.length - 1);

  const open = (i) => setOpenAt(i);

  let grid = null;
  if (photos.length === 1) {
    const f = photos[0];
    grid = (
      <Box
        data-stop
        role="button"
        tabIndex={0}
        aria-label={fileName(f)}
        onClick={(e) => {
          e.stopPropagation();
          open(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            open(0);
          }
        }}
        sx={{
          cursor: "pointer",
          backgroundColor: "rgba(13, 58, 92, 0.04)",
          display: "flex",
          justifyContent: "center",
          "&:focus-visible": {
            outline: `2px solid ${colors.brand.focus}`,
            outlineOffset: "-2px",
          },
        }}
      >
        <MediaImage
          Src={f.FileSrc}
          Name={fileName(f)}
          Sx={{
            width: "100%",
            height: "auto",
            maxHeight: "min(620px, 78vh)",
            objectFit: "contain",
            display: "block",
          }}
        />
      </Box>
    );
  } else if (photos.length === 2) {
    grid = (
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
        {photos.map((f, i) => (
          <Tile key={i} file={f} ratio="1 / 1" onOpen={open} index={i} />
        ))}
      </Box>
    );
  } else if (photos.length === 3) {
    grid = (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "2px",
          aspectRatio: "3 / 2",
          "& > :first-of-type": { gridRow: "span 2" },
        }}
      >
        {photos.map((f, i) => (
          <Tile key={i} file={f} ratio="auto" onOpen={open} index={i} />
        ))}
      </Box>
    );
  } else if (photos.length >= 4) {
    const shown = photos.slice(0, 4);
    grid = (
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
        {shown.map((f, i) => (
          <Tile
            key={i}
            file={f}
            ratio="1 / 1"
            onOpen={open}
            index={i}
            overlay={i === 3 ? photos.length - 4 + extra : 0}
          />
        ))}
      </Box>
    );
  }

  return (
    <>
      {grid ? (
        <Box
          sx={{
            // Full bleed: cancel the card's own horizontal padding so the
            // photos run edge to edge. Nothing else on the page does this,
            // which is what gives them the visual weight.
            mx: FullBleedMargin,
            mt: space[3],
            backgroundColor: colors.brand.hairline,
            overflow: "hidden",
          }}
        >
          {grid}
        </Box>
      ) : null}

      {chips.length ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: space[2],
            mt: space[3],
          }}
        >
          {chips.map((f, i) => {
            const missing = isMissing(f);
            const chip = (
              <Chip
                key={i}
                data-stop
                icon={docIcon(f.FileInfo && f.FileInfo.ext)}
                label={fileName(f)}
                variant="outlined"
                size="small"
                // A file the server cannot serve is not offered as a click.
                onClick={
                  missing
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        Helper.BaseCrudHelper.BaseDownloadFile(
                          f,
                          null,
                          DownloadSource && DownloadSource(f),
                        );
                      }
                }
                sx={{
                  borderRadius: radius.sm,
                  borderColor: colors.brand.hairline,
                  color: missing ? colors.brand.inkMuted : colors.brand.ink,
                  maxWidth: "100%",
                  ...(missing
                    ? {
                        opacity: 0.65,
                        cursor: "not-allowed",
                        textDecoration: "line-through",
                      }
                    : null),
                }}
              />
            );
            return missing ? (
              <Tooltip key={i} title={t("Файл серверт олдсонгүй")}>
                <span>{chip}</span>
              </Tooltip>
            ) : (
              chip
            );
          })}
        </Box>
      ) : null}

      {openIndex >= 0 ? (
        <Lightbox
          Files={photos}
          StartIndex={openIndex}
          onClose={() => setOpenAt(-1)}
          DownloadSource={DownloadSource}
        />
      ) : null}
    </>
  );
}
