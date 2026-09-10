import React, { useRef } from "react";
// translation
import { useTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import UniCard from "customComponents/UniCard";

import RemoteVisitList from "customComponents/PatientPlatform/RemoteVisitList";
import RemoteVisitForm from "customComponents/PatientPlatform/RemoteVisitForm";

/**
 * 2.6 Цахим үзлэг — the patient's remote-examination screen.
 *
 * Both halves talk to /api/patient/evisits, which derives the patient from the
 * verified token, so this page no longer reads a patient id out of
 * `localStorage` and hands it to the server.
 */
export default function PatientRemoteVisit() {
  const { t } = useTranslation();

  // useRef(null) + Lists.current, following view/Patient/VisitComments.jsx.
  // This was `var Lists = useRef()` overwritten by a callback ref, so it was
  // reassigned on every render and the refresh-after-send only worked by
  // accident.
  const Lists = useRef(null);

  return (
    <GridContainer spacing={2}>
      <GridItem xs={12} sm={12} md={5}>
        <UniCard color="warning" title={t("Цахим үзлэг")}>
          <RemoteVisitForm
            ObjectName="RemoteVisit"
            Save={(Success) =>
              Success &&
              Lists.current &&
              Lists.current.GetData &&
              Lists.current.GetData(true)
            }
          />
        </UniCard>
      </GridItem>
      <GridItem xs={12} sm={12} md={7}>
        <UniCard color="warning" title={t("Цахим үзлэгийн түүх")}>
          <RemoteVisitList
            ref={Lists}
            ObjectName="RemoteVisit"
            UsePatientApi={true}
            CustomRender={true}
          />
        </UniCard>
      </GridItem>
    </GridContainer>
  );
}
