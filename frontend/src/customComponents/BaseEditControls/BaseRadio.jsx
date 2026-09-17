import React, { useState } from "react";

import { useTranslation } from "react-i18next";
// @mui/material components
import Radio from "@mui/material/Radio";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
// @mui/icons-material
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
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
import { FIELD } from "./fieldRowStyles";

export default function BaseRadio(props) {
  const { t } = useTranslation();
  const generatedId = React.useId();

  const {
    Config = null,
    Id = null,
    LabelledBy = null,
    defaultValue = null,
    Value = null,
    ChangeValue,
    Row = false,
    Unknown = false,
    UnknownText = "Unknown",
    Left = false,
    md = 4.8,
    LabelWidth,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // A radio group has no single input to point a <label htmlFor> at, so the
  // group is named with aria-labelledby instead. `LabelledBy` wins when a
  // parent (BaseField) renders the label itself.
  const groupId = Id || generatedId;
  const labelId = LabelledBy || `${groupId}-label`;

  const [selectedValue, setSelectedValue] = useState(
    Value !== null && Value !== undefined
      ? Value + ""
      : Config && Config.Value
        ? Config.Value + ""
        : defaultValue,
  );

  // Sync internal state with external props when they change
  React.useEffect(() => {
    if (Value !== undefined && Value !== null) {
      setSelectedValue(Value + "");
    } else if (Config && Config.Value !== undefined && Config.Value !== null) {
      setSelectedValue(Config.Value + "");
    } else if (defaultValue !== undefined && defaultValue !== null) {
      setSelectedValue(defaultValue + "");
    }
  }, [Value, Config, defaultValue]);

  const labelHorizontalSx = {
    color: FIELD.labelInk,
    display: "inline-flex",
    fontSize: "0.875rem",
    lineHeight: "1.428571429",
    fontWeight: "400",
    paddingTop: "4px",
    marginRight: "0",
    textAlign: "left",
  };

  const labelLeftSx = {
    display: "inline-block",
    width: "100%",
    textAlign: "left",
    "@media (min-width: 992px)": { float: "left" },
  };

  const onChangeValue = (event) => {
    setSelectedValue(event.target.value);
    Config && ChangeValue && ChangeValue(Config.Name, event.target.value);
  };

  const GetRadio = () => {
    var Radios = [];
    if (Config && Config.Data) {
      for (var i = 0; i < Config.Data.length; i++) {
        Radios.push(
          <div
            style={{
              display: Row ? "block" : "inline-block",
              width: Row ? "100%" : undefined,
              textAlign: Row ? "left" : undefined,
              marginRight: Row ? undefined : "8px",
              marginBottom: Row ? "8px" : "0",
            }}
            key={"Div" + i}
          >
            <FormControlLabel
              control={
                <Radio
                  checked={
                    selectedValue === Config.Data[i][Config.Config.IdField]
                  }
                  onChange={onChangeValue}
                  value={Config.Data[i][Config.Config.IdField]}
                  name={Config.Name}
                  icon={
                    <FiberManualRecord
                      sx={{
                        width: "0px",
                        height: "0px",
                        padding: "7px",
                        border: `1px solid ${FIELD.unchecked}`,
                        borderRadius: "50%",
                      }}
                    />
                  }
                  checkedIcon={
                    <FiberManualRecord
                      sx={{
                        width: "16px",
                        height: "16px",
                        border: "1px solid " + primaryColor[0],
                        borderRadius: "50%",
                      }}
                    />
                  }
                  sx={{
                    margin: Row ? "-8px 0" : "0",
                    padding: Row ? "14px" : "6px",
                    "&:hover": { backgroundColor: "unset" },
                    "&.Mui-checked": { color: primaryColor[0] + "!important" },
                  }}
                />
              }
              sx={{
                ml: Row ? "-14px" : "-6px",
                "& .MuiFormControlLabel-label": {
                  cursor: "pointer",
                  color: FIELD.labelInk,
                  fontSize: "0.875rem",
                  lineHeight: "1.428571429",
                  fontWeight:
                    selectedValue === Config.Data[i][Config.Config.IdField]
                      ? "600"
                      : "400",
                  display: "inline-flex",
                  transition: "0.3s ease all",
                  letterSpacing: "unset",
                },
              }}
              label={t(Config.Data[i][Config.Config.TextField] + "")}
            />
          </div>,
        );
      }

      if (Unknown) {
        Radios.push(
          <div
            style={{
              display: Row ? "block" : "inline-block",
              width: Row ? "100%" : undefined,
              textAlign: Row ? "left" : undefined,
              marginRight: Row ? undefined : "8px",
              marginBottom: Row ? "8px" : "0",
            }}
            key="DivUnknown"
          >
            <FormControlLabel
              control={
                <Radio
                  checked={selectedValue === "-1"}
                  onChange={onChangeValue}
                  value={"-1"}
                  name={Config.Name}
                  icon={
                    <FiberManualRecord
                      sx={{
                        width: "0px",
                        height: "0px",
                        padding: "7px",
                        border: `1px solid ${FIELD.unchecked}`,
                        borderRadius: "50%",
                      }}
                    />
                  }
                  checkedIcon={
                    <FiberManualRecord
                      sx={{
                        width: "16px",
                        height: "16px",
                        border: "1px solid " + primaryColor[0],
                        borderRadius: "50%",
                      }}
                    />
                  }
                  sx={{
                    margin: Row ? "-8px 0" : "0",
                    padding: Row ? "14px" : "6px",
                    "&:hover": { backgroundColor: "unset" },
                    "&.Mui-checked": { color: primaryColor[0] + "!important" },
                  }}
                />
              }
              sx={{
                ml: Row ? "-14px" : "-6px",
                "& .MuiFormControlLabel-label": {
                  cursor: "pointer",
                  color: FIELD.labelInk,
                  fontSize: "0.875rem",
                  lineHeight: "1.428571429",
                  fontWeight: selectedValue === "-1" ? "600" : "400",
                  display: "inline-flex",
                  transition: "0.3s ease all",
                  letterSpacing: "unset",
                },
              }}
              label={t(UnknownText)}
            />
          </div>,
        );
      }
    }
    return Radios;
  };

  const { HideLabel } = props;

  if (HideLabel) {
    return (
      <div
        role="radiogroup"
        aria-labelledby={LabelledBy || undefined}
        aria-label={
          !LabelledBy && Config && Config.Label
            ? t(Config.Label + "")
            : undefined
        }
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: Row ? "0 5px 0 15px" : "0 5px 0 10px",
          backgroundColor: "#fff",
          flexWrap: "wrap",
          rowGap: Row ? "5px" : "2px",
          minHeight: "32px",
          width: "100%",
        }}
      >
        {GetRadio()}
      </div>
    );
  }

  if (Config) {
    return (
      <GridContainer
        sx={(theme) =>
          fieldRowSx(theme, {
            borderColor: FIELD.rowBorder,
            fixedHeight: false,
          })
        }
      >
        <GridItem
          {...labelSize(effectiveMd)}
          sx={(theme) => ({
            ...labelCellSx(theme, { borderColor: FIELD.rowBorder }),
            justifyContent: "flex-start",
            ...(Row ? { paddingTop: "8px", paddingBottom: "8px" } : {}),
          })}
        >
          <FormLabel
            component="span"
            id={labelId}
            sx={{
              ...labelHorizontalSx,
              ...(Left ? labelLeftSx : {}),
              paddingTop: 0,
              margin: 0,
            }}
          >
            {Config && Config.Label
              ? t(Config.Label + "") + ":" + (Config.Required ? " *" : "")
              : ""}
          </FormLabel>
        </GridItem>

        <GridItem
          {...inputSize(effectiveMd)}
          role="radiogroup"
          aria-labelledby={labelId}
          sx={{
            ...inputCellSx(),
            ...controlHeightSx,
            flexDirection: "row",
            justifyContent: "flex-start",
            padding: Row ? "0 5px 0 15px" : "0 5px 0 10px",
            flexWrap: "wrap",
            rowGap: Row ? "5px" : "2px",
            border: `1px solid ${FIELD.rowBorder}`,
          }}
        >
          {GetRadio()}
        </GridItem>
      </GridContainer>
    );
  } else {
    return null;
  }
}
