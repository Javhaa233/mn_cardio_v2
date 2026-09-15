import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import Button from "components/CustomButtons/Button";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";

/**
 * Take a new patient under monitoring, from the roster itself.
 *
 * Until now this could only be done from the patient's own card
 * (/admin/PatientInfo -> "Хяналтанд авах"), so a doctor had to already be
 * looking at someone to add them. The monitoring list could be read from but
 * never built from.
 *
 * BY REGISTER NUMBER, AND THAT IS NOT A UI PREFERENCE. AddOrgFilter's Patient
 * branch (backend/helper/BaseControllerHelper.js) early-returns ONLY for
 * `p_registration` + `Equals`; every other search shape gets
 * `Users.Id = <caller>` appended, so a non-admin doctor searching by name sees
 * only patients they personally registered. A name typeahead would come back
 * empty and read as "this citizen does not exist" - which is worse than no
 * search at all, because it is wrong rather than absent.
 *
 * Writes through /api/doctor/monitoring, NOT the legacy
 * /PatientMonitoring/SavePatient. Both are now safe - the legacy route was
 * hardened in the same change - but the doctor route takes the doctor from the
 * token by construction and verifies the patient exists before writing.
 */

// Two letters (Cyrillic or Latin) + 8 digits. Same rule as the top-bar search in
// features/patient/PatientSearch.jsx - a doctor should not have to learn two.
const REGISTER_RE = /^[А-Яа-яA-Za-z]{2}[0-9]{8}$/;

export default function AddPatientToMonitoring({ OnAdded, OnCreateNew }) {
  const { t } = useTranslation();

  const [Register, setRegister] = useState("");
  const [Busy, setBusy] = useState(false);
  const [Patient, setPatient] = useState(null);
  const [Notice, setNotice] = useState(null);
  // `Check: true` means NOT yet monitored - the endpoint's boolean is inverted
  // relative to its name, and three call sites already depend on that.
  const [AlreadyOnList, setAlreadyOnList] = useState(false);

  const Formatted = Register.replace(/\s/g, "").toUpperCase();
  const Valid = REGISTER_RE.test(Formatted);

  const Find = async () => {
    if (!Valid || Busy) return;
    setBusy(true);
    setNotice(null);
    setPatient(null);
    setAlreadyOnList(false);

    const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [
      { Field: "p_registration", Value: Formatted, Op: "Equals" },
    ];

    await Helper.PatientShowHelper.SearchPatient(SearchOption, (resData) => {
      setBusy(false);
      const Found = resData && resData.Success ? resData.Data : null;

      // BaseGetDetailInfo answers Success:true with an empty array when nothing
      // matched, so "not found" is a shape, not an error.
      if (!Found || Array.isArray(Found) || !Found.id_data) {
        setNotice({
          severity: "info",
          text: t("Энэ регистрээр иргэн бүртгэгдээгүй байна"),
          offerCreate: true,
        });
        return;
      }
      setPatient(Found);

      // Ask before offering the button, rather than letting the add silently
      // re-activate a row and look to the doctor like nothing happened.
      Helper.PatientMonitoringHelper.CheckPatientMonitoring(
        Found.id_data,
        (chk) => {
          const NotYet =
            chk && chk.Success && chk.Data && chk.Data.Check === true;
          setAlreadyOnList(!NotYet);
        },
      );
    });
  };

  const Add = async () => {
    if (!Patient || Busy) return;
    setBusy(true);
    setNotice(null);

    const res = await Helper.DoctorApiHelper.AddMonitoring(Patient.id_data);
    setBusy(false);

    if (!res.success) {
      setNotice({ severity: "error", text: res.message || t("Алдаа гарлаа") });
      return;
    }

    setNotice({ severity: "success", text: t("Хяналтанд нэмэгдлээ") });
    setPatient(null);
    setAlreadyOnList(false);
    setRegister("");
    OnAdded && OnAdded();
  };

  return (
    <Box sx={{ minWidth: 380 }}>
      <Typography
        variant="body2"
        component="p"
        sx={{ color: colors.brand.inkDim, mb: space[3] }}
      >
        {t("Иргэний регистрийн дугаараар хайна уу")}
      </Typography>

      <Box sx={{ display: "flex", gap: space[2], alignItems: "flex-start" }}>
        <TextField
          autoFocus
          size="small"
          fullWidth
          value={Register}
          onChange={(e) => setRegister(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && Find()}
          placeholder={t("АА00000000")}
          inputProps={{ maxLength: 10, "aria-label": t("Регистрийн дугаар") }}
          // Only complain once there is enough typed to be wrong.
          error={Formatted.length === 10 && !Valid}
          helperText={
            Formatted.length === 10 && !Valid
              ? t("2 үсэг, 8 оронтой тоо байна")
              : " "
          }
        />
        <Button
          color="info"
          size="sm"
          disabled={!Valid || Busy}
          style={{ boxShadow: "none", marginTop: 0 }}
          onClick={Find}
        >
          {t("Хайх")}
        </Button>
      </Box>

      {Notice ? (
        <Alert severity={Notice.severity} sx={{ mt: space[2], fontSize: 14 }}>
          {Notice.text}
          {Notice.offerCreate && OnCreateNew ? (
            <Box sx={{ mt: space[2] }}>
              <Button
                color="info"
                size="sm"
                style={{ boxShadow: "none" }}
                onClick={() => OnCreateNew(Formatted)}
              >
                {t("Шинэ иргэн бүртгэх")}
              </Button>
            </Box>
          ) : null}
        </Alert>
      ) : null}

      {Patient ? (
        <Box
          sx={{
            mt: space[3],
            p: space[3],
            border: `1px solid ${colors.brand.hairline}`,
            borderLeft: `3px solid ${colors.brand.cyanInk}`,
            borderRadius: radius.md,
            backgroundColor: colors.background.surface,
          }}
        >
          <Typography variant="subtitle2" component="p">
            {[Patient.p_lastname, Patient.p_firstname]
              .filter(Boolean)
              .join(" ") || t("Нэргүй")}
          </Typography>
          <Typography
            variant="caption"
            component="p"
            sx={{ color: colors.brand.inkDim }}
          >
            {/* p_gender is a raw dico code (1/2), not a word - showing it
                unresolved reads as a stray number beside someone's name. The
                register number already encodes sex for anyone who needs it. */}
            {[
              Patient.p_registration,
              Patient.Age || Patient.p_age
                ? (Patient.Age || Patient.p_age) + " " + t("Нас")
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>

          <Box sx={{ mt: space[3] }}>
            {AlreadyOnList ? (
              <Typography
                variant="caption"
                component="span"
                sx={{ color: colors.brand.cyanInk, fontWeight: 600 }}
              >
                {t("Энэ иргэн таны хяналтад аль хэдийн байна")}
              </Typography>
            ) : (
              <Button
                color="info"
                size="sm"
                disabled={Busy}
                style={{ boxShadow: "none" }}
                onClick={Add}
              >
                {t("Хяналтанд авах")}
              </Button>
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
