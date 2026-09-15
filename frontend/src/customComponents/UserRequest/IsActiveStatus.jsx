import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Account request state: 2 declined, 0 received, anything else confirmed.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function IsActiveStatus(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.IsActive + "";

  if (value === "2") return <StatusChip Tone="danger" Label={t("Declined")} />;
  if (value === "0")
    return <StatusChip Tone="warning" Label={t("Request received")} />;
  return <StatusChip Tone="success" Label={t("Confirmed")} />;
}
