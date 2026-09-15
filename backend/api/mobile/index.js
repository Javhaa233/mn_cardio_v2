const express = require('express');
const c = require('./controller');

/**
 * /api/mobile/* — configuration the apps read, not clinical data.
 *
 * Two endpoints with deliberately different gates:
 *
 *   /version  UNAUTHENTICATED. A build old enough to be blocked may be old
 *             enough that its login no longer works, and an update prompt
 *             behind a login is useless to someone who cannot log in. It
 *             discloses only what a public app store listing already does.
 *
 *   /config   AUTHENTICATED, but by token alone - patient or staff. Terms of
 *             service and a support number are not scoped to either role, so
 *             this is the one place in api/** that gates on VerifyTokenJson
 *             without RequirePatient or RequireDoctor after it.
 *
 * Mounted before the legacy route table in server.js for the same reason
 * /api/patient and /api/doctor are, and gated per route rather than at the
 * mount. See the header of api/patient/index.js.
 *
 * NOT behind the X-App-Build gate: an app being told to update must be able to
 * ask what to update to.
 */
const router = express.Router();

// §2.1 Автоматаар шинэчлэгдэх - the forced-update check
router.get('/version', c.version);

// §1.3 - terms of service text and version, support contact
router.get('/config', require('../../helper/VerifyTokenJson'), c.config);

module.exports = router;
