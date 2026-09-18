import React from "react";
import PageContainer from "customComponents/PageContainer";
import BaseCrudManager from "baseComponents/BaseCrudManager";
import BaseTab from "baseComponents/BaseTab";
import ExerciseGallery from "customComponents/RehabContent/ExerciseGallery";

/**
 * Сэргээн засах дасгалын контент (гар утасны тендер 2.7).
 *
 * The tender requires the rehabilitation content to be editable from a web
 * admin without a developer. Every tab is the generic BaseObject CRUD over a
 * backend ModelConfig (RehabProgram, RehabProgramBlock, RehabExercise,
 * RehabMovement, RehabPlan, RehabSession) - no bespoke form code.
 *
 * The exercises tab is the gallery (photos, drag to arrange, create with
 * movements and clips - customComponents/RehabContent/). The rest stay on the
 * generic CRUD: programmes and blocks are clinical content (the rows on
 * MnCardio_test are DRAFT, transcribed from the rehab team's xlsx), and plans and
 * sessions are patient data written by the apps, listed here for review and
 * export only.
 */
export default function RehabContent() {
  const crud = (ObjectName, extra = {}) => (
    <BaseCrudManager
      ObjectName={ObjectName}
      isDialog={false}
      formSize={{ height: "560px", width: "820px" }}
      CreateDate="CreateDate"
      {...extra}
    />
  );

  return (
    <PageContainer>
      <BaseTab
        Tabss={[
          { Label: "Rehabilitation programmes", TabBody: crud("RehabProgram") },
          { Label: "Programme blocks", TabBody: crud("RehabProgramBlock") },
          { Label: "Rehabilitation exercises", TabBody: <ExerciseGallery /> },
          { Label: "Exercise movements", TabBody: crud("RehabMovement") },
          {
            Label: "Rehabilitation plans",
            TabBody: crud("RehabPlan", { HideNew: true }),
          },
          {
            Label: "Rehabilitation sessions",
            TabBody: crud("RehabSession", {
              HideNew: true,
              CreateDate: "StartedAt",
            }),
          },
        ]}
      />
    </PageContainer>
  );
}
