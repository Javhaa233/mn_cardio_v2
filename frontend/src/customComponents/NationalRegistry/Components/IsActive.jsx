import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Registry record confirmation state.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function IsActive(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.is_confirm + "";

  if (value === "yes")
    return <StatusChip Tone="success" Label={t("Батлагдсан")} />;
  if (value === "no")
    return <StatusChip Tone="danger" Label={t("Батлагдаагүй")} />;
  return <StatusChip Tone="warning" Label={t("Тодорхойгүй")} />;
}
