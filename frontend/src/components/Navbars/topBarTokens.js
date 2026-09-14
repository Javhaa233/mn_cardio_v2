import { layout } from "@/theme/tokens";

/**
 * Numeric tokens for the admin top bar.
 *
 * WHY THIS FILE EXISTS
 * `src/theme/colors.js` holds colours only - it has no spacing, radius or size
 * tokens - and `theme.js` keeps its sizing in a private `CONTROL` object that is
 * not exported. So there is nowhere central to put "every control in the bar is
 * 32px". This file is that home, scoped deliberately to the top bar rather than
 * pretending to be an app-wide design system.
 *
 * Colours are NOT here. They come from `theme/colors.js` and the MUI palette, so
 * there is still exactly one palette (CLAUDE.md section 6).
 */

const topBarTokens = Object.freeze({
  // Bar shell. The height lives in theme/tokens `layout.topBarHeight` so the
  // sidebar header can match it (48px; it was 60, which was 12px of empty
  // chrome above every page).
  height: layout.topBarHeight,
  sidePad: 10, // matches Content's horizontal padding (10px) so edges line up
  sidePadSm: 16,

  // The unit of the whole bar. Every icon control is this box: 32 leaves 8px
  // clear above and below inside the 48px bar and equals theme.js
  // CONTROL.height. On a touch screen (`pointer: coarse`) controls use
  // `buttonTouch` instead - still inside the bar, and a finger-sized target.
  button: 32,
  buttonTouch: 40,
  buttonPad: 6, // (32 - 20) / 2, a uniform ring around the glyph
  icon: 20, // every glyph, no exceptions
  radius: 8, // chrome radius; CONTROL.radius (3px) is for inputs

  // Spacing. 4px inside a group reads as one cluster; the divider block gives
  // ~21px optical between groups. The ratio is what makes grouping legible.
  gapItem: 4,
  gapGroup: 8,
  dividerHeight: 20,

  // Search
  searchWidth: 280,
  searchWidthSm: 200,
  searchClear: 22, // in-field affordance, the one intentional exception to 32

  // Profile chip
  avatar: 24,
  chevron: 18,
  nameMaxWidth: 140,

  // Badges
  badge: Object.freeze({
    size: 16,
    font: 11,
    ring: 2,
  }),
});

export default topBarTokens;
