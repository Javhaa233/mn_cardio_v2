/**
 * Timed messages inside a rehab movement (RehabMovement.Cues, a JSON array).
 *
 *   { AtSec: 0,    AtSet: null, Text }   the start message - once, set 1 only
 *   { AtSec: 15,   AtSet: null, Text }   15 s into the work phase, in every set
 *                                        (timed movements only)
 *   { AtSec: null, AtSet: 2,    Text }   when set 2 begins (either kind)
 *
 * The player shows each for 4 s. Contract: mobile/API.md §2.7c.
 *
 * Reps movements have no clock - the patient counts - so a seconds cue there
 * could only be a guess. They take AtSec 0 (start) and AtSet cues only.
 *
 * Two callers, one rule: RehabContentController.SaveMovement refuses a bad list
 * with the reason, and RehabPlayer.ShapeMovement drops bad entries rather than
 * sending the app something it would have to second-guess.
 */

const MAX_CUES = 20;
const MAX_TEXT = 200;

const Int = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

/** The stored string (or an array) as an array; anything unreadable is []. */
function Parse(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

/**
 * Check a cue list against the movement's dose.
 * `dose` = { WorkSec, Reps, Sets }. Returns { Cues, Errors } - Cues normalised
 * and sorted (start, then by second, then by set), Errors in Mongolian, one per
 * bad row, with its 1-based row number.
 */
function Validate(list, dose) {
  const Errors = [];
  const Cues = [];
  const items = Parse(list);
  const timed = !(parseInt(dose && dose.Reps, 10) > 0);
  const workSec = parseInt(dose && dose.WorkSec, 10) || 0;
  const sets = Math.max(1, parseInt(dose && dose.Sets, 10) || 1);

  if (items.length > MAX_CUES) Errors.push('Мессеж ' + MAX_CUES + '-аас ихгүй байна');

  items.slice(0, MAX_CUES).forEach((c, i) => {
    const row = i + 1;
    const Text = String((c && c.Text) || '').trim();
    const AtSec = Int(c && c.AtSec);
    const AtSet = Int(c && c.AtSet);
    if (!Text) return Errors.push(row + '-р мессеж: текст хоосон байна');
    if (Text.length > MAX_TEXT) {
      return Errors.push(row + '-р мессеж: ' + MAX_TEXT + ' тэмдэгтээс урт байна');
    }
    if (Number.isNaN(AtSec) || Number.isNaN(AtSet)) {
      return Errors.push(row + '-р мессеж: хугацаа бүхэл тоо байна');
    }
    if ((AtSec === null) === (AtSet === null)) {
      return Errors.push(row + '-р мессеж: секунд эсвэл сетийн аль нэгийг сонгоно уу');
    }
    if (AtSet !== null) {
      if (AtSet < 1 || AtSet > sets) {
        return Errors.push(row + '-р мессеж: сет 1-' + sets + ' хооронд байна');
      }
    } else if (AtSec < 0) {
      return Errors.push(row + '-р мессеж: секунд сөрөг байж болохгүй');
    } else if (!timed && AtSec > 0) {
      return Errors.push(row + '-р мессеж: давталттай хөдөлгөөнд зөвхөн эхлэл эсвэл сет сонгоно');
    } else if (timed && AtSec >= workSec && AtSec > 0) {
      return Errors.push(row + '-р мессеж: ' + workSec + ' секундээс өмнө байна');
    }
    Cues.push({ AtSec, AtSet, Text });
  });

  Cues.sort((a, b) => {
    const ka = a.AtSet !== null ? [1, a.AtSet] : [0, a.AtSec];
    const kb = b.AtSet !== null ? [1, b.AtSet] : [0, b.AtSec];
    return ka[0] - kb[0] || ka[1] - kb[1];
  });
  return { Cues, Errors };
}

/** For storage: null when empty, so "no messages" is one value, not two. */
function Serialize(cues) {
  return cues && cues.length ? JSON.stringify(cues) : null;
}

module.exports = { MAX_CUES, MAX_TEXT, Parse, Validate, Serialize };
