import { useTranslation } from "react-i18next";
import React, { useState } from "react";

import CustomInput from "components/CustomInput/CustomInput.jsx";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

export default function CustomTextField(props) {
  const { t } = useTranslation();
  const {
    Config = null,
    ChangeValue,
    FullWidth,
    Id = null,
    Width = "none",
    Disabled = false,
    ReadOnly = false,
  } = props;

  const [Value, setValue] = useState(
    Config && Config.Value ? Config.Value : "",
  );

  const onChange = (Value) => {
    let value = Value;
    if (ChangeValue && Config) {
      if (Config.Type === "Number") {
        if (parseFloat(value) < 0) {
          value = "0";
        }

        if (Config.min) {
          let minValue = parseInt(Config.min);
          if (parseFloat(value) < minValue) {
            value = minValue;
          }
        }
        if (value === "") {
          value = 0;
        }
      }
      ChangeValue && ChangeValue(Config.Name, value);
    }
    setValue(value);
  };

  if (Config) {
    return (
      <CustomInput
        // error={RuleError}
        formControlProps={{
          fullWidth: !!FullWidth,
          style: {
            paddingTop: "0",
            marginBottom: "0",
            backgroundColor: "#FFF",
            width: Width,
          },
        }}
        inputProps={{
          id: Id,
          value: Value,
          type: Config ? Config.Type : "Text",
          disabled: Disabled,
          readOnly: ReadOnly,
          onChange: (e) => onChange(e.target.value),
          disableUnderline: true,
          sx: {
            padding: "5px 8px",
            border: `1px solid ${FIELD.rowBorder}`,
            borderRadius: "4px",
            "&:hover:not(.Mui-disabled)": {
              border: `1px solid ${FIELD.inputBorderHover}`,
            },
            "&.Mui-focused": {
              border: `1px solid ${FIELD.inputBorderFocus}`,
            },
          },
        }}
      />
    );
  } else {
    return null;
  }
}
