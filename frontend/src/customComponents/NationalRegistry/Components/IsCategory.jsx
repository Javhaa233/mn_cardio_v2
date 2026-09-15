import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Congenital malformation register category. A category, not a verdict, so
 * the three known values share the neutral brand tone.
 * Drawn with StatusChip; it was white text on a saturated fill.
 */
export default function IsCategory(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const labels = {
    neelttei: "Нээлттэй мэс засал",
    sudsan_dotuurh: "Судсан дотуурх мэс засал",
    katetr: "Катетр ангиографийн оношилгоо",
  };
  const label = labels[rowdata.n_category + ""];

  return label ? (
    <StatusChip Tone="info" Label={t(label)} />
  ) : (
    <StatusChip Tone="warning" Label={t("Тодорхойгүй")} />
  );
}
