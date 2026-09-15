import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Cardiovascular monitoring state.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function IsActive(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.Status + "";

  if (value === "activated")
    return <StatusChip Tone="success" Label={t("Идэвхитэй")} />;
  if (value === "out_control")
    return <StatusChip Tone="danger" Label={t("Хяналтаас гарсан")} />;
  if (value === "expired")
    return <StatusChip Tone="warning" Label={t("Үзлэгт хамрагдсан")} />;
  return <StatusChip Tone="neutral" Label={t("Идэвхигүй")} />;
}
