const Logger = require('./Logger');
/**
 * One place that reads process.env for behaviour switches, so a feature is
 * never half-on because two files disagreed about a default.
 *
 * The rule for every flag in here: THE DEFAULT PRESERVES TODAY'S BEHAVIOUR.
 * Adding a flag must never change what a running deployment does until someone
 * sets it deliberately. That is what makes it safe to ship a security control
 * and a feature in the same release and turn them on separately.
 *
 * Read once at require time. The values are not re-read, because a flag that
 * can change under a request is a flag that can be true in the middle of a
 * handler and false at the end of it. Restart to change one - the process is
 * pinned to a single PM2 instance anyway (ecosystem.config.js).
 *
 * config/Config.env is the file server.js:6 loads. The root .env files are
 * near-dead (only config/DbConnection.js sees them) - putting a flag there and
 * expecting it to work is a documented trap in CLAUDE.md §2.
 */

const Raw = (name, fallback) => {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : String(v).trim();
};

const Bool = (name, fallback) => {
  const v = Raw(name, null);
  if (v === null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};

const Int = (name, fallback) => {
  const v = Raw(name, null);
  if (v === null) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

/** A flag with a fixed set of values; anything unrecognised falls back. */
const Enum = (name, allowed, fallback) => {
  const v = Raw(name, null);
  if (v === null) return fallback;
  const lower = v.toLowerCase();
  return allowed.includes(lower) ? lower : fallback;
};

/** Comma-separated list -> array of trimmed non-empty strings. */
const List = (name, fallback) => {
  const v = Raw(name, null);
  if (v === null) return fallback;
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const Flags = {
  /**
   * The two dev bypasses in helper/Auth.js and controllers/auth/UserController.js
   * used to key off NODE_ENV === 'development' alone, which meant a server that
   * came up without NODE_ENV set accepted unsigned tokens and unchecked
   * passwords. Now both ALSO require this, and it defaults off - so the failure
   * mode is "a developer has to type a real password", not "a host is open".
   *
   * NEVER true on a server. server.js prints a red banner when it is.
   */
  AllowInsecureDevAuth: Bool('ALLOW_INSECURE_DEV_AUTH', false),

  /** Count-only until someone turns it on. See helper/RateLimit.js. */
  RateLimitEnabled: Bool('RATE_LIMIT_ENABLED', false),
  RateLimitGlobalMax: Int('RATE_LIMIT_GLOBAL_MAX', 600),
  RateLimitAuthMax: Int('RATE_LIMIT_AUTH_MAX', 10),
  RateLimitAuthWindowMin: Int('RATE_LIMIT_AUTH_WINDOW_MIN', 5),

  /**
   * Unchanged default. The registry forms post base64 images through
   * BaseObject/create, so the real ceiling is not guessable from the code -
   * log what actually arrives first, then lower this from data.
   */
  JsonBodyLimit: Raw('JSON_BODY_LIMIT', '100mb'),
  BodySizeWarnBytes: Int('BODY_SIZE_WARN_BYTES', 2 * 1024 * 1024),

  /** Lockout works without its table, on an in-memory counter. */
  LoginLockoutEnabled: Bool('FEATURE_LOGIN_LOCKOUT', false),
  LoginLockoutThreshold: Int('LOGIN_LOCKOUT_THRESHOLD', 3),
  LoginLockoutWindowMin: Int('LOGIN_LOCKOUT_WINDOW_MIN', 15),
  LoginLockoutMinutes: Int('LOGIN_LOCKOUT_MINUTES', 15),
  LoginLockoutNotify: Bool('LOGIN_LOCKOUT_NOTIFY', true),

  /**
   * On by default, unlike the rest. Writing an audit row is additive - it adds
   * rows to a table that already exists and changes no response - and the
   * tender requires the record. The NOTIFY half is what is risky, and that is
   * a separate flag that defaults to none.
   */
  AccessAuditEnabled: Bool('FEATURE_ACCESS_AUDIT', true),
  AccessAuditDedupeMin: Int('ACCESS_AUDIT_DEDUPE_MIN', 10),
  AccessNotifyPolicy: Enum(
    'ACCESS_NOTIFY_POLICY',
    ['none', 'every', 'digest', 'nontreating'],
    'none'
  ),

  /** off | warn | enforce. enforce can lock doctors out - read LicenceGate first. */
  DoctorLicence: Enum('FEATURE_DOCTOR_LICENCE', ['off', 'warn', 'enforce'], 'off'),
  LicenceExemptRoles: List('LICENCE_EXEMPT_ROLES', ['1', '6']),
  LicenceExemptUserIds: List('LICENCE_EXEMPT_USER_IDS', []),
  LicenceGraceUntil: Raw('LICENCE_GRACE_UNTIL', ''),
  LicenceCheckExpiry: Bool('LICENCE_CHECK_EXPIRY', false),

  /**
   * Tokens issued before revocation existed carry no jti and live up to 10
   * hours. Treating "no jti" as invalid would log out every active session on
   * deploy - exactly what this feature exists to prevent. Flip AllowLegacy to
   * false 11 hours after the deploy that turns revocation on.
   */
  TokenRevocationEnabled: Bool('TOKEN_REVOCATION_ENABLED', false),
  TokenRevocationRefreshSec: Int('TOKEN_REVOCATION_REFRESH_SEC', 30),
  TokenRevocationAllowLegacy: Bool('TOKEN_REVOCATION_ALLOW_LEGACY', true),

  ConsentEnabled: Bool('FEATURE_CONSENT', false),
  /** allow | deny. deny before any consent row exists silently disables features. */
  ConsentDefault: Enum('CONSENT_DEFAULT', ['allow', 'deny'], 'allow'),

  /** off | warn | enforce. enforce needs the access-rights matrix, which does not exist. */
  Confidentiality: Enum('FEATURE_CONFIDENTIALITY', ['off', 'warn', 'enforce'], 'off'),

  /**
   * off | warn | enforce, for helper/RequirePermission.js.
   *
   * RoleToPermission's 125 grants ALL belong to RoleId 1. The two doctor tiers
   * have none, so 'enforce' would deny every doctor everything on /api/doctor/*
   * the day it was switched on. Seed grants for roles 2 and 3 first, then run
   * 'warn' to catch what the seeding missed. See helper/Permissions.js.
   */
  Permissions: Enum('FEATURE_PERMISSIONS', ['off', 'warn', 'enforce'], 'off'),

  /** Needs IX_UserActionHistory_PatientId, or it is a table scan per app launch. */
  AccessLogApi: Bool('FEATURE_ACCESS_LOG_API', false),

  /**
   * off | warn | enforce, for MayAttachTo's permissive default in
   * BaseController. 'warn' logs which objects reach it and denies nothing,
   * which is how the allowlist gets written from evidence instead of guesswork.
   * Do not set 'enforce' until that log has been read - the models this
   * endpoint serves are not enumerated anywhere and a wrong allowlist denies a
   * clinical attachment flow.
   */
  FileAttachStrict: Enum('FILE_ATTACH_STRICT', ['off', 'warn', 'enforce'], 'warn'),

  FhirExport: Bool('FEATURE_FHIR_EXPORT', false),

  /** log | fcm | apns | auto. auto picks a driver from whichever keys are present. */
  PushDriver: Enum('PUSH_DRIVER', ['log', 'fcm', 'apns', 'auto'], 'auto'),
};

/**
 * Printed once at boot. A deployment being in the wrong mode is the failure
 * this is here to make impossible to miss - it is far easier to read one line
 * in the log than to work out why a password was not checked.
 */
function LogResolved() {
  const Summary = {
    AllowInsecureDevAuth: Flags.AllowInsecureDevAuth,
    RateLimitEnabled: Flags.RateLimitEnabled,
    JsonBodyLimit: Flags.JsonBodyLimit,
    LoginLockoutEnabled: Flags.LoginLockoutEnabled,
    AccessAuditEnabled: Flags.AccessAuditEnabled,
    AccessNotifyPolicy: Flags.AccessNotifyPolicy,
    DoctorLicence: Flags.DoctorLicence,
    TokenRevocationEnabled: Flags.TokenRevocationEnabled,
    ConsentEnabled: Flags.ConsentEnabled,
    Confidentiality: Flags.Confidentiality,
    Permissions: Flags.Permissions,
    AccessLogApi: Flags.AccessLogApi,
    PushDriver: Flags.PushDriver,
  };
  // console.error, not console.log: server.js silences console.log in
  // production, and this line matters most in production.
  Logger.info('[FeatureFlags] ' + JSON.stringify(Summary));

  if (Flags.AllowInsecureDevAuth) {
    console.error(
      '[FeatureFlags] *** ALLOW_INSECURE_DEV_AUTH IS ON. JWT signatures are not ' +
        'verified and staff passwords are not checked. This must never be set on a server. ***'
    );
  }
}

module.exports = Flags;
module.exports.LogResolved = LogResolved;
