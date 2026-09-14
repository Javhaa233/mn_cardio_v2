const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');
const { MayDownload } = require('../../helper/FileAccessHelper');
const MediaRef = require('../../helper/MediaRef');
const { ResolveOnDisk, SendFile } = require('../../helper/MediaStream');

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
 * WHY THIS ROUTE IS HEADER-AUTHENTICATED. An HTML <video> element cannot set an
 * Authorization header, so media routes are often "fixed" by taking a session
 * token in the query string. Do not do that here: helper/SocketAuth.js explains
 * that a token in a URL lands in nginx access logs and browser history, and a
 * media URL is exactly the sort of thing that gets copied around. Flutter's
 * VideoPlayerController takes httpHeaders, so the mobile client - the one this
 * route was written for - keeps its token in the header and needs nothing else.
 *
 * THE BROWSER CASE IS SERVED ELSEWHERE. MediaTicketController answers
 * /api/Media/t/:ticket with a short-lived credential scoped to ONE file and ONE
 * user, minted only after a full authorization check and re-checked on
 * redemption. That is deliberately not a session token, and it is why this file
 * did not have to grow a ?token= branch.
 *
 * AUTHORIZATION IS NOT REIMPLEMENTED HERE. It calls the same MayDownload that
 * /BaseObject/downloadFile does, which is why that function was moved to
 * helper/FileAccessHelper.js rather than duplicated. Sending the bytes is
 * likewise helper/MediaStream.js, shared with the ticket route.
 */

router.get('/stream/:generatedName', stream);
router.head('/stream/:generatedName', stream);
router.get('/exercise/:exerciseId', exercise);
router.head('/exercise/:exerciseId', exercise);

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
