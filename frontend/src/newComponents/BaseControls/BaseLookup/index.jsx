import React from "react";
// translation
import { useTranslation } from "react-i18next";

import useSelect from "newComponents/BaseControls/useSelect";
import { Autocomplete, TextField } from "@mui/material";

export default ({ config, ...props }) => {
  const { t } = useTranslation();

  const { dataSource, value, changeValue, validate, validatorRef } = useSelect({
    config,
    ...props,
  });

  const selectedValue = Array.isArray(dataSource)
    ? dataSource.find(
        (i) =>
          i[config.valueExpr || "id"] === value ||
          i[config.valueExpr || "id"] + "" === value + "",
      ) || null
    : null;

  return (
    <Autocomplete
      options={dataSource || []}
      getOptionLabel={(option) => option[config.displayExpr || "text"] || ""}
      value={selectedValue}
      onChange={(event, newValue) => {
        changeValue(newValue ? newValue[config.valueExpr || "id"] : null);
      }}
      onBlur={validate}
      renderInput={(params) => (
        <TextField
          {...params}
          label={config.label || t("-- Select --")}
          variant="outlined"
          error={false} // TODO: Implement validation state if needed
        />
      )}
      {...config}
    />
  );
};
