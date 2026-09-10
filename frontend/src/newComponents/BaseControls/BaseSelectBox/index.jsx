import React, { useState, useEffect } from "react";
// translation
import { useTranslation } from "react-i18next";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";

import useSelect from "../useSelect";

export default ({ config, ...props }) => {
  const { t } = useTranslation();

  const { dataSource, value, changeValue, validate, validatorRef } = useSelect({
    config,
    ...props,
  });

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!dataSource) {
        setOptions([]);
        return;
      }

      if (Array.isArray(dataSource)) {
        setOptions(dataSource);
      } else if (dataSource && typeof dataSource.load === "function") {
        setLoading(true);
        try {
          const result = await dataSource.load({});
          // Handle both formats: { data: [...] } and direct array
          const data = result?.data || result || [];
          setOptions(data);
        } catch (error) {
          console.error("Error loading select options:", error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [dataSource]);

  const handleChange = (event) => {
    changeValue(event.target.value);
  };

  const handleBlur = () => {
    validate();
  };

  // Create placeholder option
  const placeholderOption =
    config.placeholder !== undefined ? config.placeholder : t("-- Select --");

  // Extract custom props that shouldn't be passed to MUI Select
  const { valueExpr, displayExpr, ...muiConfig } = config || {};

  // Handle searchEnabled and searchMode functionality with MUI
  const muiProps = {
    value: value || "",
    onChange: handleChange,
    onBlur: handleBlur,
    input: <OutlinedInput label={config.label || ""} />,
    fullWidth: true,
    disabled: loading,
    ...muiConfig,
  };

  // Render menu items
  const menuItems = options.map((item) => (
    <MenuItem key={item[valueExpr || "id"]} value={item[valueExpr || "id"]}>
      {item[displayExpr || "text"]}
    </MenuItem>
  ));

  return (
    <FormControl variant="outlined" fullWidth>
      {config.label && <InputLabel>{config.label}</InputLabel>}
      <Select
        {...muiProps}
        endAdornment={
          loading ? (
            <CircularProgress size={20} sx={{ marginRight: 2 }} />
          ) : null
        }
      >
        {!value && (
          <MenuItem value="" disabled>
            {placeholderOption}
          </MenuItem>
        )}
        {menuItems}
        {/* Add clear button functionality */}
        {value && config.showClearButton && <MenuItem value="">Clear</MenuItem>}

        {/* Prevent MUI out-of-range error by rendering the current value if missing from options */}
        {value &&
          options.length > 0 &&
          !options.some((opt) => opt[valueExpr || "id"] === value) && (
            <MenuItem value={value} style={{ display: "none" }}>
              {value}
            </MenuItem>
          )}
      </Select>
    </FormControl>
  );
};
