import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  primaryColor,
} from "assets/jss/material-dashboard-pro-react.js";

const PrimaryText = styled("div")({
  ...defaultFont,
  fontSize: "14px",
  color: primaryColor[0],
});

export default function Primary(props) {
  const { children } = props;
  return <PrimaryText>{children}</PrimaryText>;
}

Primary.propTypes = {
  children: PropTypes.node,
};
