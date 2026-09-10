import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
// @mui/material components
import TextField from "@mui/material/TextField";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

export default function CustomTextArea(props) {
  const { t } = useTranslation();
  const { Value, ChangeValue } = props;

  const [currentValue, setCurrentValue] = useState(Value || "");

  useEffect(() => {
    const newValue = Value || "";
    if (newValue !== currentValue) {
      setCurrentValue(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Value]);

  return (
    <TextField
      value={currentValue}
      onChange={(event) => {
        const value = event.target.value;
        setCurrentValue(value);
        ChangeValue && ChangeValue(value);
      }}
      // placeholder="Нэмэлт тайлбар..."
      variant="outlined"
      multiline
      minRows={6}
      fullWidth
      sx={{
        "& .MuiOutlinedInput-multiline": { padding: "12px" },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#ccc", borderRadius: 0 },
          "&:hover fieldset": { borderColor: "#5c5c5c" },
          "&.Mui-focused fieldset": {
            borderColor: "#5c5c5c",
            borderWidth: "1px",
          },
        },
        "& .MuiInputBase-input": {
          color: grayColor[14],
          height: "unset",
          fontSize: "14px",
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: "400",
          lineHeight: 1,
          opacity: "1",
          "&::placeholder": { color: grayColor[3] },
        },
      }}
    />
  );
}
