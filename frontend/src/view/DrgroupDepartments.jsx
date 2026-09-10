import React from "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function DrgroupDepartments() {
  return (
    <PageContainer>
      <BaseCrudManager
        GridHideCheck={true}
        ObjectName="DrgroupDepartments"
        isDialog={false}
        HideExport={true}
        widthPattern="40c, 60r, 300, 300, 100c"
        formSize={{ height: "600px", width: "600px" }}
      />
    </PageContainer>
  );
}
