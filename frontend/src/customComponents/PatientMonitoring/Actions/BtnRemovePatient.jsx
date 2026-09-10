import React from "react";
// translation
import { useTranslation } from "react-i18next";

import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

export default function BtnRemovePatient(props) {
  const { t } = useTranslation();
  const { onClick } = props;

  return (
    <RowActionButton
      label={t("Out of monitoring")}
      icon={<RemoveCircleOutlineIcon />}
      danger
      onClick={() => onClick && onClick("Type")}
    />
  );
}
