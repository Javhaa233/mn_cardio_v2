/**
 * Email and phone rules for staff accounts - one copy for every entry point.
 *
 * Password reset mails `Users.Email`, and the only phone a staff account has is
 * `DoctorsProfile.telephone` (`Users` has no phone column). Many accounts were
 * created with neither, so both are now required when an account is created and
 * collected from existing users by the post-login prompt.
 *
 * Deliberately NOT called from `Users.createNew`, `BaseCreate` or
 * `ensureUserForDoctor`: `UserRequest/Confirm` creates the doctor profile through
 * `BaseCreate`, and approving an old sign-up request that has no phone must keep
 * working.
 * The checks sit at the entry points instead (see CheckContact callers).
 *
 * Messages are English source strings that double as i18n keys.
 */

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Mongolian numbers are 8 digits. People type them as "9911 2233" or "9911-2233".
const PHONE_REGEX = /^\d{8}$/;

function NormalizeEmail(Value) {
  return Value === null || Value === undefined ? '' : String(Value).trim();
}

function NormalizePhone(Value) {
  return Value === null || Value === undefined ? '' : String(Value).replace(/[\s\-().]/g, '');
}

function EmailError(Email, Required) {
  if (!Email) return Required ? 'Email is required' : null;
  return EMAIL_REGEX.test(Email) ? null : 'The email address is invalid';
}

function PhoneError(Phone, Required) {
  if (!Phone) return Required ? 'Phone number is required' : null;
  return PHONE_REGEX.test(Phone) ? null : 'Phone number must be 8 digits';
}

/**
 * Validates, and normalises in place, the email/phone keys of `Data`.
 *
 * Required: true  - both keys must be present and valid (account creation).
 * Required: false - a key that is PRESENT must be valid, and may not be blanked;
 *                   an absent key is not judged. Edit forms send only changed
 *                   fields, so an untouched legacy value is never rejected.
 *
 * Pass `PhoneKey: null` where the table has no phone (Users).
 * Returns an error message, or null.
 */
function CheckContact(Data, { EmailKey = 'email', PhoneKey = 'telephone', Required = false } = {}) {
  if (!Data) return 'Information is missing';

  if (EmailKey && (Required || Object.prototype.hasOwnProperty.call(Data, EmailKey))) {
    const Email = NormalizeEmail(Data[EmailKey]);
    const Error = EmailError(Email, true);
    if (Error) return Error;
    Data[EmailKey] = Email;
  }

  if (PhoneKey && (Required || Object.prototype.hasOwnProperty.call(Data, PhoneKey))) {
    const Phone = NormalizePhone(Data[PhoneKey]);
    const Error = PhoneError(Phone, true);
    if (Error) return Error;
    Data[PhoneKey] = Phone;
  }

  return null;
}

module.exports = {
  EMAIL_REGEX,
  PHONE_REGEX,
  NormalizeEmail,
  NormalizePhone,
  CheckContact,
};
