import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @mui/material components
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Input from "@mui/material/Input";
import { styled } from "@mui/material/styles";

import {
  primaryColor,
  dangerColor,
  successColor,
  defaultFont,
  whiteColor,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";
// translation
import { useTranslation } from "react-i18next";
import { FIELD } from "customComponents/BaseEditControls/fieldRowStyles";

const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) => prop !== "hasLabel",
})(({ theme, hasLabel }) => ({
  margin: hasLabel ? "0 0 17px 0" : "0",
  paddingTop: hasLabel ? "20px" : "0",
  position: "relative",
  verticalAlign: "unset",
  "& svg,& .fab,& .far,& .fal,& .fas,& .material-icons": {
    color: grayColor[3],
  },
}));

const StyledInputLabel = styled(InputLabel, {
  shouldForwardProp: (prop) => prop !== "error" && prop !== "success",
})(({ theme, error, success }) => ({
  ...defaultFont,
  color: FIELD.labelInk + " !important",
  fontWeight: "400",
  fontSize: "14px",
  lineHeight: "1.42857",
  letterSpacing: "unset",
  "& + .MuiInput-underline": { marginTop: "0px" }, // Adjusted selector for sibling underline
  ...(error && { color: dangerColor[0] + " !important" }),
  ...(success && !error && { color: successColor[0] + " !important" }),
}));

const StyledInput = styled(Input, {
  shouldForwardProp: (prop) =>
    prop !== "white" && prop !== "error" && prop !== "success",
})(({ theme, white, error, success }) => ({
  color: FIELD.valueInk,
  height: "32px", // <<<< HEIGHT FIX (increased to match BaseInputMask)
  padding: "8px 12px", // <<<< increased from default ~7px 12px to proportionally match height
  borderTop: `1px solid ${FIELD.rowBorder}`,
  boxSizing: "border-box",
  "&,&::placeholder": {
    fontSize: "14px",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: "400",
    lineHeight: "1.42857",
    opacity: "1",
  },
  "&::placeholder": { color: FIELD.placeholder },
  ...(white && {
    "&,&::placeholder": { color: whiteColor, opacity: "1" },
  }),
  // Underline styles
  "&:after": { borderColor: primaryColor[0] },
  "&:hover:not(.Mui-disabled):before,&:before": {
    borderColor: FIELD.inputBorder + "!important",
    borderWidth: "1px !important",
  },
  "& + p": { fontWeight: "300" },
  ...(error && {
    "&:after": { borderColor: dangerColor[0] },
  }),
  ...(success &&
    !error && {
      "&:after": { borderColor: successColor[0] },
    }),
  ...(white && {
    "&:hover:not(.Mui-disabled):before,&:before": {
      backgroundColor: whiteColor,
    },
    "&:after": { backgroundColor: whiteColor },
  }),
  // Disabled state is handled by MUI default class .Mui-disabled which we shouldn't likely override too aggressively unless needed
  "&.Mui-disabled": {
    "&:before": { borderColor: "transparent !important" },
  },
}));

const StyledFormHelperText = styled(FormHelperText, {
  shouldForwardProp: (prop) => prop !== "error" && prop !== "success",
})(({ theme, error, success }) => ({
  ...(error && { color: dangerColor[0] + " !important" }),
  ...(success && !error && { color: successColor[0] + " !important" }),
}));

function CustomInput(props) {
  const { t } = useTranslation();
  const {
    formControlProps,
    labelText,
    id,
    labelProps,
    inputProps,
    error,
    white,
    inputRootCustomClasses,
    success,
    helperText,
  } = props;

  return (
    <StyledFormControl hasLabel={!!labelText} {...formControlProps}>
      {labelText && (
        <StyledInputLabel
          htmlFor={id}
          error={error}
          success={success}
          {...labelProps}
        >
          {t(labelText + "")}
        </StyledInputLabel>
      )}
      <StyledInput
        id={id}
        error={error}
        success={success}
        white={white}
        classes={{
          root: inputRootCustomClasses,
        }}
        {...inputProps}
      />
      {helperText && (
        <StyledFormHelperText id={id + "-text"} error={error} success={success}>
          {t(helperText + "")}
        </StyledFormHelperText>
      )}
    </StyledFormControl>
  );
}

CustomInput.propTypes = {
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  inputRootCustomClasses: PropTypes.string,
  error: PropTypes.bool,
  success: PropTypes.bool,
  white: PropTypes.bool,
  helperText: PropTypes.node,
};

export default CustomInput;
