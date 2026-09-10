import { useTranslation } from "react-i18next";
import React from "react";
import PropTypes from "prop-types";

// @mui/material components
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import {
  grayColor,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

export default function Pagination(props) {
  const { t } = useTranslation();
  const { pages = [], color } = props;

  const palette = {
    primary: primaryColor[0],
    info: infoColor[0],
    success: successColor[0],
    warning: warningColor[0],
    danger: dangerColor[0],
  };

  const activeColor = palette[color] || palette.primary;

  const activeBoxShadow =
    "0 4px 5px 0 rgba(" +
    hexToRgb(activeColor) +
    ", 0.14), 0 1px 10px 0 rgba(" +
    hexToRgb(activeColor) +
    ", 0.12), 0 2px 4px -1px rgba(" +
    hexToRgb(activeColor) +
    ", 0.2)";

  const paginationSx = {
    display: "inline-block",
    paddingLeft: "0",
    margin: "20px 0",
    borderRadius: "4px",
    listStyle: "none",
  };

  const paginationItemSx = { display: "inline" };

  const paginationLinkSx = {
    letterSpacing: "unset",
    border: 0,
    borderRadius: "30px !important",
    transition: "all .3s",
    padding: "0px 11px",
    margin: "0 3px",
    minWidth: "30px",
    height: "30px",
    minHeight: "auto",
    lineHeight: "30px",
    fontWeight: "400",
    fontSize: "12px",
    textTransform: "uppercase",
    background: "transparent",
    position: "relative",
    float: "left",
    textDecoration: "none",
    boxSizing: "border-box",
    "&,&:hover,&:focus": { color: grayColor[0] },
    "&:hover,&:focus": {
      zIndex: 3,
      backgroundColor: grayColor[8],
      borderColor: grayColor[5],
    },
    "&:hover": { cursor: "pointer" },
  };

  const activeSx = {
    "&,&:hover,&:focus": {
      backgroundColor: activeColor,
      borderColor: activeColor,
      color: whiteColor,
      boxShadow: activeBoxShadow,
    },
    "&:hover,&:focus": { zIndex: 2, cursor: "default" },
  };

  const disabledSx = {
    "&,&:hover,&:focus": {
      color: grayColor[1],
      cursor: "not-allowed",
      backgroundColor: whiteColor,
      borderColor: grayColor[5],
    },
  };

  return (
    <Box component="ul" sx={paginationSx}>
      {pages.map((prop, key) => {
        const buttonSx = {
          ...paginationLinkSx,
          ...(prop.active ? activeSx : {}),
          ...(prop.disabled ? disabledSx : {}),
        };
        return (
          <Box component="li" sx={paginationItemSx} key={key}>
            {prop.onClick ? (
              <Button
                onClick={prop.onClick}
                disabled={prop.disabled}
                sx={buttonSx}
              >
                {prop.text}
              </Button>
            ) : (
              <Button
                onClick={() => alert("you've clicked " + prop.text)}
                disabled={prop.disabled}
                sx={buttonSx}
              >
                {prop.text}
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

Pagination.defaultProps = {
  color: "primary",
};

Pagination.propTypes = {
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool,
      disabled: PropTypes.bool,
      text: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.oneOf(["PREV", "NEXT", "..."]),
      ]).isRequired,
      onClick: PropTypes.func,
    }),
  ).isRequired,
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
};
