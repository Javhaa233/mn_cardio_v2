import { createTheme } from "@mui/material/styles";

import baseTheme, { COARSE, TOUCH } from "@/theme.js";

/**
 * The patient portal's theme: the doctor's design system at a larger size.
 *
 * WHY A SECOND THEME AT ALL
 * The doctor side is tuned for all-shift data entry - 32px controls, 14px
 * type, maximum rows on screen. That is the right trade for someone who lives
 * in these forms. It is the wrong trade for a cardiology outpatient, who is
 * often elderly, is almost always on a phone, and opens the portal a few times
 * a month. So the patient layout - and only the patient layout - mounts this
 * derived theme.
 *
 * WHAT THIS FILE CAN AND CANNOT DO
 * It can resize MUI components. It CANNOT set the page's baseline text size,
 * and that surprises people, so it is worth stating plainly:
 *
 *   This app has no <CssBaseline>. Baseline type comes from SCSS -
 *   `assets/scss/material-dashboard-pro-react/_misc.scss` sets
 *   `body { font-size: 14px }` - and `theme.typography` never touches a bare
 *   <Box>, <div> or <span>. The patient screens are built almost entirely from
 *   bare <Box>, so a theme alone would change nearly nothing on them.
 *
 * The baseline lift therefore lives as a scoped CSS rule on `Content` in
 * `layouts/Patient.jsx`, using the constants exported below. The two halves
 * belong together; change them together.
 *
 * THREE TRAPS, ALL LOAD-BEARING
 *
 * 1. NEVER put `breakpoints` in this file. `createTheme` re-spreads an
 *    already-built breakpoints object's stale `up`/`down`/`between` closures
 *    ON TOP of freshly derived ones, so `breakpoints.values.md` and
 *    `breakpoints.up("md")` would silently disagree. Inheriting them
 *    untouched, as we do, is correct.
 *
 * 2. NEVER set `typography.fontSize` here. MUI reads it as a multiplier
 *    (coef = fontSize / 14) but `createTheme(base, ...)` inherits the base's
 *    already-pinned `pxToRem`, so setting it is a near-silent no-op - you
 *    would see nothing change and start chasing it with `!important`. Resize
 *    the NAMED VARIANTS instead, as below. (Changing it in `theme.js` itself
 *    is the genuinely dangerous version: it rescales MuiSvgIcon, MuiFab,
 *    MuiTab and MuiBadge, not just text.)
 *
 * 3. `components.styleOverrides` DEEP-MERGE with the base theme's, key by key,
 *    before any CSS is generated. There is no specificity contest to win here,
 *    so `!important` below is not aimed at `theme.js` - it is aimed at local
 *    `sx` declarations and at the global coarse-pointer rule in `index.jsx`,
 *    both of which do compete. Where the base declares a `[COARSE]` block for
 *    a key, restate it, because the merge keeps the base's copy otherwise.
 */

/**
 * The patient baseline, consumed by the scoped CSS rule in `layouts/Patient.jsx`.
 *
 * `body` is 16px against the app's 14px: one clear step up, not a jump that
 * would reflow every card. `table` exists because `styles/style.scss` sets
 * `table { font-size: 13px }` with an element selector, which beats plain
 * inheritance outright - the patient screens that render tables need it
 * restated or they stay at 13px.
 */
export const PATIENT_TYPE = {
  body: "16px",
  lineHeight: 1.55,
  table: "15px",
};

/** WCAG 2.5.5 AAA, applied on every pointer here rather than only on touch. */
const TAP = TOUCH.height;

const patientTheme = createTheme(baseTheme, {
  typography: {
    // One step up each, holding the scale's own proportions. Sizes only:
    // weights and the family are inherited so the portal still reads as the
    // same product.
    body1: { fontSize: "17px" },
    body2: { fontSize: "16px" },
    subtitle1: { fontSize: "16px" },
    subtitle2: { fontSize: "15px" },
    caption: { fontSize: "14px" },
    button: { fontSize: "16px" },
    h6: { fontSize: "16px" },
    h5: { fontSize: "17px" },
    h4: { fontSize: "18px" },
    h3: { fontSize: "20px" },
    h2: { fontSize: "24px" },
  },

  components: {
    // A patient taps these with a thumb on a phone and clicks them with a
    // mouse on a desktop. 44px on both, rather than the doctor side's 28px
    // fine-pointer minimum.
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: `${TAP} !important`,
          fontSize: "16px !important",
          padding: "8px 16px !important",
          [COARSE]: {
            minHeight: `${TAP} !important`,
            padding: "10px 18px !important",
          },
        },
      },
    },

    // Menus are how a patient reaches their profile and the logout.
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: TAP,
          fontSize: "16px",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: TAP,
          minHeight: TAP,
        },
      },
    },

    // 16px is also the floor below which iOS zooms the page on focus. The
    // global rule in `index.jsx` already pins raw <input> elements to 16 on a
    // coarse pointer; this is the MUI half, and it applies on desktop too.
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: "16px" },
        input: { fontSize: "16px" },
      },
    },

    /**
     * Inputs and selects, raised to the same 44px the buttons get.
     *
     * The base theme pins both to CONTROL.height (32px) on a fine pointer,
     * which is correct for a doctor's dense forms. At the patient baseline it
     * is actively broken, not merely small: a 32px select is too short for a
     * 16px value plus the shrunk floating label, so the label collides with
     * the text it labels. Measured on the Сануулга form - selects came out at
     * 32px against the text fields' 47px, and every label overlapped.
     *
     * The base theme's [COARSE] block already says 44; this makes it the size
     * on every pointer here, so the two agree.
     */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: TAP,
          [COARSE]: { minHeight: TAP },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          minHeight: TAP,
          display: "flex",
          alignItems: "center",
          [COARSE]: { minHeight: TAP },
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: "16px !important" },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: "16px !important" },
      },
    },

    // A tri-state radio row is the single most-tapped control in the ЗСӨ
    // questionnaire, and the default 9px padding puts two options inside one
    // fingertip.
    MuiCheckbox: {
      styleOverrides: {
        root: { padding: TOUCH.togglePadding },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: { padding: TOUCH.togglePadding },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: TAP,
          fontSize: "16px",
        },
      },
    },
  },
});

export default patientTheme;
