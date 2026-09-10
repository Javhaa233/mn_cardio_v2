import React from "react";
// translation
import { useTranslation } from "react-i18next";

import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";

export default function BtnRemoteVisit(props) {
  const { t } = useTranslation();
  const { onClick } = props;

  return (
    <RowActionButton
      label={t("Remote visit")}
      icon={<VideocamOutlinedIcon />}
      onClick={() => onClick && onClick("Type")}
    />
  );
}
