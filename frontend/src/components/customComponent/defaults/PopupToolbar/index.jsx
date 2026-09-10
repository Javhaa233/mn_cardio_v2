import React from "react";
// TODO: Install devextreme-react package or replace with MUI components
// import ToolBar, { Item as ToolbarItem } from "devextreme-react/toolbar";
// // TODO: DevExtreme not installed
// import Button from "devextreme-react/button";
import { BaseLoadButton } from "newComponents";

export default ({
  clickClose,
  clickSave,
  loadButtonSelector,
  saveBtnText,
  closeBtnText,
  hideSave,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "0px",
        width: "100%",
        borderTop: "1px solid #ddd",
        padding: "10px",
        left: "0px",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <button onClick={clickClose}>{closeBtnText || "Буцах"}</button>
      {!hideSave ? (
        <BaseLoadButton
          selector={loadButtonSelector || null}
          text={saveBtnText || "Save"}
          type="default"
          onClick={clickSave}
        />
      ) : null}
    </div>
  );
};
