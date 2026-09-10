/**
 * Non-colour design tokens: radius, spacing, elevation, motion, layout.
 *
 * This is a plain constants module consumed from `sx`, exactly like
 * `theme/colors.js` beside it - deliberately NOT a fifth styling mechanism.
 * Four already coexist in this app (inline `style`, `sx`, `styled()`, JSS+SCSS)
 * and adding a fifth is explicitly out of bounds.
 *
 * What is deliberately NOT touched here:
 *   - `theme.spacing` stays at MUI's 8px. 627 files read `sx={{ p: 1 }}` as 8px
 *     and would all shift.
 *   - `theme.shape.borderRadius` stays as-is. It is Paper's, Dialog's and
 *     Menu's radius, i.e. every popover in the app.
 */

/**
 * Corner radii. `xs` is CONTROL.radius from theme.js, so a control sitting
 * inside a card still reads as a control rather than as a second card.
 */
export const radius = {
  xs: "3px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  pill: "999px",
};

/** A 4px grid. Independent of theme.spacing, which stays on 8px. */
export const space = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
};

/**
 * Shadows are tinted with the ink navy, never neutral black.
 *
 * This is most of the "light, high-tech" feel and it costs nothing to read: a
 * shadow that shares the page's colour temperature looks like depth, while a
 * grey-black shadow on a cool canvas looks like dirt.
 */
export const elevation = {
  0: "none",
  1: "0 1px 2px rgba(13, 58, 92, 0.06)",
  2: "0 2px 6px rgba(13, 58, 92, 0.08)",
  3: "0 6px 20px rgba(13, 58, 92, 0.10)", // card hover
  4: "0 16px 40px rgba(13, 58, 92, 0.16)", // lightbox / dialog
};

export const motion = {
  fast: "120ms cubic-bezier(.2,.8,.2,1)",
  base: "180ms cubic-bezier(.2,.8,.2,1)",
};

/**
 * Layout constants for the feed page.
 *
 * `feedMax` caps the POST BODY line length, not the page. The page is full
 * width at every breakpoint; a 1900px line of Mongolian clinical text is simply
 * not readable, so the feed column centres within its own track on very wide
 * screens while the rails keep using the width.
 */
export const layout = {
  // --- App shell ---------------------------------------------------------
  //
  // These used to live in three separate homes: the drawer widths in
  // `assets/jss/material-dashboard-pro-react.js`, the top-bar height in
  // `components/Navbars/topBarTokens.js`, and raw pixel literals inline in the
  // two layout shells. Three homes meant the sidebar, the navbar and the
  // layout could each disagree about how wide the sidebar is.
  //
  // Numbers, not px strings, because the shells do arithmetic with them
  // (`calc(100% - Npx)`).
  drawerWidth: 260,
  drawerMiniWidth: 80,
  topBarHeight: 60,

  // The width the temporary (mobile/tablet-portrait) drawer opens to. Capped
  // against the viewport so a 360px phone does not get a 260px drawer with a
  // 100px slot of remaining page behind it.
  drawerMobileWidth: "min(85vw, 300px)",

  // Below this the sidebar auto-collapses to its mini rail. This is NOT a
  // breakpoint - it deliberately matches no entry in `theme.breakpoints`, it
  // is a "smaller desktop" threshold that predates the token file. Named here
  // so it stops appearing as a bare `1440` in two layout files.
  sidebarAutoMini: 1440,

  railMd: "300px",
  railLg: "340px",
  railXl: "380px",
  contextXl: "260px",
  feedMax: "820px",

  // Width a rail track shrinks to when the reader collapses it. Wide enough for
  // the chevron plus breathing room, narrow enough to read as a spine rather
  // than a column. Collapsing does NOT widen the feed - feedMax still caps it -
  // so what this buys is quiet, not reading width.
  railCollapsed: "44px",
};

export default { radius, space, elevation, motion, layout };
