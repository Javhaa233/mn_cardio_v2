/**
 * The inputs behind Эрсдэл үнэлгээ (ЗСӨ), tender §2.5.
 *
 * ONE READER, TWO SURFACES. The patient sees their own at
 * GET /api/patient/risk and the doctor sees the same patient's at
 * GET /api/doctor/patients/:id/risk. If those were two queries they would
 * eventually disagree about which row is "latest", and a doctor and a patient
 * looking at the same screen would read different numbers - which is worse than
 * either of them being wrong on its own.
 *
 * THERE IS NO SCORE HERE, DELIBERATELY. The tender asks for a cardiovascular
 * risk score and a risk class, but the methodology and its classification bands
 * are a ЗСҮТ clinical deliverable that has not been supplied (BLOCKERS §2.5).
 * Inventing a formula would produce a number a doctor might act on, so this
 * returns the measured inputs and nothing else. When the methodology arrives it
 * is added HERE, once, and both surfaces gain `score` and `riskClass` together.
 *
 * Keyed by PatRegNo rather than PatientId because that is what the two source
 * tables store - the same key the rehabilitation tables use.
 */

const { Models } = require('../config/DB');

/**
 * Latest body size and personal history for one registration number.
 *
 * Both are optional: a patient with neither is normal, not an error, so this
 * returns nulls rather than throwing. Ordered by Id DESC rather than by a date
 * column because the date is user-entered and can be back-dated, while Id is
 * the order the rows were actually recorded in.
 */
async function Read(PatRegNo) {
  if (!PatRegNo) return { bodySize: null, history: null };

  const [bodySize, history] = await Promise.all([
    Models.PatientBodySize.findOne({
      where: { PatRegNo },
      order: [['Id', 'DESC']],
      raw: true,
    }),
    Models.PatientOwnHistory.findOne({
      where: { PatRegNo },
      order: [['Id', 'DESC']],
      raw: true,
    }),
  ]);

  return { bodySize: bodySize || null, history: history || null };
}

module.exports = { Read };
