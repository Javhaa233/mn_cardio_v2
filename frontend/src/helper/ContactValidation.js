/**
 * Email and phone rules for staff accounts.
 *
 * Mirrors backend/helper/ContactValidation.js - keep the two in step. The server
 * enforces the same rules; this copy is here so a form can say what is wrong
 * before a round trip, and so a half-saved account (Users row written, profile
 * refused) cannot happen from the admin doctor form.
 *
 * Every validator returns an i18n key (an English source string) or null.
 */

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Mongolian numbers are 8 digits; people type them as "9911 2233" or "9911-2233".
export const PHONE_REGEX = /^\d{8}$/;

export const NormalizeEmail = (Value) =>
  Value === null || Value === undefined ? "" : String(Value).trim();

export const NormalizePhone = (Value) =>
  Value === null || Value === undefined
    ? ""
    : String(Value).replace(/[\s\-().]/g, "");

export function ValidateEmail(Value) {
  const Email = NormalizeEmail(Value);
  if (!Email) return "Email is required";
  return EMAIL_REGEX.test(Email) ? null : "The email address is invalid";
}

export function ValidatePhone(Value) {
  const Phone = NormalizePhone(Value);
  if (!Phone) return "Phone number is required";
  return PHONE_REGEX.test(Phone) ? null : "Phone number must be 8 digits";
}

/**
 * Validates, and normalises in place, the email/phone keys of `Data`.
 *
 * Required: true  - both must be present and valid (a new account).
 * Required: false - only a key that is PRESENT is judged, and it may not be
 *                   blanked. Edit forms keep only changed fields, so an
 *                   untouched legacy value is never rejected.
 */
export function CheckContact(
  Data,
  { EmailKey = "email", PhoneKey = "telephone", Required = false } = {},
) {
  if (!Data) return "Information is missing";
  const Has = (Key) => Object.prototype.hasOwnProperty.call(Data, Key);

  if (EmailKey && (Required || Has(EmailKey))) {
    const Error = ValidateEmail(Data[EmailKey]);
    if (Error) return Error;
    Data[EmailKey] = NormalizeEmail(Data[EmailKey]);
  }
  if (PhoneKey && (Required || Has(PhoneKey))) {
    const Error = ValidatePhone(Data[PhoneKey]);
    if (Error) return Error;
    Data[PhoneKey] = NormalizePhone(Data[PhoneKey]);
  }
  return null;
}
