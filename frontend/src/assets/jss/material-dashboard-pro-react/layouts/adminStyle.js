import {
  drawerWidth,
  drawerMiniWidth,
  transition,
  containerFluid,
} from "assets/jss/material-dashboard-pro-react.js";

export const adminLayoutSx = {
  wrapper: {
    position: "relative",
    top: "0",
    height: "100vh",
    "&:after": { display: "table", clear: "both", content: '" "' },
  },
  mainPanel: {
    transitionProperty: "top, bottom, width",
    transitionDuration: ".2s, .2s, .35s",
    transitionTimingFunction: "linear, linear, ease",
    "@media (min-width: 960px)": { width: `calc(100% - ${drawerWidth}px)` },
    overflow: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch",
  },
  content: {
    marginTop: "70px",
    padding: "0",
    minHeight: "calc(100vh - 123px)",
  },
  container: { ...containerFluid, paddingLeft: "0", paddingRight: "0" },
  map: { marginTop: "70px" },
  mainPanelSidebarMini: {
    "@media (min-width: 960px)": {
      width: `calc(100% - ${drawerMiniWidth}px)`,
    },
  },
  mainPanelWithPerfectScrollbar: { overflow: "hidden !important" },
};

const appStyle = (theme) => ({
  ...adminLayoutSx,
  mainPanel: {
    ...adminLayoutSx.mainPanel,
    [theme.breakpoints.up("md")]: { width: `calc(100% - ${drawerWidth}px)` },
  },
  mainPanelSidebarMini: {
    ...adminLayoutSx.mainPanelSidebarMini,
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerMiniWidth}px)`,
    },
  },
});

export default appStyle;
