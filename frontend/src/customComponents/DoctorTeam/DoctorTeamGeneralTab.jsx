import React, { useEffect, useState, useCallback } from "react";
// translation
import { useTranslation } from "react-i18next";

// MUI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// custom components
import BaseField from "baseComponents/BaseField";

// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

// =======================
// Shared label style
// =======================
const labelSx = {
  fontWeight: 600,
  fontSize: "0.875rem",
  color: colors.brand.ink,
  textAlign: { xs: "left", md: "right" },
  display: "block",
  paddingTop: "6px",
};

export default function DoctorTeamGeneralTab(props) {
  const { t } = useTranslation();
  const { DoctorTeamId = null, Save } = props;

  const [teamId, setTeamId] = useState(null);
  const [Name, setName] = useState("");
  const [Description, setDescription] = useState("");
  const [Procedures, setProcedures] = useState([]);
  const [Config, setConfig] = useState(null);
  const [Fields, setFields] = useState([]);
  const [Finish, setFinish] = useState(false);
  const [Alert, setAlert] = useState(null);

  // =======================
  // Load config
  // =======================
  const getConfigData = async () => {
    if (!Config) {
      await Helper.BaseCrudHelper.GetConfigData("DoctorsTeam", (resData) => {
        if (resData?.Success && resData?.Data) {
          setConfig(resData.Data);
          setFields(resData.Data.Fields || []);
        }
      });
    }
  };

  // =======================
  // Load detail
  // =======================
  const GetTeamData = useCallback(async () => {
    setFinish(false);
    setName("");
    setDescription("");
    setProcedures([]);

    if (DoctorTeamId) {
      const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Value: DoctorTeamId, Op: "Equals" },
      ];

      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "DoctorsTeam", SearchOption },
        (resData) => {
          if (resData?.Data) {
            setName(resData.Data.name || "");
            setDescription(resData.Data.description || "");
            setProcedures(resData.Data.procedures || []);
            setFinish(true);
          }
        },
      );
    } else {
      setFinish(true);
    }
  }, [DoctorTeamId]);

  // =======================
  // Init
  // =======================
  useEffect(() => {
    getConfigData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (DoctorTeamId && DoctorTeamId !== teamId) {
      setTeamId(DoctorTeamId);
      GetTeamData();
    } else {
      setFinish(true);
    }
  }, [DoctorTeamId, GetTeamData, teamId]);

  // =======================
  // Save
  // =======================
  const CurrentSave = async () => {
    await Helper.DoctorTeamHelper.SaveGeneral(
      {
        id_data: DoctorTeamId,
        name: Name,
        description: Description,
        procedures: Procedures,
      },
      (resData) => Save && Save(resData),
    );
  };

  const CurrentDelete = async () => {
    const alert = Helper.BaseCrudHelper.ShowConfirm(
      t("Are you sure you want to delete this team?"),
      async () => {
        setAlert(null);
        await Helper.DoctorTeamHelper.DeleteDoctorsTeam(
          DoctorTeamId,
          (resData) => {
            if (resData) {
              const alertChild = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  Save && Save(resData);
                  setAlert(null);
                },
              );
              setAlert(alertChild);
            }
          },
        );
      },
      () => setAlert(null),
    );
    setAlert(alert);
  };

  // =======================
  // Render
  // =======================
  if (!Finish) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* loading */}
      </div>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: space[5],
        gap: space[4],
      }}
    >
      {/* Not a bare <h2>: _misc.scss styles h1-h6 at element level. */}
      <Typography
        variant="h3"
        component="div"
        role="heading"
        aria-level={2}
        sx={{ color: colors.brand.ink }}
      >
        {t("Doctor team information")}
      </Typography>
      {Alert}
      {/* ================= FORM =================
          Was a <table> for layout. `_misc.scss` styles bare <table> at element
          level across ~72 routes, so a layout table here picks up rules meant
          for data tables. A two-column grid does the same job and cannot be
          reached by those selectors. */}
      <Box
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "160px minmax(0, 520px)" },
          alignItems: "start",
          columnGap: space[4],
          rowGap: space[3],
        }}
      >
        <FormLabel sx={labelSx} htmlFor="doctor-team-name">
          {t("Name")} *
        </FormLabel>
        <TextField
          id="doctor-team-name"
          fullWidth
          size="small"
          value={Name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
        />

        <FormLabel sx={labelSx} htmlFor="doctor-team-description">
          {t("Description")}
        </FormLabel>
        <TextField
          id="doctor-team-description"
          fullWidth
          multiline
          minRows={3}
          size="small"
          value={Description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
        />

        <FormLabel sx={labelSx}>{t("Procedures")}</FormLabel>
        <BaseField
          Value={Procedures}
          Config={{
            ...Helper.BaseCrudHelper.GetFieldByName("procedures", Fields),
            Label: "",
          }}
          ChangeValue={(Field, Value) => setProcedures(Value)}
        />

        <Box sx={{ display: { xs: "none", md: "block" } }} />
        <Box sx={{ display: "flex", gap: space[2], paddingTop: space[2] }}>
          <Button
            size="small"
            disableElevation
            onClick={CurrentSave}
            sx={gridToolbarButtonSx.primary}
          >
            {t("Save")}
          </Button>
          {DoctorTeamId && DoctorTeamId > 5 && (
            <Button
              size="small"
              disableElevation
              onClick={CurrentDelete}
              sx={gridToolbarButtonSx.danger}
            >
              {t("Delete")}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
