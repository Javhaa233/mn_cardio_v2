import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
// @mui/material components
import TextField from "@mui/material/TextField";
// helper
// import Helper from "helper";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

// Format number with thousands separator
const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  const numStr = String(value).replace(/,/g, "");
  if (numStr === "" || isNaN(numStr)) return value;
  return Number(numStr).toLocaleString("en-US");
};

// Parse formatted number back to raw number
const parseNumber = (value) => {
  if (!value && value !== 0) return 0;
  const cleaned = String(value).replace(/,/g, "");
  return cleaned === "" ? 0 : Number(cleaned);
};

export default function CustomTextField(props) {
  const {
    Value = 0,
    Field,
    ChangeValue,
    Label = null,
    Type = "text",
    IsDisabled = false,
    Style = {},
  } = props;

  const [displayValue, setDisplayValue] = useState(
    Type === "number" ? formatNumber(Value) : Value,
  );
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(Value);

  useEffect(() => {
    // Only update from external Value prop when not focused
    if (!isFocused) {
      setInternalValue(Value);
      if (Type === "number") {
        setDisplayValue(formatNumber(Value));
      } else {
        setDisplayValue(Value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Value]);

  const handleChange = (event) => {
    const value = event.target.value;

    if (Type === "number") {
      // Allow typing numbers and commas
      const cleaned = value.replace(/[^0-9]/g, "");
      setDisplayValue(cleaned);

      // Update the actual value (as number)
      const numValue = cleaned === "" ? 0 : Number(cleaned);
      setInternalValue(numValue);
      Field && ChangeValue && ChangeValue(Field, numValue);
    } else {
      setDisplayValue(value);
      setInternalValue(value);
      Field && ChangeValue && ChangeValue(Field, value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (Type === "number") {
      // Show raw number without formatting when focused
      const rawValue = parseNumber(displayValue);
      setDisplayValue(rawValue === 0 ? "" : String(rawValue));
    }
  };

  const handleBlur = () => {
    if (Type === "number") {
      // Format the number when focus is lost
      const numValue = displayValue === "" ? 0 : Number(displayValue);
      setInternalValue(numValue);
      setDisplayValue(formatNumber(numValue));
      Field && ChangeValue && ChangeValue(Field, numValue);
    }
    setIsFocused(false);
  };

  return (
    <TextField
      fullWidth
      label={Label}
      variant="outlined"
      type={Type === "number" ? "text" : Type}
      style={{ fontWeight: "400", ...Style }}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": { border: "none" },
          "&:hover fieldset": { border: "none" },
          "&.Mui-focused fieldset": {
            border: "none",
          },
        },
        "& .MuiInputBase-input": {
          color: grayColor[14],
          height: "unset",
          padding: "4px 0px",
          fontSize: "14px",
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: "400",
          lineHeight: 1.5,
          opacity: "1",
          "&::placeholder": { color: "#ccc" },
          textAlign: Type === "number" ? "right" : "left",
        },
      }}
      disabled={IsDisabled}
    />
  );
}
