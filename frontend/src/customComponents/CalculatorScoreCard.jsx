import React from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

// default components
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";

// styles
import {
  whiteColor,
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
} from "assets/jss/material-dashboard-pro-react.js";

const CalculatorScoreCard = ({
  points,
  title,
  children,
  sx,
  style,
  ...rest
}) => {
  const { t } = useTranslation();

  const headerColors = {
    warning: warningCardHeader,
    success: successCardHeader,
    danger: dangerCardHeader,
    info: infoCardHeader,
    primary: primaryCardHeader,
    rose: roseCardHeader,
  };

  const selectedHeaderStyle = headerColors[rest.color || "warning"] || {};

  return (
    <Box
      sx={{
        margin: "10px 0px 10px 20px",
        width: "200px",
        maxWidth: "100%",
        height: "285px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "transparent",
        boxShadow: "none",
        border: "none",
        ...sx,
      }}
      style={style}
      {...rest}
    >
      <CardHeader
        color={rest.color || "warning"}
        style={{
          ...selectedHeaderStyle,
          borderRadius: "12px",
          marginTop: "0px",
          padding: "15px",
          width: "170px",
          height: "170px",
          position: "relative",
          color: whiteColor,
          fontWeight: 600,
          letterSpacing: "0.01em",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          margin: "0 auto",
        }}
      >
        <Box
          component="p"
          sx={{
            color: "#FFF",
            fontSize: "16px",
            margin: "0",
            fontWeight: "400",
          }}
        >
          {title || t("Points")}
        </Box>
        <Box
          component="h3"
          sx={{
            color: "#FFF",
            fontSize: "56px",
            fontWeight: "500",
            margin: "0",
          }}
        >
          {points}
        </Box>
      </CardHeader>
      {children && (
        <CardFooter
          stats
          style={{ borderTop: "none", marginTop: "auto", paddingBottom: 0 }}
        >
          <Box
            sx={{
              fontSize: "14px",
              color: "#3C4858",
              width: "100%",
              textAlign: "right",
            }}
          >
            {children}
          </Box>
        </CardFooter>
      )}
    </Box>
  );
};

export default CalculatorScoreCard;
