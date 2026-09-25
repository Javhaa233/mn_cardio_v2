import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import Button from "components/CustomButtons/Button";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import Helper from "helper";

/**
 * "Who is monitoring this patient" - the strip at the top of the patient card.
 *
 * Customer decision 2026-09-25: a doctor opening a patient should see at once
 * whether anyone has them in "Миний хяналт", and be offered to take them.
 * Monitoring is what gives a doctor the patient's rehab, journal and chat
 * (helper/CareTeam.js), so this strip is the way in for a doctor who is not
 * yet on the team. Several doctors may monitor one patient; taking never
 * removes anyone.
 *
 * Three states: nobody (offer to take), others only (list them, offer to take
 * too), me (confirm, list the others). Names and organisation only - the
 * endpoint returns nothing clinical.
 *
 * Staff roles 1-3 only, like the "Transfer, Monitoring" menu; admin-config
 * (6) has no monitoring list.
 */
export default function MonitoringBanner({ PatientId }) {
  const { t } = useTranslation();
  const [Monitors, setMonitors] = useState(null);
  const [Saving, setSaving] = useState(false);
  const [Alert, setAlert] = useState(null);

  const Allowed = Helper.AuthHelper.CheckRole([1, 2, 3]) === true;

  const Load = useCallback(() => {
    if (!PatientId || !Allowed) return;
    Helper.PatientMonitoringHelper.GetPatientMonitors(PatientId, (resData) => {
      setMonitors(
        resData && resData.Success && Array.isArray(resData.Data)
          ? resData.Data
          : null,
      );
    });
  }, [PatientId, Allowed]);

  useEffect(() => {
    Load();
    const OnChanged = (e) => {
      if (!e.detail || String(e.detail.PatientId) === String(PatientId)) Load();
    };
    window.addEventListener("mncardio:monitoring-changed", OnChanged);
    return () =>
      window.removeEventListener("mncardio:monitoring-changed", OnChanged);
  }, [Load, PatientId]);

  // Nothing until the answer is in: a strip that flips from "nobody" to
  // "Д.Бат" a moment later reads as a mistake.
  if (!Allowed || !PatientId || !Monitors) return null;

  const Mine = Monitors.some((m) => m.IsMe);
  const Others = Monitors.filter((m) => !m.IsMe);

  const Take = () => {
    setSaving(true);
    Helper.PatientMonitoringHelper.SavePatient({ PatientId }, (resData) => {
      setSaving(false);
      if (!resData || !resData.Success) {
        setAlert(
          Helper.BaseCrudHelper.ShowAlert(
            (resData && resData.Message) || t("Алдаа гарлаа"),
            false,
            () => setAlert(null),
          ),
        );
      }
      // Success reloads through the change event SavePatient fires.
    });
  };

  // Test data has patients on ten lists at once; three names and a count keep
  // the strip one line, and the tooltip carries the rest.
  const Label = (m) =>
    m.OrganizationName ? `${m.Name} (${m.OrganizationName})` : m.Name;
  const Names = (List) =>
    List.slice(0, 3).map(Label).join(", ") +
    (List.length > 3 ? ` +${List.length - 3}` : "");
  const AllNames = Monitors.map(Label).join("\n");

  let Main;
  let Sub = null;
  if (Mine) {
    Main = t("Таны хяналтад байна");
    if (Others.length)
      Sub = `${t("Мөн хяналт тавьж буй эмч")}: ${Names(Others)}`;
  } else if (Others.length) {
    Main = `${t("Хяналт тавьж буй эмч")}: ${Names(Others)}`;
    Sub = t("Та мөн хяналтандаа авах уу?");
  } else {
    Main = t("Энэ өвчтөн хэний ч хяналтад байхгүй байна");
    Sub = t("Хяналтандаа авах уу?");
  }

  return (
    <Box
      role="status"
      title={AllNames || undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: space[3],
        flexWrap: "wrap",
        padding: `${space[2]} ${space[3]}`,
        marginBottom: space[2],
        background: Mine ? colors.brand.surface : colors.brand.tintSolid,
        border: `1px solid ${colors.brand.hairline}`,
        borderLeft: `3px solid ${colors.brand.cyan}`,
        borderRadius: radius.sm,
      }}
    >
      {Alert}
      <VisibilityOutlinedIcon
        sx={{ color: colors.brand.cyanInk, fontSize: 24 }}
        aria-hidden="true"
      />
      <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
        <Typography
          component="div"
          variant="body2"
          sx={{ color: colors.brand.ink, fontWeight: 600 }}
        >
          {Main}
        </Typography>
        {Sub && (
          <Typography
            component="div"
            variant="body2"
            sx={{ color: colors.brand.inkMuted }}
          >
            {Sub}
          </Typography>
        )}
      </Box>
      {!Mine && (
        <Button color="primary" size="sm" disabled={Saving} onClick={Take}>
          {t("Хяналтандаа авах")}
        </Button>
      )}
    </Box>
  );
}
