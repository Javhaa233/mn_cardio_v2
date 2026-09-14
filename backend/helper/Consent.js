/**
 * Consent for non-treatment use of personal data. Tracker row 23.
 *
 * THE CURRENT STATE IS THE MOST RECENT ROW, not a column. PatientConsent is
 * append-only: granting writes a row with Granted = 1, withdrawing writes
 * another with Granted = 0, and nothing is ever updated. So "does this person
 * consent" is answered by ordering, which is what IX_PatientConsent_PatRegNo
 * exists for.
 *
 * NOTHING CALLS HasConsent YET, AND THAT IS CORRECT RATHER THAN INCOMPLETE.
 * The tender requires CAPTURE. The enforcement points are wherever
 * non-treatment use happens - a research export, a secondary-use pipeline - and
 * no such feature exists in this backend. Wiring a check into something that
 * does not exist would be theatre, and would give a false impression at UAT
 * that the consent flow is load-bearing when it is not yet.
 *
 * CONSENT_DEFAULT governs the no-row and no-table cases and defaults to
 * 'allow'. Flipping it to 'deny' before any consent has been captured would
 * silently disable every future secondary-use feature on day one; ЗСҮТ flip it
 * at go-live, once patients have actually been asked.
 */

const Flags = require('./FeatureFlags');
const SchemaProbe = require('./SchemaProbe');
const { Models } = require('../config/DB');

const TTL_MS = 5 * 60 * 1000;
const Cache = new Map(); // 'PatRegNo|PurposeCode' -> { At, Value }

const Available = async () => {
  await SchemaProbe.Warm();
  return SchemaProbe.HasTable('PatientConsent') && !!Models.PatientConsent;
};

/**
 * The active document a patient should be shown for a purpose, or null.
 *
 * Latest EffectiveFrom wins, so publishing a new version is an INSERT and the
 * app starts showing it without a deployment.
 */
async function ActiveDocument(PurposeCode) {
  if (!(await Available()) || !Models.ConsentDocument) return null;
  return Models.ConsentDocument.findOne({
    where: { PurposeCode, IsActive: true },
    order: [
      ['EffectiveFrom', 'DESC'],
      ['Id', 'DESC'],
    ],
    raw: true,
  });
}

/** The latest row per purpose for one patient - i.e. their current state. */
async function CurrentStates(PatRegNo) {
  if (!PatRegNo || !(await Available())) return [];

  const rows = await Models.PatientConsent.findAll({
    where: { PatRegNo },
    order: [
      ['GrantedDate', 'DESC'],
      ['Id', 'DESC'],
    ],
    raw: true,
  });

  // First row wins per purpose, because the query is already newest-first.
  const latest = new Map();
  rows.forEach((r) => {
    if (!latest.has(r.PurposeCode)) latest.set(r.PurposeCode, r);
  });
  return [...latest.values()];
}

/**
 * Has this patient consented to this purpose?
 *
 * The single function the rest of the system should call when a secondary-use
 * feature finally exists. Memoised briefly; consent changes on human timescales.
 */
async function HasConsent({ PatRegNo, PurposeCode }) {
  const Default = Flags.ConsentDefault === 'deny' ? false : true;

  try {
    if (!PatRegNo || !PurposeCode) return Default;
    if (!(await Available())) return Default;

    const Key = String(PatRegNo) + '|' + String(PurposeCode);
    const Now = Date.now();
    const Hit = Cache.get(Key);
    if (Hit && Now - Hit.At < TTL_MS) return Hit.Value;

    const row = await Models.PatientConsent.findOne({
      where: { PatRegNo, PurposeCode },
      order: [
        ['GrantedDate', 'DESC'],
        ['Id', 'DESC'],
      ],
      raw: true,
    });

    // No row at all means never asked, which is not the same as refused - hence
    // the configurable default rather than a hardcoded false.
    const Value = row ? !!row.Granted : Default;

    if (Cache.size > 5000) Cache.clear();
    Cache.set(Key, { At: Now, Value });
    return Value;
  } catch (ex) {
    console.error('[Consent] check failed: ' + ex.message);
    return Default;
  }
}

/** Forget a patient's cached state - called after they grant or withdraw. */
function Invalidate(PatRegNo) {
  if (!PatRegNo) return Cache.clear();
  [...Cache.keys()]
    .filter((k) => k.startsWith(String(PatRegNo) + '|'))
    .forEach((k) => Cache.delete(k));
}

module.exports = { HasConsent, CurrentStates, ActiveDocument, Invalidate, Available };
