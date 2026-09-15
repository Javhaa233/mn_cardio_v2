/**
 * Reading MobileSetting, with a short cache.
 *
 * WHY A CACHE. The X-App-Build gate runs on EVERY /api/patient/* and
 * /api/doctor/* request, and it needs minSupportedBuild. Reading a row per
 * request would put a SELECT in front of the whole mobile surface to answer a
 * question whose answer changes a few times a year.
 *
 * 60 seconds, not process-lifetime: an administrator who fixes a wrong
 * minSupportedBuild in the admin web must not have to wait for a PM2 restart to
 * un-brick the app. A minute is short enough to be a non-event and long enough
 * that the table is read roughly once a minute instead of thousands of times.
 *
 * FAILS OPEN, DELIBERATELY. If the table is missing - it is created by
 * scripts/add_mobile_settings.sql, which has not run on production - or the
 * query throws, this returns an empty map rather than raising. Every caller
 * treats "no value" as "no restriction", so a database problem cannot lock
 * every phone out of the system. That is the correct failure direction for a
 * kill switch: the damage from wrongly blocking every user is far worse than
 * from wrongly allowing an old build through for a minute.
 */

const { Models } = require('../config/DB');

const TTL_MS = 60 * 1000;

let cache = null;
let cachedAt = 0;

/** All settings as a plain { key: value } object. Never throws. */
async function All() {
  const now = Date.now();
  if (cache && now - cachedAt < TTL_MS) return cache;

  try {
    const rows = await Models.MobileSetting.findAll({
      attributes: ['Key', 'Value'],
      raw: true,
    });
    const map = {};
    rows.forEach((r) => {
      map[r.Key] = r.Value;
    });
    cache = map;
    cachedAt = now;
    return map;
  } catch (ex) {
    // Table absent or unreachable. Empty map = no restriction; see the header.
    console.error('[MobileSettings] read failed, treating as unset: ' + ex.message);
    cache = {};
    cachedAt = now;
    return cache;
  }
}

async function Get(key, fallback) {
  const map = await All();
  const v = map[key];
  return v === undefined || v === null || v === '' ? fallback : v;
}

/** An integer setting. Anything unparseable is the fallback, not NaN. */
async function GetInt(key, fallback) {
  const v = await Get(key, null);
  if (v === null) return fallback;
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** '1' / 'true' / 'yes' / 'on' are true; everything else is false. */
async function GetBool(key, fallback) {
  const v = await Get(key, null);
  if (v === null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).trim().toLowerCase());
}

/** Drop the cache. Called after a write so an admin edit takes effect at once. */
function Invalidate() {
  cache = null;
  cachedAt = 0;
}

module.exports = { All, Get, GetInt, GetBool, Invalidate, TTL_MS };
