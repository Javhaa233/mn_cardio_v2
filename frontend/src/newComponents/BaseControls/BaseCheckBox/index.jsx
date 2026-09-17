import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

import useInput from "newComponents/BaseControls/useInput";

export default ({ config, ...props }) => {
  const { value, changeValue, validatorRef } = useInput(props);

  const handleChange = (event) => {
    changeValue(event.target.checked);
  };

  // Create a label if provided in config
  if (config?.label) {
    return (
      <FormControlLabel
        control={
          <Checkbox checked={!!value} onChange={handleChange} {...config} />
        }
        label={config.label}
      />
    );
  } else {
    return <Checkbox checked={!!value} onChange={handleChange} {...config} />;
  }
};
