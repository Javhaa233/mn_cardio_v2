const express = require('express');
const router = express.Router();

const Auth = require('../../helper/Auth');
const MediaTicket = require('../../helper/MediaTicket');
const { MayDownload } = require('../../helper/FileAccessHelper');
const { ResolveOnDisk, SendFile } = require('../../helper/MediaStream');

/**
 * Redeem a media ticket and stream the file.
 *
 * THE ONE UNAUTHENTICATED MEDIA ROUTE, and the only route in the application
 * that takes its credential from the URL. helper/MediaTicket.js sets out why
 * that is acceptable here and why it is not a precedent for anything else; read
 * it before adding a second caller.
 *
 * MOUNT ORDER IS LOAD-BEARING. server.js mounts this at /api/Media BEFORE the
 * token-gated MediaController. That works only because this router declares a
 * single path - /t/:ticket - so every other /api/Media/* request matches
 * nothing here and falls through to the gated router. Adding a second route to
 * this file silently removes authentication from whatever it matches.
 *
 * A TICKET IS A CLAIM, NOT A GRANT. It says which file and which user; it
 * carries no permission of its own. The user is re-loaded from the database and
 * MayDownload runs exactly as it would for a bearer-header request, so an
 * outstanding ticket stops working the moment the underlying access does -
 * a member removed from a chat room, a soft-deleted file.
 */

router.get('/t/:ticket', redeem);
router.head('/t/:ticket', redeem);

async function redeem(req, res) {
  try {
    const Claim = MediaTicket.Verify(req.params.ticket);
    // Forged, edited, or expired. 404 rather than 401: this route has no
    // session to renew, and a distinct status would confirm that the file
    // behind a guessed ticket exists.
    if (!Claim) return res.status(404).end();

    // Rebuild the same LogedUser that Auth.verifyToken would have produced, so
    // MayDownload sees exactly what it sees on every other route - PatientId,
    // Doctor.OrganizationId and all. This read is cached inside Auth.
    const LogedUser = await Auth.fetchFullUserData(Claim.UserId, Claim.RoleId);
    if (!LogedUser) return res.status(404).end();

    const Stored = await MayDownload({
      FileInfo: { generated_name: Claim.generatedName },
      LogedUser,
    });
    if (!Stored) return res.status(404).end();

    const OnDisk = ResolveOnDisk(Stored.generated_name);
    // The row exists but the bytes do not - the normal state on the test
    // server, which was restored without the attachment directory.
    if (!OnDisk) return res.status(404).end();

    return SendFile(req, res, Stored, OnDisk);
  } catch (ex) {
    console.error('[MediaTicketController/redeem] ' + ex.message);
    return res.status(500).end();
  }
}

module.exports = router;
