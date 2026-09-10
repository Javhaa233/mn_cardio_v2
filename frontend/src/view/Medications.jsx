import React from "react";
import PageContainer from "customComponents/PageContainer";

import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function Medications() {
  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="Medications"
        isDialog={false}
        HideExport={true}
        formSize={{ height: "300px", width: "700px" }}
        CreateDate="CreatedDate"
      />
    </PageContainer>
  );
}
