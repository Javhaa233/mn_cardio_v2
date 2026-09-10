import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from "react";
import { getFileSrc, getValue } from "utils/helper";
import { v4 as uuidv4 } from "uuid";
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
  const [labelText, setLabelText] = useState("");
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

    // Ensure we work with an array
    let newValue = Array.isArray(value) ? [...value] : value ? [value] : [];

    for (var l = 0; l < files.length; l++) {
      const file = files[l];

      newValue.push({
        id: uuidv4(),
        file: file,
        ext: file.type, // Use MIME type for preview logic
        orginalName: file.name,
      });
    }

    changeValue(newValue);
    inputRef.current.value = "";
  };

  const remove = (data) => {
    let newValue = Array.isArray(value) ? [...value] : value ? [value] : [];
    newValue = newValue.filter((s) => s.id + "" !== data.id + "");
    changeValue(newValue);
  };

  const download = async (data) => {
    props.download && props.download(data, name);
  };

  const changeValue = (v) => {
    if (!loading) {
      setValue(v);
      props.changeValue && props.changeValue(v, name);
    }
  };

  return {
    inputRef,
    chooseFile,
    value,
    changeValue,
    remove,
    download,
    labelText,
  };
};
