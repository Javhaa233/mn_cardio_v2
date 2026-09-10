import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SettingsIcon from "@mui/icons-material/Settings";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import ListPageHeader from "customComponents/ListPageHeader";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * Says which team you are looking at.
 *
 * The chrome lives in ListPageHeader; what is team-specific stays here -
 * resolving the title from a record the rail may or may not hold, and the two
 * actions that only make sense for a team.
 */
export default function DoctorTeamHeader({
  Team,
  GroupLabel,
  PatientCount,
  OnSettings,
  OnExport,
  Exporting = false,
}) {
  const { t } = useTranslation();

  // Deliberately NOT `if (!Team) return null`.
  //
  // A TeamId in the URL is not always one of the signed-in doctor's own teams -
  // the list loads by team_id regardless of whose rail it appears in - so the
  // rail cannot always resolve the record. Hiding the whole header in that case
  // also hides Excel and Тохиргоо, which is how the export became unreachable
  // on exactly the URL this page is usually opened with.
  const title = Team && Team.name ? Team.name : t("Өвчтөний жагсаалт");

  // The list's own total is the truthful number once a filter is applied; the
  // team's stored count is the fallback before the first page has loaded.
  const count =
    PatientCount !== undefined && PatientCount !== null
      ? PatientCount
      : Team && Team.vwDoctorsTeamInfo
        ? Team.vwDoctorsTeamInfo.PatientCount
        : null;

  return (
    <ListPageHeader
      Title={title}
      Overline={GroupLabel}
      Count={count}
      Actions={
        <>
          <Button
            size="small"
            disableElevation
            onClick={OnExport}
            disabled={Exporting}
            startIcon={
              Exporting ? (
                <CircularProgress size={14} thickness={5} color="inherit" />
              ) : (
                <FileDownloadOutlinedIcon />
              )
            }
            sx={gridToolbarButtonSx.neutral}
          >
            {t("Excel")}
          </Button>

          <Button
            size="small"
            disableElevation
            onClick={OnSettings}
            startIcon={<SettingsIcon />}
            sx={gridToolbarButtonSx.neutral}
          >
            {t("Тохиргоо")}
          </Button>
        </>
      }
    />
  );
}
