import { useState, useRef, useCallback } from "react";
// translation
import i18n from "i18n";
import { Workbook } from "exceljs";
import { sleep } from "utils/helper";
import saveAs from "file-saver";

import defaultConfig, { localGridConfig } from "./defaultConfig";
import { editors, getFieldEditor } from "newComponents/BaseControls/BaseField";

export default (props) => {
  const config = props && props.config ? props.config : null;
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentDataSource, setDataSource] = useState([]);
  const dataRef = useRef(null);

  // For MUI Data Grid, we'll use the selectedRows state
  const selectAll = () => {
    if (dataRef.current && currentDataSource) {
      setSelectedRows(currentDataSource.map((row) => row.Id || row.id)); // Assuming Id as key
    }
  };

  const refreshData = () => {
    // MUI Data Grid doesn't need explicit refresh, just update the data source
    if (dataRef.current) {
      setSelectedRows([]);
    }
  };

  // Export to Excel functionality using exceljs
  const exportData = async (customizeCell) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Main sheet");

    // Get data for export
    const dataToExport = currentDataSource || [];

    if (dataToExport.length > 0) {
      // Add headers
      const headers = Object.keys(dataToExport[0]);
      worksheet.addRow(headers);

      // Add data rows
      dataToExport.forEach((row) => {
        const rowValues = headers.map((header) => {
          let value = row[header];
          // Handle special values like dates
          if (value instanceof Date) {
            value = value.toISOString();
          }
          return value;
        });
        worksheet.addRow(rowValues);
      });

      // Apply customizations if provided
      if (customizeCell) {
        // ExcelJS customizeCell approach would go here
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "DataGrid.xlsx",
      );
    }
  };

  const filter = (data) => {
    // This will be handled by the component using the hook
    console.log("Filter function called with:", data);
  };

  const addRow = async () => {
    await sleep(100);
    // This will be handled by the component using the hook
  };

  const getDataSourceItems = () => {
    return currentDataSource || [];
  };

  const searchByText = (text) => {
    // This will be handled by the component using the hook
  };

  const getSelectedRow = () => {
    const selected = getSelectedRows();
    return selected.length === 1 ? selected[0] : null;
  };

  const getSelectedRows = useCallback(() => {
    if (!currentDataSource || !selectedRows) return [];

    return currentDataSource.filter((row) =>
      selectedRows.includes(row.Id || row.id),
    );
  }, [currentDataSource, selectedRows]);

  const getSelectedRowKeys = () => {
    return selectedRows;
  };

  const setSelectedRowKeys = (rowKeys) => {
    setSelectedRows(rowKeys);
  };

  const getFieldEditorConfig = (field) => {
    if (field.editor) {
      if (
        typeof field.editor === "object" &&
        Object.keys(field.editor).length > 0
      ) {
        return field.editor[Object.keys(field.editor)[0]];
      }
      return null;
    }
    return null;
  };

  const getFieldProps = (fieldName) => {
    if (config && config.fields && config.fields[fieldName]) {
      let additionalProps = {};
      if (getFieldEditor(config.fields[fieldName]) === editors.dateBox) {
        additionalProps.type = "date";
      }
      if (getFieldEditor(config.fields[fieldName]) === editors.dateTimeBox) {
        additionalProps.type = "dateTime";
      }
      if (getFieldEditor(config.fields[fieldName]) === editors.numberBox) {
        additionalProps.type = "number";
        const editorConfig = getFieldEditorConfig(config.fields[fieldName]);
        // additionalProps.format may need to be handled differently for MUI
      }
      if (getFieldEditor(config.fields[fieldName]) === editors.timeBox) {
        additionalProps.type = "time";
      }
      if (getFieldEditor(config.fields[fieldName]) === editors.selectBox) {
        const editorConfig = getFieldEditorConfig(config.fields[fieldName]);
        if (editorConfig !== null && editorConfig.dataSource) {
          // For MUI Data Grid, we handle value options differently
          additionalProps.valueOptions = editorConfig.dataSource.map(
            (item) => ({
              value: item[editorConfig.config.valueExpr],
              label: i18n.t(item[editorConfig.config.displayExpr]),
            }),
          );
        }
      }

      return {
        field: fieldName,
        headerName: i18n.t(config.fields[fieldName].label),
        ...config.fields[fieldName],
        ...additionalProps,
      };
    } else {
      return { field: fieldName, headerName: fieldName };
    }
  };

  return {
    ref: dataRef,
    getFieldProps,
    setDataSource,
    refreshData,
    exportData,
    searchByText,
    dataSource: currentDataSource,
    localGridConfig,
    defaultConfig,
    getSelectedRow,
    getSelectedRows,
    getSelectedRowKeys,
    getDataSourceItems,
    filter,
    addRow,
    setSelectedRowKeys,
    selectAll,
  };
};
