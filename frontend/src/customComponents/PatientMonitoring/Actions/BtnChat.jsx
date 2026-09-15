import React from "react";
// translation
import { useTranslation } from "react-i18next";

import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

/**
 * Open the chat with this patient.
 *
 * Sits first among the row actions because talking to the patient is what this
 * screen is for; the clinical dialogs follow it.
 */
export default function BtnChat(props) {
  const { t } = useTranslation();
  const { onClick } = props;

  return (
    <RowActionButton
      label={t("Чат")}
      icon={<ChatOutlinedIcon />}
      onClick={() => onClick && onClick("Type")}
    />
  );
}
