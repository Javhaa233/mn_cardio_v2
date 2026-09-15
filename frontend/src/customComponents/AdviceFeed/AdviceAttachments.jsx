import React from "react";
import { Box } from "@mui/material";

import Helper from "helper";
import VoiceNote from "customComponents/Chat/VoiceNote";
import PostMedia from "./PostMedia";
import { partitionFiles } from "./mediaUtils";

/**
 * Attachments on a зөвлөгөө ticket or on one of its replies.
 *
 * The Advice counterpart of Chat/MessageAttachments, and deliberately the same
 * shape: photos and documents keep going to PostMedia, and audio does not.
 *
 * WHY AUDIO IS SPLIT OUT. PostMedia fetches bytes as a blob and hands them to
 * URL.createObjectURL, because auth is header-based and an <img> cannot send a
 * header. That is right for a photo and wrong for a recording: the clip would
 * have to arrive COMPLETE before it made a sound, could not be seeked until it
 * had, and would sit in memory in full. Before this split a voice note landed
 * in PostMedia's `docs` bucket and rendered as a download chip - a reply you
 * could not listen to. VoiceNote streams a server-minted URL with real byte
 * ranges instead.
 *
 * VIDEO IS DELIBERATELY NOT SPLIT OUT. There is no video player on this
 * surface - the customer took audio and documents in scope and not video - and
 * partitionFiles warns that asking for a bucket you do not render makes those
 * attachments vanish entirely rather than merely look different. 'webm' is on
 * the global upload allowlist, so an Advice video file can already exist; it
 * stays in `docs` and renders as a named download chip, which is honest.
 *
 * The minting endpoint is Advice's own. Chat authorizes by room membership and
 * Advice by AdviceScopeHelper, and the thing that must not exist is one
 * endpoint that will mint a playback ticket for any file in the system.
 */
export default function AdviceAttachments({
  Files,
  FileTotal,
  FullBleedMargin,
}) {
  if (!Files || Files.length === 0) return null;

  const { audios, photos, docs } = partitionFiles(Files, { splitMedia: true });
  const rest = [...photos, ...docs];

  return (
    <Box>
      {audios.map((f) => (
        <VoiceNote
          key={`a-${f.FileInfo.id_data}`}
          File={f}
          FetchLink={Helper.AdviceHelper.GetAttachmentLink}
        />
      ))}

      {rest.length > 0 ? (
        <PostMedia
          Files={rest}
          // The "+N" badge counts photos, and the server counts them the same
          // way, so it is passed straight through rather than recomputed off a
          // list audio has just been removed from.
          FileTotal={FileTotal}
          FullBleedMargin={FullBleedMargin}
        />
      ) : null}
    </Box>
  );
}
