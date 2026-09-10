/**
 * Shared file-type helpers for the feed's media.
 *
 * Lifted verbatim from customComponents/Advice/AdviceFileInfo.jsx so the reply
 * attachments and the post photos agree on what an image is. Extracting it here
 * rather than importing from that component keeps the two free to diverge
 * visually while staying identical on the question that matters.
 */

export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  "tiff",
  "tif",
];

export function isImageFile(file) {
  const ext = file && file.FileInfo && file.FileInfo.ext;
  return !!ext && IMAGE_EXTENSIONS.includes(String(ext).toLowerCase());
}

/**
 * Split an attachment list into renderable photos and everything else.
 * Documents never enter the photo grid - a PDF rendered as a grey tile in a
 * 2x2 mosaic tells the reader nothing; a named chip tells them what it is.
 */
export function partitionFiles(files) {
  const all = Array.isArray(files) ? files.filter(Boolean) : [];
  return {
    photos: all.filter(isImageFile),
    docs: all.filter((f) => !isImageFile(f)),
  };
}

/** Best available display name for an attachment. */
export function fileName(file) {
  const info = (file && file.FileInfo) || {};
  const base = info.Name || info.original_name || "file";
  return info.ext ? `${base}.${info.ext}` : base;
}
