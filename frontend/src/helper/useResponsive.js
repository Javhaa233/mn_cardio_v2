/**
 * The one place the app asks about viewport size and input type.
 *
 * WHY THIS EXISTS
 * Before this file there was exactly ONE `useMediaQuery` call in the whole
 * frontend (`view/DoctorTeamCustom.jsx`). Everything else that cared about
 * width either hardcoded a pixel literal (`window.innerWidth <= 1440` in both
 * layout shells) or hand-rolled a raw media-query string against a duplicated
 * copy of the breakpoint table. Three copies of that table existed and were
 * free to drift apart from `theme.js`.
 *
 * Every new size- or touch-dependent decision goes through a hook here, so the
 * behaviour is consistent, greppable, and derived from `theme.breakpoints`
 * rather than from a number someone typed.
 *
 * WHICH DEVICE IS WHICH BAND
 * `theme.js` pins the MUI v4 breakpoint values, so the mapping is NOT the one
 * MUI documents today:
 *
 *   xs   0-599     phone (360-430)          everything stacks; lookup-grade
 *   sm   600-959   iPad PORTRAIT (768)      the primary target
 *   md   960-1279  iPad landscape (1024)    permanent sidebar returns
 *   lg+  1280+     desktop                  unchanged
 *
 * The trap is `sm`. It reads like "small phone" and is actually tablet
 * portrait - the single most important band for this app, because that is a
 * doctor holding an iPad on a ward round.
 */

import { useMediaQuery, useTheme } from "@mui/material";

/** Phone. Below 600px. Everything stacks; lists render as cards. */
export function useIsPhone() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}

/**
 * Tablet portrait: 600-959px.
 *
 * Note this is the band where the sidebar is still a temporary drawer, so a
 * screen that assumes "sidebar is visible" is wrong here.
 */
export function useIsTabletPortrait() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between("sm", "md"));
}

/**
 * Anything narrower than a landscape tablet - phone OR tablet portrait.
 *
 * This is usually the predicate you want, because it matches exactly where the
 * permanent sidebar disappears and where dialogs should go full screen.
 */
export function useIsCompact() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
}

/**
 * Is the primary input a finger?
 *
 * Deliberately NOT a width test. A narrowed desktop window is still a mouse
 * and must keep its 32px density; a docked tablet is still a finger even at
 * 1280px. Pair this with the `pointer: coarse` block in `theme.js`, which
 * handles the sizing declaratively - reach for this hook only when the
 * DIFFERENCE IS BEHAVIOURAL (a drag handle to hide, a hover affordance to
 * replace with a tap target), not when it is only a size.
 */
export function useIsTouch() {
  return useMediaQuery("(pointer: coarse)");
}

export default {
  useIsPhone,
  useIsTabletPortrait,
  useIsCompact,
  useIsTouch,
};
