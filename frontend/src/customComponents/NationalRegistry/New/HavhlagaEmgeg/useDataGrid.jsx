import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCustomDataSource } from "utils/rest/dataSource";
import { default as Config } from "./config";
import { getList, destroy } from "store/reducers/core/HavhlagaEmgeg";

import {
  setEditData,
  setEditDataAndModify,
  setVisible,
} from "store/reducers/system/form";

import { disposeGrid, setCurrent } from "store/reducers/system/dataGrid";

import { setAlert } from "store/reducers/system";
import { useBaseGrid } from "newComponents/BaseGrid";
import useConfirm from "@hooks/useConfirm";
import { getValue } from "utils/helper";

export default ({ formName, gridName, parentFormName, ...props }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { confirm, confirmDialog } = useConfirm();

  const config = Config(dispatch);

  const {
    ref,
    dataSource,
    setDataSource,
    refreshData,
    defaultConfig,
    exportData,
    searchByText,
    getFieldProps,
    getSelectedRow,
    filter,
  } = useBaseGrid({ config });

  const SetDataSource = async () => {
    const dataSources = getCustomDataSource({
      key: "id",
      load: (options) => {
        return dispatch(getList(options));
      },
    });
    setDataSource(dataSources);
  };

  const edit = (data) => {
    data = data ? data : getSelectedRow();
    if (data) {
      dispatch(setEditData({ formName, data }));
      dispatch(setVisible({ formName, visible: true }));
    } else {
      dispatch(setAlert({ type: "warning", message: "Мөр сонгоно уу" }));
    }
  };

  const deleteRow = () => {
    const row = getSelectedRow();
    if (row && row.id) {
      confirm(t("Are you sure you want to delete?"), async () => {
        const success = await dispatch(destroy(row.id));
        if (success) refreshData();
      });
    } else {
      dispatch(setAlert({ type: "warning", message: "Мөр сонгоно уу" }));
    }
  };

  const create = () => {
    dispatch(setEditDataAndModify({ formName, data: {} }));
    dispatch(setVisible({ formName, visible: true }));
  };

  useEffect(() => {
    SetDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => gridName && dispatch(disposeGrid(gridName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    dataGrid: {
      ref,
      dataSource,
      setDataSource,
      refreshData,
      defaultConfig,
      exportData,
      searchByText,
      getFieldProps,
      getSelectedRow,
      filter,
    },
    fn: {
      setCurrent: (data) =>
        gridName && dispatch(setCurrent({ gridName, data })),
      create,
      edit,
      deleteRow,
    },
    confirmDialog,
  };
};
