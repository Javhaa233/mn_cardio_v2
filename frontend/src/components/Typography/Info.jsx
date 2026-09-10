import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  infoColor,
} from "assets/jss/material-dashboard-pro-react.js";

const InfoText = styled("div")({
  ...defaultFont,
  fontSize: "14px",
  color: infoColor[0],
});

export default function Info(props) {
  const { children } = props;
  return <InfoText>{children}</InfoText>;
}

Info.propTypes = { children: PropTypes.node };
