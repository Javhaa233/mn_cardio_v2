import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import {
  warningColor,
  successColor,
  dangerColor,
  infoColor,
  primaryColor,
  roseColor,
  grayColor,
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledCardIcon = styled("div", {
  shouldForwardProp: (prop) => !["color", "groupbox"].includes(prop),
})(({ theme, color, groupbox }) => {
  const cardIconColors = {
    warning: warningCardHeader,
    success: successCardHeader,
    danger: dangerCardHeader,
    info: infoCardHeader,
    primary: primaryCardHeader,
    rose: roseCardHeader,
  };

  const cardIconBgColors = {
    warning: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    success: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    danger: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    info: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    primary: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    rose: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
  };

  const cardIconBorderColors = {
    warning: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    info: "#06b6d4",
    primary: "#8b5cf6",
    rose: "#0ea5e9",
  };

  const cardIconTextColors = {
    warning: "#92400e",
    success: "#065f46",
    danger: "#991b1b",
    info: "#0e7490",
    primary: "#5b21b6",
    rose: "#075985",
  };

  return {
    position: "relative",
    zIndex: 4,
    borderRadius: "8px",
    backgroundColor: grayColor[0],
    padding: "7px 12px",
    marginTop: "-12px",
    marginRight: "10px",
    float: "left",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    ...(groupbox && {
      background: "transparent",
      border: "none",
      boxShadow: "none",
      marginTop: "0",
      marginRight: "6px",
      padding: "0",
      float: "none",
      color: "inherit",
    }),
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
    },
    "& svg": {
      width: "20px",
      height: "20px",
      transition: "transform 0.2s ease",
    },
    "&:hover svg": {
      transform: "scale(1.1)",
    },
    ...(color &&
      !groupbox && {
        background:
          cardIconBgColors[color] || cardIconColors[color]?.background,
        border: "1px solid " + (cardIconBorderColors[color] || "transparent"),
        color: cardIconTextColors[color] || "inherit",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }),
  };
});

function CardIcon(props) {
  const { className, children, color, groupbox, ...rest } = props;

  return (
    <StyledCardIcon
      className={className}
      color={color}
      groupbox={groupbox}
      {...rest}
    >
      {children}
    </StyledCardIcon>
  );
}

CardIcon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf([
    "warning",
    "success",
    "danger",
    "info",
    "primary",
    "rose",
  ]),
  groupbox: PropTypes.bool,
  children: PropTypes.node,
};

export default CardIcon;
