import {
  containerFluid,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

const headerStyle = () => ({
  appBar: {
    backgroundColor: "#FFF",
    boxShadow: "none",
    borderBottom: "0",
    marginBottom: "0",
    position: "absolute",
    width: "100%",
    paddingTop: "10px",
    zIndex: "1029",
    color: grayColor[6],
    border: "0",
    borderRadius: "3px",
    padding: "10px 0",
    transition: "all 150ms ease 0s",
    minHeight: "50px",
    display: "block",
  },
  container: { ...containerFluid, minHeight: "50px" },
  flex: { display: "flex", flex: "1 auto" },
  appResponsive: { top: "8px" },
});

export default headerStyle;
