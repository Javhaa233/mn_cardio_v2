import React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import useInput from "newComponents/BaseControls/useInput";

export default ({ config, ...props }) => {
  const { value, changeValue, validatorRef, validate } = useInput(props);

  const handleChange = (newValue) => {
    // Format the date as yyyy-MM-dd if the value is valid
    if (newValue && newValue.isValid && newValue.isValid()) {
      changeValue(newValue.format("YYYY-MM-DD"));
    } else {
      changeValue(null);
    }
  };

  const handleBlur = () => {
    validate();
  };

  // Convert devextreme config properties to MUI props
  const muiProps = {
    format: "YYYY-MM-DD",
    slotProps: {
      textField: {
        variant: "outlined",
        fullWidth: true,
        onBlur: handleBlur,
        className: "input-bold500",
        sx: {
          // Height, padding and radius come from the shared control scale in
          // src/theme.js. This used to pin itself to 26px, 6px shorter than
          // every field beside it.
          ...config?.slotProps?.textField?.sx,
        },
        ...config?.slotProps?.textField,
      },
    },
    ...config,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        {...muiProps}
      />
    </LocalizationProvider>
  );
};
