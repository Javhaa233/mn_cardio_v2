import React from "react";
// TODO: Install devextreme-react package or replace with MUI components
// import ToolBar, { Item as ToolbarItem } from "devextreme-react/toolbar";
// // TODO: DevExtreme not installed
// import Button from "devextreme-react/button";
import { BaseLoadButton } from "newComponents";

export default ({ clickClose, clickSave, loadButtonSelector, texts }) => {
  return (
    <div
      style={{
        width: "100%",
        borderTop: "1px solid #ddd",
        padding: "10px",
      }}
    >
      <button onClick={clickClose}>
        {texts && texts.close ? texts.close : "Буцах"}
      </button>
      <BaseLoadButton
        selector={loadButtonSelector || null}
        text="Save"
        type="default"
        onClick={clickSave}
      />
    </div>
  );
};
