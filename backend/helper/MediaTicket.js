const crypto = require('crypto');

/**
 * A short-lived, single-file, single-user credential for a media URL.
 *
 * WHY THIS EXISTS. An HTML <audio> or <video> element cannot set an
 * Authorization header. That is the whole reason chat media has never been
 * playable in the browser: the bytes were reachable only by an authenticated
 * POST, and a player cannot make one. Flutter does not have this problem - it
 * passes httpHeaders - so /api/Media/stream stays header-authenticated and the
 * mobile client needs nothing from this file.
 *
 * WHY THIS IS NOT THE THING SocketAuth WARNS ABOUT. That warning is about
 * putting a SESSION token in a URL, where it lands in nginx access logs and
 * browser history and then unlocks the entire account for ten hours. A ticket
 * here is deliberately a much smaller object:
 *
 *   - it names ONE file (one generated_name) and ONE user
 *   - it expires in an hour, and cannot be extended
 *   - it carries no privileges of its own. On redemption the user is re-loaded
 *     from the database and MayDownload runs exactly as it does for a header
 *     request, so revoking access revokes outstanding tickets with it
 *
 * A leaked ticket is worth one attachment its holder could already read, for
 * up to an hour. It cannot be replayed as a login, cannot be widened to another
 * file, and cannot outlive the permission behind it.
 *
 * FORMAT. base64url('v1.<name>.<userType>.<userId>.<roleId>.<exp>') + '.' + sig
 * The signature covers the payload, so nothing in it can be edited.
 */

const VERSION = 'v1';
const DEFAULT_TTL_SECONDS = 3600;

/**
 * The signing secret.
 *
 * MEDIA_TICKET_SECRET is its own variable rather than a reuse of JWT_PASS
 * because JWT_PASS is in git history and has not been rotated
 * (CLAUDE.md §10). Falling back to it keeps a deployment that has not set the
 * new variable working, but says so loudly - a ticket signed with a published
 * secret is forgeable by anyone holding the repository.
 */
let WarnedAboutFallback = false;

function Secret() {
  const Own = process.env.MEDIA_TICKET_SECRET;
  if (Own && String(Own).length >= 16) return String(Own);

  if (!WarnedAboutFallback) {
    WarnedAboutFallback = true;
    console.error(
      '[MediaTicket] MEDIA_TICKET_SECRET is not set (or is shorter than 16 characters). ' +
        'Falling back to JWT_PASS, which is in git history and unrotated - media tickets are ' +
        'forgeable until a real secret is configured.'
    );
  }
  return String(process.env.JWT_PASS || 'mncardio-media-ticket-unconfigured');
}

function Sign(Payload) {
  return crypto.createHmac('sha256', Secret()).update(Payload).digest('base64url');
}

/**
 * Mint a ticket. The CALLER is responsible for having authorized the read
 * first - this function does not check anything, it only attests.
 */
function Mint({ generatedName, LogedUser, TtlSeconds }) {
  if (!generatedName || !LogedUser) return null;

  const Me = {
    UserId: LogedUser.Id,
    RoleId: LogedUser.RoleId,
  };
  if (!Me.UserId) return null;

  const Ttl = parseInt(TtlSeconds, 10) > 0 ? parseInt(TtlSeconds, 10) : DEFAULT_TTL_SECONDS;
  const Exp = Math.floor(Date.now() / 1000) + Ttl;

  // '.' separates the fields, so a generated_name containing one would shift
  // every field after it. Upload builds the name from digits, an id and four
  // base36 characters, so this cannot happen today - but a ticket that decodes
  // to the wrong file is worth refusing to create rather than trusting that.
  if (String(generatedName).indexOf('.') !== -1) return null;

  const Payload = [VERSION, generatedName, 'U', Me.UserId, Me.RoleId, Exp].join('.');
  const Encoded = Buffer.from(Payload, 'utf8').toString('base64url');

  return {
    Ticket: Encoded + '.' + Sign(Payload),
    ExpiresAt: new Date(Exp * 1000).toISOString(),
    ExpiresInSeconds: Ttl,
  };
}

/**
 * Verify a ticket and return what it claims, or null.
 *
 * Returns only a CLAIM - the file it names and the user it names. The caller
 * must still load that user and authorize the read; see the file header.
 */
function Verify(Ticket) {
  if (!Ticket || typeof Ticket !== 'string') return null;

  const Cut = Ticket.lastIndexOf('.');
  if (Cut <= 0) return null;

  const Encoded = Ticket.slice(0, Cut);
  const Given = Ticket.slice(Cut + 1);

  let Payload;
  try {
    Payload = Buffer.from(Encoded, 'base64url').toString('utf8');
  } catch (ex) {
    return null;
  }

  const Expected = Sign(Payload);

  // Constant-time compare. timingSafeEqual throws on a length mismatch, which
  // is itself a signal, so the lengths are checked first and equal-length
  // buffers are the only thing it ever sees.
  const A = Buffer.from(Given);
  const B = Buffer.from(Expected);
  if (A.length !== B.length) return null;
  if (!crypto.timingSafeEqual(A, B)) return null;

  const Parts = Payload.split('.');
  if (Parts.length !== 6) return null;

  const [Ver, generatedName, Marker, UserId, RoleId, Exp] = Parts;
  if (Ver !== VERSION || Marker !== 'U') return null;
  if (!generatedName) return null;

  const ExpiresAt = parseInt(Exp, 10);
  if (!ExpiresAt || Math.floor(Date.now() / 1000) >= ExpiresAt) return null;

  return {
    generatedName,
    UserId: parseInt(UserId, 10),
    RoleId: RoleId,
    ExpiresAt,
  };
}

module.exports = { Mint, Verify, DEFAULT_TTL_SECONDS };
