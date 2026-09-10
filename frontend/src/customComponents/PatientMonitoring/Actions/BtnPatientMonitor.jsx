import React from "react";
// translation
import { useTranslation } from "react-i18next";

import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";

export default function BtnPatientMonitor(props) {
  const { t } = useTranslation();
  const { onClick } = props;

  return (
    <RowActionButton
      label={t("Own monitoring")}
      icon={<MonitorHeartOutlinedIcon />}
      onClick={() => onClick && onClick()}
    />
  );
}
