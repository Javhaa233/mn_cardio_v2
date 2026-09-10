import React from "react";
import { Box } from "@mui/material";

import PostMedia from "customComponents/AdviceFeed/PostMedia";

/**
 * Attachments inside a chat bubble.
 *
 * A thin wrapper over the feed's PostMedia rather than a second media renderer.
 * PostMedia already declares each tile's aspectRatio before the image loads
 * (which stops the list reflowing under the reader), partitions photos from
 * documents, and hands photos to Lightbox - which is the only component in the
 * app that solves the real problem here: auth is header-based, so a plain
 * <img src> to the download endpoint cannot work, and the bytes have to be
 * fetched and turned into an object URL.
 *
 * Only two things need overriding: its feed-sized defaults, and where the bytes
 * come from. Chat attachments must go through /Chat/DownloadAttachment, which
 * checks room membership - /BaseObject/downloadFile does not check anything.
 */
export default function MessageAttachments({ Files }) {
  if (!Files || Files.length === 0) return null;

  return (
    <Box sx={{ maxWidth: 320, mt: 0.5 }}>
      <PostMedia
        Files={Files}
        FullBleedMargin="0px"
        DownloadSource={(f) => ({
          Url: "/Chat/DownloadAttachment",
          Body: { FileId: f && f.FileInfo && f.FileInfo.id_data },
        })}
      />
    </Box>
  );
}
