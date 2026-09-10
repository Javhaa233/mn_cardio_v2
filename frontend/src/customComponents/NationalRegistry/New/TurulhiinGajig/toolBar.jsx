import React from "react";
// TODO: DevExtreme not installed
// import Tbar, { Item } from "devextreme-react/toolbar";
import { ToolBar } from "newComponents";

export default ({
  clickExport,
  clickRefresh,
  clickCreate,
  clickDelete,
  clickEdit,
}) => {
  return (
    <ToolBar
      objectName="TurulhiinGajig"
      {...{ clickExport, clickRefresh, clickCreate, clickDelete, clickEdit }}
    />
  );
};
