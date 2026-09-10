import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// default components
import Button from "components/CustomButtons/Button";
// helper
import Helper from "helper";

export default function AddToList(props) {
  const { t } = useTranslation();

  const { PatientId, className = "" } = props;

  const [MenuValue, setMenuValue] = useState(null);
  const [DoctorTeams, setDoctorTeams] = useState([]);
  const [Alert, setAlert] = useState(null);

  const LogedDoctor = Helper.AuthHelper.GetLogedDoctorLocal();
  const DoctorId = LogedDoctor ? LogedDoctor.id_data : null;

  useEffect(() => {
    GetDoctorsTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PatientId]);

  const GetDoctorsTeam = async () => {
    if (PatientId) {
      await Helper.DoctorTeamHelper.GetDoctorsTeamsWithoutPatient(
        { DoctorId, PatientId },
        (resData) => resData && setDoctorTeams(resData.Data),
      );
    }
  };

  const SavePatient = async (TeamId) => {
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      "Багт нэмэхдээ итгэлтэй байна уу?",
      async () => {
        setAlert(null);
        await Helper.DoctorTeamHelper.SavePatient(
          { patient_id: PatientId, team_id: TeamId },
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

  return (
    <div style={{ float: "left" }}>
      {Alert}
      <Button
        disabled={!PatientId ? true : false}
        color="danger"
        onClick={(event) => setMenuValue(event.currentTarget)}
        size="sm"
        className={className}
      >
        {t("Add to ...")}
      </Button>
      <Menu
        anchorEl={MenuValue}
        keepMounted
        open={Boolean(MenuValue)}
        onClose={() => setMenuValue(null)}
      >
        {Array.isArray(DoctorTeams) &&
          DoctorTeams.map((Team, index) => (
            <MenuItem
              key={index}
              disabled={Team.IsActive === true ? false : true}
              onClick={() => {
                SavePatient(Team.id_data);
                setMenuValue(null);
              }}
            >
              {Team.name}
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
}
