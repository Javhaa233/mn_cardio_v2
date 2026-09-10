/**
 * Shared PropTypes for Base Controls
 * Provides consistent prop type definitions across all base controls
 */

import PropTypes from "prop-types";

/**
 * Base Config prop type
 * Used by all BaseField controls
 */
export const ConfigPropType = PropTypes.shape({
  // Field identification
  FieldName: PropTypes.string.isRequired,
  Type: PropTypes.string,

  // Display properties
  Label: PropTypes.string,
  Placeholder: PropTypes.string,
  Horizontal: PropTypes.bool,
  Visible: PropTypes.bool,
  Disabled: PropTypes.bool,
  ReadOnly: PropTypes.bool,

  // Value and data
  Value: PropTypes.any,
  DefaultValue: PropTypes.any,

  // Validation
  Validation: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      message: PropTypes.string,
    }),
  ),
  Required: PropTypes.bool,

  // Event handlers
  OnChange: PropTypes.func,
  OnFocus: PropTypes.func,
  OnBlur: PropTypes.func,
  OnClick: PropTypes.func,

  // Data source (for select/lookup controls)
  DataSource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  DisplayExpr: PropTypes.string,
  ValueExpr: PropTypes.string,

  // Styling
  Width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  Height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ClassName: PropTypes.string,
  Style: PropTypes.object,

  // Additional options
  Options: PropTypes.object,
  CustomData: PropTypes.any,
});

/**
 * Form name prop type
 * Required for Redux form state management
 */
export const FormNamePropType = PropTypes.string.isRequired;

/**
 * Validation rule prop type
 */
export const ValidationRulePropType = PropTypes.shape({
  type: PropTypes.oneOf([
    "required",
    "email",
    "pattern",
    "numeric",
    "range",
    "stringLength",
    "custom",
    "compare",
    "async",
  ]).isRequired,
  message: PropTypes.string,
  trim: PropTypes.bool,
  // For pattern validation
  pattern: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(RegExp),
  ]),
  // For range validation
  min: PropTypes.number,
  max: PropTypes.number,
  // For string length validation
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  // For compare validation
  comparisonTarget: PropTypes.func,
  comparisonType: PropTypes.oneOf([
    "==",
    "!=",
    "===",
    "!==",
    ">",
    ">=",
    "<",
    "<=",
  ]),
  // For custom validation
  validationCallback: PropTypes.func,
  // For async validation
  validationPromise: PropTypes.func,
});

/**
 * Data source prop type
 * Used for select boxes, lookups, etc.
 */
export const DataSourcePropType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.object),
  PropTypes.arrayOf(PropTypes.string),
  PropTypes.arrayOf(PropTypes.number),
  PropTypes.shape({
    store: PropTypes.any,
    filter: PropTypes.any,
    sort: PropTypes.any,
    paginate: PropTypes.bool,
    pageSize: PropTypes.number,
  }),
]);

/**
 * Base text input props
 */
export const BaseTextInputProps = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  autoFocus: PropTypes.bool,
};

/**
 * Base select/lookup props
 */
export const BaseSelectProps = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  dataSource: DataSourcePropType,
  value: PropTypes.any,
  onChange: PropTypes.func,
  displayExpr: PropTypes.string,
  valueExpr: PropTypes.string,
  searchEnabled: PropTypes.bool,
  searchExpr: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  placeholder: PropTypes.string,
};

/**
 * Base date/time props
 */
export const BaseDateTimeProps = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.number,
  ]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  format: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  showTime: PropTypes.bool,
  showCalendarButton: PropTypes.bool,
};

/**
 * Base checkbox/radio props
 */
export const BaseCheckboxRadioProps = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.any]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  checkedValue: PropTypes.any,
  uncheckedValue: PropTypes.any,
};

/**
 * Base file upload props
 */
export const BaseFileUploadProps = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  maxFileSize: PropTypes.number,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  uploadUrl: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
};

/**
 * Base number input props
 */
export const BaseNumberProps = {
  Config: ConfigPropType.isRequired,
  formName: FormNamePropType,
  value: PropTypes.number,
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  precision: PropTypes.number,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  showSpinButtons: PropTypes.bool,
  format: PropTypes.string,
};

/**
 * Common default props
 */
export const CommonDefaultProps = {
  disabled: false,
  readOnly: false,
  required: false,
};

export default {
  ConfigPropType,
  FormNamePropType,
  ValidationRulePropType,
  DataSourcePropType,
  BaseTextInputProps,
  BaseSelectProps,
  BaseDateTimeProps,
  BaseCheckboxRadioProps,
  BaseFileUploadProps,
  BaseNumberProps,
  CommonDefaultProps,
};
