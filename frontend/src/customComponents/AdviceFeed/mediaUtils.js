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

/*
 * WHAT THE SERVER WILL ACCEPT ON AN ADVICE TICKET OR REPLY.
 *
 * BaseFileUpload's own default list is images, Office, PDF and VIDEO, with no
 * audio at all - so a doctor picking an .mp3 was refused by the browser before
 * a request was ever made, while a 60 MB video sailed past the client and was
 * rejected by the server with nothing on screen to explain why. Both halves
 * were wrong, in opposite directions.
 *
 * This is backend/helper/UploadPolicy.AllowedExtFor('AdviceComment') written
 * out: the global ALLOWED_UPLOAD_EXT plus 'weba'. If that list moves, this
 * moves with it - it is a mirror, not a second opinion.
 *
 * 'weba' is audio/webm, which is what a browser records when it cannot record
 * audio/mp4 (Firefox always, Chrome before 130), so a surface offering the
 * microphone has to admit its own recorder's output. 'webm' is on the server's
 * global list and so is here, but it is VIDEO and renders as a download chip:
 * video is not in scope on this surface.
 */
// Written out literally rather than derived from IMAGE_EXTENSIONS above. That
// list is the RENDERING question - what this app can draw in an <img> - and it
// is wider than what the server stores: it carries svg, ico, tif and tiff,
// none of which are on ALLOWED_UPLOAD_EXT. Deriving one from the other reads as
// tidier and quietly lets four extensions past the browser that the server will
// refuse, with nothing on screen to say why.
export const ADVICE_UPLOAD_EXT = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "csv",
  "dcm",
  ...AUDIO_EXTENSIONS,
  "webm",
];

/**
 * MB, matching UploadPolicy.UploadCapFor's default for Advice.
 *
 * The control's own default is 100, which is ten times what the server will
 * take. A 10-minute voice note at the recorder's 64 kbps is about 4.8 MB, so
 * this constrains documents and images, not recordings.
 */
export const ADVICE_MAX_FILE_MB = 10;

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
