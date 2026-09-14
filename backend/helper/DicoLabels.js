/**
 * Option-list labels, read from the OptionTypes dictionary.
 *
 * Every option list in this system is DATA: a `dico` code with rows in
 * OptionTypes. That is what lets the customer change wording without a
 * deployment, and it is the property several of the mobile features depend on,
 * because their option lists are drafted by us and not yet approved by ЗСҮТ.
 * When approval arrives it is an UPDATE to a label, not a release.
 *
 * FAILS SOFT, AND THAT IS THE POINT. If the dico has not been seeded, or the
 * query fails, this returns an empty map rather than throwing. Callers then
 * emit `…Label: null` beside the raw value, and the endpoint behaves exactly as
 * it did before the dictionary existed. That is what makes it safe to seed
 * drafted wording to the test database only: the code does not care whether the
 * rows are there.
 *
 * Cached in process with a short TTL. Precedent: userCache in helper/Auth.js
 * and DirectoryHits in ChatController. The dictionary changes when a human
 * edits it, so a few minutes of staleness is not worth a query per request.
 */

const { Models } = require('../config/DB');

const TTL_MS = 5 * 60 * 1000;

/** dico -> { At: epoch ms, Map: Map(value -> label) } */
const Cache = new Map();

/**
 * Map of value -> label for one dico. Never throws, never null.
 */
async function GetLabelMap(dico) {
  if (!dico) return new Map();

  const Now = Date.now();
  const Hit = Cache.get(dico);
  if (Hit && Now - Hit.At < TTL_MS) return Hit.Map;

  try {
    const Rows = await Models.OptionTypes.findAll({
      where: { dico },
      attributes: ['value', 'label', 'pos'],
      order: [['pos', 'ASC']],
      raw: true,
    });

    const M = new Map();
    Rows.forEach((r) => M.set(String(r.value), r.label));
    Cache.set(dico, { At: Now, Map: M });
    return M;
  } catch (ex) {
    console.error('[DicoLabels] could not read dico ' + dico + ': ' + ex.message);
    // Deliberately not cached: a transient failure should not blank the labels
    // for the next five minutes.
    return new Map();
  }
}

/** One label, or null. */
async function GetLabel(dico, value) {
  if (value === null || value === undefined || value === '') return null;
  const M = await GetLabelMap(dico);
  const L = M.get(String(value));
  return L === undefined ? null : L;
}

/**
 * The whole list, ordered, in the shape a client renders a dropdown from.
 * Empty array when the dico is unseeded - which the caller should pass through
 * rather than treat as an error, so the app can show "not configured yet"
 * instead of failing.
 */
async function GetOptions(dico) {
  const M = await GetLabelMap(dico);
  return [...M.entries()].map(([value, label]) => ({ value, label }));
}

/** Forget one dico, or all of them. For an admin screen that edits OptionTypes. */
function Invalidate(dico) {
  if (dico) Cache.delete(dico);
  else Cache.clear();
}

module.exports = { GetLabelMap, GetLabel, GetOptions, Invalidate };
