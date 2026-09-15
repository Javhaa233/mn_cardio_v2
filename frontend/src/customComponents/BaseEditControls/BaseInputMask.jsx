import React, { useState, useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";
import { IMaskInput } from "react-imask";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {
  controlHeightSx,
  fieldRowSx,
  labelCellSx,
  inputCellSx,
  nativeInputSx,
  labelSize,
  inputSize,
} from "./fieldRowStyles";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";
import { FIELD } from "./fieldRowStyles";

// Validate date string in YYYY-MM-DD format
const isValidDate = (dateString) => {
  if (!dateString || dateString.length !== 10) return true; // Don't validate incomplete dates
  if (dateString.includes("_")) return true; // Don't validate if mask placeholder present

  const parts = dateString.split("-");
  if (parts.length !== 3) return false;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Check valid ranges
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Check days in month
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Leap year check
  if (month === 2) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (isLeapYear && day > 29) return false;
    if (!isLeapYear && day > 28) return false;
  } else if (day > daysInMonth[month - 1]) {
    return false;
  }

  return true;
};

export default function BaseInputMask(props) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const generatedId = React.useId();

  const {
    Config = null,
    Id = null,
    defaultValue = "",
    ChangeValue,
    md = 4.8,
    Mask = null,
    MaskChar = "-",
    type = "text",
    disabled = false,
    LabelWidth,
    ContainerSx,
  } = props;

  const effectiveMd = LabelWidth ? (LabelWidth / 100) * 12 : md;

  // Stable id shared by the <label htmlFor> and the masked <input>.
  // `Id` wins when a parent (BaseField) already owns the association.
  const inputId = Id || generatedId;

  const isDateMask = Mask === "9999-99-99";

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);

  const labelHorizontalSx = {
    color: FIELD.labelInk,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: 1,
    fontWeight: "400",
    paddingTop: "5px",
    marginRight: "0",
    textAlign: "left",
  };

  // NOTE: height and fontSize are deliberately absent. IMaskInput renders a
  // native <input> and takes a raw DOM `style` attribute, which cannot hold a
  // media query and would beat any emotion class - so a control sized here
  // could never grow for touch. Both live in the parent's `sx` as `& input`
  // instead (see maskedInputSx below).
  const inputStyle = {
    color: "#495057",
    backgroundColor: "#ffffff",
    fontWeight: "400",
    boxSizing: "border-box",
    padding: "0 10px",
    lineHeight: 1.5,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    outline: "none",
    border: "none",
    borderRadius: "0",
    width: "100%",
  };

  const [Value, setValue] = useState(() => {
    // Use Config.Value if it exists and is not empty, otherwise use defaultValue
    if (
      Config &&
      Config.Value !== undefined &&
      Config.Value !== null &&
      Config.Value !== ""
    ) {
      return String(Config.Value);
    }
    return String(defaultValue);
  });

  const onChangeValue = (newValue) => {
    const stringValue = newValue != null ? String(newValue) : "";

    // Validate date if using date mask
    if (isDateMask) {
      const valid = isValidDate(stringValue);
      setHasError(!valid);
    }

    Config && ChangeValue && ChangeValue(Config.Name, stringValue);
    setValue(stringValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validate on blur for date mask
    if (isDateMask) {
      setHasError(!isValidDate(Value));
    }
  };

  const errorBorderStyle = hasError ? "1px solid #f44336" : `1px solid ${FIELD.rowBorder}`;

  const { HideLabel } = props;

  if (HideLabel) {
    return (
      <GridContainer
        sx={{
          width: "100%",
          margin: 0,
          padding: 0,
          ...controlHeightSx,
          ...nativeInputSx,
        }}
      >
        <IMaskInput
          id={inputId}
          mask={Mask || (Config && Config.Mask) || ""}
          lazy={true}
          placeholderChar={MaskChar || (Config && Config.MaskChar) || "_"}
          definitions={{
            "#": /[a-zA-Zа-яА-Я]/,
            9: /\d/,
          }}
          value={Value != null ? String(Value) : ""}
          disabled={disabled}
          onAccept={(value) => onChangeValue(value)}
          inputRef={inputRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          style={{
            ...inputStyle,
            color: hasError ? "#f44336" : grayColor[14] || inputStyle.color,
            border: errorBorderStyle,
            padding: "0 10px",
          }}
        />
      </GridContainer>
    );
  }

  return (
    <GridContainer
      sx={(theme) => ({
        ...fieldRowSx(theme, { borderColor: FIELD.rowBorder }),
        // This control signals validation state on the row border, so it keeps
        // its own border rather than the shared one.
        border: errorBorderStyle,
        borderBottom: errorBorderStyle,
        ...(ContainerSx || {}),
      })}
    >
      <GridItem
        {...labelSize(effectiveMd)}
        sx={(theme) => ({
          ...labelCellSx(theme, { borderColor: FIELD.rowBorder }),
          justifyContent: "flex-start",
        })}
      >
        <FormLabel
          htmlFor={inputId}
          sx={{ ...labelHorizontalSx, paddingTop: 0, margin: 0 }}
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
          ...nativeInputSx,
          flexDirection: "row",
          justifyContent: "flex-start",
          position: "relative",
          zIndex: 1,
          padding: "0",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <IMaskInput
            id={inputId}
            mask={Mask || ""}
            lazy={true}
            placeholderChar={MaskChar}
            definitions={{
              "#": /[a-zA-Zа-яА-Я]/,
              9: /\d/,
            }}
            value={Value != null ? String(Value) : ""}
            disabled={disabled}
            onAccept={(value) => onChangeValue(value)}
            inputRef={inputRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            style={{
              ...inputStyle,
              color: hasError ? "#f44336" : grayColor[14] || inputStyle.color,
              height: "100%",
              padding: "0 10px",
            }}
          />
        </div>
      </GridItem>
    </GridContainer>
  );
}
