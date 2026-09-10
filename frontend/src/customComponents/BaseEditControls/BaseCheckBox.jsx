import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";
// @mui/icons-material
import Check from "@mui/icons-material/Check";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {
  controlHeightSx,
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  labelSize,
  inputSize,
} from "./fieldRowStyles";

import {
  primaryColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

export default function BaseCheckBox(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Id = null,
    LabelledBy = null,
    md = 4.8,
    boxMd = 12,
    ChangeValue,
    Compact = true,
    LabelWidth,
    HideLabel = false,
    Disabled = false,
    Value: PropValue,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // A checkbox group has no single input to point a <label htmlFor> at, so the
  // group is named with aria-labelledby instead. `LabelledBy` wins when a
  // parent (BaseField) renders the label itself.
  const groupId = Id || generatedId;
  const labelId = LabelledBy || `${groupId}-label`;

  // 1. DETERMINE CURRENT VALUE
  // Priority: Prop Value > Config.Value > Empty Array
  const rawValue =
    PropValue !== undefined
      ? PropValue
      : Config && Config.Value
        ? Config.Value
        : [];

  // Ensure it is always an array to prevent crashes
  const CheckedData = Array.isArray(rawValue) ? rawValue : [];

  // 2. CHECK IF A SPECIFIC VALUE IS SELECTED
  const GetChecked = (val) => {
    return CheckedData.some((s) => s + "" === "" + val);
  };

  // 3. HANDLE CLICKS
  const onChangeValue = (val, isChecked) => {
    let NewCheckedData = [...CheckedData];
    const index = NewCheckedData.findIndex((x) => x + "" === val + "");

    if (isChecked && index === -1) {
      NewCheckedData.push(val);
    } else if (!isChecked && index !== -1) {
      NewCheckedData.splice(index, 1);
    }

    // Directly notify parent.
    // We rely on the parent to update state and re-render this component.
    if (Config && ChangeValue) {
      ChangeValue(Config.Name, NewCheckedData);
    }
  };

  const GetCheckBox = () => {
    var CheckBoxes = [];

    const configObj = Config?.Config || {
      IdField: Config?.IdField || "Value",
      TextField: Config?.TextField || "Label",
    };

    if (Config && Array.isArray(Config.Data) && Config.Data.length > 0) {
      for (let i = 0; i < Config.Data.length; i++) {
        const itemData = Config.Data[i];
        const itemValue = itemData[configObj.IdField];
        const itemLabel = itemData[configObj.TextField];
        const isChecked = GetChecked(itemValue);

        const checkboxAndRadioHorizontalSx = {
          position: "relative",
          display: "block",
          marginTop: Compact ? "5px" : "10px",
          marginBottom: Compact ? "5px" : "10px",
          paddingTop: "1px",
          minHeight: "fit-content",
          zIndex: 10,
          pointerEvents: "auto",
        };

        CheckBoxes.push(
          <GridItem
            xs={12}
            sm={12}
            md={boxMd}
            key={"Grid" + i}
            style={{
              minHeight: "fit-content",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Box sx={checkboxAndRadioHorizontalSx}>
              <FormControlLabel
                key={"label" + i}
                control={
                  <Checkbox
                    key={"Check" + i}
                    disabled={Disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeValue(itemValue, !isChecked);
                    }}
                    checked={isChecked}
                    value={itemValue}
                    checkedIcon={
                      <Check
                        sx={{
                          width: "16px",
                          height: "16px",
                          pointerEvents: "none",
                          border:
                            "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
                          borderRadius: "3px",
                        }}
                      />
                    }
                    icon={
                      <Box
                        component="span"
                        sx={{
                          width: "16px",
                          height: "16px",
                          pointerEvents: "none",
                          border:
                            "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
                          borderRadius: "3px",
                        }}
                      />
                    }
                    sx={{
                      "&:hover": { backgroundColor: "unset" },
                      "&.Mui-checked": {
                        color: primaryColor[0] + "!important",
                      },
                    }}
                  />
                }
                sx={{
                  ml: "-14px",
                  mt: Compact ? "-4px" : "0",
                  alignItems: "center",
                  minHeight: "fit-content",
                  "& .MuiCheckbox-root": { zIndex: 3 },
                  "& .MuiFormControlLabel-label": {
                    zIndex: 3,
                    cursor: "pointer",
                    paddingLeft: "0",
                    color: "#75736c",
                    fontSize: "14px",
                    lineHeight: 1.4,
                    fontWeight: isChecked ? "600" : "400",
                    display: "inline-flex",
                    transition: "0.3s ease all",
                    letterSpacing: "unset",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  },
                }}
                label={t(itemLabel + "")}
              />
            </Box>
          </GridItem>,
        );
      }
    }
    return CheckBoxes;
  };

  if (Config) {
    if (HideLabel) {
      return (
        <div
          role="group"
          aria-labelledby={LabelledBy || undefined}
          aria-label={
            !LabelledBy && Config.Label ? t(Config.Label + "") : undefined
          }
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "0 15px",
            backgroundColor: "#fff",
            width: "100%",
            minHeight: "32px",
          }}
        >
          <GridContainer>{GetCheckBox()}</GridContainer>
        </div>
      );
    }
    return (
      <GridContainer
        sx={(theme) =>
          fieldRowSx(theme, { borderColor: "#eee", fixedHeight: false })
        }
      >
        {Config.Label && (
          <GridItem
            {...labelSize(effectiveMd)}
            sx={(theme) => ({
              ...labelCellSx(theme, { borderColor: "#eee" }),
              justifyContent: "flex-start",
            })}
          >
            <FormLabel
              component="span"
              id={labelId}
              sx={{
                color: "#75736c",
                cursor: "pointer",
                display: "inline-flex",
                fontSize: "14px",
                lineHeight: 1.2,
                fontWeight: "400",
                paddingTop: "0",
                marginRight: "0",
                textAlign: "left",
              }}
            >
              {t(Config.Label + "") + ":" + (Config.Required ? " *" : "")}
            </FormLabel>
          </GridItem>
        )}
        <GridItem
          {...inputSize(effectiveMd, !!Config.Label)}
          role="group"
          aria-labelledby={Config.Label ? labelId : undefined}
          sx={{
            ...inputCellSx(),
            ...controlHeightSx,
            flexDirection: "row",
            justifyContent: "flex-start",
            padding: "0 15px",
            border: "1px solid #eee",
          }}
        >
          <GridContainer>{GetCheckBox()}</GridContainer>
        </GridItem>
      </GridContainer>
    );
  } else {
    return null;
  }
}
