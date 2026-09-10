import { useTranslation } from "react-i18next";
/**
 * Unified Field Hook
 * Consolidates useInput, useSelect, and useLocalSelect into a single, configurable hook
 * Handles all field types: text, number, select, date, checkbox, etc.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFieldValue, setFieldValidation } from "store/reducers/system/form";
import { getValue } from "utils/helper";

/**
 * @param {Object} config - Field configuration
 * @param {string} config.type - Field type: 'text', 'select', 'date', 'checkbox', 'number', etc.
 * @param {string} config.formName - Form name for Redux state
 * @param {string} config.fieldName - Field name
 * @param {Array} config.validation - Validation rules
 * @param {*} config.defaultValue - Default value
 * @param {Function} config.transform - Transform function for value changes
 * @param {Object|Array} config.dataSource - Data source for select fields
 * @param {string} config.valueExpr - Value expression for select fields
 * @param {string} config.displayExpr - Display expression for select fields
 * @param {Function} config.onChange - Custom onChange handler
 * @param {Function} config.onBlur - Custom onBlur handler
 * @param {Function} config.onFocus - Custom onFocus handler
 * @param {boolean} config.immediate - Validate immediately on change
 */
const useField = ({
  type = "text",
  formName,
  fieldName,
  validation = [],
  defaultValue,
  transform,
  dataSource,
  valueExpr = "id",
  displayExpr = "name",
  onChange: customOnChange,
  onBlur: customOnBlur,
  onFocus: customOnFocus,
  immediate = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const validatorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Get value from Redux store
  const storeValue = useSelector((state) => {
    if (!formName || !fieldName) return defaultValue;
    return (
      getValue(state, `form.${formName}.fields.${fieldName}.value`) ??
      defaultValue
    );
  });

  // Get validation state from Redux
  const storeValidation = useSelector((state) => {
    if (!formName || !fieldName) return null;
    return getValue(state, `form.${formName}.fields.${fieldName}.validation`);
  });

  // Local data source for select fields (if needed)
  const [localDataSource, setLocalDataSource] = useState(dataSource);

  const localDataSourceRef = useRef(dataSource);

  // Update local data source when prop changes
  useEffect(() => {
    if (
      dataSource &&
      JSON.stringify(dataSource) !== JSON.stringify(localDataSourceRef.current)
    ) {
      localDataSourceRef.current = dataSource;
      setLocalDataSource((prevDataSource) => {
        if (JSON.stringify(prevDataSource) !== JSON.stringify(dataSource)) {
          return dataSource;
        }
        return prevDataSource;
      });
    }
  }, [dataSource]);

  // Load data source if it's a function or promise
  useEffect(() => {
    let isMounted = true;

    if (type === "select" && typeof dataSource === "function") {
      setLoading((prevLoading) => (prevLoading ? prevLoading : true));
      Promise.resolve(dataSource())
        .then((data) => {
          if (isMounted) {
            setLocalDataSource((prevData) =>
              JSON.stringify(prevData) !== JSON.stringify(data)
                ? data
                : prevData,
            );
            setLoading((prevLoading) => (prevLoading ? false : prevLoading));
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Error loading data source:", error);
            setLocalError((prevError) =>
              JSON.stringify(prevError) !== JSON.stringify(error)
                ? error
                : prevError,
            );
            setLoading((prevLoading) => (prevLoading ? false : prevLoading));
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [type, dataSource]);

  /**
   * Validate field value against validation rules
   */
  const validate = useCallback(
    (valueToValidate) => {
      const val = valueToValidate !== undefined ? valueToValidate : storeValue;

      if (!validation || validation.length === 0) {
        return { isValid: true, brokenRules: [] };
      }

      const brokenRules = [];

      validation.forEach((rule) => {
        const { type: ruleType, message, ...ruleOptions } = rule;

        switch (ruleType) {
          case "required":
            if (
              val === null ||
              val === undefined ||
              val === "" ||
              (Array.isArray(val) && val.length === 0)
            ) {
              brokenRules.push({
                type: ruleType,
                message: message || "This field is required",
              });
            }
            break;

          case "email":
            if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
              brokenRules.push({
                type: ruleType,
                message: message || "Invalid email format",
              });
            }
            break;

          case "pattern":
            if (val && ruleOptions.pattern) {
              const pattern =
                typeof ruleOptions.pattern === "string"
                  ? new RegExp(ruleOptions.pattern)
                  : ruleOptions.pattern;
              if (!pattern.test(val)) {
                brokenRules.push({
                  type: ruleType,
                  message: message || "Invalid format",
                });
              }
            }
            break;

          case "numeric":
            if (val && isNaN(Number(val))) {
              brokenRules.push({
                type: ruleType,
                message: message || "Must be a number",
              });
            }
            break;

          case "range":
            const numVal = Number(val);
            if (ruleOptions.min !== undefined && numVal < ruleOptions.min) {
              brokenRules.push({
                type: ruleType,
                message: message || `Must be at least ${ruleOptions.min}`,
              });
            }
            if (ruleOptions.max !== undefined && numVal > ruleOptions.max) {
              brokenRules.push({
                type: ruleType,
                message: message || `Must be at most ${ruleOptions.max}`,
              });
            }
            break;

          case "stringLength":
            if (val) {
              if (ruleOptions.minLength && val.length < ruleOptions.minLength) {
                brokenRules.push({
                  type: ruleType,
                  message:
                    message ||
                    `Must be at least ${ruleOptions.minLength} characters`,
                });
              }
              if (ruleOptions.maxLength && val.length > ruleOptions.maxLength) {
                brokenRules.push({
                  type: ruleType,
                  message:
                    message ||
                    `Must be at most ${ruleOptions.maxLength} characters`,
                });
              }
            }
            break;

          case "custom":
            if (ruleOptions.validationCallback) {
              const result = ruleOptions.validationCallback(val);
              if (!result) {
                brokenRules.push({
                  type: ruleType,
                  message: message || "Validation failed",
                });
              }
            }
            break;

          default:
            console.warn(`Unknown validation type: ${ruleType}`);
        }
      });

      const isValid = brokenRules.length === 0;
      const result = { isValid, brokenRules, fieldName };

      // Update Redux validation state
      if (formName && fieldName) {
        dispatch(
          setFieldValidation({
            formName,
            fieldName,
            validation: result,
          }),
        );
      }

      return result;
    },
    [validation, storeValue, formName, fieldName, dispatch],
  );

  /**
   * Handle value change
   */
  const handleChange = useCallback(
    (newValue) => {
      // Apply transform function if provided
      const transformedValue = transform ? transform(newValue) : newValue;

      // Update Redux store
      if (formName && fieldName) {
        dispatch(
          setFieldValue({
            formName,
            fieldName,
            value: transformedValue,
          }),
        );
      }

      // Validate immediately if configured
      if (immediate) {
        validate(transformedValue);
      }

      // Call custom onChange handler
      if (customOnChange) {
        customOnChange(transformedValue);
      }
    },
    [
      formName,
      fieldName,
      transform,
      immediate,
      dispatch,
      validate,
      customOnChange,
    ],
  );

  /**
   * Handle blur event
   */
  const handleBlur = useCallback(() => {
    validate();

    if (customOnBlur) {
      customOnBlur();
    }
  }, [validate, customOnBlur]);

  /**
   * Handle focus event
   */
  const handleFocus = useCallback(() => {
    if (customOnFocus) {
      customOnFocus();
    }
  }, [customOnFocus]);

  /**
   * Reset field value to default
   */
  const reset = useCallback(() => {
    handleChange(defaultValue);
  }, [handleChange, defaultValue]);

  /**
   * Get display value for select fields
   */
  const getDisplayValue = useCallback(
    (value) => {
      if (!localDataSource || !Array.isArray(localDataSource)) {
        return value;
      }

      const item = localDataSource.find((item) => item[valueExpr] === value);
      return item ? item[displayExpr] : value;
    },
    [localDataSource, valueExpr, displayExpr],
  );

  // Validation state
  const isValid = storeValidation?.isValid ?? true;
  const errors = storeValidation?.brokenRules ?? [];
  const errorMessage = errors.length > 0 ? errors[0].message : "";

  return {
    // Value
    value: storeValue ?? defaultValue,
    displayValue: type === "select" ? getDisplayValue(storeValue) : storeValue,

    // Data source (for select fields)
    dataSource: localDataSource,

    // Event handlers
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,

    // Validation
    validate,
    isValid,
    errors,
    errorMessage,
    validatorRef,

    // State
    loading,
    error: localError,

    // Utilities
    reset,
    getDisplayValue,
  };
};

export default useField;
