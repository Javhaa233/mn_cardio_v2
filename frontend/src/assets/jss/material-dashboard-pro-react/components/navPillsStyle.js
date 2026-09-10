import {
  roseColor,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const navPillsStyle = (theme) => ({
  root: {
    marginTop: "10px",
    paddingLeft: "0",
    marginBottom: "0",
    overflow: "visible !important",
  },
  flexContainer: {
    [theme.breakpoints.down("xs")]: { display: "flex", flexWrap: "wrap" },
  },
  displayNone: { display: "none !important" },
  fixed: { overflow: "visible !important" },
  horizontalDisplay: { display: "block" },
  pills: {
    float: "left",
    position: "relative",
    display: "block",
    padding: "8px 3px",
    color: grayColor[6],
    height: "auto",
    opacity: "1",
    margin: "0",
    fontSize: "11px",
    maxWidth: "100%",
    minWidth: "100px",
    minHeight: "10px",
    textAlign: "center",
    transition: "all .3s",
    fontWeight: "400",
    lineHeight: "24px",
    borderRadius: "0",
    textTransform: "uppercase",
    letterSpacing: "initial",
  },
  pillsWithIcons: { borderRadius: "4px" },
  tabIcon: {
    width: "30px",
    height: "30px",
    display: "block",
    margin: "15px 0 !important",
  },
  horizontalPills: {
    width: "100%",
    float: "none !important",
    "& + button": { margin: "3px 0" },
  },
  contentWrapper: { marginTop: "10px" },
  primary: {
    "&,&:hover": {
      color: whiteColor,
      backgroundColor: primaryColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(primaryColor[0]) +
        ", 0.4)",
    },
  },
  info: {
    "&,&:hover": {
      color: whiteColor,
      backgroundColor: infoColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(successColor[0]) +
        ", 0.4)",
    },
  },
  success: {
    "&,&:hover": {
      color: whiteColor,
      backgroundColor: successColor[0],
      boxShadow:
        "0 2px 2px 0 rgba(" +
        hexToRgb(successColor[0]) +
        ", 0.14), 0 3px 1px -2px rgba(" +
        hexToRgb(successColor[0]) +
        ", 0.2), 0 1px 5px 0 rgba(" +
        hexToRgb(successColor[0]) +
        ", 0.12)",
    },
  },
  warning: {
    "&,&:hover": {
      color: whiteColor,
      backgroundColor: warningColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ", 0.4)",
    },
  },
  danger: {
    "&,&:hover": {
      color: whiteColor,
      backgroundColor: dangerColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ", 0.4)",
    },
  },
  rose: {
    "&,&:hover": {
      color: whiteColor,
      backgroundColor: roseColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(roseColor[0]) +
        ", 0.4)",
    },
  },
  alignCenter: { alignItems: "center", justifyContent: "center" },
});

export default navPillsStyle;
