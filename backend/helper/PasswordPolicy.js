/**
 * One definition of the password rule.
 *
 * The rule was copy-pasted into UserController.ResetPassword and
 * UserController.ChangePassword and never reached the patient equivalents in
 * PatientUserController, so "abc" was an acceptable patient password while
 * staff needed 8 mixed-class characters. Import from here instead of
 * re-declaring the regex.
 */

// At least 8 characters, with a digit, a lowercase letter, an uppercase letter
// and one special character. Kept byte-for-byte as it was in UserController so
// no existing staff password stops validating.
const PasswordRegex =
  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{8,}/;

const RequirementMessageMn =
  'Нууц үг хамгийн багадаа 8 тэмдэгт байх ба том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт тус бүр нэгээс доошгүй агуулсан байх ёстой';

const RequirementMessageEn =
  'Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number';

/** True when Value already looks like a bcrypt digest, so it must not be re-hashed. */
function IsBcryptHash(Value) {
  return typeof Value === 'string' && /^\$2[aby]\$\d{2}\$/.test(Value);
}

/** True when Password satisfies the policy. */
function IsAcceptable(Password) {
  return typeof Password === 'string' && PasswordRegex.test(Password);
}

module.exports = {
  PasswordRegex,
  RequirementMessageMn,
  RequirementMessageEn,
  IsBcryptHash,
  IsAcceptable,
};
