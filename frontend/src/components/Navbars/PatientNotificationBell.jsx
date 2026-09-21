import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import TopBarIconButton from "components/Navbars/TopBarIconButton";
import Helper from "helper";

/**
 * The patient top bar's notification bell.
 *
 * The doctor bar has had one since the consistency programme; the patient bar
 * had nothing, so a doctor's reply landed with no indication anywhere in the
 * shell that anything had happened.
 *
 * It reads GET /api/patient/notifications/unread-count, which exists precisely
 * so a badge does not have to page a list to count it, and navigates to the
 * Мэдэгдэл screen rather than opening a popover - a patient has few enough
 * notifications that a whole screen is the simpler answer, and it is reachable
 * from the menu too.
 */

/**
 * How often to re-check.
 *
 * 60s, and only while the tab is visible. There is no socket for notifications
 * (chat has one; this does not), so a poll is the honest mechanism - but a
 * backgrounded phone browser should not be waking up to ask.
 */
const POLL_MS = 60000;

/**
 * Fired by the Мэдэгдэл screen whenever it marks something read.
 *
 * Without it the badge only refreshed on navigation or on the next 60s tick,
 * so marking everything read left a stale count sitting in the bar - measured,
 * not theorised: the badge still said 3 after the list had emptied.
 *
 * A window event rather than lifting this into shared state, because the bell
 * and the screen have no common owner short of the layout, and the payload is
 * nothing more than "go and re-read".
 */
export const NOTIFICATIONS_CHANGED = "mncardio:notifications-changed";

export default function PatientNotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [Unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const read = async () => {
      if (document.visibilityState === "hidden") return;
      const res = await Helper.PatientApiHelper.GetUnreadCount();
      if (cancelled) return;
      // A failed poll leaves the badge alone. Writing 0 on a dropped request
      // hid a real count until the next tick, which reads as "nothing new"
      // when the truth is "we could not ask".
      if (!res.success || !res.data) return;
      setUnread(Number(res.data.unread) || 0);
    };

    read();
    timer = setInterval(read, POLL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED, read);
    // Re-read on return to the tab, so a patient coming back to the phone sees
    // the true count immediately rather than up to a minute late.
    document.addEventListener("visibilitychange", read);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", read);
      window.removeEventListener(NOTIFICATIONS_CHANGED, read);
    };
    // location drives a re-read: opening the Мэдэгдэл screen marks things read,
    // and the badge should follow on the way back out.
  }, [location.pathname]);

  return (
    <TopBarIconButton
      title={t("Мэдэгдэл")}
      badge={{ content: Unread, invisible: Unread === 0, max: 99 }}
      onClick={() => navigate("/patient/PatientNotifications")}
    >
      <NotificationsNoneIcon />
    </TopBarIconButton>
  );
}
