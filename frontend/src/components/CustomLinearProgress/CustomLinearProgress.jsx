import React from "react";
import PropTypes from "prop-types";

// @mui/material components
import { styled } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";

import {
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => !["color"].includes(prop),
})(({ theme, color }) => {
  const colorStyles = {
    primary: {
      backgroundColor: primaryColor[0],
      background: "rgba(" + hexToRgb(primaryColor[0]) + ", 0.2)",
    },
    warning: {
      backgroundColor: warningColor[0],
      background: "rgba(" + hexToRgb(warningColor[0]) + ", 0.2)",
    },
    danger: {
      backgroundColor: dangerColor[0],
      background: "rgba(" + hexToRgb(dangerColor[0]) + ", 0.2)",
    },
    success: {
      backgroundColor: successColor[0],
      background: "rgba(" + hexToRgb(successColor[0]) + ", 0.2)",
    },
    info: {
      backgroundColor: infoColor[0],
      background: "rgba(" + hexToRgb(infoColor[0]) + ", 0.2)",
    },
    rose: {
      backgroundColor: roseColor[0],
      background: "rgba(" + hexToRgb(roseColor[0]) + ", 0.2)",
    },
    gray: {
      backgroundColor: grayColor[0],
      background: "rgba(" + hexToRgb(grayColor[5]) + ", 0.2)",
    },
  };

  return {
    height: "4px",
    marginBottom: "20px",
    overflow: "hidden",
    ...(color &&
      colorStyles[color] && {
        background: colorStyles[color].background,
      }),
    "& .MuiLinearProgress-bar": {
      height: "4px",
      ...(color &&
        colorStyles[color] && {
          backgroundColor: colorStyles[color].backgroundColor,
        }),
    },
  };
});

export default function CustomLinearProgress(props) {
  const { color, ...rest } = props;
  return <StyledLinearProgress color={color} {...rest} />;
}

CustomLinearProgress.defaultProps = { color: "gray" };

CustomLinearProgress.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
    "gray",
  ]),
};
