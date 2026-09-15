import {
  defaultFont,
  dangerColor,
  whiteColor,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

import customDropdownStyle from "assets/jss/material-dashboard-pro-react/components/customDropdownStyle.js";
import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";

const adminNavbarLinksStyle = (theme) => ({
  ...customDropdownStyle(theme),
  search: {
    margin: "0",
    paddingTop: "7px",
    paddingBottom: "7px",
    [theme.breakpoints.down("sm")]: {
      margin: "10px 15px",
      float: "none !important",
      paddingTop: "1px",
      paddingBottom: "1px",
      padding: "10px 15px",
      width: "auto",
    },
  },
  searchInput: { paddingTop: "2px" },
  searchRTL: {
    [theme.breakpoints.down("sm")]: { marginRight: "18px !important" },
    [theme.breakpoints.up("md")]: { marginLeft: "12px" },
  },
  linkText: {
    zIndex: "4",
    ...defaultFont,
    fontSize: "14px",
    margin: "0!important",
    textTransform: "none",
  },

  buttonIconLink: {
    padding: "12px 8px",
    borderRadius: "50%",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      margin: "5px 15px 0",
      width: "auto",
      height: "auto",
      "& svg": {
        width: "30px",
        height: "24px",
        marginRight: "19px",
        marginLeft: "3px",
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        width: "30px",
        fontSize: "24px",
        lineHeight: "30px",
        marginRight: "19px",
        marginLeft: "3px",
      },
    },
    "&:hover": { color: "inherit", backgroundColor: grayColor[11] },
  },
  buttonLink: {
    padding: "12px 8px 12px 18px",
    borderRadius: "24px",
    alignItems: "center",
    gap: "8px",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      margin: "5px 15px 0",
      width: "auto",
      height: "auto",
      "& svg": {
        width: "30px",
        height: "24px",
        marginRight: "19px",
        marginLeft: "3px",
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        width: "30px",
        fontSize: "24px",
        lineHeight: "30px",
        marginRight: "19px",
        marginLeft: "3px",
      },
    },
    "&:hover": { color: "inherit", backgroundColor: grayColor[13] },
  },
  userName: {
    ...defaultFont,
    fontSize: "13px",
    fontWeight: "600",
    color: colors.brand.ink,
    lineHeight: "18px",
    maxWidth: "160px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdown: {
    ...(customDropdownStyle(theme)?.dropdown || {}),
    // Every top-bar dropdown (profile, overflow, notifications, open tabs, the
    // patient menu) renders on this. Brand surface, radius and navy shadow; it
    // was a neutral-black 12px card with #111827 text and #1976d2 hovers.
    borderRadius: radius.md,
    minWidth: "220px",
    padding: "6px",
    backgroundColor: colors.brand.surface,
    boxShadow: elevation[3],
    border: `1px solid ${colors.brand.hairline}`,
  },
  dropdownItem: {
    ...(customDropdownStyle(theme)?.dropdownItem || {}),
    borderRadius: radius.sm,
    padding: "10px 12px",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: colors.brand.ink,
    "&:hover": {
      backgroundColor: colors.brand.tint,
      color: colors.brand.ink,
      boxShadow: "none",
    },
  },
  dropdownItemIcon: {
    width: "18px",
    height: "18px",
    color: colors.brand.inkDim,
    flex: "0 0 auto",
  },
  dropdownItemText: {
    ...defaultFont,
    fontSize: "14px",
    color: "inherit",
    flex: "1 1 auto",
    minWidth: "0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lightBlueHover: {
    "&:hover": {
      backgroundColor: colors.brand.tint,
      color: colors.brand.cyanInk,
      "& svg": {
        color: colors.brand.cyanInk,
      },
    },
  },
  dropdownItemDanger: {
    color: colors.status.dangerInk,
    fontWeight: "600",
    "& svg": {
      color: colors.status.danger,
    },
    "&:hover": {
      backgroundColor: colors.status.dangerTint,
      color: colors.status.dangerInk,
    },
  },
  searchButton: {
    [theme.breakpoints.down("sm")]: {
      top: "-50px !important",
      marginRight: "38px",
      float: "right",
    },
  },
  top: { zIndex: "4" },
  searchIcon: { width: "17px", zIndex: "4" },
  links: {
    width: "20px",
    height: "20px",
    zIndex: "4",
    [theme.breakpoints.down("sm")]: {
      display: "block",
      width: "30px",
      height: "30px",
      color: "inherit",
      opacity: "0.8",
      marginRight: "16px",
      marginLeft: "-5px",
    },
  },
  notifications: {
    zIndex: "4",
    [theme.breakpoints.up("md")]: {
      position: "absolute",
      top: "5px",
      border: "1px solid " + whiteColor,
      right: "5px",
      fontSize: "9px",
      background: dangerColor[0],
      color: whiteColor,
      minWidth: "16px",
      height: "16px",
      borderRadius: "10px",
      textAlign: "center",
      lineHeight: "14px",
      verticalAlign: "middle",
      display: "block",
    },
    [theme.breakpoints.down("sm")]: {
      ...defaultFont,
      fontSize: "14px",
      marginRight: "8px",
    },
  },
  wrapperRTL: { [theme.breakpoints.up("md")]: { paddingLeft: "16px" } },
  buttonLinkRTL: {
    [theme.breakpoints.down("sm")]: {
      alignItems: "center",
      justifyContent: "flex-end",
      width: "-webkit-fill-available",
      margin: "10px 15px 0",
      padding: "10px 15px",
      display: "block",
      position: "relative",
    },
  },
  labelRTL: {
    [theme.breakpoints.down("sm")]: {
      flexDirection: "row-reverse",
      justifyContent: "initial",
      display: "flex",
    },
  },
  linksRTL: {
    [theme.breakpoints.down("sm")]: {
      marginRight: "-5px !important",
      marginLeft: "16px !important",
    },
  },
  managerClasses: {
    [theme.breakpoints.up("md")]: {
      display: "inline-block",
      marginLeft: "10px",
    },
  },
  headerLinksSvg: {
    color: "#333 !important",
    marginLeft: "5px !important",
    marginBottom: "3px !important",
    width: "20px !important",
    height: "20px !important",
  },
  headerIconLinksSvg: {
    marginTop: "-2px !important",
    marginRight: "5px !important",
    width: "20px !important",
    height: "20px !important",
  },
  headerHelpLinksSvg: {
    // marginTop: "-2px !important",// marginLeft: "2px !important",// marginRight: "2px !important",width: "28px !important",height: "28px !important",
  },
});

// Uses the real theme rather than a local copy of the breakpoint table. This
// was the SECOND hand-rolled copy in the codebase (the other was in
// sidebarStyle.js); both agreed with `theme.js` by coincidence and neither was
// linked to it, so editing the breakpoints in one place silently left the
// sidebar and the navbar disagreeing with the app.
import appTheme from "@/theme.js";

export const adminNavbarLinksSx = (() => {
  const sx = adminNavbarLinksStyle(appTheme);

  // JSS-only selector; there is no generated "$caret" class in sx usage.
  if (sx?.target?.["& $caret"]) {
    const { ["& $caret"]: _, ...rest } = sx.target;
    sx.target = rest;
  }

  return sx;
})();

export default adminNavbarLinksStyle;
