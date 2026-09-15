import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import Button from "components/CustomButtons/Button";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import LoadError from "customComponents/LoadError";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";

/**
 * Цахим үзлэг for one patient, WITH the three triage actions.
 *
 * The web had no doctor action on e-visits at all. The state machine has been
 * complete in backend/helper/RemoteVisitFlow.js for some time - requested ->
 * scheduled -> completed | cancelled, with terminal states refused server-side
 * - and POST /api/doctor/evisits/:id/{schedule,complete,cancel} exposed all
 * three. Nothing called them: the only e-visit UI a doctor had was
 * RemoteVisitList, which is read-only history and does not even show Status. So
 * a patient could request a visit and no one could accept it from the web.
 *
 * Reads GET /api/doctor/evisits?patientId=, which exists for exactly this
 * screen - its own header says so - and is access-audited. The legacy
 * /RemoteVisit/GetList this replaces returned every patient's rows and was
 * filtered in the browser.
 *
 * ATTACHMENTS ARE NOT SHOWN HERE. The legacy route is still the only one that
 * returns them, and RemoteVisitList remains the place to read them. This panel
 * is the queue and the actions; that one is the record.
 */

// RemoteVisitFlow.STATUS. Values, not labels - these are the OptionTypes
// `value` column, and the server sends StatusLabel for display.
const STATUS = {
  REQUESTED: "requested",
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const ACCENT = {
  [STATUS.REQUESTED]: colors.brand.urgent,
  [STATUS.SCHEDULED]: colors.brand.cyanInk,
  [STATUS.COMPLETED]: colors.label.success || colors.brand.inkDim,
  [STATUS.CANCELLED]: colors.brand.inkDim,
};

/** A datetime-local value the server will accept, defaulting an hour ahead. */
function DefaultSlot() {
  const D = new Date(Date.now() + 3600000);
  const Pad = (n) => String(n).padStart(2, "0");
  return (
    D.getFullYear() +
    "-" +
    Pad(D.getMonth() + 1) +
    "-" +
    Pad(D.getDate()) +
    "T" +
    Pad(D.getHours()) +
    ":" +
    Pad(D.getMinutes())
  );
}

export default function EvisitPanel({ PatientId = null, Height = "560px" }) {
  const { t } = useTranslation();

  // Carries the patient it belongs to, rather than being reset by an effect -
  // that would be a cascading render (an eslint error here) and would show the
  // previous patient's visits for a frame under the new patient's name.
  const [State, setState] = useState({
    ForId: null,
    LoadFailed: false,
    Message: "",
    Rows: [],
  });
  const [Busy, setBusy] = useState(0);
  const [Slot, setSlot] = useState(DefaultSlot);
  const [Notice, setNotice] = useState("");

  const Load = useCallback(() => {
    if (!PatientId) return;
    Helper.DoctorApiHelper.GetEvisits({ patientId: PatientId, limit: 50 }).then(
      (res) => {
        if (!res.success) {
          setState({
            ForId: PatientId,
            LoadFailed: true,
            Message: Helper.DoctorApiHelper.IsNotMonitored(res)
              ? t("Энэ иргэн таны хяналтад байхгүй байна")
              : res.message || "",
            Rows: [],
          });
          return;
        }
        setState({
          ForId: PatientId,
          LoadFailed: false,
          Message: "",
          Rows: Array.isArray(res.data) ? res.data : [],
        });
      },
    );
  }, [PatientId, t]);

  useEffect(() => {
    Load();
  }, [Load]);

  /**
   * Run one transition and reload.
   *
   * Every refusal is shown rather than swallowed, because most of them are
   * meaningful and actionable: INVALID_TRANSITION means somebody else already
   * moved this visit, NOT_ASSIGNED means it belongs to another doctor, and
   * DATE_IN_PAST means the slot needs picking again. Reloading afterwards is
   * what makes the first of those self-correcting.
   */
  const Act = (Id, Fn, Body) => {
    setBusy(Id);
    setNotice("");
    Fn(Id, Body).then((res) => {
      setBusy(0);
      if (!res.success) {
        setNotice(res.message || t("Алдаа гарлаа"));
        if (res.code === "INVALID_TRANSITION") Load();
        return;
      }
      Load();
    });
  };

  if (!PatientId) return <BaseNoData Text={t("Иргэн сонгогдоогүй байна")} />;

  const Ready = State.ForId === PatientId;
  if (!Ready) return <BaseLoading />;
  if (State.LoadFailed)
    return <LoadError Message={State.Message} Retry={Load} />;

  const { Rows } = State;

  return (
    <Box sx={{ height: Height, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: space[2],
        }}
      >
        <Typography variant="subtitle2" component="span">
          {t("Цахим үзлэг")} ({Rows.length})
        </Typography>
        {Notice ? (
          <Typography
            variant="caption"
            component="span"
            sx={{ color: colors.label.error }}
          >
            {Notice}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {Rows.length === 0 ? (
          <BaseNoData Text={t("Цахим үзлэгийн хүсэлт байхгүй байна")} />
        ) : (
          Rows.map((R) => {
            const Open =
              R.Status === STATUS.REQUESTED || R.Status === STATUS.SCHEDULED;
            const Working = Busy === R.Id;
            return (
              <Box
                key={R.Id}
                sx={{
                  border: `1px solid ${colors.brand.hairline}`,
                  borderLeft: `3px solid ${ACCENT[R.Status] || colors.brand.inkDim}`,
                  borderRadius: radius.md,
                  p: space[3],
                  mb: space[2],
                  backgroundColor: colors.background.surface,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: space[2],
                  }}
                >
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      color: ACCENT[R.Status] || colors.brand.inkDim,
                      fontWeight: 600,
                    }}
                  >
                    {R.StatusLabel || R.Status}
                    {R.DoctorName ? " · " + R.DoctorName : ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{ color: colors.brand.inkDim }}
                  >
                    {Helper.ObjectHelper.getDateYMDHMS({
                      DateStr: R.RequestedDate,
                    })}
                  </Typography>
                </Box>

                {R.Comment ? (
                  <Typography
                    variant="body2"
                    component="p"
                    sx={{ mt: space[1] }}
                  >
                    {R.Comment}
                  </Typography>
                ) : null}

                {R.ScheduledDate ? (
                  <Typography
                    variant="caption"
                    component="p"
                    sx={{ mt: space[1], color: colors.brand.cyanInk }}
                  >
                    {t("Товлосон") +
                      ": " +
                      Helper.ObjectHelper.getDateYMDHMS({
                        DateStr: R.ScheduledDate,
                      })}
                  </Typography>
                ) : null}

                {Open ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: space[2],
                      mt: space[2],
                    }}
                  >
                    <TextField
                      type="datetime-local"
                      size="small"
                      value={Slot}
                      onChange={(e) => setSlot(e.target.value)}
                      inputProps={{ "aria-label": t("Товлох огноо") }}
                    />
                    <Button
                      color="info"
                      size="sm"
                      disabled={Working || !Slot}
                      style={{ boxShadow: "none" }}
                      onClick={() =>
                        Act(R.Id, Helper.DoctorApiHelper.ScheduleEvisit, {
                          ScheduledDate: new Date(Slot).toISOString(),
                        })
                      }
                    >
                      {R.Status === STATUS.SCHEDULED
                        ? t("Дахин товлох")
                        : t("Товлох")}
                    </Button>
                    <Tooltip
                      title={
                        R.Status === STATUS.REQUESTED
                          ? t("Товлоогүй үзлэгийг шууд дуусгаж болно")
                          : ""
                      }
                    >
                      <span>
                        <Button
                          color="success"
                          size="sm"
                          disabled={Working}
                          style={{ boxShadow: "none" }}
                          onClick={() =>
                            Act(R.Id, Helper.DoctorApiHelper.CompleteEvisit, {})
                          }
                        >
                          {t("Дуусгах")}
                        </Button>
                      </span>
                    </Tooltip>
                    <Button
                      color="danger"
                      size="sm"
                      disabled={Working}
                      style={{ boxShadow: "none" }}
                      onClick={() =>
                        Act(R.Id, Helper.DoctorApiHelper.CancelEvisit, {})
                      }
                    >
                      {t("Цуцлах")}
                    </Button>
                  </Box>
                ) : null}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
