import { useTranslation } from "react-i18next";
import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@mui/material";
import useInput from "newComponents/BaseControls/useInput";

const BaseTextBox = ({ config = {}, ...props }) => {
  const { t } = useTranslation();
  const { value, changeValue, validate, validatorRef, loading } =
    useInput(props);

  const handleChange = (event) => {
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
    ...config,
    // Map devextreme-specific properties to MUI equivalents
    InputProps: {
      ...config?.InputProps,
    },
    InputLabelProps: {
      ...config?.InputLabelProps,
    },
  };

  // Handle placeholder translation if needed
  if (config?.placeholder) {
    muiProps.placeholder = config.placeholder;
  }

  return <TextField {...muiProps} />;
};

BaseTextBox.propTypes = {
  config: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    maxLength: PropTypes.number,
    multiline: PropTypes.bool,
    rows: PropTypes.number,
    type: PropTypes.string,
    InputProps: PropTypes.object,
    InputLabelProps: PropTypes.object,
  }),
  formName: PropTypes.string,
  fieldName: PropTypes.string,
  dataField: PropTypes.string,
  validation: PropTypes.array,
};

export default BaseTextBox;
