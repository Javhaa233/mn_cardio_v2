import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  successColor,
} from "assets/jss/material-dashboard-pro-react.js";

const SuccessText = styled("div")({
  ...defaultFont,
  fontSize: "14px",
  color: successColor[0],
});

export default function Success(props) {
  const { children } = props;
  return <SuccessText>{children}</SuccessText>;
}

Success.propTypes = {
  children: PropTypes.node,
};
