import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Button from "components/CustomButtons/Button";
import StatusChip from "customComponents/StatusChip";
import DivLoading from "customComponents/DivLoading";
import BaseNoData from "customComponents/BaseNoData";
import { labelRoomSx, NumField } from "customComponents/RehabContent/rehabUi";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import Helper from "helper";

import { PLAN_STATUS, SESSION_STATUS, STOP_SYMPTOMS } from "./rehabLabels";

/** One label-value line of the current plan. */
function Row({ label, children }) {
  return (
    <Box sx={{ display: "flex", gap: space[2], py: "2px" }}>
      <Typography
        component="span"
        variant="body2"
        sx={{ color: colors.brand.inkMuted, minWidth: 130 }}
      >
        {label}
      </Typography>
      <Typography
        component="span"
        variant="body2"
        sx={{ color: colors.brand.ink }}
      >
        {children}
      </Typography>
    </Box>
  );
}

const PANEL_SX = {
  border: `1px solid ${colors.brand.hairline}`,
  borderRadius: radius.md,
  p: space[3],
  mb: space[3],
};

/**
 * A monitored patient's rehab plan, on the web: assign, change, pause, end,
 * and the recent sessions. The web half of the doctor app's DoctorRehabPlanCard
 * (mobile/app/lib/features/doctor/doctor_rehab_plan.dart), over the same
 * /api/doctor endpoints, so the two cannot disagree.
 *
 * Opened from the "Миний хяналт" roster, so the caller is on the patient's
 * monitoring list and the server's care-team check (helper/CareTeam.js)
 * passes. If it does not - the row was removed in another tab - the server's
 * message is shown rather than an empty panel.
 *
 * The dose rules (target HR, intensity bounds) are the server's; the bounds
 * repeated here only keep the inputs sane and are re-checked there.
 */
export default function RehabPlanPanel({ PatientId }) {
  const { t } = useTranslation();
  const [Loading, setLoading] = useState(true);
  const [LoadErr, setLoadErr] = useState(null);
  const [Programs, setPrograms] = useState([]);
  const [Data, setData] = useState(null);
  const [Form, setForm] = useState({
    ProgramId: "",
    StartDate: "",
    IntensityPct: "",
    MaxHrOverride: "",
    Notes: "",
  });
  const [Saving, setSaving] = useState(false);
  const [Alert, setAlert] = useState(null);

  // Fetch, then apply in the .then: state is set from a callback, never in the
  // effect body (react-hooks set-state-in-effect is an error in this repo).
  const Fetch = useCallback(
    () =>
      Promise.all([
        Helper.DoctorApiHelper.GetRehabPrograms(),
        Helper.DoctorApiHelper.GetPatientRehabPlan(PatientId),
      ]),
    [PatientId],
  );

  const Apply = useCallback(
    ([P, R]) => {
      setLoading(false);
      if (!R.success) {
        setLoadErr(R.message || t("Алдаа гарлаа"));
        return;
      }
      setLoadErr(null);
      setPrograms(P.success && Array.isArray(P.data) ? P.data : []);
      setData(R.data);
      const Plan = R.data && R.data.plan;
      setForm({
        ProgramId: Plan ? Plan.Program.Id : "",
        StartDate: new Date().toISOString().slice(0, 10),
        IntensityPct:
          Plan && Plan.IntensityPct != null ? Plan.IntensityPct : "",
        MaxHrOverride: Plan && Plan.MaxHrOverride ? Plan.MaxHrOverride : "",
        Notes: "",
      });
    },
    [t],
  );

  const Load = () => Fetch().then(Apply);

  useEffect(() => {
    let Alive = true;
    Fetch().then((Res) => Alive && Apply(Res));
    return () => {
      Alive = false;
    };
  }, [Fetch, Apply]);

  const Say = (Message, Success) =>
    setAlert(
      Helper.BaseCrudHelper.ShowAlert(Message, Success, () => setAlert(null)),
    );

  const Send = async (Body, DoneText) => {
    setSaving(true);
    const R = await Helper.DoctorApiHelper.SavePatientRehabPlan(
      PatientId,
      Body,
    );
    setSaving(false);
    if (!R.success) {
      Say(R.message || t("Алдаа гарлаа"), false);
      return;
    }
    Say(DoneText, true);
    Load();
  };

  const Assign = () => {
    if (!Form.ProgramId) {
      Say(t("Хөтөлбөр сонгоно уу"), false);
      return;
    }
    Send(
      {
        ProgramId: Form.ProgramId,
        StartDate: Form.StartDate || undefined,
        IntensityPct: Form.IntensityPct === "" ? null : Form.IntensityPct,
        MaxHrOverride: Form.MaxHrOverride === "" ? null : Form.MaxHrOverride,
        Notes: Form.Notes || undefined,
      },
      t("Хөтөлбөр оноолоо. Үйлчлүүлэгчид мэдэгдэл очлоо."),
    );
  };

  const End = () =>
    setAlert(
      Helper.BaseCrudHelper.ShowConfirm(
        t("Хөтөлбөрийг дуусгах уу?"),
        () => {
          setAlert(null);
          Send({ Status: "ended" }, t("Хөтөлбөр дууслаа"));
        },
        () => setAlert(null),
        { Destructive: true },
      ),
    );

  if (Loading) {
    return (
      <Box sx={{ position: "relative", minHeight: 200 }}>
        <DivLoading WithoutCard />
      </Box>
    );
  }
  if (LoadErr) {
    return (
      <Box sx={{ p: space[4] }}>
        <Typography
          component="div"
          variant="body2"
          sx={{ color: colors.brand.ink }}
        >
          {LoadErr}
        </Typography>
      </Box>
    );
  }

  const Plan = Data && Data.plan;
  const Sessions = (Data && Data.sessions) || [];
  const Selected = Programs.find(
    (p) => String(p.Id) === String(Form.ProgramId),
  );
  const HasHr = Selected
    ? Selected.HasHrTarget
    : Plan && Plan.Program.HasHrTarget;

  return (
    <Box sx={{ p: space[3], ...labelRoomSx }}>
      {Alert}

      <Box sx={PANEL_SX}>
        <Typography
          component="div"
          variant="subtitle2"
          sx={{ color: colors.brand.ink, mb: space[2] }}
        >
          {t("Одоогийн хөтөлбөр")}
        </Typography>
        {Plan ? (
          <>
            <Row label={t("Хөтөлбөр")}>
              {Plan.Program.Name}{" "}
              <StatusChip
                Tone={Plan.Status === "paused" ? "warning" : "success"}
                Label={t(PLAN_STATUS[Plan.Status] || Plan.Status)}
              />
            </Row>
            <Row label={t("Эхэлсэн")}>
              {String(Plan.StartDate).slice(0, 10)}
              {Plan.DayNo ? " · " + Plan.DayNo + t("-р өдөр") : ""}
            </Row>
            {Plan.IntensityPct != null && (
              <Row label={t("Эрчим")}>{Plan.IntensityPct + "%"}</Row>
            )}
            {Data.maxHr ? (
              <Row label={t("Дээд пульс")}>{Data.maxHr}</Row>
            ) : null}
            <Box sx={{ display: "flex", gap: space[2], mt: space[2] }}>
              <Button
                size="sm"
                color="white"
                disabled={Saving}
                onClick={() =>
                  Plan.Status === "paused"
                    ? Send({ Status: "active" }, t("Хөтөлбөр үргэлжиллээ"))
                    : Send({ Status: "paused" }, t("Хөтөлбөр түр зогслоо"))
                }
              >
                {Plan.Status === "paused"
                  ? t("Үргэлжлүүлэх")
                  : t("Түр зогсоох")}
              </Button>
              <Button size="sm" color="danger" disabled={Saving} onClick={End}>
                {t("Дуусгах")}
              </Button>
            </Box>
          </>
        ) : (
          <Typography
            component="div"
            variant="body2"
            sx={{ color: colors.brand.inkMuted }}
          >
            {t("Хөтөлбөр оноогоогүй байна")}
          </Typography>
        )}
      </Box>

      <Box sx={PANEL_SX}>
        <Typography
          component="div"
          variant="subtitle2"
          sx={{ color: colors.brand.ink, mb: space[2] }}
        >
          {Plan ? t("Хөтөлбөр өөрчлөх") : t("Хөтөлбөр оноох")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: space[3],
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            select
            size="small"
            label={t("Хөтөлбөр")}
            value={Form.ProgramId}
            onChange={(e) => setForm({ ...Form, ProgramId: e.target.value })}
            sx={{ minWidth: 260 }}
          >
            {Programs.map((p) => (
              <MenuItem key={p.Id} value={p.Id}>
                {p.Name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            size="small"
            label={t("Эхлэх огноо")}
            value={Form.StartDate}
            onChange={(e) => setForm({ ...Form, StartDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
          <NumField
            label={t("Эрчим %")}
            value={Form.IntensityPct}
            min={10}
            max={90}
            width={120}
            onChange={(v) => setForm({ ...Form, IntensityPct: v })}
          />
          {HasHr && (
            <NumField
              label={t("Дээд пульс")}
              value={Form.MaxHrOverride}
              min={80}
              max={220}
              width={130}
              onChange={(v) => setForm({ ...Form, MaxHrOverride: v })}
            />
          )}
        </Box>
        <TextField
          size="small"
          label={t("Тэмдэглэл")}
          value={Form.Notes}
          onChange={(e) => setForm({ ...Form, Notes: e.target.value })}
          fullWidth
          multiline
          minRows={2}
          sx={{ mt: space[3] }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: space[2] }}>
          <Button size="sm" color="primary" disabled={Saving} onClick={Assign}>
            {Plan ? t("Өөрчлөх") : t("Оноох")}
          </Button>
        </Box>
      </Box>

      <Box sx={{ ...PANEL_SX, mb: 0 }}>
        <Typography
          component="div"
          variant="subtitle2"
          sx={{ color: colors.brand.ink, mb: space[2] }}
        >
          {t("Дасгалын бүртгэл")}
        </Typography>
        {Sessions.length === 0 ? (
          <BaseNoData Text={t("Дасгал хийгээгүй байна")} />
        ) : (
          Sessions.slice(0, 10).map((S) => {
            const Symptoms =
              S.StopReason && Array.isArray(S.StopReason.symptoms)
                ? S.StopReason.symptoms.map((c) => t(STOP_SYMPTOMS[c] || c))
                : [];
            return (
              <Box
                key={S.Id}
                sx={{
                  display: "flex",
                  gap: space[3],
                  alignItems: "center",
                  flexWrap: "wrap",
                  py: space[1],
                  borderTop: `1px solid ${colors.brand.hairline}`,
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ minWidth: 140, fontVariantNumeric: "tabular-nums" }}
                >
                  {Helper.ObjectHelper.getDateYMD({ DateStr: S.StartedAt })}
                  {S.DayNo ? " · " + S.DayNo + t("-р өдөр") : ""}
                </Typography>
                <StatusChip
                  Tone={
                    S.Status === "stopped"
                      ? "danger"
                      : S.Status === "completed"
                        ? "success"
                        : "neutral"
                  }
                  Label={t(SESSION_STATUS[S.Status] || S.Status)}
                />
                {S.DurationSec ? (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: colors.brand.inkMuted }}
                  >
                    {S.DurationSec < 60
                      ? S.DurationSec + " " + t("сек")
                      : Math.round(S.DurationSec / 60) + " " + t("мин")}
                  </Typography>
                ) : null}
                {Symptoms.length ? (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: colors.status.dangerInk }}
                  >
                    {Symptoms.join(", ")}
                  </Typography>
                ) : null}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
