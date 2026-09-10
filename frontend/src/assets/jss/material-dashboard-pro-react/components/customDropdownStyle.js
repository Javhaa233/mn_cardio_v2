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

const customDropdownStyle = (theme) => ({
  popperClose: { pointerEvents: "none", display: "none !important" },
  popperNav: {
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
  },
  manager: {
    "& > div > button:first-of-type > span:first-of-type, & > div > a:first-of-type > span:first-of-type":
      {
        width: "100%",
      },
  },
  innerManager: {
    "& > div > button,& > div > a": {
      margin: "0px !important",
      color: "inherit !important",
      padding: "10px 20px !important",
      "& > span:first-of-type": { width: "100%", justifyContent: "flex-start" },
    },
  },
  target: {
    "& > button:first-of-type > span:first-of-type, & > a:first-of-type > span:first-of-type":
      {
        display: "inline-block",
      },
    "& $caret": { marginLeft: "0px" },
  },
  dropdown: {
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
  },
  menuList: { padding: "0" },
  popperResponsive: {
    zIndex: "1200",
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
  },
  listItem: {
    display: "block",
    cursor: "pointer",
    padding: "4px",
    color: grayColor[7],
    "&:hover": { backgroundColor: "#f0f0f0" },
  },
  dropdownItem: {
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
  },
  darkHover: {
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
  primaryHover: {
    "&:hover": {
      backgroundColor: primaryColor[0],
      color: whiteColor,
      ...primaryBoxShadow,
    },
  },
  infoHover: {
    "&:hover": {
      backgroundColor: infoColor[0],
      color: whiteColor,
      ...infoBoxShadow,
    },
  },
  successHover: {
    "&:hover": {
      backgroundColor: successColor[0],
      color: whiteColor,
      ...successBoxShadow,
    },
  },
  warningHover: {
    "&:hover": {
      backgroundColor: warningColor[0],
      color: whiteColor,
      ...warningBoxShadow,
    },
  },
  dangerHover: {
    "&:hover": {
      backgroundColor: dangerColor[0],
      color: whiteColor,
      ...dangerBoxShadow,
    },
  },
  roseHover: {
    "&:hover": {
      backgroundColor: roseColor[0],
      color: whiteColor,
      ...roseBoxShadow,
    },
  },
  dropdownItemRTL: { textAlign: "right" },
  dropdownDividerItem: {
    margin: "5px 0",
    backgroundColor: "rgba(" + hexToRgb(blackColor) + ", 0.12)",
    height: "1px",
    overflow: "hidden",
  },
  buttonIcon: { width: "20px", height: "20px" },
  caret: {
    transition: "all 150ms ease-in",
    display: "inline-block",
    width: "0",
    height: "0",
    marginLeft: "4px",
    verticalAlign: "middle",
    borderTop: "4px solid",
    borderRight: "4px solid transparent",
    borderLeft: "4px solid transparent",
  },
  caretActive: { transform: "rotate(180deg)" },
  caretDropup: { transform: "rotate(180deg)" },
  caretRTL: { marginRight: "4px" },
  dropdownHeader: {
    display: "block",
    padding: "0.1875rem 1.25rem",
    fontSize: "0.75rem",
    lineHeight: "1.428571",
    color: grayColor[1],
    fontWeight: "inherit",
    marginTop: "10px",
    minHeight: "unset",
    "&:hover,&:focus": { backgroundColor: "transparent", cursor: "auto" },
  },
  noLiPadding: { padding: "0" },
});

export default customDropdownStyle;
