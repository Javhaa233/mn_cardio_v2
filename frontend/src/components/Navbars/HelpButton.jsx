import { useTranslation } from "react-i18next";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import TopBarIconButton from "./TopBarIconButton";
import customHistory from "customHistory";

/**
 * Opens the user handbook as an in-app page (a tab, once tabbing lands).
 *
 * Replaces `var win = window.open(url, "_blank"); win.focus();` which opened a
 * second browser tab and threw a TypeError whenever a popup blocker returned
 * null. It also carried a stale `aria-label="Notifications"`.
 */
export default function HelpButton() {
  const { t } = useTranslation();

  return (
    <TopBarIconButton
      title={t("User handbook")}
      onClick={() => customHistory.push("/admin/Handbook")}
    >
      <HelpOutlineOutlinedIcon />
    </TopBarIconButton>
  );
}
