import { whiteColor } from "assets/jss/material-dashboard-pro-react.js";

const pagesStyle = (theme) => ({
  wrapper: {
    height: "auto",
    minHeight: "100vh",
    position: "relative",
    top: "0",
  },
  fullPage: {
    padding: "0",
    position: "relative",
    minHeight: "100vh",
    display: "flex!important",
    margin: "0",
    border: "0",
    color: whiteColor,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    overflow: "hidden",
    // Below `md`, let the page scroll rather than clip. The old rule here
    // restated `minHeight: 100vh`, which was already the value above it - a
    // no-op that looked like a mobile accommodation. See layouts/Auth.jsx.
    [theme.breakpoints.down("md")]: {
      overflow: "auto",
      alignItems: "flex-start",
      height: "auto",
    },
  },
});

export default pagesStyle;
