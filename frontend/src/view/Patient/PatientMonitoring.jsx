import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import UniCard from "customComponents/UniCard";

import BaseNoData from "customComponents/BaseNoData";
import PatientMonitoringList from "customComponents/PatientPlatform/PatientMonitoringList";
import PatientMonitoringForm from "customComponents/PatientPlatform/PatientMonitoringForm";
import PressureChart from "customComponents/PatientPlatform/PressureChart";

import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
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
  const [Exporting, setExporting] = useState(false);
  const [ExportError, setExportError] = useState("");

  /**
   * Mobile tender section 1.8: the journal as a file, to show a doctor at an
   * appointment. The endpoint has existed since the /api/patient layer was
   * built, complete with the provenance stamp the tender requires - there was
   * simply no way to ask for it from the web.
   */
  const Export = async () => {
    setExporting(true);
    setExportError("");
    const res = await Helper.PatientApiHelper.ExportJournal({ format: "xlsx" });
    setExporting(false);
    if (!res.success) {
      setExportError(res.message || t("Татаж чадсангүй. Дахин оролдоно уу."));
    }
  };

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
          // space[4], not 16: UniCard spreads cardStyle into `sx`, and MUI
          // multiplies a bare number by the 8px spacing unit - so `16` was
          // rendering as 128px of dead canvas between this card and the form.
          cardStyle={{ height: "auto", marginTop: space[4] }}
        >
          <PressureChart RefreshKey={Resset} />
        </UniCard>
      </GridItem>
      <GridItem xs={12} sm={12} md={6}>
        <UniCard
          color="warning"
          title={t("Тэмдэглэлийн түүх")}
          cardStyle={{ height: "auto" }}
          actions={
            <Button
              onClick={Export}
              disabled={Exporting}
              startIcon={<FileDownloadIcon />}
              sx={gridToolbarButtonSx.neutral}
            >
              {Exporting ? t("Татаж байна") : t("Татах")}
            </Button>
          }
        >
          {ExportError ? (
            <Box
              role="alert"
              sx={{
                marginBottom: space[2],
                color: colors.status.dangerInk,
                backgroundColor: colors.status.dangerTint,
                border: `1px solid ${colors.brand.hairline}`,
                borderRadius: radius.sm,
                padding: space[2],
              }}
            >
              {ExportError}
            </Box>
          ) : null}
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
