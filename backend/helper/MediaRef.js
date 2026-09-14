/**
 * How RehabExercise.MediaRef points at a video, whichever way the videos end up
 * being hosted.
 *
 * THE PROBLEM. The tender commits to 39 exercise instruction videos, and where
 * they will live is an open customer question (mobile/BLOCKERS.md item 10).
 * Three options were put to ЗСҮТ - the internal server, cloud storage, or
 * bundled inside the app - and each implies a different client. MediaRef is a
 * bare NVARCHAR(255), and add_rehabilitation_tables.sql already says it is
 * "deliberately not a hard FK: the videos may end up in object storage".
 *
 * Left as a bare string, a client cannot tell a File.generated_name from a URL,
 * so it would have to be rebuilt once the answer lands. A prefix fixes that:
 * the answer becomes an UPDATE to a column, with no schema change and no app
 * release.
 *
 *   'file:abc123.mp4'   the internal file store  -> stream it
 *   'url:https://...'   cloud or CDN             -> redirect to it
 *   'asset:ex01'        bundled in the app       -> the client already has it
 *   'https://...'       a bare URL, tolerated    -> treated as url:
 *   'abc123.mp4'        a bare name, tolerated   -> treated as file:, legacy
 *   null / ''                                    -> no video yet
 *
 * THE CONTRACT FOR THE APP DEVELOPER, which belongs in API.md too: never parse
 * MediaRef. Branch on media.kind, and treat media.url === null as "not
 * available yet" rather than as an error. Today every row is null, because the
 * catalogue is 39 placeholders and filming has not started.
 */

const PREFIXES = ['file', 'url', 'asset'];

/**
 * Parse a stored MediaRef into { kind, ref, url }.
 *
 * `url` is what the client may fetch directly, and is null for anything the
 * client cannot fetch on its own - a file needs an authenticated, range-capable
 * route, and a bundled asset is not fetched at all. Never throws; an
 * unparseable value degrades to the legacy file interpretation rather than
 * failing a whole catalogue listing because one row is malformed.
 */
function Parse(ref) {
  const Empty = { kind: null, ref: null, url: null };

  if (ref === null || ref === undefined) return Empty;
  const S = String(ref).trim();
  if (!S) return Empty;

  const colon = S.indexOf(':');
  if (colon > 0) {
    const head = S.slice(0, colon).toLowerCase();
    const rest = S.slice(colon + 1);

    if (PREFIXES.includes(head) && rest) {
      if (head === 'url') return { kind: 'url', ref: rest, url: rest };
      if (head === 'asset') return { kind: 'asset', ref: rest, url: null };
      return { kind: 'file', ref: rest, url: null };
    }

    // 'https://host/x' splits on its own colon, so check the scheme before
    // falling through to the legacy reading.
    if (head === 'http' || head === 'https') {
      return { kind: 'url', ref: S, url: S };
    }
  }

  // No recognised prefix: a bare generated_name from before this scheme.
  return { kind: 'file', ref: S, url: null };
}

/**
 * The `media` object an API response carries.
 *
 * `streamPath` is supplied by the caller because only it knows the route that
 * will serve the bytes, and that route does not exist yet - the file layer
 * still serves POST plus Content-Disposition: attachment, which no player can
 * stream (READINESS.md §2.4). Until it does, a file-kind entry reports
 * url: null, which the client already has to handle for "not filmed yet".
 */
function Describe(ref, streamPath) {
  const P = Parse(ref);
  if (P.kind === 'file' && streamPath) return Object.assign({}, P, { url: streamPath });
  return P;
}

/** Build a stored value from its parts. Keeps the prefix spelling in one place. */
function Build(kind, ref) {
  if (!kind || !ref) return null;
  if (!PREFIXES.includes(kind)) return null;
  return kind + ':' + ref;
}

module.exports = { Parse, Describe, Build, PREFIXES };
