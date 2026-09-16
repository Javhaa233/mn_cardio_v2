import React from "react";
import { useTranslation } from "react-i18next";

import StatusChip from "customComponents/StatusChip";

/**
 * Sign-up request state: "0" pending, "1" approved, "2" declined.
 * Anything else is unknown - it used to fall through to "Confirmed", so a
 * request with no status looked approved.
 */
export default function IsActiveStatus(props) {
  const { t } = useTranslation();
  const { rowdata = {} } = props;
  const value = rowdata.IsActive + "";

  if (value === "0")
    return <StatusChip Tone="warning" Label={t("Хүлээгдэж буй")} />;
  if (value === "1")
    return <StatusChip Tone="success" Label={t("Зөвшөөрсөн")} />;
  if (value === "2")
    return <StatusChip Tone="danger" Label={t("Татгалзсан")} />;
  return <StatusChip Tone="neutral" Label={t("Тодорхойгүй")} />;
}
