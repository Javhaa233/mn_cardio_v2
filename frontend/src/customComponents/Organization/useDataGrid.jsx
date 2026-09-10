import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getCustomDataSource } from "utils/rest/dataSource";
import { default as Config } from "./config";
import { getList, destroy, getOne } from "store/reducers/core/Organization";

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

import Helper from "helper";

export default ({
  formName,
  gridName,
  patientRegister,
  parentFormName,
  ...props
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { confirm, confirmDialog } = useConfirm();
  const filterRef = useRef(null);
  const rowFilterRef = useRef({});

  const config = Config(dispatch);

  const {
    ref,
    dataSource,
    setDataSource,
    refreshData: baseRefreshData,
    defaultConfig,
    exportData,
    searchByText: baseSearchByText,
    getFieldProps,
    getSelectedRow,
    filter: baseFilter,
  } = useBaseGrid({ config });

  const SetDataSource = async (options = {}) => {
    let finalFilter = null;
    const filters = [];

    // Form filter
    if (filterRef.current) {
      filters.push(filterRef.current);
    }

    // Row filter
    if (rowFilterRef.current && Object.keys(rowFilterRef.current).length > 0) {
      const currentFilters = [];
      Object.keys(rowFilterRef.current).forEach((key) => {
        const value = rowFilterRef.current[key];
        if (value !== "" && value !== null && value !== undefined) {
          currentFilters.push([key, "contains", value]);
        }
      });

      if (currentFilters.length > 0) {
        if (currentFilters.length === 1) {
          filters.push(currentFilters[0]);
        } else {
          const combined = [];
          for (let i = 0; i < currentFilters.length; i++) {
            if (i > 0) combined.push("and");
            combined.push(currentFilters[i]);
          }
          filters.push(combined);
        }
      }
    }

    // Combine filters with "and"
    if (filters.length > 0) {
      if (filters.length === 1) {
        finalFilter = filters[0];
      } else {
        finalFilter = [];
        for (let i = 0; i < filters.length; i++) {
          if (i > 0) finalFilter.push("and");
          finalFilter.push(filters[i]);
        }
      }
    }

    // Handle patientRegister (root filter)
    if (patientRegister) {
      const rootFilter = ["patientRegister", "=", patientRegister];
      if (finalFilter) {
        finalFilter = [finalFilter, "and", rootFilter];
      } else {
        finalFilter = rootFilter;
      }
    }

    const queryOptions = {
      ...options,
      filter: finalFilter,
    };

    const result = await dispatch(getList(queryOptions));
    if (result && result.data) {
      setDataSource(result.data);
    }
  };

  const refreshData = () => {
    baseRefreshData();
    SetDataSource();
  };

  const filter = (filterData) => {
    filterRef.current = filterData;
    SetDataSource();
  };

  const searchField = (field, value) => {
    if (!rowFilterRef.current) rowFilterRef.current = {};
    if (value === "" || value === null || value === undefined) {
      delete rowFilterRef.current[field];
    } else {
      rowFilterRef.current[field] = value;
    }
    SetDataSource();
  };

  const edit = async (data) => {
    data = data ? data : getSelectedRow();
    if (data && data.Id) {
      // Fetch full data including Logo from custom endpoint
      const fullData = await dispatch(getOne(data.Id));
      if (fullData) {
        dispatch(setEditData({ formName, data: fullData }));
        dispatch(setVisible({ formName, visible: true }));
      }
    } else {
      dispatch(setAlert({ type: "warning", message: "Мөр сонгоно уу" }));
    }
  };

  const deleteRow = () => {
    const row = getSelectedRow();
    if (row && row.Id) {
      confirm(t("Are you sure you want to delete?"), async () => {
        const success = await dispatch(destroy(row.Id));
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
      searchByText: searchField, // Replace with our implementation
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
