/**
 * Turning a record into the exact bytes that get signed. ДАН, tracker row 114.
 *
 * WHY ONLY THIS PART EXISTS. The ДАН service agreement, a sandbox endpoint and
 * a test certificate are all outstanding (BLOCKERS item 7), and the wire format
 * is theirs, not ours - building a transport against a protocol we have not
 * been given would be inventing it. `SIGNATURE_HOST` has sat in the env
 * template for a long time, read by no code at all.
 *
 * But canonicalisation is ours, it is independent of whose signature service is
 * used, and it is the part that is expensive to get wrong: CHANGE HOW A
 * DOCUMENT CANONICALISES AFTER SIGNATURES EXIST AND EVERY EXISTING SIGNATURE
 * STOPS VERIFYING. There is no migration for that - the old bytes cannot be
 * reconstructed. So it is worth building carefully now, while nothing depends
 * on it.
 *
 * It also has an acceptance criterion that can be tested TODAY, without ДАН:
 * the same record canonicalises to the same hash across processes and
 * restarts, and changing any signed field changes the hash. That is real,
 * verifiable work against a blocked requirement.
 *
 * THE RULES, and each one exists because the obvious alternative is unstable:
 *
 *   Keys are sorted. JSON.stringify follows insertion order, so the same record
 *   read through two different queries - different column order, an include
 *   added later - would otherwise produce different bytes.
 *
 *   Dates become ISO-8601 UTC. The server runs UTC and Mongolia is UTC+8
 *   (measured 2026-09-14); a local-time string would make the hash depend on
 *   where the process happens to run.
 *
 *   Numbers become decimal strings, so 5 and 5.0 are one value.
 *
 *   null and undefined are both omitted entirely. A column that is added later
 *   and left NULL must not change the hash of a document signed before it
 *   existed - otherwise every ALTER TABLE silently invalidates history.
 *
 *   Strings are NFC-normalised and trimmed. Mongolian text can be composed or
 *   decomposed depending on the input method, and two visually identical names
 *   must hash the same.
 */

const crypto = require('crypto');

/** Recursively canonicalise one value. Returns undefined for things to omit. */
function Canon(value) {
  if (value === null || value === undefined) return undefined;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined;
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    // Array ORDER IS PRESERVED - it is data, not incidental. Two diagnoses in a
    // different order are a different document.
    const out = value.map(Canon).filter((v) => v !== undefined);
    return out;
  }

  if (typeof value === 'object') {
    const out = {};
    Object.keys(value)
      .sort()
      .forEach((k) => {
        const v = Canon(value[k]);
        if (v !== undefined) out[k] = v;
      });
    return out;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined;
    return String(value);
  }

  if (typeof value === 'boolean') return value ? 'true' : 'false';

  if (typeof value === 'string') {
    const s = value.normalize('NFC').trim();
    return s === '' ? undefined : s;
  }

  return String(value);
}

/**
 * The canonical byte string for a record.
 *
 * `fields` names exactly what is signed, in the caller's chosen set - NOT the
 * whole row. Bookkeeping columns (date_modif, user_mod) change without the
 * clinical content changing, and including them would invalidate a signature
 * every time somebody opened the record.
 */
function Canonicalise({ ObjectName, ObjectId, Data, Fields }) {
  const subset = {};
  (Fields && Fields.length ? Fields : Object.keys(Data || {}))
    .slice()
    .sort()
    .forEach((f) => {
      const v = Canon(Data ? Data[f] : undefined);
      if (v !== undefined) subset[f] = v;
    });

  // The envelope is part of the signed bytes: a signature over a payload that
  // does not say which object it belongs to could be replayed onto another.
  const envelope = {
    object: String(ObjectName || ''),
    id: String(ObjectId || ''),
    data: subset,
    v: 1, // canonicalisation version - bump ONLY with a migration plan
  };

  return JSON.stringify(envelope);
}

/** SHA-256 of the canonical bytes, lowercase hex. */
function Hash(payload) {
  return crypto.createHash('sha256').update(Buffer.from(payload, 'utf8')).digest('hex');
}

/** Both at once, which is what a signing endpoint hands to the client. */
function Prepare({ ObjectName, ObjectId, Data, Fields }) {
  const Payload = Canonicalise({ ObjectName, ObjectId, Data, Fields });
  return { Payload, PayloadHash: Hash(Payload), Algorithm: 'SHA-256', CanonVersion: 1 };
}

module.exports = { Canonicalise, Hash, Prepare, Canon };
