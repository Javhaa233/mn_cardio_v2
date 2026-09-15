import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";

// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

export default function BaseInfo(props) {
  const { t } = useTranslation();

  const {
    md = 3,
    Label = "",
    Value = "",
    Left = false,
    LabelColor = FIELD.labelInk,
    Size = "14px",
    LabelWeight = "400",
    ValueColor = FIELD.valueInk,
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
    fontWeight: "400",
    // 14px like the edit controls: a read-only value was 2px smaller than its own label.
    fontSize: "14px",
    minHeight: `${height}px`,
    lineHeight: `${height}px`,
    boxSizing: "border-box",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    width: "100%",
  };

  const borderColor = FIELD.rowBorder;

  return (
    <GridContainer
      sx={{
        m: 0,
        width: "100%",
        border: `1px solid ${borderColor}`,
        marginTop: "-1px",
        alignItems: "stretch",
        backgroundColor: "#fff",
        overflow: "hidden",
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
      {/* Label Grid Item */}
      <GridItem
        xs={12}
        sm={12}
        md={md}
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: FIELD.labelBg,
          borderRight: `1px solid ${borderColor}`,
          px: "15px",
          minHeight: "32px",
        }}
      >
        {Label && (
          <FormLabel sx={labelHorizontalSx}>{t(Label + "") + ":"}</FormLabel>
        )}
      </GridItem>

      {/* Value Grid Item */}
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
