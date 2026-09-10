import React from "react";
import PageContainer from "customComponents/PageContainer";

import BaseCrudManager from "baseComponents/BaseCrudManager";
import AppsDetail from "./AppsDetail";

export default function Apps() {
  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="Apps"
        HideRangeDate={true}
        GridHideCheck={true}
        isDialog={false}
        HideExport={true}
        CustomDetailView={AppsDetail}
      />
    </PageContainer>
  );
}
