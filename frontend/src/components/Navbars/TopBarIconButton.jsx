import { forwardRef } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

import { colors } from "@/theme/colors";
import T from "./topBarTokens";

/**
 * The single icon-button primitive for the admin top bar. EVERY icon control in
 * the bar goes through this component - that is what makes the sizes, margins
 * and hit targets uniform by construction rather than by discipline.
 *
 * DO NOT rebuild this on `components/CustomButtons/Button` or MUI `Button`.
 * `src/theme.js` globally forces
 *     MuiButton.root { padding: 4.5px 10px !important;
 *                      minHeight: 28px !important;
 *                      fontSize: 14px !important }
 * and CustomButtons/Button's `justIcon` is 41x41 with `margin: .3125rem 1px`.
 * Between them they are the reason the old bar was uneven, and no amount of
 * local `sx` beats an `!important` in a global override. `MuiIconButton` and
 * `MuiButtonBase` carry no such overrides - verified against theme.js,
 * styles/style.scss, index.css and the SCSS bundle - so they are the safe base.
 */

const Root = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  width: T.button,
  height: T.button,
  padding: T.buttonPad,
  flex: "0 0 auto",
  borderRadius: T.radius,
  color: active ? theme.palette.primary.main : colors.text.strong,
  backgroundColor: active ? colors.background.selected : "transparent",
  transition: theme.transitions.create(["background-color", "color"], {
    duration: theme.transitions.duration.shortest,
  }),

  "& .MuiSvgIcon-root": {
    fontSize: T.icon,
  },

  "&:hover": {
    backgroundColor: active
      ? colors.background.selected
      : colors.background.hover,
  },
  "&:active": {
    backgroundColor: colors.background.selected,
  },

  // Keyboard-only ring: mouse clicks stay clean.
  "&:focus": { outline: "none" },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },

  "&.Mui-disabled": {
    opacity: 0.38,
  },
}));

const BadgedIcon = styled(Badge)(() => ({
  display: "flex",
  "& .MuiBadge-badge": {
    height: T.badge.size,
    minWidth: T.badge.size,
    padding: "0 4px",
    borderRadius: T.badge.size / 2,
    fontSize: T.badge.font,
    fontWeight: 600,
    lineHeight: 1,
    border: `${T.badge.ring}px solid ${colors.background.primary}`,
    transform: "scale(1) translate(35%, -35%)",
  },
}));

/**
 * @param {string}  title    tooltip text AND aria-label - required, these are
 *                           icon-only controls
 * @param {boolean} active   dropdown open / control engaged; callers should also
 *                           swap to the filled icon variant
 * @param {object}  badge    { content, color, invisible, max } - omit for none
 */
const TopBarIconButton = forwardRef(function TopBarIconButton(
  { title, active = false, badge, children, ...rest },
  ref,
) {
  const icon = badge ? (
    <BadgedIcon
      overlap="circular"
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      badgeContent={badge.content}
      color={badge.color || "primary"}
      invisible={badge.invisible}
      max={badge.max ?? 99}
    >
      {children}
    </BadgedIcon>
  ) : (
    children
  );

  const button = (
    <Root ref={ref} active={active} aria-label={title} {...rest}>
      {icon}
    </Root>
  );

  if (!title) return button;

  return (
    <Tooltip title={title} placement="bottom" arrow enterDelay={400}>
      {button}
    </Tooltip>
  );
});

export default TopBarIconButton;
