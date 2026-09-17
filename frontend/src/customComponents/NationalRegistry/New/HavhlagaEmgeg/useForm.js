import { useEffect } from "react";
import { useBaseForm } from "newComponents/BaseForm";
import { getValue } from "utils/helper";
import { setAlert } from "store/reducers/system";
import {
  validationRules,
  update,
  create,
} from "store/reducers/core/HavhlagaEmgeg";

import {
  setFieldValue,
  setEditDataAndModify,
  setValidate,
  setVisible,
  disposeForm,
} from "store/reducers/system/form";

import { useDispatch, useSelector } from "react-redux";
import store from "store/index";
import Config from "./config";

export default ({ saved, formName }) => {
  const dispatch = useDispatch();

  const config = Config(dispatch);

  const visible = useSelector((state) =>
    getValue(state, `form.${formName}.visible`),
  );

  const { validate, renderFields } = useBaseForm({
    store,
    formName,
    setFieldValue: ({ fieldName, value }) =>
      dispatch(setFieldValue({ fieldName, value, formName })),
    setValidate: ({ fieldName, validate }) =>
      dispatch(setValidate({ fieldName, validate, formName })),
    validationRules,
  });

  const hide = () => {
    dispatch(setVisible({ formName, visible: false }));
    dispatch(setEditDataAndModify({ formName, data: {} }));
  };

  const close = () => {
    dispatch(disposeForm(formName));
  };

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

    let saveResult = null;
    if (editData.id) {
      saveResult = await dispatch(
        update({ formName, id: editData.id, data: { ...modifyData } }),
      );
    } else {
      saveResult = await dispatch(
        create({ formName, data: { ...modifyData } }),
      );
    }
    if (saveResult) {
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
  };
};
