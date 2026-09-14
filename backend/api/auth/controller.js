const jwt = require('jsonwebtoken');
const Auth = require('../../helper/Auth');
const SessionStore = require('../../helper/SessionStore');

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
      // A signature-valid token can still have been cancelled.
      if (SessionStore.IsRevoked(decoded.jti)) return resolve(null);
      resolve(decoded.user);
    });
  });

/** The same, but keeping the jti - the session routes act on it. */
const verifyWithJti = (token) =>
  new Promise((resolve) => {
    if (!token) return resolve(null);
    jwt.verify(token, process.env.JWT_PASS, (err, decoded) => {
      if (err || !decoded || !decoded.user || !decoded.user.Id) return resolve(null);
      if (SessionStore.IsRevoked(decoded.jti)) return resolve(null);
      resolve({ user: decoded.user, jti: decoded.jti || null });
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

/* ------------------------------------------------------- session management */

const UserTypeOf = (user) => (String(user.RoleId) === '4' ? 'patient' : 'staff');

/**
 * POST /api/auth/logout
 *
 * Ends THIS session. The jti comes from the presented token, so one session
 * cannot be used to end another - there is no id to pass and nothing to guess.
 */
exports.logout = async (req, res) => {
  try {
    const decoded = await verifyWithJti(bearer(req));
    if (!decoded) return fail(res, 'TOKEN_INVALID', 'Токен буруу байна', 401);

    const revoked = decoded.jti ? await SessionStore.Revoke(decoded.jti, 'logout') : 0;
    // Success either way. A token with no jti pre-dates revocation and cannot
    // be cancelled individually; telling the client its logout failed would be
    // both useless and alarming, since it clears its own state regardless.
    return ok(res, { revoked });
  } catch (ex) {
    console.error('[api/auth] logout: ' + ex.message);
    return fail(res, 'SERVER_ERROR', 'Сервер дээр алдаа гарлаа', 500);
  }
};

/**
 * GET /api/auth/sessions
 *
 * Where am I signed in? Never returns a jti - that is the credential this
 * endpoint exists to let somebody cancel, not something to hand out.
 */
exports.sessions = async (req, res) => {
  try {
    const decoded = await verifyWithJti(bearer(req));
    if (!decoded) return fail(res, 'TOKEN_INVALID', 'Токен буруу байна', 401);

    const rows = await SessionStore.ListFor({
      UserType: UserTypeOf(decoded.user),
      UserId: decoded.user.Id,
    });

    return ok(
      res,
      rows.map((r) => ({
        Id: r.Id,
        DeviceName: r.DeviceName,
        IssuedDate: r.IssuedDate,
        LastSeenDate: r.LastSeenDate,
        ExpireDate: r.ExpireDate,
        IpAddress: r.IpAddress,
      }))
    );
  } catch (ex) {
    console.error('[api/auth] sessions: ' + ex.message);
    return fail(res, 'SERVER_ERROR', 'Сервер дээр алдаа гарлаа', 500);
  }
};

/**
 * POST /api/auth/logout-all
 *
 * Ends every session for this identity, including the one making the call.
 * This is the "I lost my phone" button, and the reason token revocation exists
 * at all - before it, the only way to achieve this was to rotate JWT_PASS and
 * sign out every user of the system.
 */
exports.logoutAll = async (req, res) => {
  try {
    const decoded = await verifyWithJti(bearer(req));
    if (!decoded) return fail(res, 'TOKEN_INVALID', 'Токен буруу байна', 401);

    const revoked = await SessionStore.RevokeAllFor({
      UserType: UserTypeOf(decoded.user),
      UserId: decoded.user.Id,
      reason: 'logout-all',
    });

    return ok(res, { revoked });
  } catch (ex) {
    console.error('[api/auth] logoutAll: ' + ex.message);
    return fail(res, 'SERVER_ERROR', 'Сервер дээр алдаа гарлаа', 500);
  }
};
