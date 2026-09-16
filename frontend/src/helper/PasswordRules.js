// The special-character class of backend/helper/PasswordPolicy.js, verbatim -
// `=-?` is a RANGE there (= > ?), so a bare "-" does not count. Keep in step.
const SPECIAL_REGEX = /[!@#$%^&*()+=-?;,./{}|":<>[\]\\' ~_]/;

// Together these are exactly the server's PasswordRegex. Shown as a live
// checklist so the rule is visible BEFORE someone fails it, instead of the old
// one-line "does not meet the requirements !!!" after the fact. Labels are
// i18n keys. Used by the change-password dialog and the sign-up page.
export const PASSWORD_RULES = [
  {
    Key: "Length",
    Label: "At least 8 characters",
    Test: (v) => v.length >= 8,
  },
  {
    Key: "Upper",
    Label: "An uppercase Latin letter (A-Z)",
    Test: (v) => /[A-Z]/.test(v),
  },
  {
    Key: "Lower",
    Label: "A lowercase Latin letter (a-z)",
    Test: (v) => /[a-z]/.test(v),
  },
  { Key: "Digit", Label: "A digit (0-9)", Test: (v) => /\d/.test(v) },
  {
    Key: "Special",
    Label: "A special character (!@#$%...)",
    Test: (v) => SPECIAL_REGEX.test(v),
  },
];

export function PasswordMeetsRules(Value) {
  return PASSWORD_RULES.every((Rule) => Rule.Test(String(Value || "")));
}
