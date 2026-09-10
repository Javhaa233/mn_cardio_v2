import React from "react";
import PropTypes from "prop-types";

// @mui/material components
import Snack from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import IconButton from "@mui/material/IconButton";

// @mui/icons-material
import Close from "@mui/icons-material/Close";

import {
  defaultFont,
  infoBoxShadow,
  successBoxShadow,
  warningBoxShadow,
  dangerBoxShadow,
  roseBoxShadow,
  primaryBoxShadow,
  whiteColor,
  grayColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  roseColor,
  primaryColor,
  hexToRgb,
  blackColor,
} from "assets/jss/material-dashboard-pro-react.js";

export default function Snackbar(props) {
  const { message, color, close, icon, place, open } = props;
  var action = [];

  const colorSxByVariant = {
    info: {
      backgroundColor: infoColor[3],
      color: whiteColor,
      ...infoBoxShadow,
    },
    success: {
      backgroundColor: successColor[3],
      color: whiteColor,
      ...successBoxShadow,
    },
    warning: {
      backgroundColor: warningColor[3],
      color: whiteColor,
      ...warningBoxShadow,
    },
    danger: {
      backgroundColor: dangerColor[3],
      color: whiteColor,
      ...dangerBoxShadow,
    },
    primary: {
      backgroundColor: primaryColor[3],
      color: whiteColor,
      ...primaryBoxShadow,
    },
    rose: {
      backgroundColor: roseColor[3],
      color: whiteColor,
      ...roseBoxShadow,
    },
  };

  const iconColorSxByVariant = {
    info: { color: successColor[3] },
    success: { color: successColor[3] },
    warning: { color: warningColor[3] },
    danger: { color: dangerColor[3] },
    primary: { color: primaryColor[3] },
    rose: { color: roseColor[3] },
  };

  if (close) {
    action = [
      <IconButton
        key="close"
        aria-label="Close"
        color="inherit"
        onClick={() => props.closeNotification()}
        sx={{ width: "24px", height: "24px", padding: "0" }}
      >
        <Close sx={{ width: "11px", height: "11px" }} />
      </IconButton>,
    ];
  }
  return (
    <Snack
      anchorOrigin={{
        vertical: place.indexOf("t") === -1 ? "bottom" : "top",
        horizontal:
          place.indexOf("l") !== -1
            ? "left"
            : place.indexOf("c") !== -1
              ? "center"
              : "right",
      }}
      open={open}
      sx={{
        "&.MuiSnackbar-anchorOriginTopCenter": { top: "20px" },
        "&.MuiSnackbar-anchorOriginTopRight": { top: "40px" },
        "&.MuiSnackbar-anchorOriginTopLeft": { top: "40px" },
      }}
    >
      <SnackbarContent
        sx={{
          ...defaultFont,
          flexWrap: "unset",
          position: "relative",
          padding: "20px 15px",
          lineHeight: "20px",
          marginBottom: "20px",
          fontSize: "14px",
          backgroundColor: "white",
          color: grayColor[6],
          borderRadius: "3px",
          boxShadow:
            "0 12px 20px -10px rgba(" +
            hexToRgb(whiteColor) +
            ", 0.28), 0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.12), 0 7px 8px -5px rgba(" +
            hexToRgb(whiteColor) +
            ", 0.2)",
          ...(colorSxByVariant[color] || {}),
        }}
        message={
          <span
            style={{
              padding: 0,
              display: "block",
              maxWidth: "89%",
              ...(icon ? { paddingLeft: "50px" } : null),
            }}
          >
            {icon ? (
              <props.icon
                style={{
                  width: "38px",
                  height: "38px",
                  display: "block",
                  left: "15px",
                  position: "absolute",
                  marginTop: "-39px",
                  fontSize: "20px",
                  backgroundColor: whiteColor,
                  padding: "9px",
                  borderRadius: "50%",
                  maxWidth: "38px",
                  boxShadow:
                    "0 10px 30px -12px rgba(" +
                    hexToRgb(blackColor) +
                    ", 0.42), 0 4px 25px 0px rgba(" +
                    hexToRgb(blackColor) +
                    ", 0.12), 0 8px 10px -5px rgba(" +
                    hexToRgb(blackColor) +
                    ", 0.2)",
                  ...(iconColorSxByVariant[color] || {}),
                }}
              />
            ) : null}
            {message}
          </span>
        }
        action={action}
      />
    </Snack>
  );
}

Snackbar.defaultProps = {
  color: "info",
};

Snackbar.propTypes = {
  message: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    "info",
    "success",
    "warning",
    "danger",
    "primary",
    "rose",
  ]),
  close: PropTypes.bool,
  icon: PropTypes.object,
  place: PropTypes.oneOf(["tl", "tr", "tc", "br", "bl", "bc"]),
  open: PropTypes.bool,
  closeNotification: PropTypes.func,
};
