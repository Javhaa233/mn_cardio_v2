/**
 * Centralized color constants for the application
 * Extracted from inline styles across components
 */

export const colors = {
  // Input/Form control colors
  input: {
    text: "#495057",
    textDisabled: "#868e96",
    border: "#ced4da",
    borderFocus: "#80bdff",
    borderHover: "#adb5bd",
    background: "#ffffff",
    backgroundDisabled: "#e9ecef",
    placeholder: "#6c757d",
    error: "#dc3545",
  },

  // Label colors
  label: {
    primary: "#75736c",
    secondary: "#6c757d",
    error: "#dc3545",
    disabled: "#adb5bd",
  },

  // Button colors
  button: {
    primary: "#1976d2",
    primaryHover: "#1565c0",
    secondary: "#6c757d",
    secondaryHover: "#5a6268",
    success: "#28a745",
    successHover: "#218838",
    danger: "#dc3545",
    dangerHover: "#c82333",
    warning: "#ffc107",
    warningHover: "#e0a800",
  },

  // Background colors
  background: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#e9ecef",
    dark: "#343a40",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",

    // --- Values in active use ---
    surface: "#fafafa", // 101 - panel/section background
    surfaceAlt: "#f5f5f5", // 65
    infoTint: "#eff9fe", // 18
  },

  // Text colors
  text: {
    primary: "#212529",
    secondary: "#6c757d",
    disabled: "#adb5bd",
    white: "#ffffff",

    // --- Values in active use ---
    black: "#000000", // 98
    strong: "#333", // 25
    muted: "#999", // 17
    faint: "#949494", // 24
    heading: "#3c4858", // 36 - inherited Creative Tim heading colour
    sectionHeading: "#003366", // GroupPanel titles on every clinical form
  },

  // Border colors
  border: {
    light: "#dee2e6",
    medium: "#ced4da",
    dark: "#adb5bd",

    // --- Values in active use, named so they have one home ---
    // These are not new choices: they are the literals this codebase already
    // repeats, given names. Converging them is now a one-line edit here
    // instead of a 1,425-site search-and-replace.
    default: "#ccc", // 222 uses - the de facto control/panel border
    subtle: "#eee", // 63
    muted: "#d2d2d2", // 13
    divider: "#e0e0e0", // 14
    faint: "#949494", // 24 - table rules in the registry detail views
  },

  // Status colors
  status: {
    success: "#28a745",
    info: "#17a2b8",
    warning: "#ffc107",
    danger: "#dc3545",

    // --- Values in active use in the clinical views ---
    // Four greens and several reds are in circulation for the same
    // normal/abnormal meaning. Named first, converged second, so the
    // convergence is a visible decision rather than a side effect.
    normal: "#009c00", // 32
    normalAlt: "#00b530", // 11
    normalMui: "#4caf50", // 12
    abnormal: "#ff5757", // 9
    abnormalAlt: "#f54242", // 9
    accent: "#00acc1", // 10
  },

  // Shadow/Overlay colors
  shadow: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.2)",
    dark: "rgba(0, 0, 0, 0.3)",
  },

  // DataGrid specific colors
  grid: {
    headerBackground: "#f8f9fa",
    headerText: "#495057",
    rowHover: "rgba(0, 0, 0, 0.04)",
    rowSelected: "rgba(25, 118, 210, 0.12)",
    border: "#dee2e6",
    selectedAccent: "#4caf50",
  },

  // Anatomical diagram strokes (Echo 17-segment, coronary map). These are
  // drawing colours, not text colours, and deserve their own names so the
  // diagrams can be restyled without touching typography.
  diagram: {
    stroke: "#000000", // 73 uses in EchoExamination
    leader: "#999999", // 7 - leader lines
  },

  // Chart colors
  chart: {
    primary: "#1976d2",
    secondary: "#dc004e",
    tertiary: "#ff9800",
    quaternary: "#4caf50",
    quinary: "#9c27b0",
  },

  /**
   * Brand tokens - "light, high-tech".
   *
   * None of these are new inventions. The app already had a deliberate visual
   * identity in two places that had never been allowed to meet:
   *   - `view/Auth/LoginScene.css` (the animated login map) defines the cyan,
   *     the navy ink and the pale canvas as CSS custom properties.
   *   - `assets/jss/.../sidebarStyle.js` defines the sidebar's indigo->cyan
   *     gradient.
   * They already rhyme. This group makes that accidental brand deliberate and
   * reachable from `sx`, instead of locked inside one route's private
   * stylesheet.
   *
   * CONTRAST RULE - this is not optional polish. `cyan` (#18a8e8) is ~2.5:1 on
   * white and `cyanDeep` (#0096c9) is ~3.0:1. Both FAIL WCAG AA for text, and
   * white text on either fails too. So:
   *   - `cyan` / `cyanDeep`  -> non-text only: accent bars, borders, chart
   *                             strokes, icon glyphs at >=24px.
   *   - `cyanInk` (#0a6c96)  -> anything that is a word. 5.84:1 against white.
   *                             WCAG contrast is symmetric, so that one figure
   *                             covers both cyanInk text on white AND white text
   *                             on a filled cyanInk button - both pass AA.
   * Doctors read these screens for a whole shift; do not spend that budget.
   */
  brand: {
    // Ink - LoginScene --ink / --ink-dim
    ink: "#0c2233",
    inkDim: "#5e7688",
    // A deeper step of inkDim, for secondary text on a TINTED surface rather
    // than on white. inkDim is 4.75:1 on #ffffff - AA, but only just - and
    // falls to 3.86:1 once the surface is `tint` over `canvas`, which fails.
    // This is 5.97:1 on that same surface. Use it for muted text anywhere the
    // background is not white.
    inkMuted: "#3f5a6b",

    // Accent
    cyan: "#18a8e8", // LoginScene --cyan. NON-TEXT ONLY.
    cyanDeep: "#0096c9", // sidebar gradient end. NON-TEXT ONLY.
    cyanInk: "#0a6c96", // text and filled buttons - the AA-safe step
    cyanInkHover: "#085678", // hover/active step for a filled cyanInk button
    indigo: "#4034d6", // sidebar gradient start; only inside the gradient
    gradient: "linear-gradient(135deg, #4034D6 0%, #0096C9 100%)",

    // Surfaces
    canvas: "#eaf2f8", // LoginScene --bg-1. The page background.
    surface: "#ffffff", // cards
    tint: "rgba(24, 140, 200, 0.075)", // LoginScene --ring. Hover wash, chips.

    // Hairlines - LoginScene --panel-line
    hairline: "rgba(13, 58, 92, 0.13)",
    hairlineStrong: "rgba(13, 58, 92, 0.22)",

    focus: "rgba(24, 168, 232, 0.55)",

    // One saturated colour, used once per screen, for the only urgent thing.
    urgent: "#ee147d", // LoginScene --pink
  },
};

export default colors;
