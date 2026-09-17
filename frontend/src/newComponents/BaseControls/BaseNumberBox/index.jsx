import React from "react";
import useInput from "../useInput";
import { TextField } from "@mui/material";

export default ({ config, ...props }) => {
  const { value, changeValue, validate, validatorRef } = useInput(props);

  const handleChange = (event) => {
    const newValue = event.target.value;
    // Convert to number if it's a valid number, otherwise pass as is
    const numericValue = newValue === "" ? null : Number(newValue);
    changeValue(numericValue);
  };

  const handleBlur = () => {
    validate();
  };

  // Convert devextreme config properties to MUI props
  const muiProps = {
    variant: "outlined",
    type: "number",
    fullWidth: true,
    value: value || "",
    onChange: handleChange,
    onBlur: handleBlur,
    InputProps: {
      ...config?.InputProps,
      inputProps: {
        step: config.step || "any", // Allow any decimal step, or specific step if provided
        min: config.min,
        max: config.max,
        ...config?.InputProps?.inputProps,
      },
    },
    InputLabelProps: {
      ...config?.InputLabelProps,
    },
    ...config,
  };

  // Handle precision by adding step based on precision
  if (config.format && config.format.precision === 2) {
    muiProps.InputProps.inputProps.step = "0.01";
  }

  return <TextField {...muiProps} />;
};
