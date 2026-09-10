import { useTranslation } from "react-i18next";
import PageContainer from "customComponents/PageContainer";
import React from "react";
import BaseCrudManager from "baseComponents/BaseCrudManager";
// helper
import Helper from "helper";

export default function Patient() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <BaseCrudManager
        ObjectName="Patient"
        ObjectHelper={Helper.EditObjectHelper}
        isDialog={false}
        GridHideCheck={true}
        HideNew={true}
        HideExport={true}
        widthPattern="40, 150, 150, 150, 150, 60c, 100c, 60c, 120, 100, 60r, 150, 150, 150, 150, 150, 100, 100c"
        layoutPattern={`
1 | 2
  | 3
  | 4
  | 5
6 | 7
`}
      />
    </PageContainer>
  );
}
