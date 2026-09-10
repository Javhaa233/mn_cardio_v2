import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Button from "components/CustomButtons/Button";

import Helper from "helper";

export default function MoveToList(props) {
  const { t } = useTranslation();

  const [MenuValue, setMenuValue] = useState(null);
  const [DoctorTeams, setDoctorTeams] = useState([]);
  const [Alert, setAlert] = useState(null);

  const { PatientId = null, TeamId = null, className = "" } = props;

  const LogedDoctor = Helper.AuthHelper.GetLogedDoctorLocal();
  const DoctorId = LogedDoctor ? LogedDoctor.id_data : null;

  useEffect(() => {
    GetDoctorsTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PatientId]);

  const handleClose = () => {
    setMenuValue(null);
  };

  const GetDoctorsTeam = async () => {
    if (PatientId) {
      await Helper.DoctorTeamHelper.GetDoctorsTeamsWithoutPatient(
        { DoctorId, PatientId },
        (resData) => setDoctorTeams(resData),
      );
    }
  };

  const MovePatient = async (ToTeamId) => {
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      "Are you sure about transferring to a team?",
      async () => {
        setAlert(null);
        await Helper.DoctorTeamHelper.SavePatient(
          { patient_id: PatientId, team_id: ToTeamId, remove_team_id: TeamId },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  setAlert(null);
                  GetDoctorsTeam();
                },
              );
              setAlert(alert);
            }
          },
        );
      },
      () => setAlert(null),
    );
    setAlert(alert);
  };

  if (!PatientId || !TeamId) {
    return null;
  } else {
    return (
      <div style={{ float: "left" }}>
        {Alert}
        <Button
          disabled={!PatientId || !TeamId ? true : false}
          color="primary"
          className={className}
          onClick={(event) => setMenuValue(event.currentTarget)}
          size="sm"
        >
          {t("Move to ...")}
        </Button>
        <Menu
          anchorEl={MenuValue}
          keepMounted
          open={Boolean(MenuValue)}
          onClose={handleClose}
        >
          {Array.isArray(DoctorTeams) &&
            DoctorTeams.map((Team, index) => (
              <MenuItem
                disabled={Team.IsActive === true ? false : true}
                onClick={() => {
                  MovePatient(Team.id_data);
                  handleClose();
                }}
                key={index}
              >
                {Team.name}
              </MenuItem>
            ))}
        </Menu>
      </div>
    );
  }
}
