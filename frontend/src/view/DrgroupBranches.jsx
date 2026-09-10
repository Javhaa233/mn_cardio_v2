import "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function DrgroupBranches() {
  return (
    <PageContainer>
      <BaseCrudManager ObjectName="DrgroupBranches" GridHideCheck={true} />
    </PageContainer>
  );
}
