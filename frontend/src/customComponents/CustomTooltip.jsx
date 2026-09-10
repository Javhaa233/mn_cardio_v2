import React from "react";
import { useTranslation } from "react-i18next";
// @mui/material components
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { tooltipClasses } from "@mui/material/Tooltip";

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: "5px 8px",
    marginTop: "0",
    backgroundColor: "rgba(255, 255, 255, 1)",
    color: "#3c4858",
    maxWidth: 220,
    fontSize: "15px",
    fontWeight: "300",
    borderRadius: "3px",
    boxShadow:
      "0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(60, 72, 88, .4)",
    borderColor: "rgba(255, 255, 255, 1)",
    position: "relative",
  },
  [`&[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]: {
    marginLeft: "-10px",
  },
  [`&[data-popper-placement*="right"] .${tooltipClasses.tooltip}::after`]: {
    left: "-5px",
    top: "calc(50% - 7px)",
    border: "solid transparent",
    content: '""',
    height: 0,
    width: 0,
    position: "absolute",
    borderRightColor: "rgba(255, 255, 255, 1)",
    borderWidth: "7px",
    marginLeft: "-7px",
  },
  [`&[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: {
    marginTop: "8px",
  },
  [`&[data-popper-placement*="top"] .${tooltipClasses.tooltip}::after`]: {
    top: "-8px",
    left: "calc(50% - 10px)",
    border: "solid transparent",
    content: '""',
    height: 0,
    width: 0,
    position: "absolute",
    borderBottomColor: "rgba(255, 255, 255, 1)",
    borderWidth: "10px",
    marginTop: "-10px",
  },
}));

function CustomTooltip(props) {
  const { t } = useTranslation();
  const {
    placement = "bottom",
    title = "",
    Disabled = false,
    children,
  } = props;

  return (
    <StyledTooltip
      title={t(title + "")}
      placement={placement}
      disableHoverListener={!!Disabled}
    >
      {children}
    </StyledTooltip>
  );
}

export default CustomTooltip;
