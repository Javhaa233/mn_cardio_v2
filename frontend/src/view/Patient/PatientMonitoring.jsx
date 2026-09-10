import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import UniCard from "customComponents/UniCard";

import BaseNoData from "customComponents/BaseNoData";
import PatientMonitoringList from "customComponents/PatientPlatform/PatientMonitoringList";
import PatientMonitoringForm from "customComponents/PatientPlatform/PatientMonitoringForm";
import PressureChart from "customComponents/PatientPlatform/PressureChart";

import Helper from "helper";

/**
 * "2.2 Миний тэмдэглэл" - the patient's daily health log.
 *
 * Three cards: entry form, the chart the tender's acceptance criterion asks
 * for ("график хэлбэрээр харагдана"), and the history list.
 *
 * The account has to resolve to a patient record before any of this means
 * anything. It previously fell back to `PatientId = 0` and sent that to the
 * server, which is a real value the query happily runs against; now the screen
 * says what is wrong instead.
 */
export default function PatientMonitoring() {
  const { t } = useTranslation();
  const [Resset, setResset] = useState(true);

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const LogedPatient = LogedUser ? LogedUser.Patient : null;
  const PatientId = LogedPatient ? LogedPatient.id_data : null;

  // refs
  let PatientMonitoringListRef = useRef();

  if (!PatientId) {
    return (
      <GridContainer spacing={2}>
        <GridItem xs={12} sm={12} md={12}>
          <UniCard
            color="warning"
            title={t("Миний тэмдэглэл")}
            cardStyle={{ height: "auto" }}
          >
            <BaseNoData Text="Таны хэрэглэгчид өвчтөний бүртгэл холбогдоогүй тул тэмдэглэл харуулах боломжгүй байна" />
          </UniCard>
        </GridItem>
      </GridContainer>
    );
  }

  return (
    <GridContainer spacing={2}>
      <GridItem xs={12} sm={12} md={6}>
        <UniCard
          color="warning"
          title={t("Тэмдэглэл бүртгэх")}
          cardStyle={{ height: "auto" }}
        >
          <PatientMonitoringForm
            PatientId={PatientId}
            Resset={Resset}
            ObjectName="PatientMonitoring"
            Save={(Success) => {
              if (Success) {
                PatientMonitoringListRef.GetData &&
                  PatientMonitoringListRef.GetData();
                // Toggling this both resets the form and reloads the chart, so
                // a new measurement shows up on the graph without a refresh.
                setResset(!Resset);
              }
            }}
          />
        </UniCard>
        <UniCard
          color="primary"
          title={t("Даралт хяналт")}
          cardStyle={{ height: "auto", marginTop: 16 }}
        >
          <PressureChart RefreshKey={Resset} />
        </UniCard>
      </GridItem>
      <GridItem xs={12} sm={12} md={6}>
        <UniCard
          color="warning"
          title={t("Тэмдэглэлийн түүх")}
          cardStyle={{ height: "auto" }}
        >
          <PatientMonitoringList
            ref={(ref) => (PatientMonitoringListRef = ref)}
            ObjectName="PatientMonitoring"
            CustomRender={true}
            PatientId={PatientId}
          />
        </UniCard>
      </GridItem>
    </GridContainer>
  );
}
