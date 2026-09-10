import { useTranslation } from "react-i18next";
import PageContainer from "customComponents/PageContainer";
import React from "react";

import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function DictSoumDistrict() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <BaseCrudManager ObjectName="DictSoumDistrict" />
    </PageContainer>
  );
}
