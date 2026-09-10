import React from "react";
import PageContainer from "customComponents/PageContainer";

import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function DicoType() {
  return (
    <PageContainer>
      <BaseCrudManager ObjectName="DicoType" isDialog={false} />
    </PageContainer>
  );
}
