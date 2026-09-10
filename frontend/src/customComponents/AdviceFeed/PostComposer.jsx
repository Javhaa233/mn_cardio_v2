import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import BaseField from "baseComponents/BaseField";
import SimpleSelect from "customComponents/SimpleSelect";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseFileUpload from "baseComponents/Controls/BaseFileUpload";
import { colors } from "@/theme/colors";
import { radius, space, elevation } from "@/theme/tokens";

/**
 * "Шинэ тасалбар" - the composer at the head of the feed.
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
 */
export default function PostComposer({ onPublished }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const user = useRef(Helper.AuthHelper.GetLogedUserLocal());

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

  const reset = () => {
    setValues({});
    setFiles([]);
    setError(null);
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
            text: t("Тасалбар нийтлэгдлээ."),
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
          {t("Шинэ тасалбар бичих…")}
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
                <BaseField
                  ChangeValue={change}
                  Value={values.adv_id_patient || null}
                  Config={configField("adv_id_patient")}
                />
                <SimpleSelect
                  labelId="composer-ticket-type"
                  Config={configField("ticket_type")}
                  ChangeValue={(v) => change("ticket_type", v)}
                  Variant="outlined"
                  FullWidth={true}
                />
              </Box>

              <Box sx={{ mt: space[3] }}>
                <BaseTextArea
                  Config={{ Name: "Body", Value: values.Body || "" }}
                  Value={values.Body || ""}
                  ChangeValue={(name, v) => change("Body", v)}
                  Rows="4"
                  HideLabel={true}
                />
              </Box>

              <Box sx={{ mt: space[3] }}>
                <BaseFileUpload
                  Value={files}
                  Config={{ Name: "Files" }}
                  ChangeValue={(v) => setFiles(v || [])}
                />
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
                    "Нийтэлсэн тасалбар бусад эмч нарт шууд харагдана. Ноорог зөвхөн танд харагдана.",
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
