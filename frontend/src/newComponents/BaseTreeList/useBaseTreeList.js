import React, { useRef, useState, useEffect } from "react";
import defaultConfig from "./defaultConfig";

export default (props) => {
  const ref = useRef();
  const [dataSource, setDataSource] = useState(null);

  const refreshData = () => {
    ref.current && ref.current.instance && ref.current.instance.refresh();
  };

  const getSelectedRow = () => {
    const selectedRows = getSelectedRows();
    return selectedRows.length === 1 ? selectedRows[0] : null;
  };

  const getSelectedRows = () => {
    return ref.current && ref.current.instance
      ? ref.current.instance.getSelectedRowsData()
      : [];
  };

  return {
    ref,
    setDataSource,
    refreshData,
    dataSource,
    defaultConfig,
    getSelectedRow,
    getSelectedRows,
  };
};
