import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
import BaseNoData from "customComponents/BaseNoData";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";
import StatusChip from "customComponents/StatusChip";

import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import Helper from "helper";

/**
 * Сануулга — reminders the patient sets for themselves.
 *
 * The mobile tender asks for "patient-configurable notifications (medication,
 * exercise, follow-up appointments)". The whole CRUD has existed on
 * /api/patient/reminders since the API layer was built, with the option lists
 * seeded as `patient_reminder_type` and `patient_reminder_freq` dicos - and
 * nothing anywhere could reach it.
 *
 * Both option lists come from the server rather than being restated here.
 * They are clinical-ish wording under ЗСҮТ's control, and the create handler
 * validates against exactly those dicos, so a hardcoded list here would be a
 * second source that can silently disagree with what the server accepts.
 *
 * Delete is a soft delete server-side: the reminder stops firing and the
 * history stays answerable.
 */

const EMPTY = {
  title: "",
  reminder_type: "medication",
  frequency: "daily",
  times_of_day: "08:00",
};

export default function PatientReminders() {
  const { t } = useTranslation();

  const [State, setState] = useState({
    loading: true,
    error: null,
    data: [],
  });
  const [Options, setOptions] = useState({ types: [], freqs: [] });
  const [Form, setForm] = useState(EMPTY);
  const [FormError, setFormError] = useState("");
  const [Busy, setBusy] = useState(false);
  const [Reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [list, types, freqs] = await Promise.all([
        Helper.PatientApiHelper.GetReminders({ limit: 50 }),
        Helper.PatientApiHelper.GetOptions("patient_reminder_type"),
        Helper.PatientApiHelper.GetOptions("patient_reminder_freq"),
      ]);
      if (cancelled) return;

      setOptions({
        types: types.success && Array.isArray(types.data) ? types.data : [],
        freqs: freqs.success && Array.isArray(freqs.data) ? freqs.data : [],
      });
      setState({
        loading: false,
        error: list.success
          ? null
          : list.message || t("Мэдээлэл ачаалахад алдаа гарлаа"),
        data: list.success && Array.isArray(list.data) ? list.data : [],
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

  const submit = async () => {
    setFormError("");
    if (!Form.title.trim()) {
      setFormError(t("Гарчгаа бичнэ үү"));
      return;
    }
    setBusy(true);
    const res = await Helper.PatientApiHelper.CreateReminder(Form);
    setBusy(false);
    if (!res.success) {
      // The server's message is already Mongolian and specific - which time
      // was malformed, which type is unknown - so it is shown rather than
      // replaced with something vaguer.
      setFormError(res.message || t("Хадгалах үед алдаа гарлаа"));
      return;
    }
    setForm(EMPTY);
    refresh();
  };

  const remove = async (row) => {
    setBusy(true);
    setFormError("");
    const res = await Helper.PatientApiHelper.DeleteReminder(row.Id);
    setBusy(false);
    if (!res.success) {
      // Discarding this made a refused delete look like a successful one: the
      // list simply re-rendered unchanged.
      setFormError(res.message || t("Устгах үед алдаа гарлаа"));
      return;
    }
    refresh();
  };

  const field = (key) => ({
    value: Form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    size: "small",
    fullWidth: true,
  });

  const RenderList = () => {
    if (State.loading) {
      return (
        <Box sx={{ position: "relative", minHeight: "160px" }}>
          <DivLoading WithoutCard />
        </Box>
      );
    }
    if (State.error) {
      return <LoadError Message={State.error} Retry={refresh} />;
    }
    if (!State.data.length) {
      return <BaseNoData Text={t("Сануулга үүсгээгүй байна")} />;
    }

    return State.data.map((row) => (
      <Box
        key={row.Id}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: space[3],
          padding: space[3],
          marginBottom: space[2],
          border: `1px solid ${colors.brand.hairline}`,
          borderRadius: radius.md,
          backgroundColor: colors.brand.surface,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ color: colors.brand.ink }}
          >
            {row.Title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: space[2],
              marginTop: space[1],
              alignItems: "center",
            }}
          >
            {/* The server sends the label beside the code, so the chip reads
                in Mongolian without this screen owning the wording. */}
            <StatusChip
              Tone="info"
              Label={row.ReminderTypeLabel || row.ReminderType}
            />
            <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
              {row.FrequencyLabel || row.Frequency}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
              {Array.isArray(row.TimesOfDay)
                ? row.TimesOfDay.join(", ")
                : row.TimesOfDay}
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label={t("Устгах")}
          onClick={() => remove(row)}
          disabled={Busy}
          sx={{ color: colors.status.dangerInk, flex: "0 0 auto" }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Box>
    ));
  };

  return (
    <PageContainer>
      <GridContainer spacing={2}>
        <GridItem xs={12} md={5}>
          <UniCard title={t("Шинэ сануулга")}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: space[3] }}
            >
              <TextField
                {...field("title")}
                label={t("Гарчиг")}
                placeholder={t("Жишээ: Аспирин уух")}
              />
              <TextField {...field("reminder_type")} label={t("Төрөл")} select>
                {Options.types.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField {...field("frequency")} label={t("Давтамж")} select>
                {Options.freqs.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                {...field("times_of_day")}
                label={t("Цаг")}
                placeholder="08:00, 20:00"
                helperText={t("Олон цагийг таслалаар тусгаарлана")}
              />

              {FormError ? (
                <Box
                  role="alert"
                  sx={{
                    color: colors.status.dangerInk,
                    backgroundColor: colors.status.dangerTint,
                    border: `1px solid ${colors.brand.hairline}`,
                    borderRadius: radius.sm,
                    padding: space[2],
                  }}
                >
                  {FormError}
                </Box>
              ) : null}

              <Box>
                <Button
                  onClick={submit}
                  disabled={Busy}
                  startIcon={<AddIcon />}
                  sx={gridToolbarButtonSx.primary}
                >
                  {t("Нэмэх")}
                </Button>
              </Box>
            </Box>
          </UniCard>
        </GridItem>

        <GridItem xs={12} md={7}>
          <UniCard title={t("Миний сануулгууд")}>{RenderList()}</UniCard>
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
