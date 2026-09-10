import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

export default function BaseConfigInfo(props) {
  const { t } = useTranslation();

  const {
    Label = "",
    md = 3,
    Left = false,
    LabelColor = "#75736c",
    Size = "14px",
    LabelWeight = "400",
    padding = "0 12px",
    margin = "0",
    ValueColor = "#000",
    ValueWeight = "400",
    Value = "",
    height = 24,
  } = props;

  const labelHorizontalSx = {
    color: LabelColor,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: Size,
    lineHeight: 1,
    fontWeight: LabelWeight,
    marginRight: "2px",
    textAlign: "left",
  };

  const valueSx = {
    color: ValueColor,
    backgroundColor: "#ffffff",
    fontWeight: ValueWeight,
    fontSize: "12px",
    minHeight: `${height}px`,
    lineHeight: `${height}px`,
    boxSizing: "border-box",
    padding: padding,
    display: "flex",
    alignItems: "center",
    width: "100%",
  };

  const borderColor = "#d0d0d0";

  return (
    <GridContainer
      sx={{
        m: 0,
        width: "100%",
        border: `1px solid ${borderColor}`,
        borderRadius: "4px",
        marginTop: "-1px",
        alignItems: "stretch",
        backgroundColor: "#fff",
        transition: "border-color 0.15s ease-in-out",
        minHeight: "32px",
        "&:hover": {
          borderColor: borderColor,
        },
        "&:focus-within": {
          borderColor: borderColor,
        },
      }}
    >
      <GridItem
        xs={12}
        sm={12}
        md={md}
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          borderRight: `1px solid ${borderColor}`,
          px: "15px",
          minHeight: "32px",
        }}
      >
        {Label && (
          <FormLabel sx={labelHorizontalSx}>{t(Label + "") + ":"}</FormLabel>
        )}
      </GridItem>
      <GridItem
        xs={12}
        sm={12}
        md={12 - md}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 0,
          backgroundColor: "#fff",
          minHeight: "32px",
        }}
      >
        <div style={valueSx}>{Value ? t(Value + "") : ""}</div>
      </GridItem>
    </GridContainer>
  );
}
