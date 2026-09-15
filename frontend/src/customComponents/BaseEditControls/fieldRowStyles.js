/**
 * The shared geometry of a form field row.
 *
 * WHAT A FIELD ROW IS
 * Every clinical form field renders as one bordered row split into a tinted
 * label cell and a white control cell. That shape is repeated, almost
 * character for character, in eight `BaseEditControls/*` files and again in
 * `baseComponents/BaseField.jsx`. This module is the single description of it,
 * so a change to how rows behave on a tablet is one edit rather than nine.
 *
 * THE BUG THIS FILE EXISTS TO FIX
 * The controls always declared `xs={12} sm={6} md={effectiveMd}` on both
 * cells, so the label and input were correctly told to stack on a phone. They
 * could not, because the row CONTAINER was pinned:
 *
 *     height: "32px", minHeight: "32px", maxHeight: "32px"
 *
 * Two stacked cells need roughly 64px inside a box capped at 32px, so the
 * input rendered on top of its own label. It looked like the breakpoints were
 * not working; the breakpoints were fine and the parent was clipping them.
 * `layouts/Admin.jsx` then had `overflowX: hidden`, so the damage was silently
 * cropped instead of scrolling into view.
 *
 * WHY sx AND NOT style
 * These were plain `style={{}}` attributes. An inline style attribute cannot
 * hold a media query, so a responsive row is impossible until the row moves to
 * `sx`. Where you convert one, REMOVE the old `style` height keys - an inline
 * style beats an emotion class, so leaving both means the cap silently wins.
 */

import { CONTROL, TOUCH, COARSE } from "@/theme.js";
import { colors } from "@/theme/colors";

/**
 * The colours of a field row, in one place.
 *
 * Every control used to restate them as literals - a warm grey label
 * (#75736c, 25 copies), #eee borders, #ccc on hover, #aaa on focus, a #f5f5f5
 * label cell on read-only rows and #eff9fe on edit rows - so the same form
 * showed two label greys and two label tints depending on which control drew
 * the row. These are the brand equivalents; controls import FIELD instead of
 * repeating a hex.
 *
 * Contrast: inkMuted is 5.97:1 on tintSolid, so a label on the tinted cell
 * passes AA (the old warm grey was ~4.5:1). Values use the full ink.
 */
export const FIELD = {
  rowBorder: colors.brand.hairline,
  labelBg: colors.brand.tintSolid,
  labelInk: colors.brand.inkMuted,
  valueInk: colors.brand.ink,
  inputBg: colors.brand.surface,
  inputBorder: colors.brand.hairline,
  inputBorderHover: colors.brand.hairlineStrong,
  inputBorderFocus: colors.brand.cyan,
  placeholder: colors.brand.inkDim,
  checked: colors.brand.cyanInk,
  unchecked: colors.brand.inkDim,
  disabledBg: colors.brand.tintSolid,
};

/**
 * The inner input's border states, as an sx fragment. A focused field shows a
 * cyan edge (not text, so the bright cyan is allowed) doubled with an inset
 * shadow so it reads at a glance without shifting the layout.
 */
export const inputBorderSx = {
  border: `1px solid ${FIELD.inputBorder}`,
  transition: "border-color 120ms ease, box-shadow 120ms ease",
  "&:hover:not(.Mui-disabled)": { borderColor: FIELD.inputBorderHover },
  "&.Mui-focused, &:focus-within": {
    borderColor: FIELD.inputBorderFocus,
    boxShadow: `inset 0 0 0 1px ${FIELD.inputBorderFocus}`,
  },
  "&.Mui-disabled": { backgroundColor: FIELD.disabledBg },
};

/**
 * The breakpoint at which the label stops sitting ABOVE the input and moves
 * BESIDE it.
 *
 * `sm` is 600px, which in this app's (MUI v4) breakpoint table is tablet
 * portrait - so an iPad gets the side-by-side row a doctor expects and only a
 * phone stacks.
 */
export const ROW_FROM = "sm";

/**
 * Fold `pointer: coarse` into an existing breakpoint query.
 *
 * Produces e.g. "@media (pointer: coarse) and (min-width:600px)". Written flat
 * rather than nested because nested at-rules through the styling pipeline are
 * not reliably flattened, and a silently dropped rule here is invisible.
 */
export const withCoarse = (mq) =>
  mq.replace("@media ", "@media (pointer: coarse) and ");

/**
 * Grid widths for the two cells.
 *
 * xs  stacked, both full width
 * sm  label 4/12 (33%). It was 6/12, which gave a portrait tablet a 50% label
 *     column and left the actual input narrower than the word describing it.
 * md  label `effectiveMd` (40% by default), the long-standing desktop ratio,
 *     deliberately unchanged.
 */
export const labelSize = (effectiveMd) => ({ xs: 12, sm: 4, md: effectiveMd });

export const inputSize = (effectiveMd, hasLabel = true) =>
  hasLabel
    ? { xs: 12, sm: 8, md: 12 - effectiveMd }
    : { xs: 12, sm: 12, md: 12 };

/**
 * Callers pass `borderColor`, and nearly all of them pass the old default
 * "#eee" (or nothing). Those become the brand hairline; a deliberate other
 * colour is kept.
 */
const brandBorder = (borderColor) =>
  !borderColor || /^#e{3}(e{3})?$/i.test(borderColor)
    ? FIELD.rowBorder
    : borderColor;

/**
 * The row container.
 *
 * `fixedHeight` mirrors the existing `useFixedHeight` flag: single-line
 * controls pin to one control height, multi-line ones (textarea, checkbox and
 * radio groups) only set a floor.
 */
export const fieldRowSx = (
  theme,
  { borderColor, fixedHeight = true, fullHeight = false } = {},
) => {
  const stacked = theme.breakpoints.down(ROW_FROM);
  const beside = theme.breakpoints.up(ROW_FROM);

  const base = {
    marginBottom: "5px",
    width: "100%",
    border: `1px solid ${brandBorder(borderColor)}`,
    borderBottom: `1px solid ${FIELD.rowBorder}`,
    alignItems: "stretch",
    boxSizing: "border-box",
  };

  if (fullHeight) return { ...base, height: "100%", flex: 1 };

  return {
    ...base,
    // Stacked: free to grow to two control heights.
    [stacked]: {
      height: "auto",
      minHeight: CONTROL.height,
      maxHeight: "none",
    },
    // Beside: the historical single-row geometry, unchanged on desktop.
    [beside]: fixedHeight
      ? {
          height: CONTROL.height,
          minHeight: CONTROL.height,
          maxHeight: CONTROL.height,
        }
      : { minHeight: CONTROL.height },
    // Touch overrides come last so they win on a coarse pointer.
    [withCoarse(stacked)]: { minHeight: TOUCH.height },
    [withCoarse(beside)]: fixedHeight
      ? {
          height: TOUCH.height,
          minHeight: TOUCH.height,
          maxHeight: TOUCH.height,
        }
      : { minHeight: TOUCH.height },
  };
};

/**
 * The tinted label cell.
 *
 * The divider between label and control is a RIGHT edge when they sit side by
 * side and has to become a BOTTOM edge once they stack - otherwise every field
 * on a phone shows a stray vertical rule hanging off the end of its label.
 */
export const labelCellSx = (
  theme,
  { borderColor, fullHeight = false } = {},
) => ({
  backgroundColor: FIELD.labelBg,
  display: "flex",
  alignItems: "center",
  paddingLeft: "10px",
  paddingRight: "15px",
  boxSizing: "border-box",
  [theme.breakpoints.down(ROW_FROM)]: {
    borderRight: "none",
    borderBottom: `1px solid ${brandBorder(borderColor)}`,
    minHeight: "28px",
    paddingTop: "4px",
    paddingBottom: "4px",
  },
  [theme.breakpoints.up(ROW_FROM)]: {
    borderRight: `1px solid ${brandBorder(borderColor)}`,
  },
  ...(fullHeight ? { height: "100%" } : {}),
});

/**
 * The inner input's own line box.
 *
 * Separate from the row: the row is the bordered container, this is the height
 * of the editable line inside it. These are declared `!important` because
 * `CustomInput`'s own StyledInput sets competing padding the theme cannot
 * reach - so the touch override has to be `!important` too, or it loses to the
 * 32px it is trying to replace.
 */
export const innerInputSx = {
  padding: "0 10px !important",
  lineHeight: `${CONTROL.height} !important`,
  boxSizing: "border-box",
  overflow: "hidden",
  "& input": {
    padding: "0 !important",
    height: `${CONTROL.height} !important`,
    lineHeight: `${CONTROL.height} !important`,
  },
  [COARSE]: {
    lineHeight: `${TOUCH.height} !important`,
    "& input": {
      height: `${TOUCH.height} !important`,
      lineHeight: `${TOUCH.height} !important`,
      // Below 16px iOS zooms the page on focus.
      fontSize: `${TOUCH.fontSize} !important`,
    },
  },
};

/**
 * A single control's height, as a spreadable fragment.
 *
 * Use this wherever a control used to hardcode `height: "32px"`. It is a
 * `minHeight` on purpose: a hard `height` re-creates the clipping bug one
 * level down, where the theme raises the inner input to 44px for touch and the
 * wrapper still refuses to grow.
 */
export const controlHeightSx = {
  minHeight: CONTROL.height,
  [COARSE]: { minHeight: TOUCH.height },
};

/**
 * Sizing for a NATIVE `<input>` nested inside a cell - the masked-input case.
 *
 * `IMaskInput` renders a bare `<input>` and only accepts a raw DOM `style`
 * attribute, which cannot carry a media query and outranks every emotion
 * class. So the input cannot size itself; its parent has to size it by
 * descendant selector, which is what this is for.
 */
export const nativeInputSx = {
  "& input": {
    height: CONTROL.height,
    fontSize: CONTROL.fontSize,
    [COARSE]: {
      height: TOUCH.height,
      // 16px, or iOS zooms the page the moment the field takes focus.
      fontSize: TOUCH.fontSize,
    },
  },
};

/** The white control cell. */
export const inputCellSx = ({ fullHeight = false } = {}) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: FIELD.inputBg,
  boxSizing: "border-box",
  minWidth: 0,
  ...(fullHeight ? { height: "100%" } : {}),
});

export default {
  FIELD,
  inputBorderSx,
  ROW_FROM,
  controlHeightSx,
  withCoarse,
  innerInputSx,
  labelSize,
  inputSize,
  fieldRowSx,
  labelCellSx,
  inputCellSx,
};
