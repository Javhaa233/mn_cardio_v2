import React, { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import { partitionFiles, fileName } from "./mediaUtils";
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
      <Box
        component="img"
        src={file.FileSrc}
        alt={fileName(file)}
        loading="lazy"
        decoding="async"
        sx={{
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
  const [openAt, setOpenAt] = useState(-1);
  const { photos, docs } = partitionFiles(Files);
  const extra = Math.max(0, (FileTotal || photos.length) - photos.length);

  if (!photos.length && !docs.length) return null;

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
        <Box
          component="img"
          src={f.FileSrc}
          alt={fileName(f)}
          loading="lazy"
          decoding="async"
          sx={{
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

      {docs.length ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: space[2],
            mt: space[3],
          }}
        >
          {docs.map((f, i) => (
            <Chip
              key={i}
              data-stop
              icon={docIcon(f.FileInfo && f.FileInfo.ext)}
              label={fileName(f)}
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                Helper.BaseCrudHelper.BaseDownloadFile(
                  f,
                  null,
                  DownloadSource && DownloadSource(f),
                );
              }}
              sx={{
                borderRadius: radius.sm,
                borderColor: colors.brand.hairline,
                color: colors.brand.ink,
                maxWidth: "100%",
              }}
            />
          ))}
        </Box>
      ) : null}

      {openAt >= 0 ? (
        <Lightbox
          Files={photos}
          StartIndex={openAt}
          onClose={() => setOpenAt(-1)}
          DownloadSource={DownloadSource}
        />
      ) : null}
    </>
  );
}
