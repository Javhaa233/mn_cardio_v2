const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const BaseControllerHelper = require('./BaseControllerHelper');

/**
 * Serving bytes to a player, with byte ranges.
 *
 * Lifted out of controllers/system/MediaController.js when a second router
 * needed the same behaviour. There are now two ways to authorize a media
 * request - a bearer header (Flutter, which can set one) and a minted ticket
 * (a browser <video>, which cannot) - and exactly one way to send the bytes.
 * Keeping that one way here is the point of this file: a second copy of
 * ParseRange is how you get a video that plays and then corrupts near the end
 * on one route but not the other.
 *
 * Nothing here authorizes anything. Callers resolve and authorize the File row
 * first and pass the row in.
 */

/**
 * Content types we are willing to serve INLINE.
 *
 * Inline means the browser renders it in place, which is exactly what makes a
 * player possible and exactly what makes a stored-XSS matter. The upload list
 * in BaseController does not currently admit svg or html, so this is defence in
 * depth rather than a fix - but it is the layer that has to hold if that list
 * is ever widened, because widening it is a one-line change made for unrelated
 * reasons.
 *
 * Anything not on this list is still served, as an opaque download.
 */
const INLINE_SAFE_EXT = [
  // audio
  'mp3',
  'm4a',
  'aac',
  'ogg',
  'wav',
  // video
  'mp4',
  'm4v',
  'mov',
  'webm',
  // images
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'heic',
  'weba',
  // documents
  'pdf',
];

/**
 * Types `mime-types` does not know, or gets wrong for our purposes.
 *
 * 'weba' is not in the mime-db at all, so without this it would fall to
 * application/octet-stream and be served as a download - which is exactly the
 * thing a player cannot consume.
 */
const CONTENT_TYPE_OVERRIDE = {
  weba: 'audio/webm',
};

// 'weba' is audio/webm. It is how a BROWSER voice note arrives when the browser
// has no audio/mp4 recorder - Firefox always, Chrome before 130 - and it exists
// as a separate extension precisely because '.webm' alone cannot say whether
// there is a picture in it. See Kind() below.
const AUDIO_EXT = ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'weba'];
const VIDEO_EXT = ['mp4', 'm4v', 'mov', 'webm'];
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic'];

/**
 * What KIND of thing this is, for a client deciding which player to render.
 *
 * '.webm' is video and '.weba' is audio, and keeping them apart is the whole
 * point of using both. The container is identical, so the extension is the only
 * thing that can carry the distinction - and the recorder is the one component
 * that knows, because it asked for a microphone or for a camera.
 *
 * Getting this wrong is not cosmetic. A voice note classified as video renders
 * as a black rectangle with a play button instead of a voice bubble. It would
 * eventually correct itself, because MediaTranscode rewrites the file to .m4a -
 * but only on a host that has ffmpeg, and never for the window before that runs.
 */
function Kind(ext) {
  const Ext = String(ext || '').toLowerCase();
  if (AUDIO_EXT.indexOf(Ext) !== -1) return 'audio';
  if (VIDEO_EXT.indexOf(Ext) !== -1) return 'video';
  if (IMAGE_EXT.indexOf(Ext) !== -1) return 'image';
  return 'file';
}

/** The legacy quirk: some older uploads are a DIRECTORY containing `file`. */
function ResolveOnDisk(generatedName) {
  const validated = BaseControllerHelper.ValidateFilePath(generatedName);
  if (!fs.existsSync(validated)) return null;

  const stat = fs.statSync(validated);
  // BaseDownloadFile and FileExistsOnHost both handle this, and a large share
  // of the existing corpus is stored that way. Omitting it here would 404 files
  // that download perfectly well through the old route - the single easiest
  // mistake to make in this file.
  const filePath = stat.isDirectory() ? path.join(validated, 'file') : validated;
  if (!fs.existsSync(filePath)) return null;

  return { Path: filePath, Size: fs.statSync(filePath).size };
}

/**
 * Parse an HTTP Range header.
 *
 * Returns null for "no range, send the whole thing", or {start,end}, or the
 * string 'invalid' for something that parses but cannot be satisfied - which is
 * a 416 rather than a 400, because the request was well-formed and the resource
 * simply does not have those bytes.
 */
function ParseRange(header, size) {
  if (!header) return null;

  const m = String(header).match(/^bytes=(\d*)-(\d*)$/);
  if (!m) return 'invalid';

  const hasStart = m[1] !== '';
  const hasEnd = m[2] !== '';
  if (!hasStart && !hasEnd) return 'invalid';

  let start;
  let end;

  if (!hasStart) {
    // 'bytes=-500' means the LAST 500 bytes, not the first 500. Getting this
    // backwards produces a video that plays and then corrupts near the end.
    const suffix = parseInt(m[2], 10);
    if (!suffix) return 'invalid';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = parseInt(m[1], 10);
    end = hasEnd ? parseInt(m[2], 10) : size - 1;
  }

  if (isNaN(start) || isNaN(end) || start > end || start >= size) return 'invalid';
  if (end >= size) end = size - 1;

  return { start, end };
}

/**
 * Decide Content-Type and Content-Disposition together.
 *
 * These two are one decision, not two: a type the browser will execute is only
 * dangerous because the disposition told it to render. Anything off the
 * allowlist loses both its real type and its inline treatment.
 */
function Disposition(ext) {
  const Ext = String(ext || '').toLowerCase();

  if (INLINE_SAFE_EXT.indexOf(Ext) === -1) {
    return { ContentType: 'application/octet-stream', Inline: false };
  }

  const Type = CONTENT_TYPE_OVERRIDE[Ext] || mime.contentType(Ext) || 'application/octet-stream';
  return { ContentType: Type, Inline: true };
}

/** Send a file, honouring Range. Shared by every media route. */
function SendFile(req, res, Stored, OnDisk) {
  const { ContentType, Inline } = Disposition(Stored.ext);
  const range = ParseRange(req.headers.range, OnDisk.Size);

  if (range === 'invalid') {
    res.set('Content-Range', 'bytes */' + OnDisk.Size);
    return res.status(416).end();
  }

  // inline, NOT attachment. That one header is the difference between a file
  // the browser downloads and a file a player can render.
  res.set('Content-Disposition', Inline ? 'inline' : 'attachment');
  res.set('Content-Type', ContentType);
  // Without this, a browser may sniff the bytes and decide for itself that the
  // octet-stream above is really HTML - which would undo the allowlist.
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Accept-Ranges', 'bytes');
  // private: this is one patient's or one clinic's media; a shared proxy cache
  // must never hold it.
  res.set('Cache-Control', 'private, max-age=3600');

  if (req.method === 'HEAD') {
    res.set('Content-Length', String(OnDisk.Size));
    return res.status(200).end();
  }

  if (!range) {
    res.set('Content-Length', String(OnDisk.Size));
    return fs.createReadStream(OnDisk.Path).pipe(res);
  }

  res.status(206);
  res.set('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + OnDisk.Size);
  res.set('Content-Length', String(range.end - range.start + 1));
  return fs.createReadStream(OnDisk.Path, { start: range.start, end: range.end }).pipe(res);
}

module.exports = {
  ResolveOnDisk,
  ParseRange,
  SendFile,
  Disposition,
  Kind,
  INLINE_SAFE_EXT,
  AUDIO_EXT,
  VIDEO_EXT,
  IMAGE_EXT,
};
