import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  dangerColor,
} from "assets/jss/material-dashboard-pro-react.js";

const DangerText = styled("div")({
  ...defaultFont,
  fontSize: "14px",
  color: dangerColor[0],
});

export default function Danger(props) {
  const { children } = props;
  return <DangerText>{children}</DangerText>;
}

Danger.propTypes = { children: PropTypes.node };
