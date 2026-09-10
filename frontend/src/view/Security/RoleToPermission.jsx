import React from "react";
import PageContainer from "customComponents/PageContainer";

import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function RoleToPermission() {
  return (
    <PageContainer>
      <BaseCrudManager ObjectName="RoleToPermission" />
    </PageContainer>
  );
}
