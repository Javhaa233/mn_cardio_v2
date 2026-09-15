import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

import Button from "components/CustomButtons/Button";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import LoadError from "customComponents/LoadError";
import navClick from "customComponents/PageTabs/navClick";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { statusAccent, statusLabel } from "./ticketStatus";

/**
 * Зөвлөгөө for ONE patient.
 *
 * There was no way to ask this question anywhere in the app. `/Advice/GetFeed`
 * filters by tab, search text, ticket type and geography but not by patient;
 * `/api/patient/advice` scopes to the caller's own token, so a doctor cannot
 * use it for somebody else; and `/api/doctor/advice` filters on `Advice.id`,
 * which is the AUTHOR, not the patient. So a doctor looking at a patient could
 * not see what had already been advised about them - and asked again.
 *
 * No new endpoint was needed. `/Advice/GetList` is a generic BaseGetList and
 * `Advice.adv_id_patient` is already in `Advice.SearchField`, so one search
 * field answers it. `view/MyTicket.jsx` uses the same route the same way.
 *
 * DELIBERATELY READ-ONLY plus a create button. The full thread - replies,
 * likes, ratings, the voice-note player - already exists at
 * /admin/AdviceComment, and rebuilding it inside a tab would fork the renderer.
 * This lists and links.
 */

// A tab is not a feed. Enough to answer "has this been asked about before?"
// without turning the panel into a second scrolling wall.
const PAGE_SIZE = 20;

export default function PatientAdvicePanel({
  PatientId = null,
  RegisterNo = null,
  Height = "560px",
}) {
  const { t } = useTranslation();

  /*
   * The result carries the patient it belongs to rather than being reset by an
   * effect when PatientId changes.
   *
   * An effect that calls setState is a cascading render and this project's
   * eslint config makes it an error - correctly, because the reset would land a
   * frame LATE: for one render the panel would show the PREVIOUS patient's
   * зөвлөгөө under the new patient's name. On a clinical screen that is not a
   * flicker, it is the wrong patient's record. Deriving cannot go stale.
   */
  const [State, setState] = useState({
    ForId: null,
    LoadFailed: false,
    Message: "",
    Rows: [],
  });

  /**
   * Whether a NEW ticket may be opened for this patient.
   *
   * This is the care-team rule, not the monitoring rule, and the difference is
   * the whole reason this check exists. `/Advice/CheckByPatient` -> SetExamAdvice
   * requires a DoctorsTeamPatient row, so a doctor may perfectly well be
   * monitoring a patient - and so able to read this panel - and still be unable
   * to open a ticket for them. Asking up front means the button explains itself
   * instead of the save failing.
   *
   * The endpoint's boolean is INVERTED relative to its name: `Check: true` means
   * "no active ticket blocks a new one". It also returns false when the patient
   * already has an open Асуумж, so the reason is carried through verbatim
   * rather than being guessed at here.
   */
  const [CanCreate, setCanCreate] = useState({
    ForId: null,
    Allowed: false,
    Reason: "",
  });

  const Load = useCallback(() => {
    if (!PatientId) return;

    const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.PageOption.Limit = PAGE_SIZE;
    SearchOption.SearchField = [
      { Field: "adv_id_patient", Value: PatientId, Op: "Equals" },
    ];
    SearchOption.OrderBy = { Field: "id_data", Type: "desc" };

    Helper.AdviceHelper.GetList(SearchOption, (resData) => {
      if (!resData || resData.Success === false) {
        setState({
          ForId: PatientId,
          LoadFailed: true,
          Message: (resData && resData.Message) || "",
          Rows: [],
        });
        return;
      }
      setState({
        ForId: PatientId,
        LoadFailed: false,
        Message: "",
        Rows: resData.Data || [],
      });
    });

    Helper.AdviceHelper.CheckByPatient(PatientId, (resData) => {
      const Data = (resData && resData.Data) || {};
      setCanCreate({
        ForId: PatientId,
        Allowed: Data.CheckData === true,
        Reason: Data.Text || "",
      });
    });
  }, [PatientId]);

  useEffect(() => {
    Load();
  }, [Load]);

  if (!PatientId) return <BaseNoData Text={t("Иргэн сонгогдоогүй байна")} />;

  // Anything not yet answered FOR THIS PATIENT is still loading.
  const Ready = State.ForId === PatientId;
  const { LoadFailed, Message, Rows } = State;
  const AllowCreate = CanCreate.ForId === PatientId && CanCreate.Allowed;

  if (!Ready) return <BaseLoading />;
  if (LoadFailed) return <LoadError Message={Message} Retry={Load} />;

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
          {t("Энэ иргэнд өгсөн зөвлөгөө")} ({Rows.length})
        </Typography>

        {/* span, because a disabled button fires no events and a Tooltip with
            nothing to listen to never opens - which is precisely the case that
            has something to explain. */}
        <Tooltip
          title={AllowCreate ? "" : CanCreate.Reason || t("Боломжгүй байна")}
        >
          <span>
            <Button
              color="info"
              size="sm"
              disabled={!AllowCreate}
              style={{ boxShadow: "none" }}
              onClick={navClick(
                "/admin/AdviceHome?PatientId=" +
                  PatientId +
                  (RegisterNo ? "&RegisterNo=" + RegisterNo : ""),
              )}
            >
              {t("Шинэ зөвлөгөө")}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {Rows.length === 0 ? (
          <BaseNoData Text={t("Зөвлөгөө бүртгэгдээгүй байна")} />
        ) : (
          Rows.map((Row) => {
            const Href = "/admin/AdviceComment?AdviceId=" + Row.id_data;
            return (
              <Box
                key={Row.id_data}
                component="a"
                href={Href}
                onClick={navClick(Href)}
                sx={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  cursor: "pointer",
                  border: `1px solid ${colors.brand.hairline}`,
                  borderLeft: `3px solid ${statusAccent(Row)}`,
                  borderRadius: radius.md,
                  p: space[3],
                  mb: space[2],
                  backgroundColor: colors.background.surface,
                  "&:hover": { backgroundColor: colors.brand.tint },
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
                    sx={{ color: statusAccent(Row), fontWeight: 600 }}
                  >
                    {statusLabel(Row, t)}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{ color: colors.brand.inkDim }}
                  >
                    {Helper.ObjectHelper.getDateYMD({
                      DateStr: Row.date_creation,
                    })}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  component="p"
                  sx={{
                    mt: space[1],
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {/* Body is empty on 57% of tickets - the clinical content is
                      in the first reply - so an empty card would be the common
                      case rather than the exception. */}
                  {Row.Body || t("Тайлбар бичээгүй")}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
