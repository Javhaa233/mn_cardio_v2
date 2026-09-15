// Create theme that works with both @mui/material and @mui/styles
import { createTheme } from "@mui/material/styles";
import { colors } from "./theme/colors";
import { radius, elevation, space } from "./theme/tokens";

/**
 * Control sizing lives here, and only here.
 *
 * It used to live in `src/styles/control-height-reduction.css` - 185 lines of
 * `!important` loaded globally. Because the app mounts MUI with
 * `<StyledEngineProvider injectFirst>`, that plain stylesheet was injected
 * AFTER every emotion class and therefore beat components even when they
 * declared `!important` themselves. Components fought back with ~220 more
 * `!important` declarations that could never win, which is why control heights
 * varied per control rather than per screen.
 *
 * The scale below replaces it. `!important` survives only where a component
 * library still declares a competing value; those local overrides are being
 * removed in favour of these, and each `!important` here should come off with
 * the last override it was guarding against.
 */
export const CONTROL = {
  // 32px is not a new opinion - it is what the control layer already declares
  // 97 times across BaseEditControls, against a handful of 26/28/30px
  // stragglers elsewhere. Same for 14px: 18 of the 22 font-size declarations
  // in that layer already say 14px (or 0.875rem). The old global stylesheet
  // was the odd one out at 30px/15px, and it won by injection order.
  height: "32px",
  paddingX: "10px",
  fontSize: "14px",
  radius: "3px",
  buttonMinHeight: "28px",
  buttonFontSize: "14px",
  labelFontSize: "14px",
  menuItemMinHeight: "36px",
};

/**
 * Touch sizing.
 *
 * `topBarTokens.js` used to state the old position outright: 36px "Meets WCAG
 * 2.5.8 AA (24x24); does not meet 2.5.5 AAA (44x44) - an accepted, mouse-first
 * tradeoff." That tradeoff is wrong now that doctors work from a tablet at the
 * bedside, so it is retired FOR TOUCH DEVICES ONLY.
 *
 * WHY `pointer: coarse` AND NOT A BREAKPOINT
 * A breakpoint measures the window, not the hand. Narrowing a desktop browser
 * would inflate every control on a mouse-driven machine, and the 200+ field
 * surgery forms would lose a quarter of their vertical density for nothing.
 * `pointer: coarse` asks the real question - is the primary input a finger -
 * so a docked tablet gets 44px and a small laptop window does not.
 *
 * This media query is the ONE place touch sizing is declared. Controls should
 * inherit from `CONTROL`/`TOUCH` rather than restating 44 locally.
 */
export const TOUCH = {
  // WCAG 2.5.5 AAA.
  height: "44px",
  buttonMinHeight: "44px",
  menuItemMinHeight: "44px",
  // (44 - 20) / 2, keeping the same glyph size inside a bigger hit box.
  togglePadding: "11px",
  pickersDay: "40px",
  // iOS zooms the page when a focused input is under 16px. Every control that
  // accepts typing must clear that bar on a touch device.
  fontSize: "16px",
};

/** The one touch media query, so call sites never retype the string. */
export const COARSE = "@media (pointer: coarse)";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    // The brand's filled-button colour, not MUI's default blue (#1976d2). Every
    // `color="primary"` in the app - a contained button, a checked radio, a
    // focused field - used to be a second, unrelated blue next to the cyanInk
    // toolbars. cyanInk is 5.84:1 on white, so it is safe for text as well.
    primary: {
      main: colors.brand.cyanInk,
      dark: colors.brand.cyanInkHover,
      contrastText: colors.text.white,
    },
    secondary: {
      main: colors.button.secondary,
      dark: colors.button.secondaryHover,
    },
    success: {
      main: colors.status.success,
    },
    error: {
      main: colors.status.danger,
    },
    warning: {
      main: colors.status.warning,
    },
    info: {
      main: colors.status.info,
    },
    background: {
      default: colors.background.primary,
      paper: colors.background.secondary,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
  },
  /**
   * The type scale. Sizes are px strings on purpose.
   *
   * Two things were wrong before, and the second one is the subtle one:
   *
   * 1. There was no scale at all - only `fontFamily` and `fontSize`. So every
   *    heading in the app was a local literal, and they disagreed: 202 sites
   *    say 14px, 104 say 12px, 56 say 18px, 47 say 16px, with weights split
   *    across 300/400/500/600/700.
   *
   * 2. `fontSize: 16` is NOT "body is 16px". MUI reads it as a multiplier
   *    (`coef = fontSize / 14`) and scales every built-in variant by it. At 16
   *    that is a 1.143x inflation on a control layer that is 14px, so `body1`
   *    actually rendered at 18.29px and `caption` at 13.7px. Setting it to 14
   *    makes coef exactly 1, and every variant below lands at the px it says.
   *
   * `body2` is 14px, which is `CONTROL.fontSize` / `labelFontSize` /
   * `buttonFontSize`. A label, an input value, a button and a line of secondary
   * text are therefore all one size, and forms do not shift - the controls in
   * `components:` below already declare their own explicit 14px and always did.
   *
   * Weight 300 is deliberately absent. It is the `_misc.scss` body weight and
   * it reads as washed out against a near-white canvas. 400 is the floor.
   */
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    htmlFontSize: 16,
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    // One display size per screen - the analytics rail's headline number.
    display: { fontSize: "34px", fontWeight: 700, lineHeight: 1.15 },

    // Headings, sized for a dense clinical app rather than a marketing page.
    h1: { fontSize: "28px", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "22px", fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: "18px", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: "16px", fontWeight: 600, lineHeight: 1.35 },
    h5: { fontSize: "15px", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "14px", fontWeight: 600, lineHeight: 1.4 },

    subtitle1: { fontSize: "15px", fontWeight: 600, lineHeight: 1.45 },
    subtitle2: { fontSize: "13px", fontWeight: 600, lineHeight: 1.45 },

    // Reading sizes. body1 is the post body; body2 is the app default.
    body1: { fontSize: "16px", fontWeight: 400, lineHeight: 1.55 },
    body2: { fontSize: "14px", fontWeight: 400, lineHeight: 1.5 },

    button: {
      fontSize: CONTROL.buttonFontSize,
      fontWeight: 500,
      lineHeight: 1.2,
      textTransform: "none",
    },
    caption: { fontSize: "12.5px", fontWeight: 400, lineHeight: 1.45 },
    // No uppercase transform: Cyrillic uppercase is harder to scan, and the
    // app's labels are Mongolian.
    overline: {
      fontSize: "11px",
      fontWeight: 700,
      lineHeight: 1.2,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          padding: "4.5px 10px !important",
          minHeight: `${CONTROL.buttonMinHeight} !important`,
          fontSize: `${CONTROL.buttonFontSize} !important`,
          [COARSE]: {
            minHeight: `${TOUCH.buttonMinHeight} !important`,
            padding: "8px 16px !important",
          },
        },
      },
    },
    /**
     * Dialog surface defaults.
     *
     * `BaseDialog`, `BaseDetailView` and `BaseAlert` style themselves; these
     * defaults are for the dialogs that open a raw MUI `<Dialog>` (user edit,
     * file preview, organisation merge, chat and others), so every popup shares
     * one surface: the page-surface radius, the dialog elevation, a white paper
     * and a navy-tinted backdrop instead of neutral black. A component that
     * passes its own `sx` still wins.
     */
    MuiDialog: {
      styleOverrides: {
        root: {
          "& .MuiBackdrop-root": { backgroundColor: "rgba(12, 34, 51, 0.45)" },
        },
        paper: {
          borderRadius: radius.lg,
          boxShadow: elevation[4],
          backgroundColor: colors.brand.surface,
          backgroundImage: "none",
        },
        paperFullScreen: { borderRadius: 0 },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: colors.brand.ink,
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: 1.35,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        dividers: { borderColor: colors.brand.hairline },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: `${space[3]} ${space[4]}` },
      },
    },
    /**
     * The small overlays: tooltips, menus, select dropdowns, date-picker and
     * lookup popovers. Every one of these rendered in MUI's defaults - a grey
     * #616161 tooltip, a neutral-black shadow, a 4px corner - beside surfaces
     * that are navy-tinted and 14px. Colour, corner and shadow only; sizes are
     * untouched.
     */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.brand.ink,
          color: colors.text.white,
          fontSize: "12.5px",
          fontWeight: 500,
          lineHeight: 1.4,
          padding: `${space[1]} ${space[2]}`,
          borderRadius: radius.sm,
        },
        arrow: { color: colors.brand.ink },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: radius.md,
          boxShadow: elevation[3],
          border: `1px solid ${colors.brand.hairline}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radius.md,
          boxShadow: elevation[3],
          border: `1px solid ${colors.brand.hairline}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.brand.hairline },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: "rgba(13, 58, 92, 0.08)" },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          marginTop: "6px !important",
          marginBottom: "6px !important",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        /**
         * The iOS zoom backstop.
         *
         * `input` below already asks for 16px on a coarse pointer, but
         * individual controls set their own `fontSize` locally and win on
         * specificity - a browser probe found a live filter control still
         * rendering at 11px, which makes iOS Safari zoom the whole page the
         * moment it takes focus. Rather than chase each control, this catches
         * every text entry in the app from one place. `!important` is what
         * makes it beat those local declarations, and it is scoped to coarse
         * pointers so desktop is untouched.
         */
        root: {
          [COARSE]: {
            "& input, & textarea": {
              fontSize: `${TOUCH.fontSize} !important`,
            },
          },
        },
        input: {
          padding: `0 ${CONTROL.paddingX}`,
          height: "auto",
          fontSize: CONTROL.fontSize,
          lineHeight: "30px",
          // 16px is not a style choice here - below it, iOS Safari zooms the
          // whole page on focus and the doctor has to pinch back out between
          // fields.
          [COARSE]: {
            fontSize: TOUCH.fontSize,
            lineHeight: "42px",
          },
        },
        inputMultiline: {
          padding: "6px 10px",
          lineHeight: 1.35,
          height: "auto",
        },
      },
    },
    /**
     * The iOS zoom backstop.
     *
     * `MuiInputBase.input` above already asks for 16px on a coarse pointer, but
     * individual controls set their own `fontSize` locally and win on
     * specificity - a browser probe found a live filter control still rendering
     * at 11px, which makes iOS Safari zoom the entire page the moment it takes
     * focus. Rather than chase each control, this catches every text entry in
     * the app from one place. `!important` is what makes it beat the local
     * declarations; it is scoped to coarse pointers, so desktop is untouched.
     */
    /**
     * Small icon buttons keep their SIZE and gain a hit AREA.
     *
     * A browser probe found 16px and 18px icon buttons in the page-tab strip on
     * a touch device - well under half the 44px minimum. Setting a real 44px
     * height on them would blow the tab strip apart, so instead an invisible
     * centred pseudo-element extends the tappable region to 44x44 while the
     * glyph and the layout stay exactly as they are.
     */
    MuiIconButton: {
      styleOverrides: {
        root: {
          [COARSE]: {
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: TOUCH.height,
              height: TOUCH.height,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: CONTROL.height,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: CONTROL.radius,
          [COARSE]: { minHeight: TOUCH.height },
          // Brand hairlines for raw MUI fields, so they sit beside the
          // BaseEditControls rows (fieldRowStyles FIELD) without a second,
          // darker grey border. Focus keeps MUI's primary, which is cyanInk.
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.brand.hairlineStrong,
          },
          "&:hover:not(.Mui-disabled):not(.Mui-focused) .MuiOutlinedInput-notchedOutline":
            { borderColor: colors.brand.inkDim },
        },
      },
    },
    /**
     * Labels. Deliberately NO table overrides alongside these: CalculateRisk
     * and CVDInspectionAndManagement capture plain MUI tables with html2canvas
     * into the PDFs they hand to patients, and a global MuiTable rule would
     * change those printed pages.
     */
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: colors.brand.inkMuted,
          "&.Mui-focused": { color: colors.brand.cyanInk },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          minHeight: CONTROL.height,
          "&:before, &:after": {
            marginTop: "-1px",
          },
          [COARSE]: { minHeight: TOUCH.height },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: `0 32px 0 ${CONTROL.paddingX}`,
          minHeight: CONTROL.height,
          height: "auto",
          display: "flex",
          alignItems: "center",
          fontSize: CONTROL.fontSize,
          [COARSE]: {
            minHeight: TOUCH.height,
            fontSize: TOUCH.fontSize,
          },
        },
        icon: {
          right: "6px !important",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        input: {
          padding: `0 ${CONTROL.paddingX} !important`,
        },
        root: {
          "& .MuiInputBase-root": {
            minHeight: CONTROL.height,
            borderRadius: CONTROL.radius,
            [COARSE]: { minHeight: TOUCH.height },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: `${CONTROL.menuItemMinHeight} !important`,
          fontSize: CONTROL.fontSize,
          paddingTop: "5px !important",
          paddingBottom: "5px !important",
          // Option lists are long in this app (a `dico` can run to hundreds of
          // rows), so a mistap here costs a scroll back.
          [COARSE]: {
            minHeight: `${TOUCH.menuItemMinHeight} !important`,
            fontSize: TOUCH.fontSize,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        // No !important: a control that asks for different padding should win.
        // The glyph stays 20px on touch; only the hit box around it grows, so
        // a dense radio grid keeps its visual weight and gains a tappable area.
        root: { padding: "4.5px", [COARSE]: { padding: TOUCH.togglePadding } },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: { padding: "4.5px", [COARSE]: { padding: TOUCH.togglePadding } },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { height: "28px !important" },
        switchBase: { padding: "6px !important" },
        thumb: { width: "14px !important", height: "14px !important" },
        track: { height: "22px !important", width: "40px !important" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          transform: "translateY(-1px) !important",
          top: "5px !important",
          fontSize: `${CONTROL.labelFontSize} !important`,
        },
        shrink: {
          transform: "translate(12px, -6px) scale(0.85) !important",
        },
        // The root rule replaces MUI's translate(14px, 9px) with a bare
        // translateY, so a resting outlined label sat flush against the left
        // border, touching the top (TenderFormAll search fields, CVD toolbars).
        // Same 12px inset as the shrunk label, and down to the text line.
        outlined: {
          "&:not(.MuiInputLabel-shrink)": {
            transform: "translate(12px, 2px) !important",
          },
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          width: "30px !important",
          height: "30px !important",
          fontSize: `${CONTROL.labelFontSize} !important`,
          [COARSE]: {
            width: `${TOUCH.pickersDay} !important`,
            height: `${TOUCH.pickersDay} !important`,
          },
        },
      },
    },
  },
});

// Enhance the theme to make it compatible with @mui/styles (withStyles)
// This adds the jss structure that @mui/styles expects
export default theme;
