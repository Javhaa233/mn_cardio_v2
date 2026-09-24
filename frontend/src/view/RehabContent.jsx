import React from "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";
import BaseTab from "baseComponents/BaseTab";
import ExerciseLibrary from "customComponents/RehabContent/ExerciseLibrary";
import ProgramBuilder from "customComponents/RehabContent/ProgramBuilder";

/**
 * Сэргээн засах дасгалын контент (гар утасны тендер 2.7), 2026-09-24-нд
 * гурван хэсэг болгон шинэчилсэн:
 *
 *   Дасгалын сан   дасгал → хөдөлгөөн нэг нэгээр → тун, сет, анхааруулга,
 *                  явцын мессеж, бичлэг (customComponents/RehabContent/)
 *   Хөтөлбөр       өвчний бүлэг бүрийн өдрийн блокууд, сангаас дасгал сонгоно
 *   Өвчтөн         аппаас бичигдсэн төлөвлөгөө, дасгалын явц — харах, экспорт
 *
 * Хөтөлбөр ба блокийн мөрүүд MnCardio_test дээр НООРОГ (сэргээн засах багийн
 * xlsx-ээс). Төлөвлөгөө, явц нь өвчтөний өгөгдөл тул энд шинээр үүсгэхгүй.
 */
export default function RehabContent() {
  const crud = (ObjectName, extra = {}) => (
    <BaseCrudManager
      ObjectName={ObjectName}
      isDialog={false}
      formSize={{ height: "560px", width: "820px" }}
      CreateDate="CreateDate"
      HideNew
      {...extra}
    />
  );

  return (
    <PageContainer>
      <BaseTab
        Tabss={[
          { Label: "Дасгалын сан", TabBody: <ExerciseLibrary /> },
          { Label: "Хөтөлбөр", TabBody: <ProgramBuilder /> },
          {
            Label: "Өвчтөн",
            TabBody: (
              <BaseTab
                Tabss={[
                  { Label: "Төлөвлөгөө", TabBody: crud("RehabPlan") },
                  {
                    Label: "Дасгалын явц",
                    TabBody: crud("RehabSession", { CreateDate: "StartedAt" }),
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
