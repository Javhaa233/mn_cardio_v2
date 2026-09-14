const express = require('express');
const c = require('./controller');

/**
 * /api/auth/* — session lifecycle for the mobile clients.
 *
 * Mounted in server.js WITHOUT Auth.verifyToken: these routes authenticate
 * themselves from the token in the body or the Bearer header, always with
 * strict jwt.verify (see controller.js).
 *
 * Login itself stays where it is — POST /api/User/Login for staff and
 * POST /api/PatientUser/Login for patients. This router does not duplicate it.
 */
const router = express.Router();

router.post('/refresh', c.refresh);
router.get('/session', c.session);

// End this session. The jti comes from the presented token, so one session
// cannot be used to end another
router.post('/logout', c.logout);
// Where am I signed in? Never returns a session identifier
router.get('/sessions', c.sessions);
// The "I lost my phone" button - ends every session for this identity
router.post('/logout-all', c.logoutAll);

module.exports = router;
