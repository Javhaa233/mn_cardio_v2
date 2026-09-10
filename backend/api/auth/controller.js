const jwt = require('jsonwebtoken');
const Auth = require('../../helper/Auth');

/**
 * Handlers for /api/auth/*.
 *
 * These authenticate themselves, so the router is mounted WITHOUT
 * Auth.verifyToken. Two consequences that are deliberate:
 *
 *  - verification here is always strict. verifyToken downgrades to jwt.decode()
 *    when NODE_ENV === 'development' (helper/Auth.js), which would let an
 *    unsigned token be exchanged for a signed one. jwt.verify is called
 *    directly below so that hole cannot be reached through this route.
 *  - no route reveals whether a token was expired, malformed or forged; they
 *    all return the same TOKEN_INVALID.
 *
 * Envelope is the lowercase { success, message, data, code } used by api/**.
 */

const ok = (res, data) => res.json({ success: true, message: '', data });

const fail = (res, code, message, status) =>
  res.status(status || 400).json({ success: false, code, message, data: null });

/** Strict verify. Resolves to the decoded payload or null; never throws. */
const verifyAccessToken = (token) =>
  new Promise((resolve) => {
    if (!token) return resolve(null);
    jwt.verify(token, process.env.JWT_PASS, (err, decoded) => {
      if (err || !decoded || !decoded.user || !decoded.user.Id) return resolve(null);
      resolve(decoded.user);
    });
  });

const bearer = (req) => {
  const header = req.headers['authorization'];
  if (!header || typeof header !== 'string') return null;
  const parts = header.split(' ');
  return parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;
};

/**
 * POST /api/auth/refresh
 *
 * Accepts either a refresh token in the body or a still-valid access token as a
 * Bearer header, and returns a new pair.
 *
 * The Bearer path exists so a client can obtain its first refresh token without
 * the login endpoints changing shape - both of those are long functions with
 * several response points, and adding a field to each is a change with more
 * risk than value. A mobile client logs in as it does today, calls this once,
 * and holds the refresh token from then on.
 *
 * Both paths re-read the user from the database, so a deactivated account stops
 * refreshing.
 */
exports.refresh = async (req, res) => {
  try {
    const RefreshToken = req.body ? req.body.refreshToken || req.body.RefreshToken : null;
    let identity = null;

    if (RefreshToken) {
      identity = await Auth.verifyRefreshToken(RefreshToken);
    } else {
      const user = await verifyAccessToken(bearer(req));
      if (user) identity = { Id: user.Id, RoleId: user.RoleId };
    }

    if (!identity) {
      return fail(res, 'TOKEN_INVALID', 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү', 401);
    }

    const issued = await Auth.reissue(identity);
    if (!issued) {
      // The token verified but the account behind it no longer resolves.
      return fail(res, 'USER_NOT_FOUND', 'Хэрэглэгчийн мэдээлэл олдсонгүй', 401);
    }

    return ok(res, {
      token: issued.token,
      refreshToken: issued.refreshToken,
      expiresIn: issued.expiresIn,
      LogedUser: issued.LogedUser,
    });
  } catch (ex) {
    console.error('[api/auth] refresh:', ex);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Сервер дээр алдаа гарлаа',
      data: null,
    });
  }
};

/**
 * GET /api/auth/session
 *
 * Is this access token still good, and who is it? Lets a client decide on
 * launch whether to refresh, without calling a resource endpoint and reading
 * the answer out of an error.
 */
exports.session = async (req, res) => {
  try {
    const user = await verifyAccessToken(bearer(req));
    if (!user) return fail(res, 'TOKEN_INVALID', 'Нэвтрэх хугацаа дууссан байна', 401);

    return ok(res, {
      Id: user.Id,
      UserName: user.UserName,
      RoleId: user.RoleId,
      OrganizationId: user.OrganizationId || null,
      IsPatient: String(user.RoleId) === '4',
    });
  } catch (ex) {
    console.error('[api/auth] session:', ex);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Сервер дээр алдаа гарлаа',
      data: null,
    });
  }
};
