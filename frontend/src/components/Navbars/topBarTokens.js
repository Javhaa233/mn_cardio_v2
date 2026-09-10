/**
 * Numeric tokens for the admin top bar.
 *
 * WHY THIS FILE EXISTS
 * `src/theme/colors.js` holds colours only - it has no spacing, radius or size
 * tokens - and `theme.js` keeps its sizing in a private `CONTROL` object that is
 * not exported. So there is nowhere central to put "every control in the bar is
 * 36px". This file is that home, scoped deliberately to the top bar rather than
 * pretending to be an app-wide design system.
 *
 * Colours are NOT here. They come from `theme/colors.js` and the MUI palette, so
 * there is still exactly one palette (CLAUDE.md section 6).
 */

const topBarTokens = Object.freeze({
  // Bar shell - 60px is the existing locked height, kept at every breakpoint.
  height: 60,
  sidePad: 10, // matches Content's horizontal padding (10px) so edges line up
  sidePadSm: 16,

  // The unit of the whole bar. Every icon control is this box.
  // 36 leaves 12px clear above and below inside the 60px bar, and sits in the
  // same family as theme.js's CONTROL.height (32). Meets WCAG 2.5.8 AA (24x24);
  // does not meet 2.5.5 AAA (44x44) - an accepted, mouse-first tradeoff.
  button: 36,
  buttonPad: 8, // (36 - 20) / 2, a uniform ring around the glyph
  icon: 20, // every glyph, no exceptions
  radius: 8, // chrome radius; CONTROL.radius (3px) is for inputs

  // Spacing. 4px inside a group reads as one cluster; the divider block gives
  // ~25px optical between groups. The ratio is what makes grouping legible.
  gapItem: 4,
  gapGroup: 8,
  dividerHeight: 24,

  // Search
  searchWidth: 280,
  searchWidthSm: 200,
  searchClear: 24, // in-field affordance, the one intentional exception to 36

  // Profile chip
  avatar: 26,
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
