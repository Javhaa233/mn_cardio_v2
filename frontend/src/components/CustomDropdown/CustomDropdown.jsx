import React, { useState } from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// @mui/material components
import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import Divider from "@mui/material/Divider";
import Popper from "@mui/material/Popper";
// core components
import Button from "components/CustomButtons/Button";

import {
  defaultFont,
  primaryColor,
  primaryBoxShadow,
  infoColor,
  infoBoxShadow,
  successColor,
  successBoxShadow,
  warningColor,
  warningBoxShadow,
  dangerColor,
  dangerBoxShadow,
  roseColor,
  roseBoxShadow,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

// Styled components
const DropdownWrapper = styled("div", {
  shouldForwardProp: (prop) => !["innerDropDown"].includes(prop),
})(({ innerDropDown }) => ({
  ...(innerDropDown
    ? {
        "& > div > button,& > div > a": {
          margin: "0px !important",
          color: "inherit !important",
          padding: "10px 20px !important",
          "& > span:first-of-type": {
            width: "100%",
            justifyContent: "flex-start",
          },
        },
      }
    : {
        "& > div > button:first-of-type > span:first-of-type, & > div > a:first-of-type > span:first-of-type":
          {
            width: "100%",
          },
      }),
}));

const ButtonTarget = styled("div")({
  "& > button:first-of-type > span:first-of-type, & > a:first-of-type > span:first-of-type":
    {
      display: "inline-block",
    },
  "& .caret": { marginLeft: "0px" },
});

const StyledMenuList = styled(MenuList)({
  padding: "0",
});

const StyledPaper = styled(Paper)({
  borderRadius: "0",
  border: "0",
  boxShadow: "0 2px 5px 0 rgba(" + hexToRgb(blackColor) + ", 0.26)",
  top: "100%",
  zIndex: "1000",
  minWidth: "260px",
  maxWidth: "360px",
  fontSize: "14px",
  textAlign: "left",
  listStyle: "none",
  backgroundColor: whiteColor,
  backgroundClip: "padding-box",
});

const StyledPopper = styled(Popper, {
  shouldForwardProp: (prop) => !["isOpen", "navDropdown"].includes(prop),
})(({ theme, isOpen, navDropdown }) => ({
  zIndex: "1200",
  ...(isOpen &&
    navDropdown && {
      borderRadius: "0",
      [theme.breakpoints.down("sm")]: {
        position: "static !important",
        left: "unset !important",
        top: "unset !important",
        transform: "none !important",
        willChange: "unset !important",
        "& > div": {
          boxShadow: "none !important",
          marginLeft: "0rem",
          marginRight: "0rem",
          transition: "none !important",
          marginTop: "0px !important",
          marginBottom: "0px !important",
          padding: "0px !important",
          backgroundColor: "transparent !important",
          "& ul li": {
            color: whiteColor + " !important",
            "&:hover": {
              backgroundColor: "hsla(0,0%,78%,.2)",
              boxShadow: "none",
            },
          },
        },
      },
    }),
  ...(!isOpen && {
    pointerEvents: "none",
    display: "none !important",
  }),
  [theme.breakpoints.down("sm")]: {
    zIndex: "1640",
    position: "static",
    float: "none",
    width: "auto",
    marginTop: "0",
    backgroundColor: "transparent",
    border: "0",
    boxShadow: "none",
    color: "black",
  },
}));

const StyledDivider = styled(Divider)({
  margin: "5px 0",
  backgroundColor: "rgba(" + hexToRgb(blackColor) + ", 0.12)",
  height: "1px",
  overflow: "hidden",
});

const Caret = styled("b", {
  shouldForwardProp: (prop) => !["dropup", "isActive"].includes(prop),
})(({ dropup, isActive }) => ({
  transition: "all 150ms ease-in",
  display: "inline-block",
  width: "0",
  height: "0",
  marginLeft: "4px",
  verticalAlign: "middle",
  borderTop: "4px solid",
  borderRight: "4px solid transparent",
  borderLeft: "4px solid transparent",
  ...((isActive || dropup) && {
    transform: "rotate(180deg)",
  }),
}));

const ButtonIcon = styled("div")({
  width: "20px",
  height: "20px",
});

function CustomDropdown(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    buttonText,
    buttonIcon,
    dropdownList,
    buttonProps,
    dropup,
    dropdownHeader,
    caret,
    hoverColor,
    dropPlacement,
    noLiPadding,
    innerDropDown,
    navDropdown,
    onClick,
  } = props;

  const handleClick = (event) => {
    if (anchorEl && anchorEl.contains(event.target)) setAnchorEl(null);
    else setAnchorEl(event.currentTarget);
  };
  const handleClose = (event) => {
    if (anchorEl.contains(event.target)) return;
    setAnchorEl(null);
  };
  const handleCloseMenu = (param) => {
    setAnchorEl(null);
    onClick && onClick(param);
  };

  // Hover color styles mapping
  const hoverStyles = {
    dark: {
      "&:hover": {
        boxShadow:
          "0 4px 20px 0px rgba(" +
          hexToRgb(blackColor) +
          ", 0.14), 0 7px 10px -5px rgba(" +
          hexToRgb(grayColor[16]) +
          ", 0.4)",
        backgroundColor: grayColor[16],
        color: whiteColor,
      },
    },
    primary: {
      "&:hover": {
        backgroundColor: primaryColor[0],
        color: whiteColor,
        ...primaryBoxShadow,
      },
    },
    info: {
      "&:hover": {
        backgroundColor: infoColor[0],
        color: whiteColor,
        ...infoBoxShadow,
      },
    },
    success: {
      "&:hover": {
        backgroundColor: successColor[0],
        color: whiteColor,
        ...successBoxShadow,
      },
    },
    warning: {
      "&:hover": {
        backgroundColor: warningColor[0],
        color: whiteColor,
        ...warningBoxShadow,
      },
    },
    danger: {
      "&:hover": {
        backgroundColor: dangerColor[0],
        color: whiteColor,
        ...dangerBoxShadow,
      },
    },
    rose: {
      "&:hover": {
        backgroundColor: roseColor[0],
        color: whiteColor,
        ...roseBoxShadow,
      },
    },
  };

  const dropdownItemStyle = {
    ...defaultFont,
    fontSize: "15px",
    margin: "0",
    position: "relative",
    transition: "all 150ms linear",
    display: "block",
    clear: "both",
    fontWeight: "400",
    height: "100%",
    color: grayColor[7],
    minHeight: "unset",
    ...(hoverColor && hoverStyles[hoverColor]),
    ...(noLiPadding && { padding: "0" }),
  };

  const dropdownHeaderStyle = {
    display: "block",
    padding: "0.1875rem 1.25rem",
    fontSize: "0.75rem",
    lineHeight: "1.428571",
    color: grayColor[1],
    fontWeight: "inherit",
    marginTop: "10px",
    minHeight: "unset",
    "&:hover,&:focus": { backgroundColor: "transparent", cursor: "auto" },
  };

  const dropDownMenu = (
    <StyledMenuList role="menu">
      {dropdownHeader ? (
        <MenuItem
          onClick={() => handleCloseMenu(dropdownHeader)}
          sx={dropdownHeaderStyle}
        >
          {dropdownHeader}
        </MenuItem>
      ) : null}
      {Array.isArray(dropdownList) &&
        dropdownList.map((prop, key) => {
          if (prop.divider) {
            return (
              <StyledDivider
                key={key}
                onClick={() => handleCloseMenu("divider")}
              />
            );
          } else if (prop.props && prop.props["data-ref"] === "multi") {
            return (
              <MenuItem
                key={key}
                sx={{
                  ...dropdownItemStyle,
                  overflow: "visible",
                  padding: 0,
                }}
              >
                {prop}
              </MenuItem>
            );
          }
          return (
            <MenuItem
              key={key}
              onClick={() => handleCloseMenu(prop)}
              sx={dropdownItemStyle}
            >
              {prop}
            </MenuItem>
          );
        })}
    </StyledMenuList>
  );

  return (
    <DropdownWrapper innerDropDown={innerDropDown}>
      {buttonText ? (
        <div>
          <Button
            aria-label="Notifications"
            aria-owns={anchorEl ? "menu-list" : null}
            aria-haspopup="true"
            {...buttonProps}
            onClick={handleClick}
          >
            {buttonIcon ? <ButtonIcon as={buttonIcon} /> : null}
            {buttonText}
            {caret ? (
              <Caret
                dropup={dropup && !anchorEl}
                isActive={Boolean(anchorEl) && !dropup}
                className="caret"
              />
            ) : null}
          </Button>
        </div>
      ) : (
        <ButtonTarget>
          <Button
            aria-label="Notifications"
            aria-owns={anchorEl ? "menu-list" : null}
            aria-haspopup="true"
            {...buttonProps}
            onClick={handleClick}
          >
            {buttonIcon ? <ButtonIcon as={buttonIcon} /> : null}
            {caret ? (
              <Caret
                dropup={dropup && !anchorEl}
                isActive={Boolean(anchorEl) && !dropup}
                className="caret"
              />
            ) : null}
          </Button>
        </ButtonTarget>
      )}
      <StyledPopper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        transition
        disablePortal
        placement={dropPlacement}
        isOpen={Boolean(anchorEl)}
        navDropdown={navDropdown}
      >
        {() => (
          <Grow
            in={Boolean(anchorEl)}
            id="menu-list"
            style={
              dropup
                ? { transformOrigin: "0 100% 0" }
                : { transformOrigin: "0 0 0" }
            }
          >
            <StyledPaper>
              {innerDropDown ? (
                dropDownMenu
              ) : (
                <ClickAwayListener onClickAway={handleClose}>
                  {dropDownMenu}
                </ClickAwayListener>
              )}
            </StyledPaper>
          </Grow>
        )}
      </StyledPopper>
    </DropdownWrapper>
  );
}

CustomDropdown.defaultProps = {
  caret: true,
  dropup: false,
  hoverColor: "primary",
};

CustomDropdown.propTypes = {
  hoverColor: PropTypes.oneOf([
    "dark",
    "primary",
    "info",
    "success",
    "warning",
    "danger",
    "rose",
  ]),
  buttonText: PropTypes.node,
  buttonIcon: PropTypes.object,
  dropdownList: PropTypes.array,
  buttonProps: PropTypes.object,
  dropup: PropTypes.bool,
  dropdownHeader: PropTypes.node,
  caret: PropTypes.bool,
  dropPlacement: PropTypes.oneOf([
    "bottom",
    "top",
    "right",
    "left",
    "bottom-start",
    "bottom-end",
    "top-start",
    "top-end",
    "right-start",
    "right-end",
    "left-start",
    "left-end",
  ]),
  noLiPadding: PropTypes.bool,
  innerDropDown: PropTypes.bool,
  navDropdown: PropTypes.bool,
  // This is a function that returns the clicked menu item
  onClick: PropTypes.func,
};
