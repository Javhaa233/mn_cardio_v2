import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

const MutedText = styled("div")({
  ...defaultFont,
  fontSize: "14px",
  color: grayColor[1],
});

export default function Muted(props) {
  const { children } = props;
  return <MutedText>{children}</MutedText>;
}

Muted.propTypes = {
  children: PropTypes.node,
};
