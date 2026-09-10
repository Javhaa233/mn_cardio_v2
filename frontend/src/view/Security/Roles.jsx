import React from "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function Roles() {
  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="Roles"
        isDialog={false}
        HideRangeDate={true}
        GridHideCheck={true}
        HideExport={true}
        formSize={{ height: "600px", width: "700px" }}
      />
    </PageContainer>
  );
}
