import { useTranslation } from "react-i18next";
import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

// @mui/material components
import Snack from "@mui/material/SnackbarContent";
import IconButton from "@mui/material/IconButton";

// @mui/icons-material
import Close from "@mui/icons-material/Close";

import {
  defaultFont,
  primaryBoxShadow,
  infoBoxShadow,
  successBoxShadow,
  warningBoxShadow,
  dangerBoxShadow,
  roseBoxShadow,
  whiteColor,
  blackColor,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  roseColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledSnack = styled(Snack, {
  shouldForwardProp: (prop) => !["color"].includes(prop),
})(({ theme, color }) => {
  const colorStyles = {
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

  return {
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
    ...(color && colorStyles[color]),
    "& .MuiSnackbarContent-message": {
      padding: "0",
      display: "block",
      maxWidth: "89%",
    },
  };
});

const StyledIconButton = styled(IconButton)({
  width: "24px",
  height: "24px",
  padding: "0",
});

const StyledClose = styled(Close)({
  width: "11px",
  height: "11px",
});

const IconStyled = styled("div", {
  shouldForwardProp: (prop) => !["color"].includes(prop),
})(({ theme, color }) => {
  const iconColorStyles = {
    info: { color: successColor[3] },
    success: { color: successColor[3] },
    warning: { color: warningColor[3] },
    danger: { color: dangerColor[3] },
    primary: { color: primaryColor[3] },
    rose: { color: roseColor[3] },
  };

  return {
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
    ...(color && iconColorStyles[color]),
  };
});

const MessageSpan = styled("span", {
  shouldForwardProp: (prop) => !["hasIcon"].includes(prop),
})(({ hasIcon }) => ({
  ...(hasIcon && {
    paddingLeft: "50px",
    display: "block",
  }),
}));

export default function SnackbarContent(props) {
  const { t } = useTranslation();
  const { message, color, close, icon: Icon } = props;

  var action = [];

  if (close) {
    action = [
      <StyledIconButton key="close" aria-label="Close" color="inherit">
        <StyledClose />
      </StyledIconButton>,
    ];
  }

  return (
    <StyledSnack
      color={color}
      message={
        <div>
          {Icon ? <IconStyled as={Icon} color={color} /> : null}
          <MessageSpan hasIcon={!!Icon}>{message}</MessageSpan>
        </div>
      }
      action={action}
    />
  );
}

SnackbarContent.defaultProps = {
  color: "info",
};

SnackbarContent.propTypes = {
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
};
