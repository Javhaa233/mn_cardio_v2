import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";
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

import Datetime from "customComponents/DateTime";

import Helper from "helper";
import { FIELD } from "./fieldRowStyles";

const getLabelSx = (fontSize = "14px") => ({
  color: FIELD.labelInk,
  cursor: "pointer",
  display: "inline-flex",
  fontSize,
  lineHeight: "1.428571429",
  fontWeight: "400",
  paddingTop: "8px",
  marginRight: "0",
  textAlign: "left",
});

export default function BaseDate(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();
  const {
    Config = null,
    Id = null,
    IsNull = false,
    ChangeValue,
    md = 4.8,
    ViewMode = "days",
    LabelWidth,
    LabelSize = "14px",
    HideLabel = false,
    Disabled = false,
    Value: PropValue,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // Stable id shared by the <label htmlFor> and the date <input> that
  // customComponents/DateTime renders. `Id` wins when a parent owns it.
  const inputId = Id || generatedId;

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : Helper.ObjectHelper.getDateYMD(),
  );
  const isInitialMount = React.useRef(true);

  // Sync internal state with external props when they change
  // This is intentional to support both controlled and uncontrolled usage
  useEffect(() => {
    if (PropValue !== undefined && PropValue !== null) {
      setValue(PropValue);
    }
  }, [PropValue]);

  // Notify parent of value changes
  useEffect(() => {
    // Skip the initial mount to prevent calling ChangeValue on component load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (ChangeValue && Value && !IsNull && Config) {
      ChangeValue(Config.Name, Value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Value]);

  if (HideLabel) {
    return (
      <Datetime
        Id={inputId}
        Value={Value}
        Disabled={Disabled}
        ChangeValue={(Value) => {
          setValue(Value);
          ChangeValue && ChangeValue(Config.Name, Value);
        }}
        ViewMode={ViewMode}
        Sx={{
          width: "100%",
          ...controlHeightSx,
          "& .MuiInput-underline:before": { borderBottom: "none !important" },
          "& .MuiInput-underline:after": { borderBottom: "none !important" },
          "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
            borderBottom: "none !important",
          },
          "& .MuiInputBase-root": {
            border: "none",
          },
          "& .MuiInputBase-input": {
            textAlign: "left", // optional: BaseTextField is usually left aligned
            boxSizing: "border-box",
          },
        }}
      />
    );
  }

  return (
    <GridContainer
      sx={(theme) => fieldRowSx(theme, { borderColor: FIELD.rowBorder })}
    >
      <GridItem
        {...labelSize(effectiveMd)}
        sx={(theme) => ({
          ...labelCellSx(theme, { borderColor: FIELD.rowBorder }),
          justifyContent: "flex-start",
          paddingLeft: "15px",
          paddingRight: "15px",
        })}
      >
        <FormLabel
          htmlFor={inputId}
          sx={{ ...getLabelSx(LabelSize), paddingTop: 0, margin: 0 }}
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
          padding: "0",
        }}
      >
        <Datetime
          Id={inputId}
          Value={Value}
          ChangeValue={(Value) => {
            setValue(Value);
            ChangeValue && ChangeValue(Config.Name, Value);
          }}
          ViewMode={ViewMode}
          Sx={{
            width: "100%",
            ...controlHeightSx,
            "& .MuiInput-underline:before": { borderBottom: "none !important" },
            "& .MuiInput-underline:after": { borderBottom: "none !important" },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottom: "none !important",
            },
            "& .MuiInputBase-root": {
              border: "none",
            },
            "& .MuiInputBase-input": {
              textAlign: "left", // optional: BaseTextField is usually left aligned
              boxSizing: "border-box",
            },
          }}
        />
      </GridItem>
    </GridContainer>
  );
}
