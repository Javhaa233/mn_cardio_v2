/**
 * Failed-login counting, lockout, and the notification the tender asks for
 * after three wrong passwords (tracker row 20, mobile tender §2).
 *
 * Storage-agnostic on purpose. SchemaProbe decides at boot which backing store
 * is available:
 *
 *   LoginAttempt table present  -> persisted, survives restart, forensic trail
 *   absent                      -> in-process Map
 *
 * The in-memory path is not a stub. It satisfies the acceptance criterion
 * today, on a process that ecosystem.config.js already pins to a single fork
 * instance, so there is exactly one counter. What the table buys is persistence
 * across restarts and a record of who tried what from where - worth having,
 * but not worth blocking the feature on a DDL request.
 *
 * Two things this deliberately does NOT do:
 *
 *   It never tells the caller why a login failed. FailReason is recorded and
 *   never returned; the response stays the single opaque "Login name or
 *   password is incorrect". A lockout message is the one exception, because a
 *   user who cannot get in needs to know to wait rather than keep trying.
 *
 *   It does not lock an account permanently. Lockout is a time window. A
 *   permanent lock on a username an attacker can guess is a denial-of-service
 *   against the real doctor, on a system used for clinical work.
 */

const Flags = require('./FeatureFlags');
const SchemaProbe = require('./SchemaProbe');
const MailHelper = require('./MailHelper');
const { Models } = require('../config/DB');
const ObjectHelper = require('./ObjectHelper');

/** userType:userName -> { Fails: [epoch ms], LockedUntil: epoch ms, Notified: bool } */
const Memory = new Map();

const KeyOf = (UserType, UserName) =>
  String(UserType || 'staff') +
  ':' +
  String(UserName || '')
    .trim()
    .toLowerCase();

const WindowMs = () => Flags.LoginLockoutWindowMin * 60 * 1000;
const LockMs = () => Flags.LoginLockoutMinutes * 60 * 1000;

// Both, not either. The table can exist before the model does - someone runs
// the script against the test database a release ahead of the code - and
// Models.LoginAttempt would then be undefined at the first write.
const Persisted = () => SchemaProbe.HasTable('LoginAttempt') && !!Models.LoginAttempt;

/** Drop attempts older than the window so the Map cannot grow without bound. */
function Prune(Entry, Now) {
  Entry.Fails = (Entry.Fails || []).filter((t) => Now - t < WindowMs());
  return Entry;
}

/**
 * Is this login allowed to proceed?
 *
 * Call BEFORE looking the user up. Refusing here also removes a timing oracle:
 * the lookup plus bcrypt.compare takes measurably longer than an early return,
 * so an attacker could otherwise distinguish "no such user" from "wrong
 * password" by the clock even though both return the same message.
 */
async function Check({ UserType, UserName }) {
  if (!Flags.LoginLockoutEnabled) return { Locked: false, RetryAfterSec: 0, FailCount: 0 };

  const Now = Date.now();
  const Key = KeyOf(UserType, UserName);
  const Entry = Prune(Memory.get(Key) || { Fails: [] }, Now);
  Memory.set(Key, Entry);

  if (Entry.LockedUntil && Entry.LockedUntil > Now) {
    return {
      Locked: true,
      RetryAfterSec: Math.ceil((Entry.LockedUntil - Now) / 1000),
      FailCount: Entry.Fails.length,
    };
  }

  return { Locked: false, RetryAfterSec: 0, FailCount: Entry.Fails.length };
}

/** Best-effort row in LoginAttempt. Never throws, never blocks the response. */
async function Record({ UserType, UserName, UserId, Success, FailReason, Req }) {
  if (!Persisted()) return;

  try {
    await Models.LoginAttempt.create({
      UserType: UserType || 'staff',
      UserName: UserName ? String(UserName).slice(0, 100) : null,
      UserId: UserId || null,
      AttemptDate: ObjectHelper.getDateYMDHMS(),
      Success: Success ? 1 : 0,
      FailReason: FailReason || null,
      IpAddress: Req ? String(Req.ip || '').slice(0, 45) : null,
      UserAgent: Req ? String(Req.headers['user-agent'] || '').slice(0, 255) : null,
    });
  } catch (ex) {
    console.error('[LoginGuard] could not record attempt: ' + ex.message);
  }
}

/**
 * Count a failure. Returns whether this one crossed the threshold.
 *
 * ShouldNotify is true exactly once per lock, not once per failure past the
 * threshold - otherwise a doctor mistyping ten times gets seven emails about
 * it, and the eighth is the one nobody reads.
 */
async function RecordFailure({ UserType, UserName, UserId, Reason, Req }) {
  await Record({ UserType, UserName, UserId, Success: false, FailReason: Reason, Req });

  if (!Flags.LoginLockoutEnabled) return { FailCount: 0, Locked: false, ShouldNotify: false };

  const Now = Date.now();
  const Key = KeyOf(UserType, UserName);
  const Entry = Prune(Memory.get(Key) || { Fails: [] }, Now);

  Entry.Fails.push(Now);

  const Crossed = Entry.Fails.length >= Flags.LoginLockoutThreshold;
  let ShouldNotify = false;

  if (Crossed) {
    Entry.LockedUntil = Now + LockMs();
    if (!Entry.Notified) {
      Entry.Notified = true;
      ShouldNotify = Flags.LoginLockoutNotify;
    }
  }

  Memory.set(Key, Entry);

  return { FailCount: Entry.Fails.length, Locked: Crossed, ShouldNotify };
}

/** Clear the counter. A correct password ends the episode. */
async function RecordSuccess({ UserType, UserName, UserId, Req }) {
  Memory.delete(KeyOf(UserType, UserName));
  await Record({ UserType, UserName, UserId, Success: true, FailReason: null, Req });
}

/**
 * Tell the account holder someone is trying. Best-effort: a mail failure must
 * never turn into a login failure, so this returns rather than throws.
 */
async function Notify({ Email, UserName, Req }) {
  if (!Email) return false;

  const Ip = Req ? String(Req.ip || '') : '';
  const When = ObjectHelper.getDateYMDHMS();

  const Mail = {
    to: Email,
    subject: 'MnCardio - Нэвтрэх оролдлого',
    html:
      'Сайн байна уу<br /><br />Таны бүртгэлд ' +
      Flags.LoginLockoutThreshold +
      ' удаа буруу нууц үгээр нэвтрэх оролдлого хийгдлээ. Бүртгэл ' +
      Flags.LoginLockoutMinutes +
      ' минутын турш түр хаагдсан байна.<br /><br />' +
      'Хэрэглэгчийн нэр: ' +
      String(UserName || '') +
      '<br />Хугацаа: ' +
      When +
      '<br />IP хаяг: ' +
      Ip +
      '<br /><br />Хэрэв энэ нь та биш бол нууц үгээ яаралтай солино уу.<br /><br />' +
      'MnCardio системийг ашиглаж байгаа танд баярлалаа.',
  };

  const Res = await MailHelper.SendMail(Mail);
  if (Res === null) {
    console.error('[LoginGuard] lockout notification not sent: ' + MailHelper.LastError);
    return false;
  }
  return true;
}

/** The message a locked-out caller sees. The only failure reason ever disclosed. */
function LockedMessage(RetryAfterSec) {
  const Minutes = Math.max(1, Math.ceil((RetryAfterSec || 0) / 60));
  return (
    'Нууц үгээ ' +
    Flags.LoginLockoutThreshold +
    ' удаа буруу оруулсан тул бүртгэл түр хаагдлаа. ' +
    Minutes +
    ' минутын дараа дахин оролдоно уу.'
  );
}

module.exports = {
  Check,
  RecordFailure,
  RecordSuccess,
  Notify,
  LockedMessage,
  IsPersisted: Persisted,
};
