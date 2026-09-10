import React, { useRef } from "react";
// translation
import { useTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import UniCard from "customComponents/UniCard";
import VisitCommentsList from "customComponents/PatientPlatform/VisitCommentsList";
import VisitCommentsForm from "customComponents/PatientPlatform/VisitCommentsForm";

/**
 * 2.3 Эмчээс асуух асуулт.
 *
 * Neither half takes a patient id any more: both talk to /api/patient/questions,
 * which resolves the patient from the verified token. Sending a question
 * refreshes the thread beside it.
 */
export default function VisitComments() {
  const { t } = useTranslation();

  // refs
  const Lists = useRef(null);

  return (
    <GridContainer spacing={2}>
      <GridItem xs={12} sm={12} md={5}>
        <UniCard color="warning" title={t("Эмч нараас асуух асуулт")}>
          <VisitCommentsForm
            ObjectName="VisitComments"
            Save={() =>
              Lists.current &&
              Lists.current.GetData &&
              Lists.current.GetData(true)
            }
          />
        </UniCard>
      </GridItem>
      <GridItem xs={12} sm={12} md={7}>
        <UniCard color="warning" title={t("Асуултын түүх")}>
          <VisitCommentsList ref={Lists} CustomRender />
        </UniCard>
      </GridItem>
    </GridContainer>
  );
}
