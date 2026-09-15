import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
import AudioRecorder from "customComponents/Chat/AudioRecorder";
import { recorderUnavailableReason } from "customComponents/Chat/useMediaRecorder";
import { ADVICE_UPLOAD_EXT, ADVICE_MAX_FILE_MB } from "./mediaUtils";
import { colors } from "@/theme/colors";
import { radius, space, elevation } from "@/theme/tokens";
import { CONTROL } from "@/theme.js";

/**
 * "Шинэ асуумж" - the composer at the head of the feed.
 *
 * Every field is driven by the server's Advice config (labels, control types
 * and the patient lookup's own configuration all come from
 * /BaseObject/getData). Nothing here hardcodes a label or an option list; the
 * ticket-type options are OptionTypes rows, so adding one is a database row
 * rather than a code change.
 *
 * Publishing is one action. The API creates the ticket AND opens it in a single
 * call, so a doctor never ends up with an invisible ticket that they believe
 * they posted. Saving a draft is deliberately the secondary path, and it says
 * plainly that a draft stays private.
 *
 * The patient is found BY REGISTER NUMBER, not through the config's
 * `adv_id_patient` lookup. That lookup searched `p_registration` with
 * `Contains`, and AddOrgFilter's Patient branch appends `Users.Id = <caller>`
 * to every search except `p_registration` + `Equals` - so a non-admin doctor
 * only ever saw patients they had registered themselves, listed by internal Id.
 * Same rule as PatientMonitoring/AddPatientToMonitoring.jsx.
 */

// Two letters (Cyrillic or Latin) + 8 digits - the rule the top-bar search and
// the monitoring roster already use.
const REGISTER_RE = /^[А-Яа-яA-Za-z]{2}[0-9]{8}$/;

// The two fields in the composer's top row share one label and one control
// spec, so they line up at the same height whichever is taller by content.
const fieldLabelSx = {
  display: "block",
  mb: space[1],
  color: colors.brand.ink,
};

const controlSx = {
  // The theme's MuiFormControl adds 6px top/bottom margin; the label above
  // already provides the spacing.
  m: "0 !important",
  "& .MuiOutlinedInput-root": {
    backgroundColor: colors.brand.surface,
    "& fieldset": { borderColor: colors.brand.hairlineStrong },
    "&:hover fieldset": { borderColor: colors.brand.inkDim },
    "&.Mui-focused fieldset": { borderColor: colors.brand.cyanInk },
    "&.Mui-error fieldset": { borderColor: colors.input.error },
  },
  // MUI's size="small" input keeps 8.5px top/bottom padding ON TOP of the
  // theme's 30px line-height, which rendered the register field 47px tall
  // beside a 32px select. The select already zeroes its own.
  "& input.MuiOutlinedInput-input": {
    padding: `0 ${CONTROL.paddingX}`,
    height: "30px",
  },
  "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
    padding: `${space[2]} ${CONTROL.paddingX}`,
    fontSize: CONTROL.fontSize,
  },
  "& .MuiInputAdornment-root": { mr: "-6px" },
};

// Brand rank for a secondary action: outlined, neutral, same height as the
// fields above it (ui-consistency program).
const secondaryButtonStyle = {
  margin: 0,
  minHeight: CONTROL.height,
  backgroundColor: colors.brand.surface,
  color: colors.brand.ink,
  border: `1px solid ${colors.brand.hairlineStrong}`,
  boxShadow: "none",
};

export default function PostComposer({ onPublished }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [register, setRegister] = useState("");
  const [patient, setPatient] = useState(null);
  const [finding, setFinding] = useState(false);
  const [patientNotice, setPatientNotice] = useState(null);
  const user = useRef(Helper.AuthHelper.GetLogedUserLocal());
  // The register a response belongs to, so a slow answer for a number the
  // doctor has since changed cannot attach the wrong citizen to the ticket.
  const lookupFor = useRef("");

  const formattedRegister = register.replace(/\s/g, "").toUpperCase();
  const registerValid = REGISTER_RE.test(formattedRegister);

  // Once per mount: a browser that cannot record will not start being able to,
  // and a button that explains itself only once pressed should not be offered.
  const recorderBlocked = React.useMemo(() => recorderUnavailableReason(), []);

  useEffect(() => {
    if (!open || fields.length) return;
    Helper.BaseCrudHelper.GetConfigData("Advice", (res) => {
      if (res && res.Data && res.Data.Fields) {
        setFields(res.Data.Fields.flat().filter((f) => f && f.Name));
      }
    });
  }, [open, fields.length]);

  const configField = (name) => {
    const f = fields.find((s) => String(s.Name) === String(name));
    if (!f) return null;
    return { ...f, Value: values[name] !== undefined ? values[name] : null };
  };

  const change = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  // Label text and options still come from the server config; only the
  // control is local. SimpleSelect is the legacy 28px / 12px control and sat
  // visibly shorter than the register input beside it.
  const patientField = configField("adv_id_patient") || { Label: "" };
  const typeField = configField("ticket_type") || { Label: "" };
  const typeOptions = Array.isArray(typeField.Data) ? typeField.Data : [];
  const typeIdField = (typeField.Config && typeField.Config.IdField) || "Value";
  const typeTextField =
    (typeField.Config && typeField.Config.TextField) || "Label";
  const typeLabelOf = (v) => {
    const o = typeOptions.find((s) => String(s[typeIdField]) === String(v));
    return o ? String(o[typeTextField]) : String(v);
  };

  // Only complain once there is enough typed to be wrong.
  const registerMalformed = formattedRegister.length >= 10 && !registerValid;

  const clearPatient = () => {
    lookupFor.current = "";
    setPatient(null);
    setPatientNotice(null);
    setFinding(false);
    setValues((v) => ({ ...v, adv_id_patient: null }));
  };

  const changeRegister = (text) => {
    setRegister(text);
    if (patient || patientNotice) clearPatient();
  };

  const findPatient = () => {
    if (!registerValid || finding) return;
    const target = formattedRegister;
    lookupFor.current = target;
    setFinding(true);
    setPatientNotice(null);

    const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [
      { Field: "p_registration", Value: target, Op: "Equals" },
    ];
    Helper.PatientShowHelper.SearchPatient(SearchOption, (res) => {
      if (lookupFor.current !== target) return;
      setFinding(false);
      const found = res && res.Success ? res.Data : null;
      // An empty array with Success:true is how "no such citizen" comes back.
      if (!found || Array.isArray(found) || !found.id_data) {
        setPatient(null);
        setValues((v) => ({ ...v, adv_id_patient: null }));
        setPatientNotice(t("Энэ регистрээр иргэн бүртгэгдээгүй байна"));
        return;
      }
      setPatient(found);
      setValues((v) => ({ ...v, adv_id_patient: found.id_data }));
    });
  };

  const reset = () => {
    setValues({});
    setFiles([]);
    setError(null);
    setRegister("");
    clearPatient();
  };

  const canSubmit =
    !!values.adv_id_patient &&
    !!values.ticket_type &&
    values.ticket_type !== "-1" &&
    !!(values.Body && String(values.Body).replace(/\s/g, "").length);

  const attachThenFinish = (DataId, done) => {
    if (!files.length) {
      done();
      return;
    }
    Helper.BaseCrudHelper.BaseUploadFile(
      {
        LinkedObjectInfo: {
          LinkedObjectName: "Advice",
          LinkedObjectId: DataId,
          FieldName: "Files",
        },
        Value: files,
      },
      // Photos are attached after the ticket exists, because a File row points
      // at the ticket's id. This is why create has to return one.
      () => done(),
    );
  };

  const publish = () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    Helper.AdviceHelper.CustomSaveAndPublish(
      {
        adv_id_patient: values.adv_id_patient,
        ticket_type: values.ticket_type,
        Body: values.Body,
      },
      (res) => {
        if (!res || !res.Success) {
          setSaving(false);
          setError((res && res.Message) || t("Хадгалж чадсангүй"));
          return;
        }
        const DataId = res.Data && res.Data.DataId;
        attachThenFinish(DataId, () => {
          setSaving(false);
          reset();
          setOpen(false);
          setNotice({
            severity: "success",
            text: t("Асуумж нийтлэгдлээ."),
          });
          onPublished && onPublished(DataId);
        });
      },
    );
  };

  const saveDraft = () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    Helper.AdviceHelper.CustomSave(
      {
        adv_id_patient: values.adv_id_patient,
        ticket_type: values.ticket_type,
        Body: values.Body,
      },
      (res) => {
        if (!res || !res.Success) {
          setSaving(false);
          setError((res && res.Message) || t("Хадгалж чадсангүй"));
          return;
        }
        const DataId = res.Data && res.Data.DataId;
        attachThenFinish(DataId, () => {
          setSaving(false);
          reset();
          setOpen(false);
          setNotice({
            severity: "info",
            // The customer asked explicitly that people be told this rather
            // than discover it: a draft is not on the wall.
            text: t(
              "Ноорогт хадгаллаа. Ноорог зөвхөн танд харагдана — нийтлэх хүртэл бусад эмч нарт харагдахгүй.",
            ),
          });
          onPublished && onPublished(DataId, { draft: true });
        });
      },
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
        mb: space[4],
        overflow: "hidden",
      }}
    >
      {notice ? (
        <Alert
          severity={notice.severity}
          onClose={() => setNotice(null)}
          sx={{ borderRadius: 0, fontSize: "14px" }}
        >
          {notice.text}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[3],
          p: space[4],
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: colors.brand.tint,
            color: colors.brand.cyanInk,
            fontWeight: 600,
          }}
        >
          {String((user.current && user.current.UserName) || "?")
            .slice(0, 1)
            .toUpperCase()}
        </Avatar>

        <Box
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          sx={{
            flex: 1,
            textAlign: "left",
            font: "inherit",
            fontSize: "15px",
            color: colors.brand.inkDim,
            cursor: "pointer",
            px: space[4],
            height: "40px",
            borderRadius: radius.pill,
            border: `1px solid ${colors.brand.hairline}`,
            backgroundColor: open
              ? colors.brand.surface
              : colors.background.surface,
            "&:hover": { backgroundColor: colors.brand.tint },
            "&:focus-visible": {
              outline: `2px solid ${colors.brand.focus}`,
              outlineOffset: "2px",
            },
          }}
        >
          {t("Шинэ асуумж бичих…")}
        </Box>
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: space[4], pb: space[4] }}>
          {fields.length === 0 ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", py: space[6] }}
            >
              <CircularProgress size={22} />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gap: space[3],
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="label"
                    htmlFor="composer-register"
                    sx={fieldLabelSx}
                  >
                    {t(patientField.Label)}
                  </Typography>
                  <TextField
                    id="composer-register"
                    size="small"
                    fullWidth
                    sx={controlSx}
                    value={register}
                    onChange={(e) =>
                      changeRegister(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        findPatient();
                      }
                    }}
                    placeholder={t("АА00000000")}
                    inputProps={{ maxLength: 12 }}
                    error={registerMalformed}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {finding ? (
                            <CircularProgress size={16} />
                          ) : patient ? (
                            <IconButton
                              size="small"
                              aria-label={t("Clear selection")}
                              onClick={() => changeRegister("")}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              aria-label={t("Хайх")}
                              disabled={!registerValid}
                              onClick={findPatient}
                            >
                              <SearchIcon fontSize="small" />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="label"
                    htmlFor="composer-ticket-type"
                    sx={fieldLabelSx}
                  >
                    {t(typeField.Label)}
                  </Typography>
                  <TextField
                    id="composer-ticket-type"
                    select
                    size="small"
                    fullWidth
                    sx={controlSx}
                    value={
                      values.ticket_type && values.ticket_type !== "-1"
                        ? values.ticket_type
                        : ""
                    }
                    onChange={(e) => change("ticket_type", e.target.value)}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (v) =>
                        v === "" ? (
                          <Box
                            component="span"
                            sx={{ color: colors.brand.inkDim }}
                          >
                            {t("-- Select --")}
                          </Box>
                        ) : (
                          t(typeLabelOf(v))
                        ),
                    }}
                  >
                    {typeOptions.map((o) => (
                      <MenuItem
                        key={String(o[typeIdField])}
                        value={String(o[typeIdField])}
                      >
                        {t(String(o[typeTextField]))}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>

              {/* One status line under BOTH fields, so a message about the
                  register never pushes that field out of line with Төрөл. */}
              {registerMalformed || patientNotice || patient ? (
                <Typography
                  variant="body2"
                  component="p"
                  role="status"
                  sx={{
                    mt: space[2],
                    pl: space[2],
                    borderLeft: `3px solid ${
                      patient ? colors.brand.cyanInk : colors.brand.hairline
                    }`,
                    color: registerMalformed
                      ? colors.input.error
                      : colors.brand.ink,
                  }}
                >
                  {registerMalformed
                    ? t("2 үсэг, 8 оронтой тоо байна")
                    : patient
                      ? [
                          [patient.p_lastname, patient.p_firstname]
                            .filter(Boolean)
                            .join(" ") || t("Нэргүй"),
                          patient.p_registration,
                        ].join(" · ")
                      : patientNotice}
                </Typography>
              ) : null}

              <Box sx={{ mt: space[3] }}>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  sx={controlSx}
                  value={values.Body || ""}
                  onChange={(e) => change("Body", e.target.value)}
                  placeholder={t("Шинэ асуумж бичих…")}
                  inputProps={{ "aria-label": t("Шинэ асуумж бичих…") }}
                />
              </Box>

              <Box
                sx={{ mt: space[3], display: "flex", alignItems: "flex-start" }}
              >
                {recording ? (
                  <AudioRecorder
                    Active={recording}
                    // The clip joins the attachment list; it is not posted on
                    // its own the way a chat voice note is.
                    DoneLabel={t("Хавсаргах")}
                    OnDone={(file) => {
                      setRecording(false);
                      if (file) setFiles((prev) => [...prev, file]);
                    }}
                    OnCancel={() => setRecording(false)}
                    OnError={(msg) => {
                      setRecording(false);
                      setError(t(msg));
                    }}
                  />
                ) : (
                  <>
                    <Box sx={{ flex: 1 }}>
                      <BaseFileUpload
                        Value={files}
                        Config={{ Name: "Files" }}
                        ChangeValue={(v) => setFiles(v || [])}
                        ButtonStyle={secondaryButtonStyle}
                        ButtonAlign="flex-start"
                        allowedFileTypes={ADVICE_UPLOAD_EXT}
                        maxFileSize={ADVICE_MAX_FILE_MB}
                      />
                    </Box>

                    <Tooltip
                      title={
                        recorderBlocked ? t(recorderBlocked) : t("Дуу бичих")
                      }
                    >
                      {/* span: a disabled IconButton fires no events, and a
                          Tooltip with nothing to listen to never opens - which
                          is exactly the case that needs to explain itself. */}
                      <span>
                        <IconButton
                          size="small"
                          aria-label={t("Дуу бичих")}
                          disabled={!!recorderBlocked}
                          onClick={() => setRecording(true)}
                          // 10px: level with the middle of the 52px drop zone beside it.
                          sx={{
                            ml: space[2],
                            mt: "10px",
                            color: colors.brand.cyanInk,
                          }}
                        >
                          <MicIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: space[2],
                  mt: space[3],
                  color: colors.brand.inkDim,
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  {t(
                    "Нийтэлсэн асуумж бусад эмч нарт шууд харагдана. Ноорог зөвхөн танд харагдана.",
                  )}
                </Typography>
              </Box>

              {error ? (
                <Alert severity="error" sx={{ mt: space[3], fontSize: "14px" }}>
                  {error}
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: space[2],
                  mt: space[4],
                }}
              >
                <Button
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                  disabled={saving}
                  sx={{ color: colors.brand.inkDim }}
                >
                  {t("Болих")}
                </Button>
                <Button
                  onClick={saveDraft}
                  disabled={!canSubmit || saving}
                  variant="outlined"
                >
                  {t("Ноорогт хадгалах")}
                </Button>
                <Button
                  onClick={publish}
                  disabled={!canSubmit || saving}
                  variant="contained"
                  startIcon={
                    saving ? <CircularProgress size={14} /> : <SendIcon />
                  }
                  sx={{
                    backgroundColor: colors.brand.cyanInk,
                    "&:hover": { backgroundColor: colors.brand.ink },
                  }}
                >
                  {t("Нийтлэх")}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
