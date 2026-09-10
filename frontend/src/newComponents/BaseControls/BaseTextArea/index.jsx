import { useTranslation } from "react-i18next";
import React from "react";
import useInput from "newComponents/BaseControls/useInput";
import { TextField } from "@mui/material";

export default ({ config, ...props }) => {
  const { value, changeValue, validate, validatorRef } = useInput(props);

  const handleChange = (event) => {
    const { t } = useTranslation();
    changeValue(event.target.value);
  };

  const handleBlur = () => {
    validate();
  };

  // Convert devextreme config properties to MUI props
  const muiProps = {
    variant: "outlined",
    fullWidth: true,
    value: value || "",
    onChange: handleChange,
    onBlur: handleBlur,
    multiline: true,
    minRows: 4,
    maxRows: 10,
    ...config,
    // Apply any custom styles, merging with config
    sx: {
      ...config?.sx,
      color: config.style?.color || "red", // Default to red as in original
    },
  };

  // Handle height property if needed
  if (config.height) {
    muiProps.sx = { ...muiProps.sx, height: config.height };
  }

  return <TextField {...muiProps} />;
};
