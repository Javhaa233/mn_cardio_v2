/**
 * Token revocation, as an in-memory denylist.
 *
 * THE DESIGN DECISION, because the obvious alternative is much worse.
 * A session table checked per request would put a database read in front of all
 * 47 legacy prefixes and every mobile route, on every call, to answer "not
 * revoked" almost every time. Instead this holds the jti values that are BOTH
 * revoked AND not yet expired - a set that is empty on a healthy day and holds
 * a handful after an incident - and refreshes it on a timer.
 *
 * The cost is bounded and stated: a revoked token can still work for up to
 * TOKEN_REVOCATION_REFRESH_SEC (default 30). For "I lost my phone" that is the
 * right trade against a query per request forever.
 *
 * LEGACY TOKENS HAVE NO jti AND MUST KEEP WORKING. helper/Auth.js never put one
 * in the payload, and an access token lives ten hours. Treating a missing jti
 * as invalid would log out every active session the moment this deploys -
 * exactly the outage the feature exists to prevent. So AllowLegacy defaults to
 * true; flip TOKEN_REVOCATION_ALLOW_LEGACY to false eleven hours after the
 * deploy, once nothing without a jti can still be valid.
 *
 * DISABLED BY DEFAULT. With TOKEN_REVOCATION_ENABLED false nothing here runs
 * and the behaviour is exactly what it was.
 */

const crypto = require('crypto');

const Flags = require('./FeatureFlags');
const SchemaProbe = require('./SchemaProbe');
const ObjectHelper = require('./ObjectHelper');
const { Models, Op } = require('../config/DB');

/** jti values that are revoked and not yet expired. */
let Denied = new Set();
let LastRefresh = 0;
let Refreshing = false;

const Available = async () => {
  if (!Flags.TokenRevocationEnabled) return false;
  await SchemaProbe.Warm();
  return SchemaProbe.HasTable('UserSession') && !!Models.UserSession;
};

/** A token id. Random, not derived from anything about the user. */
const NewJti = () => crypto.randomUUID();

/**
 * Reload the denylist if it is stale. Cheap to call often; does nothing until
 * the interval has passed.
 */
async function Refresh(force) {
  if (!(await Available())) return;

  const Now = Date.now();
  const IntervalMs = Flags.TokenRevocationRefreshSec * 1000;
  if (!force && Now - LastRefresh < IntervalMs) return;
  if (Refreshing) return;

  Refreshing = true;
  try {
    const rows = await Models.UserSession.findAll({
      where: {
        RevokedDate: { [Op.ne]: null },
        // Expired tokens are already worthless, so keeping them in the set
        // would grow it without bound for no benefit.
        ExpireDate: { [Op.gt]: new Date() },
      },
      attributes: ['Jti'],
      raw: true,
    });
    Denied = new Set(rows.map((r) => r.Jti).filter(Boolean));
    LastRefresh = Now;
  } catch (ex) {
    // Keep the previous set rather than emptying it. A failed refresh must not
    // silently un-revoke somebody's stolen session.
    console.error('[SessionStore] refresh failed, keeping previous denylist: ' + ex.message);
  } finally {
    Refreshing = false;
  }
}

/**
 * Is this token revoked?
 *
 * Synchronous on purpose - it is called from verifyToken, which is on every
 * request. The refresh is kicked off in the background and never awaited here.
 */
function IsRevoked(jti) {
  if (!Flags.TokenRevocationEnabled) return false;

  if (!jti) {
    // No jti: either a token issued before this existed, or a forgery. Which
    // one it is cannot be told apart, which is why the flag exists.
    return !Flags.TokenRevocationAllowLegacy;
  }

  // Fire-and-forget; the answer below uses whatever the set currently holds.
  Refresh(false);
  return Denied.has(jti);
}

/** Record a newly issued session. Best-effort: a failure must not block login. */
async function Record({ UserType, UserId, Jti, RefreshJti, ExpiresInSec, Req, DeviceName }) {
  try {
    if (!(await Available())) return null;

    const Now = new Date();
    const created = await Models.UserSession.create({
      UserType: UserType || 'staff',
      UserId,
      Jti,
      RefreshJti: RefreshJti || null,
      IssuedDate: ObjectHelper.getDateYMDHMS(),
      ExpireDate: new Date(Now.getTime() + (ExpiresInSec || 36000) * 1000),
      LastSeenDate: ObjectHelper.getDateYMDHMS(),
      DeviceName: DeviceName ? String(DeviceName).slice(0, 100) : null,
      IpAddress: Req ? String(Req.ip || '').slice(0, 45) : null,
    });
    return created.Id;
  } catch (ex) {
    console.error('[SessionStore] could not record session: ' + ex.message);
    return null;
  }
}

/** Revoke one session by its access-token id. */
async function Revoke(jti, reason) {
  if (!jti || !(await Available())) return 0;

  const [count] = await Models.UserSession.update(
    { RevokedDate: ObjectHelper.getDateYMDHMS(), RevokedReason: reason || 'logout' },
    { where: { Jti: jti, RevokedDate: null } }
  );

  // Add locally at once rather than waiting for the next refresh - otherwise
  // "log out" appears not to work for up to 30 seconds on the very request
  // where the user is watching.
  if (count) Denied.add(jti);
  return count;
}

/** Revoke every live session for one identity. "Log out everywhere". */
async function RevokeAllFor({ UserType, UserId, reason }) {
  if (!UserId || !(await Available())) return 0;

  const rows = await Models.UserSession.findAll({
    where: { UserType: String(UserType), UserId, RevokedDate: null },
    attributes: ['Jti'],
    raw: true,
  });

  const [count] = await Models.UserSession.update(
    { RevokedDate: ObjectHelper.getDateYMDHMS(), RevokedReason: reason || 'logout-all' },
    { where: { UserType: String(UserType), UserId, RevokedDate: null } }
  );

  rows.forEach((r) => r.Jti && Denied.add(r.Jti));
  return count;
}

/** The caller's own live sessions. Never returns a jti. */
async function ListFor({ UserType, UserId }) {
  if (!(await Available())) return [];
  return Models.UserSession.findAll({
    where: { UserType: String(UserType), UserId, RevokedDate: null },
    attributes: ['Id', 'DeviceName', 'IssuedDate', 'LastSeenDate', 'ExpireDate', 'IpAddress'],
    order: [['IssuedDate', 'DESC']],
    raw: true,
  });
}

module.exports = {
  NewJti,
  IsRevoked,
  Refresh,
  Record,
  Revoke,
  RevokeAllFor,
  ListFor,
  Available,
};
