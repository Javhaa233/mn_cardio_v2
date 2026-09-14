import i18n from "i18n";
import {
  drawerWidth,
  drawerMiniWidth,
  transition,
  boxShadow,
  defaultFont,
  primaryColor,
  primaryBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  roseColor,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";
import { colors } from "@/theme/colors";

const sidebarStyle = (theme) => ({
  drawerPaper: {
    border: "none",
    position: "fixed",
    top: "0",
    bottom: "0",
    left: "0",
    zIndex: "1032",
    transitionProperty: "top, bottom, width",
    transitionDuration: ".2s, .2s, .35s",
    transitionTimingFunction: "linear, linear, ease",
    // overflow: "auto",
    backgroundImage:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.04) 100%)",
    borderRight: "1px solid rgba(255, 255, 255, 0.14)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    width: drawerWidth,
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      position: "fixed",
      height: "100vh",
      minHeight: "100vh",
    },
    // The `down("sm")` block that used to live here has been REMOVED, and the
    // removal is the point.
    //
    // It set `right: 0; left: auto` plus `transform: translate3d(260px,0,0)` -
    // a hand-rolled off-canvas slide from the Creative Tim template, written
    // before this was a real MUI `<Drawer variant="temporary">`. MUI already
    // positions and animates the temporary drawer (its own Slide sets a
    // transform on the same element), so the two fought each other.
    //
    // Worse, it left a GAP. Styles existed for `up("md")` and `down("sm")` and
    // for nothing in between, so across the whole 600-959px band - tablet
    // portrait, the app's primary target - a right-anchored drawer kept the
    // base `left: 0` above and opened against the wrong edge.
    //
    // The temporary drawer's geometry now lives in Sidebar.jsx as its own
    // paper style, separate from the permanent one, instead of both sharing
    // this object and disagreeing about which breakpoints apply.
    "&:before,&:after": {
      position: "absolute",
      zIndex: "3",
      width: "100%",
      height: "100%",
      content: '""',
      display: "block",
      top: "0",
    },
  },
  blueBackground: {
    color: whiteColor,
    "&:after": {
      // The same indigo -> cyan the app has always had, now expressed as the
      // brand token rather than a literal, so the sidebar and the page palette
      // move together. colors.brand.gradient is this exact ramp.
      background: colors.brand.gradient.replace("135deg", "180deg"),
      opacity: "1",
    },
  },
  whiteAfter: {
    "&:after": { backgroundColor: "hsla(0,0%,71%,.3) !important" },
  },
  drawerPaperMini: { width: drawerMiniWidth + "px!important" },
  logo: {
    // The header centres it now; 10px of padding on top of the 40px line box
    // would overflow the 48px header.
    padding: "0",
    margin: "0",
    display: "block",
    position: "relative",
    zIndex: "4",
  },
  logoMini: {
    transition: "all 300ms linear",
    opacity: 1,
    transform: "translate3d(0px, 0, 0)",
    float: "left",
    textAlign: "center",
    width: "30px",
    display: "inline-block",
    maxHeight: "30px",
    marginLeft: "0",
    marginRight: "18px",
    marginTop: "7px",
    color: "inherit",
  },
  logoNormal: {
    ...defaultFont,
    transition: "all 300ms linear",
    display: "block",
    opacity: "1",
    transform: "translate3d(0px, 0, 0)",
    textTransform: "uppercase",
    padding: "5px 0px",
    marginLeft: "30px",
    fontSize: "18px",
    whiteSpace: "nowrap",
    fontWeight: "400",
    lineHeight: "30px",
    overflow: "hidden",
    "&,&:hover,&:focus": { color: "inherit" },
  },
  logoNormalSidebarMini: {
    opacity: "0",
    transform: "translate3d(-25px, 0, 0)",
  },
  img: { width: "35px", verticalAlign: "middle", border: "0" },
  background: {
    position: "absolute",
    zIndex: "1",
    height: "100%",
    width: "100%",
    display: "block",
    top: "0",
    left: "0",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    transition: "all 300ms linear",
  },
  list: {
    marginTop: "10px",
    paddingLeft: "0",
    paddingTop: "0",
    paddingBottom: "0",
    marginBottom: "0",
    listStyle: "none",
    color: "inherit",
    "&:before,&:after": { display: "table", content: '" "' },
    "&:after": { clear: "both" },
  },
  item: {
    color: "inherit",
    position: "relative",
    display: "block",
    textDecoration: "none",
    margin: "0",
    padding: "0px",
  },
  userItem: { "&:last-child": { paddingBottom: "0px" } },
  itemLink: {
    transition: "all 120ms ease",
    margin: "4px 12px 0",
    borderRadius: "10px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "7px 10px",
    backgroundColor: "transparent",
    ...defaultFont,
    width: "auto",
    "&": { color: "inherit" },
    "&:hover": {
      color: "inherit",
      outline: "none",
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    "&:focus": {
      outline: "none",
      backgroundColor: "transparent",
    },
    "&:focus-visible": {
      outline: "none",
      backgroundColor: "transparent",
    },
  },
  itemIcon: {
    color: "rgba(255, 255, 255, 0.78)",
    width: "26px",
    height: "18px",
    flex: "0 0 26px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    verticalAlign: "middle",
    opacity: "1",
    "& svg": {
      fontSize: "18px",
      width: "18px",
      height: "18px",
    },
  },
  itemText: {
    color: "rgba(255, 255, 255, 0.92)",
    ...defaultFont,
    margin: "0",
    // 14px/500, matching collapseItemText below and the app's body2. These two
    // used to disagree - 13px/500 here against 14px/300 nested - so sibling
    // rows in one menu tree were set at different sizes AND different weights.
    // defaultFont is spread above and carries fontWeight 300, which is why the
    // weight has to be restated after it.
    lineHeight: "20px",
    fontSize: "14px",
    fontWeight: 500,
    transform: "translate3d(0px, 0, 0)",
    opacity: "1",
    transition: "transform 300ms ease 0s, opacity 300ms ease 0s",
    position: "relative",
    display: "block",
    height: "auto",
    // Clinical menu names are long; clipping them mid-word made entries
    // like "Zurh sudasny hem sudlalyn maygtuud" unreadable. Wrap instead.
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    padding: "0 !important",
  },
  userItemText: { lineHeight: "22px" },
  itemTextMini: {
    transform: "translate3d(-25px, 0, 0)",
    opacity: "0",
    // display:none matters, it is not belt-and-braces. With only opacity:0 the
    // label still occupies its full width inside the flex row, so in the 80px
    // mini rail it pushed the icon out past the drawer's overflowX:hidden edge
    // and the icons rendered half-cut. collapseItemTextMini below always had
    // this; the top-level variant did not, so the two disagreed.
    display: "none",
  },

  // The mini rail is an icon column, so the row centres its icon and drops the
  // label gap and the wide side margins that only make sense next to text.
  itemLinkMini: {
    justifyContent: "center",
    gap: "0",
    margin: "2px 8px 0",
    padding: "8px 0",
  },
  collapseList: {
    marginTop: "0",
    // Indent nested entries with padding, not translateX. A transform shifts
    // the children right without narrowing them, so their right edge landed
    // 17px outside the 260px drawer and long form names were clipped mid-word.
    paddingLeft: "15px",
    "& $caret": { marginTop: "8px" },
  },
  collapseItem: {
    position: "relative",
    display: "block",
    textDecoration: "none",
    margin: "10px 0 0 0",
    padding: "0",
  },
  collapseActive: {
    outline: "none",
    backgroundColor: "rgba(" + hexToRgb(grayColor[17]) + ", 0.2)",
    boxShadow: "none",
  },
  collapseItemLink: {
    transition: "all 300ms linear",
    margin: "0 15px 0 50px", // зүүн талаас 30px болголоо
    borderRadius: "3px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "7px 10px", // дотогш зай
    backgroundColor: "transparent",
    ...defaultFont,
    width: "auto",
    "&:hover": {
      outline: "none",
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    "&:focus": {
      outline: "none",
      backgroundColor: "transparent",
    },
    "&:focus-visible": {
      outline: "none",
      backgroundColor: "transparent",
    },
    "&,&:hover,&:focus": { color: "inherit" },
  },
  collapseItemMini: {
    color: "inherit",
    ...defaultFont,
    textTransform: "uppercase",
    width: "30px",
    marginRight: "15px",
    textAlign: "center",
    letterSpacing: "1px",
    position: "relative",
    float: "left",
    display: "inherit",
    transition: "transform 300ms ease 0s, opacity 300ms ease 0s",
    fontSize: "14px",
  },
  collapseItemText: {
    color: "inherit",
    ...defaultFont,
    margin: "0",
    position: "relative",
    transform: "translateX(0px)",
    opacity: "1",
    // same reason as itemText: nested form names are the longest of all
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    display: "block",
    transition: "transform 300ms ease 0s, opacity 300ms ease 0s",
    fontSize: "14px",
    lineHeight: "20px",
    // Nested entries sit one step lighter than their parent - the size now
    // matches, so weight alone carries the hierarchy. 400 rather than the 300
    // defaultFont brings, which reads as washed out on the gradient.
    fontWeight: 400,
    padding: "8px 0",
  },
  collapseItemTextMini: {
    transform: "translate3d(-25px, 0, 0)",
    opacity: "0",
    display: "none",
  },
  caret: {
    marginTop: "0",
    position: "relative",
    right: "auto",
    marginLeft: "12px",
    alignSelf: "center",
    transition: "all 150ms ease-in",
    display: "inline-block",
    width: "0",
    height: "0",
    verticalAlign: "middle",
    borderTop: "6px solid",
    borderRight: "6px solid transparent",
    borderLeft: "6px solid transparent",
  },
  userCaret: { marginTop: "10px" },
  caretActive: { transform: "rotate(180deg)" },
  purple: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: primaryColor[0],
      ...primaryBoxShadow,
    },
  },
  blue: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: infoColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(infoColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(infoColor[0]) +
        ",.2)",
    },
  },
  green: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: successColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(successColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(successColor[0]) +
        ",.2)",
    },
  },
  orange: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: warningColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.2)",
    },
  },
  red: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: dangerColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.2)",
    },
  },
  // The active menu entry. This is the only `color` variant Sidebar.jsx uses;
  // the purple/blue/green/orange/red/rose blocks below it are unreachable.
  white: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: "rgba(255, 255, 255, 0.16)",
      backgroundImage:
        "linear-gradient(90deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      // A cyan edge on the leading side, matching the feed card's status
      // stripe. Selection is then carried by an accent rather than by
      // brightness alone, which is easier to find at a glance down a long menu.
      borderLeft: "3px solid " + colors.brand.cyan,
      boxShadow: "none",
    },
  },
  rose: {
    "&,&:hover,&:focus": {
      color: whiteColor,
      backgroundColor: roseColor[0],
      boxShadow:
        "0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.14), 0 7px 10px -5px rgba(" +
        hexToRgb(roseColor[0]) +
        ",.4)",
    },
  },
  sidebarWrapper: {
    position: "relative",
    height: "calc(100vh - 75px)",
    overflow: "auto",
    overflowX: "hidden",
    width: "260px",
    zIndex: "4",
    overflowScrolling: "touch",
    transitionProperty: "top, bottom, width",
    transitionDuration: ".2s, .2s, .35s",
    transitionTimingFunction: "linear, linear, ease",
    color: "inherit",
    paddingBottom: "30px",
  },
  sidebarWrapperWithPerfectScrollbar: { overflow: "hidden !important" },
  user: {
    paddingBottom: "20px",
    margin: "20px auto 0",
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: "0",
      right: "15px",
      height: "1px",
      width: "calc(100% - 30px)",
      backgroundColor: "hsla(0,0%,100%,.3)",
    },
  },
  photo: {
    transition: "all 300ms linear",
    width: "34px",
    height: "34px",
    overflow: "hidden",
    float: "left",
    zIndex: "5",
    marginRight: "11px",
    borderRadius: "50%",
    marginLeft: "23px",
    ...boxShadow,
  },
  avatarImg: { width: "100%", verticalAlign: "middle", border: "0" },
  userCollapseButton: {
    margin: "0",
    padding: "6px 15px",
    "&:hover": { background: "none" },
  },
  userCollapseLinks: {
    marginTop: "-4px",
    "&:hover,&:focus": { color: whiteColor },
  },
  sidebarHeader: {
    margin: "0",
    position: "relative",
    display: "flex",
    alignItems: "center",
    zIndex: "4",
    // Same height as the admin top bar, so the two bottom rules line up.
    height: layout.topBarHeight + "px",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: "0",
      height: "1px",
      right: "15px",
      width: "calc(100% - 30px)",
      backgroundColor: "rgba(255,255,255,0.14)",
    },
  },
  sidebarMinimize: {
    position: "absolute",
    right: "5px",
    bottom: 0,
    top: 0,
    display: "flex",
    alignItems: "center",
    padding: "0 15px 0 15px",
    marginTop: "0",
    color: grayColor[6],
  },
});

// This module is consumed as a plain `sx` object rather than through a theme
// provider, so it needs a theme at module scope. It used to hand-roll one from
// a LOCAL COPY of the breakpoint table - a second, unlinked source of truth
// that happened to agree with `theme.js` and was free to drift from it the
// moment either was edited. It now uses the real theme, so there is one table.
//
// No import cycle: `theme.js` pulls in `theme/colors` only, never this file.
import appTheme from "@/theme.js";
import { layout } from "@/theme/tokens";

export const sidebarSx = (() => {
  const sx = sidebarStyle(appTheme);

  // JSS-only selector; there is no generated "$caret" class in sx usage.
  if (sx?.collapseList?.["& $caret"]) {
    const { ["& $caret"]: __, ...rest } = sx.collapseList;
    sx.collapseList = rest;
  }

  return sx;
})();

export default sidebarStyle;
