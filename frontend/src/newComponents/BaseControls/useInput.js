import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getValue } from "utils/helper";

export default ({
  store,
  name,
  selector,
  setValidate,
  validationRules,
  ...props
}) => {
  const { t } = useTranslation();
  const validatorRef = useRef();
  const [value, setValue] = useState(null);
  const [config, setConfig] = useState(props.config ? props.config : {});
  const [loading, setLoading] = useState(true);

  const refresh =
    selector && selector.state
      ? useSelector((state) => {
          return getValue(state, `${selector.state}.refresh`);
        })
      : null;

  const rxConfig =
    selector && selector.state
      ? useSelector((state) => {
          return getValue(state, `${selector.state}.config`);
        })
      : null;

  useEffect(() => {
    setConfig({ ...config, ...rxConfig });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rxConfig]);

  useEffect(() => {
    if (props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    if (refresh) {
      if (store) {
        const newValue = getValue(store.getState(), selector.value);
        setValue(newValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const validate = async () => {
    if (
      setValidate &&
      Array.isArray(validationRules) &&
      validationRules.length > 0
    ) {
      if (
        validatorRef.current &&
        validatorRef.current.instance &&
        validatorRef.current.instance.validate
      ) {
        const res = validatorRef.current.instance.validate();
        if (res.status === "pending") {
          return new Promise((resolve, reject) => {
            res.complete.then((r) => {
              resolve({
                isValid: r.isValid,
                fieldName: name,
                brokenRules: r.brokenRules
                  ? r.brokenRules.map((s) => s.message)
                  : [],
              });
            });
          });
        }
        return {
          isValid: res.isValid,
          fieldName: name,
          brokenRules: res.brokenRules
            ? res.brokenRules.map((s) => s.message)
            : [],
        };
      }
    }
    return null;
  };

  useEffect(() => {
    if (Array.isArray(validationRules) && validationRules.length > 0) {
      setValidate({ fieldName: name, validate: validate });
    }
    if (store) {
      const newValue = getValue(store.getState(), selector.value);
      setValue(newValue);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeValue = (v) => {
    if (!loading) {
      setValue(v);
      props.changeValue && props.changeValue(v, name);
    }
  };

  return {
    name,
    value,
    loading,
    setValue,
    changeValue,
    validate,
    validatorRef,
    config,
  };
};
