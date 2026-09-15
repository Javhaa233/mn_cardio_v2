import React, { useState } from "react";
// @mui/material components
import InputAdornment from "@mui/material/InputAdornment";
// default components
import CustomInput from "components/CustomInput/CustomInput.jsx";
import { FIELD } from "./fieldRowStyles";

export default function BaseCustomTextField(props) {
  const {
    Config = null,
    ChangeValue,
    FullWidth,
    Width = "none",
    Disabled = false,
    NoLabel = false,
  } = props;

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : "",
  );

  const onChangeValue = (Value) => {
    setValue(Value);
    Config && ChangeValue && ChangeValue(Config.Name, Value);
  };

  return (
    <CustomInput
      formControlProps={{
        fullWidth: FullWidth,
        style: {
          paddingTop: "0",
          backgroundColor: "#FFF",
          width: Width,
        },
      }}
      inputProps={{
        value: Value ? Value : "",
        onChange: (e) => onChangeValue(e.target.value),
        type: Config ? Config.Type : "Text",
        disabled: Disabled,
        sx: {
          // CustomInput's StyledInput declares `padding: 8px 12px` on the input
          // root; the theme only pads the inner element, so this stays.
          padding: "0 14px",
          boxSizing: "border-box",
        },
        startAdornment: NoLabel ? null : (
          <InputAdornment position="start">
            <span
              style={{
                fontSize: "14px",
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: "400",
                lineHeight: "1.42857",
                opacity: "1",
                color: FIELD.labelInk,
              }}
            >
              {Config && Config.Label
                ? Config.Label + (Config.Required ? " *" : "") + ":"
                : ""}
            </span>
          </InputAdornment>
        ),
      }}
    />
  );
}
