import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Adult or child. Neither is good or bad, so both use the neutral brand
 * tone - they were green and red.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function IsType(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.n_type + "";

  return value === "Насанд хүрэгчид" || value === "Хүүхэд" ? (
    <StatusChip Tone="info" Label={t(value)} />
  ) : (
    <StatusChip Tone="warning" Label={t("Тодорхойгүй")} />
  );
}
