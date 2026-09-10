import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  whiteColor,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledBadge = styled("span", {
  shouldForwardProp: (prop) => prop !== "color",
})(({ theme, color }) => {
  const badgeColors = {
    primary: { backgroundColor: primaryColor[0] },
    warning: { backgroundColor: warningColor[0] },
    danger: { backgroundColor: dangerColor[0] },
    success: { backgroundColor: successColor[0] },
    info: { backgroundColor: infoColor[0] },
    rose: { backgroundColor: roseColor[0] },
    gray: { backgroundColor: grayColor[0] },
  };

  return {
    borderRadius: "12px",
    padding: "5px 12px",
    textTransform: "uppercase",
    fontSize: "10px",
    fontWeight: "700",
    lineHeight: "1",
    color: whiteColor,
    textAlign: "center",
    verticalAlign: "baseline",
    display: "inline-block",
    ...(color && badgeColors[color]),
  };
});

export default function Badge(props) {
  const { color, children } = props;
  return <StyledBadge color={color}>{children}</StyledBadge>;
}

Badge.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
    "gray",
  ]),
  children: PropTypes.node,
};
