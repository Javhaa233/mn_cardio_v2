/**
 * Reading CodeMapping, keyed and cached.
 *
 * The FHIR Observation projection consults this once per field per row, so a
 * query per lookup would mean hundreds of round trips to render one Bundle.
 * The whole table is small - a few dozen rows - so it is read in one go and
 * held for five minutes.
 *
 * FAILS OPEN AS "NO MAPPING". A missing table (it is created by
 * scripts/add_code_mapping.sql, which has not run on production) or an
 * unreachable database returns an empty map, and every caller treats an absent
 * mapping as "not coded" - which produces a resource with `text` and no
 * `coding` rather than an error. That is the same answer an unverified row
 * gets, and it is the safe direction: never emit a code, never fail a read.
 */

const { Models } = require('../config/DB');

const TTL_MS = 5 * 60 * 1000;

let cache = null;
let cachedAt = 0;

/**
 * The whole table as a Map keyed 'LocalObject|LocalCode'.
 *
 * `Verified` is normalised to a real boolean here: the column is BIT and
 * tedious returns it as true/false, but a null from an older row would be
 * falsy-but-not-false and every caller compares it directly.
 */
async function All() {
  const now = Date.now();
  if (cache && now - cachedAt < TTL_MS) return cache;

  const map = new Map();
  try {
    const rows = await Models.CodeMapping.findAll({
      attributes: [
        'LocalObject',
        'LocalCode',
        'System',
        'Code',
        'Display',
        'Unit',
        'RefLow',
        'RefHigh',
        'Verified',
      ],
      raw: true,
    });
    rows.forEach((r) => {
      map.set(String(r.LocalObject) + '|' + String(r.LocalCode), {
        System: r.System,
        Code: r.Code,
        Display: r.Display,
        Unit: r.Unit,
        RefLow: r.RefLow,
        RefHigh: r.RefHigh,
        Verified: r.Verified === true || r.Verified === 1,
      });
    });
  } catch (ex) {
    console.error('[CodeMappings] read failed, treating as unmapped: ' + ex.message);
  }

  cache = map;
  cachedAt = now;
  return cache;
}

/** One mapping, or null. */
async function Get(LocalObject, LocalCode) {
  const map = await All();
  return map.get(String(LocalObject) + '|' + String(LocalCode)) || null;
}

/**
 * The unit and reference range for a field, but ONLY from a verified row.
 *
 * helper/Diagnostics.js returns unit and refRange as null today. This is what
 * it will call once mappings are signed off - and until they are, it correctly
 * keeps returning null rather than an unreviewed unit.
 */
async function UnitAndRange(LocalObject, LocalCode) {
  const m = await Get(LocalObject, LocalCode);
  if (!m || !m.Verified) return { unit: null, refLow: null, refHigh: null };
  return { unit: m.Unit || null, refLow: m.RefLow, refHigh: m.RefHigh };
}

function Invalidate() {
  cache = null;
  cachedAt = 0;
}

module.exports = { All, Get, UnitAndRange, Invalidate, TTL_MS };
