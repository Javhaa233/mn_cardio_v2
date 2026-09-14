/**
 * "Зөвшөөрлийн кодгүй эмч нэвтрэхгүй" - a doctor with no professional practice
 * licence code cannot log in. Tracker row 13.
 *
 * READ THIS NUMBER BEFORE TOUCHING THE MODE. Measured on MnCardio_test
 * 2026-09-14: 3,298 active doctors across 660 organizations, and **every one of
 * them has no licence code**, because the column did not exist until that day.
 * Setting FEATURE_DOCTOR_LICENCE=enforce right now locks the entire national
 * user base out of a clinical system. That is not a hypothetical - it is what
 * the query at the bottom of scripts/add_doctor_licence_code.sql returns today.
 *
 * Hence three modes, defaulting to the one that changes nothing:
 *
 *   off     (default) no query, always allowed. Behaviour as before.
 *   warn    allowed, but the response carries Data.LicenseWarning and a
 *           LoginNoLicense audit row is written. RUN THIS FOR A FORTNIGHT: it
 *           answers "who is actually affected" from real logins rather than
 *           from a table scan, because a doctor who has not signed in for a
 *           year is not an operational problem today.
 *   enforce refuse, in the exact envelope of the other failure returns in
 *           Login().
 *
 * Escape hatches exist because day-one lockout of a national system is the
 * whole risk here, and a feature flag with no way back is not a safety measure:
 *
 *   LICENCE_EXEMPT_ROLES    default 1,6 - administrators and settings accounts
 *                           hold no clinical licence, and locking them out
 *                           removes the very panel used to enter licences.
 *   LICENCE_GRACE_UNTIL     an ISO date; before it, enforce behaves as warn.
 *   LICENCE_EXEMPT_USER_IDS break-glass for named accounts.
 *   LICENCE_CHECK_EXPIRY    default false - whether a code has EXPIRED is a
 *                           separate customer question from whether one exists.
 *
 * Still customer-blocked (BLOCKERS item 4): where codes come from - an ЭМХТ
 * registry lookup or administrator entry - and what the migration is for
 * existing doctors. LicenseSource records which, so a later sync needs no
 * schema change.
 */

const Flags = require('./FeatureFlags');
const SchemaProbe = require('./SchemaProbe');
const { Models } = require('../config/DB');

const Available = async () => {
  if (Flags.DoctorLicence === 'off') return false;
  await SchemaProbe.Warm();
  return SchemaProbe.HasColumn('DoctorsProfile', 'LicenseCode');
};

/** Is enforcement suspended by a grace date that has not passed yet? */
function InGrace() {
  const until = Flags.LicenceGraceUntil;
  if (!until) return false;
  const d = new Date(until);
  if (isNaN(d.getTime())) return false;
  return Date.now() < d.getTime();
}

function Exempt(userData) {
  if (Flags.LicenceExemptRoles.map(String).includes(String(userData.RoleId))) return true;
  if (Flags.LicenceExemptUserIds.map(String).includes(String(userData.Id))) return true;
  return false;
}

/**
 * @returns {{Allowed:boolean, Mode:string, Code:string|null, Reason:string|null}}
 *
 * Never throws. A failure here must not stop a doctor logging in - refusing
 * every login because a licence lookup errored would be a self-inflicted
 * outage far worse than the gap it guards.
 */
async function CheckLicence(userData) {
  const Mode = Flags.DoctorLicence;

  try {
    if (!userData) return { Allowed: true, Mode: 'off', Code: null, Reason: null };
    if (!(await Available())) return { Allowed: true, Mode: 'off', Code: null, Reason: null };
    if (Exempt(userData)) return { Allowed: true, Mode, Code: null, Reason: 'exempt' };

    // The licence lives on the doctor profile, not the user account -
    // DoctorsProfile.id is the Users.Id (see helper/CareTeam.js on the two
    // doctor ids, which is the easiest thing in this schema to get backwards).
    const Doctor = await Models.DoctorsProfile.findOne({
      where: { id: userData.Id },
      attributes: ['id_data', 'LicenseCode', 'LicenseExpireDate'],
      raw: true,
    });

    const Code = Doctor && Doctor.LicenseCode ? String(Doctor.LicenseCode).trim() : '';

    if (!Code) {
      const Refuse = Mode === 'enforce' && !InGrace();
      return {
        Allowed: !Refuse,
        Mode: InGrace() ? 'grace' : Mode,
        Code: null,
        Reason: 'NO_LICENCE',
      };
    }

    if (Flags.LicenceCheckExpiry && Doctor.LicenseExpireDate) {
      const exp = new Date(Doctor.LicenseExpireDate);
      if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
        const Refuse = Mode === 'enforce' && !InGrace();
        return {
          Allowed: !Refuse,
          Mode: InGrace() ? 'grace' : Mode,
          Code,
          Reason: 'LICENCE_EXPIRED',
        };
      }
    }

    return { Allowed: true, Mode, Code, Reason: null };
  } catch (ex) {
    console.error('[LicenceGate] check failed, allowing login: ' + ex.message);
    return { Allowed: true, Mode: Mode, Code: null, Reason: 'CHECK_FAILED' };
  }
}

/** The refusal text. The only place the wording lives. */
const RefusedMessage = () =>
  'Мэргэжлийн үйл ажиллагаа эрхлэх зөвшөөрлийн код бүртгэгдээгүй тул нэвтрэх ' +
  'боломжгүй байна. Байгууллагынхаа админд хандана уу.';

/** What warn mode attaches to an otherwise successful login. */
const WarningFor = (Result) =>
  Result.Reason === 'LICENCE_EXPIRED'
    ? 'Таны мэргэжлийн зөвшөөрлийн хугацаа дууссан байна.'
    : 'Мэргэжлийн үйл ажиллагаа эрхлэх зөвшөөрлийн код бүртгэгдээгүй байна.';

module.exports = { CheckLicence, RefusedMessage, WarningFor, Available };
