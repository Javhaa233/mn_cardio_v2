import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Prescription send result.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function SentStatus(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.RequestStatus + "";

  if (value === "successfully")
    return <StatusChip Tone="success" Label={t("Амжилттай")} />;
  if (value === "unsuccessfully")
    return <StatusChip Tone="danger" Label={t("Амжилтгүй")} />;
  return <StatusChip Tone="neutral" Label={t("Илгээсэн")} />;
}
