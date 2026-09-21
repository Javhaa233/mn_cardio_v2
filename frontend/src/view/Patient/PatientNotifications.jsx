import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
import BaseNoData from "customComponents/BaseNoData";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";

import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import { NOTIFICATIONS_CHANGED } from "components/Navbars/PatientNotificationBell";
import Helper from "helper";

/**
 * Мэдэгдэл — the patient's notifications.
 *
 * Both halves of this existed already and neither was reachable from the
 * portal: the legacy /Notification/GetListData is in PATIENT_ALLOWED_PREFIXES,
 * and the api layer carries four purpose-built routes (list, unread-count,
 * mark one read, mark all read). The doctor shell has had a bell since the
 * consistency programme; the patient shell had none, so a reply from a doctor
 * arrived with nothing anywhere to say so.
 *
 * This reads the api-layer routes, which scope to the token rather than to a
 * patient id in the request.
 */

/**
 * Where a notification points.
 *
 * `Action` is a short code the server sets when it creates the row. Only the
 * destinations a patient actually has are mapped - anything else stays a
 * plain, unclickable line rather than navigating somewhere they cannot open.
 */
const ACTION = {
  chat: { to: "/patient/PatientQuestion", Icon: ChatBubbleOutlineIcon },
  advice: { to: "/patient/PatientAdvice", Icon: RecordVoiceOverOutlinedIcon },
  remotevisit: {
    to: "/patient/PatientRemoteVisit",
    Icon: VideocamOutlinedIcon,
  },
};

const PAGE = 30;

export default function PatientNotifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [State, setState] = useState({
    loading: true,
    error: null,
    data: [],
    total: 0,
  });
  const [Reload, setReload] = useState(0);
  const [Busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await Helper.PatientApiHelper.GetNotifications({
        limit: PAGE,
      });
      if (cancelled) return;

      setState({
        loading: false,
        error: res.success
          ? null
          : res.message || t("Мэдээлэл ачаалахад алдаа гарлаа"),
        data: res.success && Array.isArray(res.data) ? res.data : [],
        total: res.success && typeof res.total === "number" ? res.total : 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [Reload, t]);

  const refresh = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReload((n) => n + 1);
  };

  const open = async (row) => {
    const target = ACTION[row.Action];
    // Mark read first, so the badge is right even if the route change unmounts
    // this screen immediately afterwards.
    if (!row.Seen) {
      await Helper.PatientApiHelper.MarkNotificationRead(row.Id);
      window.dispatchEvent(new window.Event(NOTIFICATIONS_CHANGED));
    }
    if (target) navigate(target.to);
    else refresh();
  };

  const markAll = async () => {
    setBusy(true);
    await Helper.PatientApiHelper.MarkAllNotificationsRead();
    window.dispatchEvent(new window.Event(NOTIFICATIONS_CHANGED));
    setBusy(false);
    refresh();
  };

  const unread = State.data.filter((n) => !n.Seen).length;

  const RenderBody = () => {
    if (State.loading) {
      return (
        <Box sx={{ position: "relative", minHeight: "180px" }}>
          <DivLoading WithoutCard />
        </Box>
      );
    }

    if (State.error) {
      return <LoadError Message={State.error} Retry={refresh} />;
    }

    if (!State.data.length) {
      return <BaseNoData Text={t("Мэдэгдэл алга байна")} />;
    }

    return State.data.map((row) => {
      const target = ACTION[row.Action];
      const Icon = target ? target.Icon : NotificationsNoneIcon;
      const clickable = !!target || !row.Seen;

      return (
        <Box
          key={row.Id}
          {...(clickable
            ? {
                role: "button",
                tabIndex: 0,
                onClick: () => open(row),
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open(row);
                  }
                },
              }
            : {})}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: space[3],
            padding: space[3],
            marginBottom: space[2],
            border: `1px solid ${colors.brand.hairline}`,
            borderRadius: radius.md,
            cursor: clickable ? "pointer" : "default",
            // Unread reads as unread without colour alone carrying it: the
            // tinted ground is backed by the weight of the text below.
            backgroundColor: row.Seen
              ? colors.brand.surface
              : colors.brand.tintSolid,
            "&:hover": clickable
              ? { backgroundColor: colors.brand.tintSolidHover }
              : undefined,
            "&:focus": { outline: "none" },
            "&:focus-visible": {
              outline: `2px solid ${colors.brand.focus}`,
              outlineOffset: "-2px",
            },
          }}
        >
          <Box
            sx={{
              flex: "0 0 auto",
              display: "flex",
              color: row.Seen ? colors.brand.inkMuted : colors.brand.cyanInk,
              "& svg": { width: 22, height: 22 },
            }}
          >
            <Icon />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: colors.brand.ink,
                fontWeight: row.Seen ? 400 : 600,
                whiteSpace: "pre-wrap",
              }}
            >
              {row.NotesMn || row.Notes}
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{ color: colors.brand.inkMuted, marginTop: space[1] }}
            >
              {Helper.ObjectHelper.getDateYMDDisplay(row.CreateDate)}
            </Typography>
          </Box>
        </Box>
      );
    });
  };

  return (
    <PageContainer>
      <GridContainer spacing={2}>
        <GridItem xs={12}>
          <UniCard
            title={t("Мэдэгдэл")}
            actions={
              unread > 0 ? (
                <Button
                  onClick={markAll}
                  disabled={Busy}
                  sx={gridToolbarButtonSx.neutral}
                >
                  {t("Бүгдийг уншсан болгох")}
                </Button>
              ) : null
            }
          >
            {RenderBody()}
          </UniCard>
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
