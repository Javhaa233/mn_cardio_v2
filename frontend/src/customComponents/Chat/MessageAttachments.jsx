import React from "react";
import { Box } from "@mui/material";

import PostMedia from "customComponents/AdviceFeed/PostMedia";
import { partitionFiles } from "customComponents/AdviceFeed/mediaUtils";
import VoiceNote from "./VoiceNote";
import VideoNote from "./VideoNote";

/**
 * Attachments inside a chat bubble.
 *
 * Photos and documents still go to the feed's PostMedia rather than to a second
 * media renderer. PostMedia already declares each tile's aspectRatio before the
 * image loads (which stops the list reflowing under the reader), and hands
 * photos to Lightbox - the only component in the app that solves the problem
 * that auth is header-based, so a plain <img src> to the download endpoint
 * cannot work and the bytes have to be fetched into an object URL.
 *
 * AUDIO AND VIDEO DO NOT GO THERE, because that blob approach is wrong for
 * them: a clip would have to arrive complete before it could start, could not
 * be seeked until it had, and would sit in memory in full. They get their own
 * players, which stream a server-minted URL with real byte ranges. Before this
 * split they fell into PostMedia's `docs` bucket and rendered as a download
 * chip - a voice message you could not listen to.
 *
 * Only two things still need overriding on PostMedia: its feed-sized defaults,
 * and where the bytes come from. Chat attachments must go through
 * /Chat/DownloadAttachment, which checks room membership -
 * /BaseObject/downloadFile does not check anything.
 */
export default function MessageAttachments({ Files, Mine }) {
  if (!Files || Files.length === 0) return null;

  const { audios, videos, photos, docs } = partitionFiles(Files, {
    splitMedia: true,
  });

  const rest = [...photos, ...docs];

  // `Mine` reaches the players because a voice note draws its own bubble
  // surface, and that surface has to be the same two colours - and the same
  // two contrast regimes - every other message uses.
  return (
    <Box sx={{ maxWidth: 320, mt: rest.length > 0 ? 0.5 : 0 }}>
      {audios.map((f) => (
        <VoiceNote key={`a-${f.FileInfo.id_data}`} File={f} Mine={Mine} />
      ))}

      {videos.map((f) => (
        <VideoNote key={`v-${f.FileInfo.id_data}`} File={f} />
      ))}

      {rest.length > 0 ? (
        <PostMedia
          Files={rest}
          FullBleedMargin="0px"
          DownloadSource={(f) => ({
            Url: "/Chat/DownloadAttachment",
            Body: { FileId: f && f.FileInfo && f.FileInfo.id_data },
          })}
        />
      ) : null}
    </Box>
  );
}
