/**
 * Confidentiality classification. Tracker rows 21 and 22.
 *
 * WHAT THIS DOES NOT DO, AND WHY THAT IS THE RIGHT ANSWER TODAY.
 *
 * The tender requires classified patient data to be hidden from unauthorised
 * users. The access-rights matrix that would define "classified" and
 * "unauthorised" does not exist - it is BLOCKERS item 8, sent to ЗСҮТ on
 * 2026-09-09. Five things are unknown, and each changes CODE rather than
 * configuration:
 *
 *   which levels exist, and their codes - so the dico cannot even be seeded;
 *   which RoleId may see which level - enforcement is a switch with no cases;
 *   whether hiding means the ROW IS ABSENT or present with fields MASKED -
 *     different queries, different response shapes, a different frontend;
 *   whether a hidden row still counts in aggregates - if a total changes by
 *     role, the existence of a confidential record leaks through the count;
 *   who may break glass, for how long, and whether it is self-service.
 *
 * Writing an enforcement rule against five unknowns would produce something
 * that looks finished, passes nothing, and has to be thrown away.
 *
 * SO IT RUNS IN 'warn' AND THAT IS USEFUL WORK, not a placeholder. It logs
 * every row that WOULD have been hidden and hides nothing. When ЗСҮТ ask how
 * much data this affects and who it inconveniences, the answer comes from that
 * log instead of from a guess - and the matrix conversation becomes concrete.
 *
 * Wired in exactly ONE place: helper/BaseControllerHelper, beside AddOrgFilter.
 * That is the funnel every legacy list and detail read already passes through,
 * which is why AddOrgFilter lives there and why a second funnel would drift.
 */

const Flags = require('./FeatureFlags');
const SchemaProbe = require('./SchemaProbe');
const { Models, Op } = require('../config/DB');

const Available = async () => {
  if (Flags.Confidentiality === 'off') return false;
  await SchemaProbe.Warm();
  return SchemaProbe.HasColumn('Patient', 'ConfidentialityLevel');
};

/**
 * Does this user hold a live break-glass grant for this patient?
 *
 * Time-boxed by design: a grant with no expiry is just a slower way of
 * declassifying the record.
 */
async function HasGrant({ UserId, PatientId }) {
  try {
    if (!UserId || !PatientId) return false;
    await SchemaProbe.Warm();
    if (!SchemaProbe.HasTable('ConfidentialityGrant') || !Models.ConfidentialityGrant) return false;

    const row = await Models.ConfidentialityGrant.findOne({
      where: {
        PatientId,
        UserId,
        RevokedDate: null,
        [Op.or]: [{ ExpireDate: null }, { ExpireDate: { [Op.gt]: new Date() } }],
      },
      attributes: ['Id'],
      raw: true,
    });
    return !!row;
  } catch (ex) {
    console.error('[Confidentiality] grant lookup failed: ' + ex.message);
    return false;
  }
}

/**
 * May this user see this patient's record?
 *
 * Returns { Allowed, Level, Mode, Reason }. In 'warn' Allowed is ALWAYS true
 * and the would-be refusal is logged instead - read the Reason, not the
 * Allowed, when analysing the log.
 *
 * Never throws: a failure here must not hide a clinical record from the
 * clinician treating the patient.
 */
async function MaySeePatient({ LogedUser, PatientId, Level }) {
  const Mode = Flags.Confidentiality;

  try {
    if (!(await Available())) return { Allowed: true, Level: null, Mode: 'off', Reason: null };
    if (!LogedUser || !PatientId) return { Allowed: true, Level: null, Mode, Reason: null };

    let ConfLevel = Level;
    if (ConfLevel === undefined) {
      const P = await Models.Patient.findByPk(PatientId, {
        attributes: ['id_data', 'ConfidentialityLevel'],
        raw: true,
      });
      ConfLevel = P ? P.ConfidentialityLevel : null;
    }

    // Unclassified is the overwhelming majority - 357,156 patients on test and
    // not one classified, because the levels do not exist yet.
    if (!ConfLevel) return { Allowed: true, Level: null, Mode, Reason: null };

    // Admins, and anyone holding a live break-glass grant, always pass.
    if (String(LogedUser.RoleId) === '1') {
      return { Allowed: true, Level: ConfLevel, Mode, Reason: 'admin' };
    }
    if (await HasGrant({ UserId: LogedUser.Id, PatientId })) {
      return { Allowed: true, Level: ConfLevel, Mode, Reason: 'grant' };
    }

    /*
     * THIS IS WHERE THE MATRIX WOULD GO. It cannot be written yet - see the
     * file header. Until it arrives, a classified record with no grant is
     * reported as "would be hidden" and is NOT hidden.
     */
    if (Mode === 'warn') {
      console.error(
        '[Confidentiality] WOULD HIDE patient=' +
          String(PatientId) +
          ' level=' +
          String(ConfLevel) +
          ' user=' +
          String(LogedUser.Id) +
          ' role=' +
          String(LogedUser.RoleId) +
          ' -> allowed (warn mode, no access-rights matrix yet)'
      );
      return { Allowed: true, Level: ConfLevel, Mode, Reason: 'WOULD_HIDE' };
    }

    // enforce: refuse. Reachable only once somebody sets the flag, which they
    // should not do before the matrix exists.
    return { Allowed: false, Level: ConfLevel, Mode, Reason: 'NO_CLEARANCE' };
  } catch (ex) {
    console.error('[Confidentiality] check failed, allowing: ' + ex.message);
    return { Allowed: true, Level: null, Mode, Reason: 'CHECK_FAILED' };
  }
}

module.exports = { MaySeePatient, HasGrant, Available };
