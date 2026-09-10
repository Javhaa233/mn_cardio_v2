import React, { useEffect, useCallback } from "react";
import { useBaseForm } from "newComponents/BaseForm";
import { getValue, getFileSrc } from "utils/helper";
import { setAlert } from "store/reducers/system";
import {
  validationRules,
  update,
  create,
} from "store/reducers/core/Organization";

import {
  setFieldValue,
  setEditDataAndModify,
  setValidate,
  setVisible,
  disposeForm,
  setFieldsValueAndRefresh,
  setFieldState,
} from "store/reducers/system/form";

import { useDispatch, useSelector } from "react-redux";
import store from "store/index";
import Config from "./config";

export default ({ saved, ...props }) => {
  const formName = props.formName;

  const dispatch = useDispatch();

  const config = Config(dispatch);

  const visible = useSelector((state) =>
    getValue(state, `form.${formName}.visible`),
  );

  const onChangedValue = ({ fieldName, value }) => {
    if (fieldName === "addr_prov_city") {
      const modifyData = {
        addr_soum_dist: null,
        addr_bag_khoroo: null,
      };
      modifyData.addr_prov_city = value;
      dispatch(
        setFieldState({
          formName,
          fieldName: "addr_soum_dist",
          values: { rootFilter: ["id_province", "=", value] },
        }),
      );
      dispatch(
        setFieldState({
          formName,
          fieldName: "addr_bag_khoroo",
          values: { rootFilter: ["id_soum", "=", -1] },
        }),
      );
      dispatch(setFieldsValueAndRefresh({ formName, values: modifyData }));
    }

    if (fieldName === "addr_soum_dist") {
      const modifyData = {
        addr_bag_khoroo: null,
      };
      modifyData.addr_soum_dist = value;
      dispatch(
        setFieldState({
          formName,
          fieldName: "addr_bag_khoroo",
          values: { rootFilter: ["id_soum", "=", value] },
        }),
      );
      dispatch(setFieldsValueAndRefresh({ formName, values: modifyData }));
    }
  };

  const editData = useSelector((state) =>
    getValue(state, `form.${formName}.editData`),
  );

  const { validate, renderFields } = useBaseForm({
    store,
    formName,
    useBorderedLayout: true,
    setFieldValue: ({ fieldName, value }) => {
      console.log("setFieldValue called with:", { fieldName, value, formName });
      dispatch(setFieldValue({ fieldName, value, formName }));
    },
    setValidate: ({ fieldName, validate }) =>
      dispatch(setValidate({ fieldName, validate, formName })),
    validationRules,
    onChangedValue,
  });

  const hide = () => {
    dispatch(setVisible({ formName, visible: false }));
    dispatch(setEditDataAndModify({ formName, data: {} }));
  };

  const close = useCallback(() => {
    dispatch(disposeForm(formName));
  }, [dispatch, formName]);

  useEffect(() => {}, []);

  const save = async (callback) => {
    const state = store.getState();
    const modifyData = getValue(state, `form.${formName}.modifyData`);
    const editData = getValue(state, `form.${formName}.editData`);
    const fields = getValue(state, `form.${formName}.fields`);

    const validateResult = await validate(fields);
    if (!validateResult.isValid) {
      dispatch(
        setAlert({
          success: false,
          message: validateResult.errorMessages.join(". "),
        }),
      );
      callback && callback();
      return;
    }

    // Prepare data for save
    const dataToSave = { ...modifyData };

    console.log("modifyData:", modifyData);
    console.log("dataToSave.Logo before processing:", dataToSave.Logo);

    // Convert Logo file to base64 if present
    // BaseFileUploader returns an array, so we need to handle both formats
    if (dataToSave.Logo) {
      // Handle array format from BaseFileUploader
      if (Array.isArray(dataToSave.Logo) && dataToSave.Logo.length > 0) {
        const logoItem = dataToSave.Logo[0]; // Get first file (single upload)
        if (logoItem && logoItem.file) {
          const base64 = await getFileSrc(logoItem.file);
          dataToSave.Logo = base64;
        } else if (logoItem && logoItem.uri) {
          // Already saved image from backend
          dataToSave.Logo = logoItem.uri;
        } else {
          delete dataToSave.Logo;
        }
      }
      // Handle single object format (from BaseSingleImage or legacy data)
      else if (dataToSave.Logo.file) {
        const base64 = await getFileSrc(dataToSave.Logo.file);
        dataToSave.Logo = base64;
      } else if (dataToSave.Logo.uri) {
        // Already saved image
        dataToSave.Logo = dataToSave.Logo.uri;
      } else if (typeof dataToSave.Logo === "string") {
        // Already base64 or data URI
        // Keep as is
      } else {
        delete dataToSave.Logo;
      }
    } else if (dataToSave.Logo === null) {
      dataToSave.Logo = null;
    } else {
      delete dataToSave.Logo;
    }

    console.log(
      "dataToSave.Logo after processing:",
      dataToSave.Logo
        ? dataToSave.Logo.substring
          ? dataToSave.Logo.substring(0, 100) + "..."
          : dataToSave.Logo
        : dataToSave.Logo,
    );

    let saveResult = null;
    const finalData = { ...editData, ...dataToSave };

    if (editData.Id) {
      saveResult = await dispatch(
        update({ formName, id: editData.Id, data: finalData }),
      );
    } else {
      saveResult = await dispatch(create({ formName, data: finalData }));
    }

    if (saveResult === true) {
      saved && saved();
      close();
    }
    callback && callback();
  };

  return {
    visible,
    save,
    renderFields,
    config,
    close,
    editData,
    setFieldValue: (fieldName, value) =>
      dispatch(setFieldValue({ fieldName, value, formName })),
  };
};
