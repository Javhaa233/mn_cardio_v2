import i18n from "i18n";
import React, { useEffect } from "react";
import { useBaseForm } from "newComponents/BaseForm";
import { getValue } from "utils/helper";
import {
  setFieldValue,
  setEditDataAndModify,
  disposeForm,
} from "store/reducers/system/form";
import { useDispatch } from "react-redux";
import store from "store/index";

export default ({ fields, saved, formName, onChangedValue, ...props }) => {
  const dispatch = useDispatch();
  const { renderFields } = useBaseForm({
    store,
    formName: formName,
    onChangedValue,
    setFieldValue: ({ fieldName, value }) =>
      dispatch(setFieldValue({ fieldName, value, formName })),
  });

  const getFilterData = () => {
    const state = store.getState();
    const editData = getValue(state, `form.${formName}.editData`);
    return editData;
  };

  const getArrayFilter = (joinOperator) => {
    const filterData = getFilterData();
    const arrayFilters = [];
    Object.entries(filterData).forEach(([key, value]) => {
      if (fields[key] && fields[key].getArrayFilter) {
        const arrayFilter = fields[key].getArrayFilter(value);
        if (arrayFilter) {
          arrayFilters.length > 0 && arrayFilters.push(joinOperator);
          arrayFilters.push(arrayFilter);
        }
      } else {
        arrayFilters.length > 0 && arrayFilters.push(joinOperator);
        arrayFilters.push([key, "=", value]);
      }
    });

    return arrayFilters;
  };

  const filter = async (userFilter, joinOperator) => {
    const filterData = getFilterData();
    const arrayFilter = getArrayFilter(joinOperator ? joinOperator : "and");

    if (userFilter && typeof userFilter === "function") {
      userFilter(arrayFilter, filterData);
    }
  };

  const setFilterData = (data) => {
    dispatch(setEditDataAndModify({ data, formName }));
  };

  useEffect(() => {
    return () => dispatch(disposeForm(formName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filter,
    setFilterData,
    renderFields,
    getArrayFilter,
    getFilterData,
    disposeForm: () => dispatch(disposeForm(formName)),
  };
};
