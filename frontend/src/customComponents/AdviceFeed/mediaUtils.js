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

export const AUDIO_EXTENSIONS = ["mp3", "m4a", "aac", "ogg", "wav", "weba"];

/**
 * '.webm' is video and '.weba' is audio/webm - the same container, told apart
 * by the only thing that can tell them apart. The recorder names its output by
 * which device it asked for, so the distinction is made where it is actually
 * known rather than guessed at here.
 *
 * These lists are only a fallback: the server sends FileInfo.Kind, computed
 * from the same two lists in backend/helper/MediaStream.js, and fileKind()
 * prefers it.
 */
export const VIDEO_EXTENSIONS = ["mp4", "m4v", "mov", "webm"];

function extOf(file) {
  const ext = file && file.FileInfo && file.FileInfo.ext;
  return ext ? String(ext).toLowerCase() : "";
}

export function isImageFile(file) {
  const ext = extOf(file);
  return !!ext && IMAGE_EXTENSIONS.includes(ext);
}

/**
 * What kind of thing this attachment is.
 *
 * Prefers FileInfo.Kind, which the server sets from the same list the streaming
 * layer uses, and falls back to the extension so an older payload - or the
 * Advice feed, which does not send Kind - still classifies.
 */
export function fileKind(file) {
  const given = file && file.FileInfo && file.FileInfo.Kind;
  if (given) return given;

  const ext = extOf(file);
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  return "file";
}

export function isAudioFile(file) {
  return fileKind(file) === "audio";
}

export function isVideoFile(file) {
  return fileKind(file) === "video";
}

/**
 * Split an attachment list into renderable photos and everything else.
 * Documents never enter the photo grid - a PDF rendered as a grey tile in a
 * 2x2 mosaic tells the reader nothing; a named chip tells them what it is.
 *
 * SPLITTING MEDIA OUT IS OPT-IN, and that is deliberate. `docs` has always
 * meant "everything that is not a photo", and the Advice feed renders exactly
 * photos plus docs - so quietly moving audio and video into new buckets would
 * make those attachments disappear from the feed entirely rather than merely
 * look different. Only a caller that actually renders `audios` and `videos`
 * asks for them.
 */
export function partitionFiles(files, { splitMedia = false } = {}) {
  const all = Array.isArray(files) ? files.filter(Boolean) : [];
  const photos = all.filter(isImageFile);

  if (!splitMedia) {
    return {
      photos,
      audios: [],
      videos: [],
      docs: all.filter((f) => !isImageFile(f)),
    };
  }

  const audios = all.filter(isAudioFile);
  const videos = all.filter(isVideoFile);
  const media = new Set([...photos, ...audios, ...videos]);

  return {
    photos,
    audios,
    videos,
    docs: all.filter((f) => !media.has(f)),
  };
}

/** Human clock for a duration in milliseconds: 0:07, 1:42, 12:05. */
export function durationLabel(ms) {
  const total = Math.max(0, Math.round(Number(ms || 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/**
 * Whether the server told us this attachment's bytes are not on the host.
 *
 * `Available` is set by BaseControllerHelper when it shapes the File row. A
 * server that does not send it leaves the flag undefined, which reads as
 * available - so an older backend behaves exactly as before.
 */
export function isMissing(file) {
  const info = (file && file.FileInfo) || {};
  return info.Available === false;
}

/** Best available display name for an attachment. */
export function fileName(file) {
  const info = (file && file.FileInfo) || {};
  const base = info.Name || info.original_name || "file";
  return info.ext ? `${base}.${info.ext}` : base;
}
