import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Follow-up deadline state.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function DateStatus(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.date_status + "";

  if (value === "simple")
    return <StatusChip Tone="success" Label={t("Хэвийн")} />;
  if (value === "date_expired")
    return <StatusChip Tone="danger" Label={t("Хугацаа дууссан")} />;
  if (value === "date_warning")
    return <StatusChip Tone="warning" Label={t("Хугацаа тулсан")} />;
  return <StatusChip Tone="neutral" Label={t("Тодорхойгүй")} />;
}
