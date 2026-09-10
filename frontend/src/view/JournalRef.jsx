import React from "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function JournalRef() {
  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="JournalRef"
        GridHideCheck={true}
        isDialog={false}
        HideExport={true}
        HideNew={false}
        widthPattern="40c, 100C, 70c, 300, 70c, 70c"
        formSize={{ height: "300px", width: "700px" }}
      />
    </PageContainer>
  );
}
