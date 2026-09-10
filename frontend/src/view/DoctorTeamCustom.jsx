import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
//customer components
import DoctorTeamList from "customComponents/DoctorTeam/DoctorTeamList";
import DoctorTeamPatient from "customComponents/DoctorTeam/DoctorTeamPatient";
import DoctorTeamManage from "customComponents/DoctorTeam/DoctorTeamManage";
// history
import customHistory from "customHistory";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius, elevation } from "@/theme/tokens";

export default function DoctorTeamCustom() {
  const location = useLocation();

  const doctor = useMemo(() => Helper.AuthHelper.GetLogedDoctorLocal(), []);
  const doctorId = doctor ? doctor.id_data : null;

  const teamListRef = useRef(null);
  const doctorTeamPatientRef = useRef(null);

  const teamIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return params.get("TeamId");
  }, [location.search]);

  const modeFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return params.get("mode");
  }, [location.search]);

  const [selectTeamId, setSelectTeamId] = useState(teamIdFromUrl);
  // The rail already holds the full team record; the right pane needs it so its
  // header can name the team without a second request.
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [groupLabel, setGroupLabel] = useState(null);
  const [body, setBody] = useState(() => {
    if (modeFromUrl === "edit") return "EditTeam";
    return teamIdFromUrl ? "ShowPatient" : "EditTeam";
  });

  useEffect(() => {
    setSelectTeamId(teamIdFromUrl);
    if (modeFromUrl === "edit") {
      setBody("EditTeam");
    } else if (teamIdFromUrl) {
      setBody("ShowPatient");
    } else {
      setBody("EditTeam");
    }
  }, [teamIdFromUrl, modeFromUrl]);

  useEffect(() => {
    doctorTeamPatientRef.current &&
      doctorTeamPatientRef.current.setTeamId &&
      doctorTeamPatientRef.current.setTeamId(selectTeamId);
  }, [selectTeamId]);

  const handleTeamResolved = useCallback((team, label) => {
    setSelectedTeam(team);
    setGroupLabel(label);
  }, []);

  const goToSettings = useCallback(() => {
    if (!selectTeamId) return;
    setBody("EditTeam");
    customHistory.push(
      "/admin/DoctorTeamCustom?TeamId=" + selectTeamId + "&mode=edit",
    );
  }, [selectTeamId]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const panelSx = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minHeight: 0,
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
    backgroundColor: colors.brand.surface,
    border: `1px solid ${colors.brand.hairline}`,
    borderRadius: radius.lg,
    boxShadow: elevation[1],
  };

  const renderRight = () => {
    if (body === "ShowPatient") {
      return (
        <Box sx={{ ...panelSx, overflow: "auto" }}>
          <DoctorTeamPatient
            ref={(ref) => (doctorTeamPatientRef.current = ref)}
            DoctorTeamId={selectTeamId}
            ObjectName="DoctorsTeamPatient"
            CustomRender={true}
            Team={selectedTeam}
            GroupLabel={groupLabel}
            OnSettings={goToSettings}
          />
        </Box>
      );
    }

    return (
      <DoctorTeamManage
        SaveGeneral={() => {
          teamListRef.current &&
            teamListRef.current.GetData &&
            teamListRef.current.GetData();
          setSelectTeamId(null);
          customHistory.push("/admin/DoctorTeamCustom");
        }}
        DoctorTeamId={selectTeamId}
      />
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        minHeight: 0,
        flexDirection: isMobile ? "column" : "row",
        gap: space[3],
        overflow: isMobile ? "auto" : "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          // Stacked on a phone the rail used to take its full natural height
          // and push the patient list off the bottom of the screen entirely.
          flex: isMobile ? "0 0 auto" : "0 0 300px",
          maxHeight: isMobile ? "40vh" : "none",
        }}
      >
        <DoctorTeamList
          ref={(ref) => (teamListRef.current = ref)}
          AutoLoad={true}
          TeamId={selectTeamId}
          DoctorId={doctorId}
          OnTeamResolved={handleTeamResolved}
          SelectTeam={(teamId) =>
            customHistory.push("/admin/DoctorTeamCustom?TeamId=" + teamId)
          }
          EditTeam={(teamId) => {
            setBody("EditTeam");
            setSelectTeamId(teamId);
            if (teamId === null) {
              customHistory.push("/admin/DoctorTeamCustom");
            } else {
              customHistory.push(
                "/admin/DoctorTeamCustom?TeamId=" + teamId + "&mode=edit",
              );
            }
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {renderRight()}
      </Box>
    </Box>
  );
}
