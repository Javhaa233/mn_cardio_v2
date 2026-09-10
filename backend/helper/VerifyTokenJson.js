const Auth = require('./Auth');

/**
 * Auth.verifyToken, with its failure translated into the api/** envelope.
 *
 * verifyToken answers an auth failure with the legacy shape and HTTP 200:
 *
 *   200 { Success: false, Message: 'There is a user who is not logged into the
 *         system', AuthError: true }
 *
 * That is correct for the 47 legacy routes - the web client reads exactly that
 * - but wrong for /api/patient and /api/doctor, which promise real status codes
 * and the lowercase envelope. Without this shim a mobile client checking
 * response.statusCode treats an expired session as a successful empty response,
 * which is the single most common way this backend misleads a caller.
 *
 * verifyToken itself is untouched: it is on every protected route, and changing
 * its response shape would break the frontend's session handling. This wraps
 * res.send for the duration of that one call, converts the auth error if it
 * appears, and restores the original immediately either way.
 */
const AUTH_ERROR_BODY = {
  success: false,
  code: 'TOKEN_INVALID',
  message: 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү',
  data: null,
};

const verifyTokenJson = (req, res, next) => {
  const originalSend = res.send;
  let restored = false;

  const restore = () => {
    if (!restored) {
      res.send = originalSend;
      restored = true;
    }
  };

  res.send = function (body) {
    let parsed = body;
    if (typeof body === 'string') {
      try {
        parsed = JSON.parse(body);
      } catch (ex) {
        parsed = null;
      }
    }

    restore();

    if (parsed && parsed.AuthError === true) {
      return res.status(401).json(AUTH_ERROR_BODY);
    }
    return originalSend.call(this, body);
  };

  return Auth.verifyToken(req, res, (err) => {
    restore();
    return next(err);
  });
};

module.exports = verifyTokenJson;
