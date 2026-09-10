import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Excel from "exceljs";
import { getValue } from "utils/helper";
import useBaseForm from "newComponents/BaseForm/useBaseForm";
import {
  setFieldValue,
  setValidate,
  disposeForm,
  setFieldState,
  setLoading,
  setFieldsValueAndRefresh,
} from "store/reducers/system/form";
import Config, { layout } from "./config";
import { loadSheets, loadDataByConfig } from "newComponents/ExcelImport/utils";
import store from "store";

export default ({
  formName,
  dataConfig,
  formConfig,
  validationRules,
  ...props
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const config = formConfig ? formConfig(dispatch) : Config(dispatch);

  const details = useSelector((state) =>
    getValue(state, `form.${formName}.editData.details`),
  );

  const visible = useSelector((state) =>
    getValue(state, `form.${formName}.visible`),
  );

  const onChangedValue = ({ fieldName, value }) => {
    if (fieldName === "file") {
      loadSheets(value, (sheets) => {
        dispatch(
          setFieldState({
            formName,
            fieldName: "sheet",
            values: { dataSource: sheets },
          }),
        );

        if (sheets.length === 1) {
          dispatch(
            setFieldsValueAndRefresh({
              formName,
              values: { sheet: sheets[0] },
            }),
          );
        }
      });
    }
  };

  const { validate, renderFields } = useBaseForm({
    store,
    formName,
    validationRules,
    onChangedValue: props.onChangedValue
      ? props.onChangedValue
      : onChangedValue,
    setFieldValue: ({ fieldName, value }) =>
      dispatch(setFieldValue({ fieldName, value, formName })),
    setValidate: ({ fieldName, validate }) =>
      dispatch(setValidate({ fieldName, validate, formName })),
  });

  const getWorksheet = (callBack) => {
    const state = store.getState();
    const sheet = getValue(state, `form.${formName}.editData.sheet`);
    const file = getValue(state, `form.${formName}.editData.file`);
    if (!sheet) {
      dispatch(setFieldValue({ formName, fieldName: "details", value: [] }));
      return;
    }

    const wb = new Excel.Workbook();
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = reader.result;
      wb.xlsx.load(buffer).then((workbook) => {
        callBack(workbook.getWorksheet(sheet));
      });
    };
  };

  const loadData = (customLoadData) => {
    getWorksheet((ws) => {
      if (customLoadData) {
        const data = customLoadData(ws);
        dispatch(setFieldsValueAndRefresh({ formName, values: data }));
      } else {
        if (dataConfig) {
          const data = loadDataByConfig({ ws, config: dataConfig });
          dispatch(setFieldsValueAndRefresh({ formName, values: data }));
        }
      }
    });
  };

  const save = async (customSave) => {
    if (customSave) {
      dispatch(setLoading({ formName, loading: true }));
      const result = await customSave(details);
      dispatch(setLoading({ formName, loading: false }));
      if (result) close();
    }
  };

  const close = () => {
    dispatch(disposeForm(formName));
  };

  return {
    config,
    visible,
    close,
    loadData,
    details,
    save,
    renderFields,
    getWorksheet,
    loadDataByConfig,
    validate,
    layout,
  };
};
