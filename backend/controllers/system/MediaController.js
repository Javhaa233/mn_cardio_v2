const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const router = express.Router();

const { Models } = require('../../config/DB');
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const { MayDownload } = require('../../helper/FileAccessHelper');
const MediaRef = require('../../helper/MediaRef');

/**
 * Streaming media, with byte ranges.
 *
 * WHY THIS EXISTS. The file layer serves POST plus
 * `Content-Disposition: attachment` (BaseController.downloadFile ->
 * res.download). That is a download, not a stream: a player cannot seek in it,
 * cannot start before the whole file has arrived, and on iOS will not play it
 * at all. Until this route existed, `RehabExercise.MediaRef` could not mean
 * anything - mobile/READINESS.md §2.4 records it as the thing blocking the 39
 * exercise videos.
 *
 * WHY A HEADER-AUTHENTICATED GET IS FINE HERE. The usual objection is that an
 * HTML <video> element cannot set an Authorization header, so media routes end
 * up taking a token in the query string. Flutter's VideoPlayerController takes
 * httpHeaders, and Flutter is the client - so the token stays in the header.
 * Do not "fix" this into ?token=: helper/SocketAuth.js already explains that a
 * token in a URL lands in nginx access logs and browser history, and a media URL
 * is exactly the sort of thing that gets copied around.
 *
 * AUTHORIZATION IS NOT REIMPLEMENTED HERE. It calls the same MayDownload that
 * /BaseObject/downloadFile does, which is why that function was moved to
 * helper/FileAccessHelper.js rather than duplicated.
 */

router.get('/stream/:generatedName', stream);
router.head('/stream/:generatedName', stream);
router.get('/exercise/:exerciseId', exercise);
router.head('/exercise/:exerciseId', exercise);

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

/** Send a file, honouring Range. Shared by both routes. */
function SendFile(req, res, Stored, OnDisk) {
  const ContentType = mime.contentType(Stored.ext) || 'application/octet-stream';
  const range = ParseRange(req.headers.range, OnDisk.Size);

  if (range === 'invalid') {
    res.set('Content-Range', 'bytes */' + OnDisk.Size);
    return res.status(416).end();
  }

  // inline, NOT attachment. That one header is the difference between a file
  // the browser downloads and a file a player can render.
  res.set('Content-Disposition', 'inline');
  res.set('Content-Type', ContentType);
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

/**
 * Stream any file the caller is allowed to read, by its generated_name.
 *
 * The path parameter is the client's handle; the bytes are resolved only from
 * the STORED row MayDownload returns, never from anything the caller sent.
 */
async function stream(req, res) {
  try {
    const generatedName = req.params.generatedName;
    if (!generatedName) return res.status(400).end();

    const Stored = await MayDownload({
      FileInfo: { generated_name: generatedName },
      LogedUser: req.LogedUser,
    });
    // 404, not 403: a refusal and a non-existent file are indistinguishable to
    // the caller, so this cannot be used to discover which files exist.
    if (!Stored) return res.status(404).end();

    const OnDisk = ResolveOnDisk(Stored.generated_name);
    // The row exists but the bytes do not. This is the normal state on the test
    // server, where the database was restored without the 23 GB of attachments
    // (deploy/README.md step 9) - so it is a plain 404, not an error worth
    // alarming anyone about.
    if (!OnDisk) return res.status(404).end();

    return SendFile(req, res, Stored, OnDisk);
  } catch (ex) {
    console.error('[MediaController/stream] ' + ex.message);
    return res.status(500).end();
  }
}

/**
 * The exercise video, by exercise id, so the client never builds a file path.
 *
 * Branches on the MediaRef scheme, which is what lets the customer's hosting
 * decision be a database value instead of an app release (helper/MediaRef.js):
 *
 *   file:  stream it from here
 *   url:   302 to wherever it actually lives
 *   asset: 409 - it is bundled in the app, the client already has it
 *   none:  404 - not filmed yet, which is every row today
 */
async function exercise(req, res) {
  try {
    const Id = parseInt(req.params.exerciseId, 10);
    if (!Id) return res.status(400).end();

    const Ex = await Models.RehabExercise.findByPk(Id, {
      attributes: ['Id', 'Code', 'MediaRef', 'IsActive'],
      raw: true,
    });
    if (!Ex || Ex.IsActive === false) return res.status(404).end();

    const Media = MediaRef.Parse(Ex.MediaRef);

    if (!Media.kind) return res.status(404).end();

    if (Media.kind === 'url') {
      // Short cache: the customer may repoint this at a different CDN, and a
      // long-lived redirect would outlive the decision.
      res.set('Cache-Control', 'private, max-age=300');
      return res.redirect(302, Media.url);
    }

    if (Media.kind === 'asset') {
      return res.status(409).json({
        success: false,
        code: 'MEDIA_BUNDLED',
        message: 'Бичлэг аппликейшнд суулгагдсан байна',
        data: { asset: Media.ref },
      });
    }

    // kind === 'file'. Authorized through the same MayDownload as everything
    // else - the catalogue is shared content, so FileAccessHelper lets any
    // authenticated caller read it, but it still has to be a real File row.
    const Stored = await MayDownload({
      FileInfo: { generated_name: Media.ref },
      LogedUser: req.LogedUser,
    });
    if (!Stored) return res.status(404).end();

    const OnDisk = ResolveOnDisk(Stored.generated_name);
    if (!OnDisk) return res.status(404).end();

    return SendFile(req, res, Stored, OnDisk);
  } catch (ex) {
    console.error('[MediaController/exercise] ' + ex.message);
    return res.status(500).end();
  }
}

module.exports = router;
