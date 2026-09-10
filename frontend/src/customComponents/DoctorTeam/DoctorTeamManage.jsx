import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomTab from "customComponents/CustomTab";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DoctorTeamGeneralTab from "customComponents/DoctorTeam/DoctorTeamGeneralTab";
import DoctorTeamDoctorTab from "customComponents/DoctorTeam/DoctorTeamDoctorTab";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

export default function DoctorTeamManage(props) {
  const { t } = useTranslation();
  const { DoctorTeamId = null, SaveGeneral } = props;

  const [Alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // refs
  const DoctorTeamDoctorTabRef = useRef();

  useEffect(() => {
    if (DoctorTeamDoctorTabRef.current?.setTeamId) {
      DoctorTeamDoctorTabRef.current.setTeamId(DoctorTeamId);
    }
  }, [DoctorTeamId]);

  const GetTabs = () => {
    let alert = null;
    var Tabs = [];
    Tabs.push({
      tabButton: t("General"),
      tabContent: (
        <DoctorTeamGeneralTab
          Save={(resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  SaveGeneral && SaveGeneral();
                  setAlert(null);
                },
              );
              setAlert(alert);
            }
          }}
          DoctorTeamId={DoctorTeamId}
        />
      ),
    });
    Tabs.push({
      tabButton: t("Sharing"),
      tabContent: (
        <DoctorTeamDoctorTab
          ref={DoctorTeamDoctorTabRef}
          ObjectName="LookupDoctorTeam"
          CustomRender={true}
          DoctorTeamId={DoctorTeamId}
        />
      ),
    });

    return Tabs;
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {Alert}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
        }}
      >
        <CustomTab
          tabs={GetTabs()}
          onChange={(val) => setActiveTab(val)}
          fillHeight={true}
          centered={false}
          containerSx={{
            borderRadius: radius.lg,
            overflow: "hidden",
            border: `1px solid ${colors.brand.hairline}`,
            boxShadow: elevation[1],
            height: "100%",
          }}
          endActions={
            activeTab === 1 ? (
              <Button
                size="small"
                disableElevation
                startIcon={<AddIcon />}
                onClick={() => {
                  DoctorTeamDoctorTabRef.current?.ShowDialog?.();
                }}
                sx={gridToolbarButtonSx.primary}
              >
                {t("Add member")}
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
}
