import React from "react";

import BaseCrudManager from "baseComponents/BaseCrudManager";
import UsersDetail from "./UsersDetail";

export default function Users() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
        gap: "10px",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BaseCrudManager
          ObjectName="Users"
          HideRangeDate={true}
          GridHideCheck={true}
          isDialog={false}
          HideExport={true}
          widthPattern="40c, 40c, 200, 120, 120, 120, 120, 120, 100c"
          formSize={{ height: "300px", width: "700px" }}
          CustomDetailView={UsersDetail}
        />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BaseCrudManager
          ObjectName="PatientUsers"
          HideRangeDate={true}
          GridHideCheck={true}
          isDialog={false}
          HideExport={true}
          widthPattern="40c, 40c, 200, 120, 120, 120, 120, 120, 100c"
          formSize={{ height: "300px", width: "700px" }}
          CustomDetailView={UsersDetail}
        />
      </div>
    </div>
  );
}
