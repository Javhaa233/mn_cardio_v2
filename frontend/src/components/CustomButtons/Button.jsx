import React, { forwardRef } from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// material-ui components
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

import { colors } from "@/theme/colors";
import { radius, motion } from "@/theme/tokens";
import { gridToolbarButtonSx, legacyButtonRank } from "@/theme/controlStyles";

/**
 * The Creative Tim button, kept for its 89 call sites and restyled onto the
 * brand ranks.
 *
 * It used to paint the template's palette - green `success`, teal `info`, red
 * `danger`, pink `rose`, orange `warning` - each filled, uppercase, with a
 * coloured drop shadow that grew on hover. A dialog footer or an action bar
 * therefore showed three or four equally loud buttons. The `color` prop is now
 * read as a rank (see `legacyButtonRank`): `primary`/`success` fill with
 * `cyanInk`, `danger`/`rose` are outlined red, everything else is outlined
 * neutral. The props and their layout meaning (`size`, `round`, `justIcon`,
 * `simple`, `block`, `fullWidth`, `link`) are unchanged.
 *
 * Two colours are chrome, not ranks, and keep their meaning:
 *   - `white` on a coloured bar (the sidebar toggle, `simple`) is white text;
 *     on its own it is a white button, i.e. neutral.
 *   - `transparent` is a ghost that inherits the surrounding colour.
 *
 * Sizes: `theme.js` MuiButton.root forces padding, min-height and font size
 * with `!important`, so `size="sm"`/`"lg"` never changed them in practice and
 * no longer try to. `justIcon` keeps its square geometry.
 */

/** Text colour for a rank when the button has no fill (`simple`, `link`). */
const quietColor = (rank, color) => {
  if (color === "white") return colors.text.white;
  if (rank === "primary") return colors.brand.cyanInk;
  if (rank === "danger") return colors.status.danger;
  return colors.brand.ink;
};

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) =>
    ![
      "color",
      "round",
      "fullWidth",
      "simple",
      "block",
      "link",
      "justIcon",
      "muiClasses",
    ].includes(prop),
})(({ color, round, fullWidth, simple, block, link, justIcon, size }) => {
  const rank = legacyButtonRank(color);
  const quiet = simple || link;

  const base = {
    ...gridToolbarButtonSx[rank],
    height: "auto",
    minWidth: "auto",
    position: "relative",
    margin: ".3125rem 1px",
    lineHeight: 1.43,
    letterSpacing: 0,
    textAlign: "center",
    verticalAlign: "middle",
    touchAction: "manipulation",
    cursor: "pointer",
    transition: `background-color ${motion.fast}, border-color ${motion.fast}, color ${motion.fast}`,
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      position: "relative",
      display: "inline-block",
      top: "0",
      marginTop: "-1em",
      marginBottom: "-1em",
      fontSize: "1.1rem",
      marginRight: "4px",
      verticalAlign: "middle",
    },
    "& svg": {
      position: "relative",
      display: "inline-block",
      top: "0",
      width: "18px",
      height: "18px",
      marginRight: "4px",
      verticalAlign: "middle",
    },
    "& .MuiButton-startIcon svg, & .MuiButton-endIcon svg": {
      width: "16px",
      height: "16px",
      marginRight: 0,
    },
  };

  const chrome =
    color === "transparent"
      ? {
          color: "inherit",
          backgroundColor: "transparent",
          border: "1px solid transparent",
          "&:hover": {
            backgroundColor: colors.brand.tint,
            borderColor: "transparent",
            boxShadow: "none",
          },
        }
      : {};

  const quietStyles = quiet
    ? {
        color: quietColor(rank, color),
        backgroundColor: "transparent",
        border: "1px solid transparent",
        "&:hover": {
          boxShadow: "none",
          borderColor: "transparent",
          backgroundColor:
            color === "white" ? "rgba(255, 255, 255, 0.14)" : colors.brand.tint,
        },
      }
    : {};

  return {
    ...base,
    ...chrome,
    ...quietStyles,
    ...(fullWidth && { width: "100%" }),
    ...(justIcon && {
      // `!important` because theme.js forces `padding: 4.5px 10px !important`
      // on every MUI button: inside a 41px square that leaves a 22px glyph
      // 19px of room, and it spilled off-centre to the right.
      padding: "0 !important",
      fontSize: "20px",
      height: "41px",
      minWidth: "41px",
      width: "41px",
      "& .fab,& .fas,& .far,& .fal,& svg,& .material-icons": {
        marginRight: "0px",
      },
      ...(size === "lg" && {
        height: "57px",
        minWidth: "57px",
        width: "57px",
        lineHeight: "56px",
        "& .fab,& .fas,& .far,& .fal,& .material-icons": {
          fontSize: "32px",
          lineHeight: "56px",
        },
        "& svg": { width: "32px", height: "32px" },
      }),
      ...(size === "sm" && {
        height: "30px",
        minWidth: "30px",
        width: "30px",
        "& .fab,& .fas,& .far,& .fal,& .material-icons": {
          fontSize: "17px",
          lineHeight: "29px",
        },
        "& svg": { width: "17px", height: "17px" },
      }),
    }),
    ...(round && { borderRadius: radius.pill }),
    ...(block && { width: "100% !important" }),
  };
});

const RegularButton = forwardRef((props, ref) => {
  const {
    color,
    round,
    children,
    fullWidth,
    disabled,
    simple,
    size,
    block,
    link,
    justIcon,
    className,
    muiClasses,
    ...rest
  } = props;

  return (
    <StyledButton
      {...rest}
      ref={ref}
      classes={muiClasses}
      className={className}
      color={color}
      round={round}
      fullWidth={fullWidth}
      disabled={disabled}
      simple={simple}
      size={size}
      block={block}
      link={link}
      justIcon={justIcon}
    >
      {children}
    </StyledButton>
  );
});

RegularButton.propTypes = {
  // The template's names are kept so call sites still type-check; each one maps
  // to a rank, see legacyButtonRank.
  color: PropTypes.oneOf([
    "primary",
    "info",
    "success",
    "warning",
    "danger",
    "rose",
    "white",
    "twitter",
    "facebook",
    "google",
    "linkedin",
    "pinterest",
    "youtube",
    "tumblr",
    "github",
    "behance",
    "dribbble",
    "reddit",
    "transparent",
  ]),
  size: PropTypes.oneOf(["sm", "lg"]),
  simple: PropTypes.bool,
  round: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  link: PropTypes.bool,
  justIcon: PropTypes.bool,
  className: PropTypes.string,
  muiClasses: PropTypes.object,
  children: PropTypes.node,
};

export default RegularButton;
