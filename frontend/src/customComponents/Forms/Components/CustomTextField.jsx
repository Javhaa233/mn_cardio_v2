import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import TextField from "@mui/material/TextField";

import styles from "assets/jss/material-dashboard-pro-react/custom/baseControlsStyles";

export default function CustomTextField(props) {
  const { t } = useTranslation();
  const {
    Value = "",
    Label = "",
    placeholder = "",
    ChangeValue,
    sx = {},
  } = props;

  const [currentValue, setCurrentValue] = useState("");

  useEffect(() => {
    if (Value !== currentValue) setCurrentValue(Value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Value]);

  return (
    <TextField
      size="small"
      variant={"outlined"}
      label={t(Label + "")}
      value={currentValue}
      InputProps={{ readOnly: false }}
      sx={{
        ...sx,
        "& .MuiInputBase-input": styles.input,
      }}
      placeholder={t(placeholder + "")}
      onChange={(event) => {
        const value = event.target.value;
        setCurrentValue(value);
        ChangeValue && ChangeValue(value);
      }}
    />
  );
}
