import { useTranslation } from "react-i18next";
import React, { useRef, useState, useEffect } from "react";
import { getValue } from "utils/helper";
import { useSelector } from "react-redux";

export default ({
  store,
  name,
  selector,
  setValidate,
  validationRules,
  ...props
}) => {
  const inputRef = useRef();
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Watch for refresh signal from form state
  const refresh =
    selector && selector.state
      ? useSelector((state) => {
          return getValue(state, `${selector.state}.refresh`);
        })
      : null;

  // On mount, get initial value from store
  useEffect(() => {
    if (store && selector && selector.value) {
      const newValue = getValue(store.getState(), selector.value);
      setValue(newValue);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle refresh
  useEffect(() => {
    if (refresh && store && selector && selector.value) {
      const newValue = getValue(store.getState(), selector.value);
      setValue(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const chooseFile = async (e) => {
    e.preventDefault();
    const files = e.target.files;

    console.log("chooseFile called, files:", files);
    console.log("loading state:", loading);

    if (files && files.length === 1) {
      const file = files[0];
      console.log("Selected file:", file);
      changeValue({
        file: file,
        ext: file.type,
      });

      inputRef.current.value = "";
    }
  };

  const remove = () => {
    changeValue(null);
  };

  const download = async (data) => {
    props.download && props.download(data, name);
  };

  const changeValue = (v) => {
    console.log("changeValue called with:", v);
    console.log("loading:", loading);
    console.log("props.changeValue exists:", !!props.changeValue);

    if (!loading) {
      setValue(v);
      props.changeValue && props.changeValue(v, name);
      console.log("setValue and props.changeValue called");
    } else {
      console.log("Skipped because loading is true");
    }
  };

  return {
    inputRef,
    chooseFile,
    value,
    changeValue,
    remove,
    download,
  };
};
