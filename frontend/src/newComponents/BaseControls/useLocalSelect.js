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
  const [dataSource, setDataSource] = useState(null);
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(props.config ? props.config : {});

  const rootFilter =
    selector && selector.state
      ? useSelector((state) => {
          return getValue(state, `${selector.state}.rootFilter`);
        })
      : null;

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

  const storeDataSource =
    selector && selector.state
      ? useSelector((state) => {
          return getValue(state, `${selector.state}.dataSource`);
        })
      : [];

  const loadDataSource = async () => {
    if (Array.isArray(props.dataSource)) {
      setDataSource(props.dataSource);
    }
    if (props.dataSource && typeof props.dataSource === "function") {
      const ds = await props.dataSource(rootFilter);
      setDataSource(ds.data.rows);
    }
  };

  useEffect(() => {
    if (refresh) {
      if (store) {
        const newValue = getValue(store.getState(), selector.value);
        setValue(newValue);
        loadDataSource();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    if (
      selector &&
      selector.dataSource &&
      storeDataSource &&
      Array.isArray(storeDataSource)
    ) {
      setDataSource(storeDataSource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeDataSource]);

  useEffect(() => {
    loadDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, props.dataSource, rootFilter]);

  const changeValue = (v) => {
    if (!loading) {
      setValue(v);
      props.changeValue && props.changeValue(v, name);
    }
  };

  const validate = async () => {
    if (
      setValidate &&
      validationRules &&
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
    if (
      setValidate &&
      validationRules &&
      Array.isArray(validationRules) &&
      validationRules.length > 0
    ) {
      setValidate({ fieldName: name, validate: validate });
    }
    if (store) {
      const newValue = getValue(store.getState(), selector.value);
      setValue(newValue);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setConfig({ ...config, ...rxConfig });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rxConfig]);

  return {
    loading,
    changeValue,
    validatorRef,
    value,
    dataSource,
    validate,
  };
};
