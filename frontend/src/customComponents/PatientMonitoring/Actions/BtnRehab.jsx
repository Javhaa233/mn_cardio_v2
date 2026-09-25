import React from "react";
// translation
import { useTranslation } from "react-i18next";

import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";

export default function BtnRehab(props) {
  const { t } = useTranslation();
  const { onClick } = props;

  return (
    <RowActionButton
      label={t("Сэргээн засах")}
      icon={<DirectionsWalkIcon />}
      onClick={() => onClick && onClick()}
    />
  );
}
