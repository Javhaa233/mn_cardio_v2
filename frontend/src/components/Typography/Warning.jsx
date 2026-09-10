import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  warningColor,
} from "assets/jss/material-dashboard-pro-react.js";

const WarningText = styled("div")({
  ...defaultFont,
  fontSize: "14px",
  color: warningColor[0],
});

export default function Warning(props) {
  const { children } = props;
  return <WarningText>{children}</WarningText>;
}

Warning.propTypes = {
  children: PropTypes.node,
};
