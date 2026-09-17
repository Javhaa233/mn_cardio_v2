const express = require('express');
const { exec } = require('child_process');

/**
 * GET /api/time — улсын цагийн эталон, tender §1.3.
 *
 * WHAT THE REQUIREMENT ACTUALLY IS. Clinical records have to carry a time that
 * can be trusted, traceable to the national time standard. Two halves:
 *
 *   1. The SERVER must be synchronised to an authorised NTP source. That is a
 *      chrony configuration on the Ubuntu host and on the MSSQL box, and it
 *      needs the authorised hostname from ЗСҮТ. It is not code.
 *   2. Anything that needs to know the time must ASK THE SERVER rather than
 *      trust a phone's clock. That is this endpoint.
 *
 * This reports honestly on half 1 rather than asserting it. `ntpSynced` comes
 * from `chronyc tracking`, and is null - not false - when chrony is not
 * installed or not reachable, because "we cannot tell" and "it is not synced"
 * are different answers and only one of them is a problem to escalate.
 *
 * UNAUTHENTICATED, deliberately. A clock is not a secret, and a client that
 * needs to detect its own clock drift may well need to do so before it can
 * complete a login. It exposes the server time and whether NTP is healthy -
 * both of which any HTTP `Date` header already reveals.
 *
 * THE RULE THIS ENDPOINT EXISTS TO SUPPORT: record timestamps are written with
 * the SERVER's clock, never a value taken from the request. Where a user
 * legitimately chooses a date - POST /api/patient/journal takes `date`, because
 * a patient may be entering yesterday's reading - that date is the clinical
 * event date, and CreateDate is stamped separately by the server.
 */
const router = express.Router();

// The server runs UTC; Mongolia has a single zone and no daylight saving, so
// this is a constant rather than something to compute per request.
const TIMEZONE = 'Asia/Ulaanbaatar';
const OFFSET_MINUTES = 8 * 60;

// chronyc is not on the hot path of anything, but it is a process spawn, so its
// answer is cached briefly rather than shelled out per request.
const TTL_MS = 30 * 1000;
let cache = null;
let cachedAt = 0;

/**
 * Ask chrony whether the clock is disciplined.
 *
 * Resolves - never rejects. A missing binary, a non-zero exit and a timeout all
 * mean "cannot tell", which is null.
 */
function ReadChrony() {
  return new Promise((resolve) => {
    exec('chronyc tracking', { timeout: 2000 }, (err, stdout) => {
      if (err || !stdout) return resolve({ synced: null, source: null, offsetSec: null });

      const text = String(stdout);
      const ref = /Reference ID\s*:\s*(.+)/.exec(text);
      const stratum = /Stratum\s*:\s*(\d+)/.exec(text);
      const offset = /System time\s*:\s*([\d.]+)\s+seconds/.exec(text);
      const leap = /Leap status\s*:\s*(.+)/.exec(text);

      const source = ref ? ref[1].trim() : null;
      const st = stratum ? Number.parseInt(stratum[1], 10) : null;

      // Stratum 0 or 16, or a reference of 00000000, means chrony is running but
      // has not locked onto anything. Running is not the same as synchronised.
      const locked =
        leap &&
        /Normal/i.test(leap[1]) &&
        st !== null &&
        st > 0 &&
        st < 16 &&
        !/^00000000/.test(source || '');

      resolve({
        synced: !!locked,
        source,
        offsetSec: offset ? Number.parseFloat(offset[1]) : null,
      });
    });
  });
}

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (!cache || now - cachedAt > TTL_MS) {
      cache = await ReadChrony();
      cachedAt = now;
    }

    const d = new Date();
    // Local wall-clock in Asia/Ulaanbaatar, expressed with its offset so a
    // client cannot mistake it for UTC. The server itself runs UTC.
    const local = new Date(d.getTime() + OFFSET_MINUTES * 60 * 1000)
      .toISOString()
      .replace('Z', '+08:00');

    return res.json({
      success: true,
      message: '',
      data: {
        serverTime: d.toISOString(),
        serverTimeLocal: local,
        epochMs: d.getTime(),
        timezone: TIMEZONE,
        utcOffsetMinutes: OFFSET_MINUTES,
        // null = cannot tell (chrony absent or unreadable), not "not synced".
        ntpSynced: cache.synced,
        ntpSource: cache.source,
        ntpOffsetSeconds: cache.offsetSec,
      },
    });
  } catch (ex) {
    console.error('[api/time] ' + ex.message);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Сервер дээр алдаа гарлаа',
      data: null,
    });
  }
});

module.exports = router;
