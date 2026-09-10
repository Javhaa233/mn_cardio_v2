import {
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  cardTitle,
} from "assets/jss/material-dashboard-pro-react.js";

const chartsStyle = {
  cardTitle,
  cardCategory: { margin: "0", color: grayColor[0] },
  cardIconTitle: { ...cardTitle, marginTop: "15px", marginBottom: "0px" },
  legendTitle: {
    color: grayColor[0],
    margin: "10px 0 !important",
    display: "flex",
  },
  primary: { color: primaryColor[0] },
  warning: { color: warningColor[0] },
  danger: { color: dangerColor[0] },
  success: { color: successColor[0] },
  info: { color: infoColor[0] },
  rose: { color: roseColor[0] },
  gray: { color: grayColor[0] },
  cardFooter: { display: "block" },

  ctChart: { position: "relative" },

  //   ctTooltip: {
  //     position: "absolute",
  //     display: "inline-block",
  //     opacity: 0,
  //     minWidth: "5em",
  //     padding: "0.5em",
  //     background: "#ddd",
  //     color: "#453d3f",
  //     textAlign: "center",
  //     pointerEvents: "none",
  //     zIndex: "1",
  //     transition: "opacity 0.2s linear",
  //     "&::before": {
  //       content: "''",
  //       position: "absolute",
  //       top: "100%",
  //       left: "50%",
  //       width: 0,
  //       height: 0,
  //       marginLeft: "-15px",
  //       border: "15px solid transparent",
  //       borderTopColor: "#ddd",
  //     },
  //     "& > .tooltip-show": {
  //       opacity: 1,
  //     },
  //   },
};

export default chartsStyle;
