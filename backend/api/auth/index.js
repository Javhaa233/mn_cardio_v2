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

module.exports = router;
