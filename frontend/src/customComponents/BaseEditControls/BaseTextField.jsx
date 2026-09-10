import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput.jsx";
import {
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  innerInputSx,
  labelSize,
  inputSize,
} from "./fieldRowStyles";
import { CONTROL, TOUCH, COARSE } from "@/theme.js";

const getLabelSx = (fontSize = "14px") => ({
  color: "#75736c",
  cursor: "pointer",
  display: "inline-flex",
  fontSize,
  lineHeight: "1.428571429",
  fontWeight: "400",
  paddingTop: "0",
  marginRight: "0",
  textAlign: "left",
  whiteSpace: "normal",
});

export default function BaseTextField(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    ChangeValue,
    md = 4.8,
    Disabled = false,
    readOnly = false,
    FullWidth = true,
    Width = "none",
    Minus = false,
    Id = null,
    ContainerSx = null,
    LabelWidth,
    LabelSize = "14px",
    HideLabel = false,
    borderColor = "#eee", // Default border color to match BaseField
    Value: PropValue,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // Stable id shared by the <label htmlFor> and the underlying <input>.
  // `Id` wins when a parent (BaseField) already owns the association.
  const inputId = Id || generatedId;

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : "",
  );

  // Sync internal state with external props when they change
  // This is intentional to support both controlled and uncontrolled usage
  useEffect(() => {
    if (PropValue !== undefined && PropValue !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(PropValue);
    } else if (Config && Config.Value) {
      setValue(Config.Value);
    }
  }, [Config, PropValue]);

  const onChangeValue = (Value) => {
    let value = Value;
    if (ChangeValue && Config) {
      if (Config.Type === "Number") {
        // Replace comma with period for decimal separator
        if (typeof value === "string") {
          value = value.replace(",", ".");
        }
        if (!Minus && parseFloat(value) < 0) value = null;
        if (Config.min) {
          let minValue = parseInt(Config.min);
          if (parseFloat(value) < minValue) value = minValue;
        }
        if (value === "") value = null;
      }
      ChangeValue(Config.Name, value);
    }
    setValue(value);
  };

  // If HideLabel is true, this component is being used within BaseField's WrapWithBorderedLayout
  // In this case, we should not render the outer container and label since BaseField handles that
  if (HideLabel) {
    return (
      <CustomInput
        // error={RuleError}
        formControlProps={{
          fullWidth: FullWidth,
          style: {
            padding: "0",
            margin: "0",
            backgroundColor: "#FFF",
            width: FullWidth ? "100%" : Width,
          },
          sx: {
            // CustomInput's StyledFormControl and the theme's MuiFormControl
            // both add spacing; the input itself is sized by the theme.
            padding: "0 !important",
            paddingTop: "0 !important",
            margin: "0 !important",
          },
        }}
        inputProps={{
          id: inputId,
          value: Value,
          type:
            Config && Config.Type === "Number"
              ? "text"
              : Config
                ? Config.Type
                : "Text",
          inputMode: Config && Config.Type === "Number" ? "decimal" : undefined,
          disabled: Disabled,
          readOnly,
          onChange: (e) => onChangeValue(e.target.value),
          disableUnderline: true,
          sx: {
            border: "1px solid #eee",
            "&:hover:not(.Mui-disabled)": {
              border: "1px solid #ccc",
            },
            "&.Mui-focused": {
              border: "1px solid #aaa",
            },
            // CustomInput's StyledInput pads the input root with 8px 12px,
            // which the theme does not reach - keep this.
            ...innerInputSx,
          },
        }}
      />
    );
  }

  // When not hidden (used directly), render the full bordered layout
  return (
    <GridContainer
      sx={(theme) => ({
        ...fieldRowSx(theme, { borderColor }),
        ...(ContainerSx || {}),
      })}
    >
      <GridItem
        {...labelSize(effectiveMd)}
        sx={(theme) => ({
          ...labelCellSx(theme, { borderColor }),
          justifyContent: "flex-start",
        })}
      >
        <FormLabel
          htmlFor={inputId}
          sx={{ ...getLabelSx(LabelSize), padding: 0, margin: 0 }}
        >
          {Config && Config.Label
            ? t(Config.Label + "") + ":" + (Config.Required ? " *" : "")
            : ""}
        </FormLabel>
      </GridItem>
      <GridItem
        {...inputSize(effectiveMd)}
        sx={{
          ...inputCellSx(),
          flexDirection: "row",
          justifyContent: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <CustomInput
          // error={RuleError}
          formControlProps={{
            fullWidth: true,
            style: {
              padding: "0",
              margin: "0",
              backgroundColor: "#FFF",
            },
            sx: {
              // CustomInput's StyledFormControl and the theme's MuiFormControl
              // both add spacing; the input itself is sized by the theme.
              padding: "0 !important",
              paddingTop: "0 !important",
              margin: "0 !important",
              // Was an inline `minHeight: 32px`, which an inline style meant no
              // media query could ever raise for touch.
              minHeight: CONTROL.height,
              [COARSE]: { minHeight: TOUCH.height },
            },
          }}
          inputProps={{
            id: inputId,
            value: Value,
            type:
              Config && Config.Type === "Number"
                ? "text"
                : Config
                  ? Config.Type
                  : "Text",
            inputMode:
              Config && Config.Type === "Number" ? "decimal" : undefined,
            disabled: Disabled,
            readOnly,
            onChange: (e) => onChangeValue(e.target.value),
            disableUnderline: true,
            sx: {
              border: "1px solid #eee",
              position: "relative",
              zIndex: 2,
              "&:hover:not(.Mui-disabled)": {
                border: "1px solid #ccc",
              },
              "&.Mui-focused": {
                border: "1px solid #aaa",
              },
              // CustomInput's StyledInput pads the input root with 8px 12px,
              // which the theme does not reach - keep this.
              ...innerInputSx,
            },
          }}
        />
      </GridItem>
    </GridContainer>
  );
}
