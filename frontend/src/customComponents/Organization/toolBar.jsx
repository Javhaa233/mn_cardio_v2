import React from "react";
// TODO: DevExtreme not installed
// import Tbar, { Item } from "devextreme-react/toolbar";
import { Button } from "@mui/material";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import { ToolBar } from "newComponents";

export default ({
  clickExport,
  clickRefresh,
  clickCreate,
  clickDelete,
  clickEdit,
  clickMerge,
  hideExport,
}) => {
  return (
    <ToolBar
      objectName="Organization"
      {...{
        clickExport,
        clickRefresh,
        clickCreate,
        clickDelete,
        clickEdit,
        hideExport,
      }}
    >
      {clickMerge && (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={clickMerge}
          startIcon={<MergeTypeIcon fontSize="small" />}
        >
          Нэгтгэх
        </Button>
      )}
    </ToolBar>
  );
};
