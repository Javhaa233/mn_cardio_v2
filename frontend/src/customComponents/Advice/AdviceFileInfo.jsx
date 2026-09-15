import React from "react";

import Box from "@mui/material/Box";

import PostMedia from "customComponents/AdviceFeed/PostMedia";
import { forMediaView } from "customComponents/AdviceFeed/mediaUtils";

/**
 * Attachments on a remote-visit request (PatientPlatform/RemoteVisitList), for
 * both the patient and the doctor.
 *
 * It was a second copy of BaseFilesInfo's thumbnails and zoom dialog, with its
 * own image-extension list. It now renders AdviceFeed's PostMedia, so photos,
 * the lightbox and document chips look and behave as they do in the feed.
 */
export default function AdviceFileInfo({ Data = null }) {
  const Files = forMediaView(Data);
  if (!Files.length) return null;

  return (
    <Box sx={{ width: "100%", maxWidth: "520px" }}>
      <PostMedia Files={Files} FullBleedMargin="0" />
    </Box>
  );
}
