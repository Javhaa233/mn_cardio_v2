import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  List,
  ListItem,
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

// AttachmentIntake.MAX_FILES_PER_POST on the server. Refusing the surplus in
// the browser is friendlier than having the server drop it after the upload.
const MAX_FILES = 5;

import Button from "components/CustomButtons/Button";

import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";

import Helper from "helper";
import { useChatContext } from "customComponents/Chat/ChatContext";

export default function MonitorQuestion(props) {
  const { t } = useTranslation();
  const { Patient, PatientId = null, onChatOpened = null } = props;

  const [Loading, setLoading] = useState(false);
  const [Comments, setComments] = useState([]);
  const [CommentBody, setCommentBody] = useState("");
  const [Files, setFiles] = useState([]);
  const [Saving, setSaving] = useState(false);
  const [Alert, setAlert] = useState(null);
  // Null when rendered in a layout with no chat dock.
  const chat = useChatContext();

  const listRef = useRef(null);
  const fileRef = useRef(null);

  const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  SearchOption.PageOption.Limit = 1000;
  SearchOption.SearchField = [
    { Field: "patient_id", Value: PatientId, Op: "Equals" },
  ];
  SearchOption.OrderBy = { Field: "id_data", Type: "asc" };

  useEffect(() => {
    GetCommentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [Comments]);

  const GetCommentData = async () => {
    setLoading(true);
    await Helper.BaseCrudHelper.BaseGetList(
      { ObjectName: "VisitComments", SearchOption },
      (resData) => {
        if (resData?.Success) {
          setComments(resData.Data || []);
        }
        setLoading(false);
      },
    );
  };

  /**
   * Answer the patient.
   *
   * THIS USED TO GO THROUGH /BaseObject/create ON VisitComments, and that is
   * why a doctor answering on the web left the patient's phone silent: the
   * generic create writes the row and stops. It notifies nobody, and it has
   * nowhere to put a file, so anything the patient attached could be read here
   * but never answered in kind.
   *
   * POST /api/doctor/monitoring/:patientId/questions writes the same row
   * through the same BaseCreate, then stores attachments against it and calls
   * NotifyPatient. That notification is the acceptance criterion for tracker
   * rows 36 and 37 - "асуулт эмчид хүрнэ", "зөвлөгөө мэдэгдэлтэйгээр хүрнэ" -
   * and the mobile client has had it since 2026-09-11 while the web did not.
   *
   * It also applies the monitoring gate server-side, so a doctor who is not
   * monitoring this patient is refused here rather than silently writing a row.
   */
  const SaveComment = async () => {
    const hasText = CommentBody.trim().length > 0;
    if ((!hasText && Files.length === 0) || !PatientId || Saving) return;

    setSaving(true);
    const res = await Helper.DoctorApiHelper.ReplyPatientQuestion(PatientId, {
      Comment: CommentBody,
      Files,
    });
    setSaving(false);

    if (!res.success) {
      setAlert(
        Helper.BaseCrudHelper.ShowAlert(
          Helper.DoctorApiHelper.IsNotMonitored(res)
            ? t("Энэ иргэн таны хяналтад байхгүй тул хариулах боломжгүй.")
            : res.message || t("Алдаа гарлаа"),
          false,
          () => setAlert(null),
        ),
      );
      return;
    }

    // Attachments are refused individually rather than failing the reply, so a
    // partial success is a real outcome and has to be said out loud - the reply
    // is already saved and retrying would double-post it.
    const rejected = (res.data && res.data.rejected) || [];
    if (rejected.length > 0) {
      setAlert(
        Helper.BaseCrudHelper.ShowAlert(
          t("Хариулт хадгалагдлаа. Зарим файл хавсрагдсангүй") +
            ": " +
            rejected.map((r) => r.Name + " - " + r.Message).join("; "),
          false,
          () => setAlert(null),
        ),
      );
    }

    setCommentBody("");
    setFiles([]);
    GetCommentData();
  };

  /**
   * Open a direct chat with this patient. Until this button, a doctor-patient
   * room could only ever be opened by the patient. StartChat is idempotent - it
   * returns the existing room or makes one - and staff may reach any patient
   * (ChatController.CanReach), so the realistic failure is a missing patient.
   */
  const StartChat = () => {
    if (!PatientId) return;
    const Target = { UserId: PatientId, UserType: "P" };

    if (chat) {
      chat.StartChat(Target, (ok, _roomId, message) => {
        if (!ok) {
          setAlert(
            Helper.BaseCrudHelper.ShowAlert(
              message || t("Алдаа гарлаа"),
              false,
              () => setAlert(null),
            ),
          );
          return;
        }
        if (onChatOpened) onChatOpened();
      });
      return;
    }

    // No dock in this layout - still create the room, and say so.
    Helper.ChatHelper.StartChat(Target, (resData) => {
      setAlert(
        Helper.BaseCrudHelper.ShowAlert(
          (resData && resData.Message) || t("Алдаа гарлаа"),
          !!(resData && resData.Success),
          () => setAlert(null),
        ),
      );
    });
  };

  const MessageBubble = ({ isDoctor, text, author, date }) => (
    <ListItem
      disableGutters
      sx={{
        display: "flex",
        justifyContent: isDoctor ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      {!isDoctor && (
        <Avatar sx={{ mr: 1, bgcolor: "#90caf9" }}>{author?.[0] || "P"}</Avatar>
      )}

      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          maxWidth: "70%",
          bgcolor: isDoctor ? "#dcf8c6" : "#fff",
          borderRadius: 2,
          borderTopRightRadius: isDoctor ? 0 : 8,
          borderTopLeftRadius: isDoctor ? 8 : 0,
        }}
      >
        <Typography variant="body2">{text}</Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.5, color: "text.secondary" }}
        >
          {Helper.ObjectHelper.getDateYMDHMS({ DateStr: date })}
        </Typography>
      </Paper>

      {isDoctor && (
        <Avatar sx={{ ml: 1, bgcolor: "#66bb6a" }}>{author?.[0] || "D"}</Avatar>
      )}
    </ListItem>
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {Alert}
      <Box sx={{ display: "flex", justifyContent: "flex-end", pb: 1 }}>
        <Button
          color="info"
          size="sm"
          onClick={StartChat}
          disabled={!PatientId}
          style={{ boxShadow: "none" }}
        >
          {t("Чатаар бичих")}
        </Button>
      </Box>
      {/* Chat Body */}
      <Box
        ref={listRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1,
          py: 0.5,
          bgcolor: "#e5ddd5",
        }}
      >
        {Loading ? (
          <BaseLoading />
        ) : Comments.length > 0 ? (
          <List disablePadding>
            {[...Comments].reverse().map((c, i) => (
              <MessageBubble
                key={i}
                isDoctor={c.is_doctor + "" === "1"}
                text={c.comment}
                date={c.date_modif}
                author={
                  c.is_doctor + "" === "1"
                    ? c.DoctorsProfile?.firstname
                    : c.Patient?.p_firstname
                }
              />
            ))}
          </List>
        ) : (
          <BaseNoData Text="No questions asked" />
        )}
      </Box>

      {/* Input Area */}
      <Paper
        elevation={1}
        sx={{
          p: 1,
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1, width: "100%" }}>
          <BaseTextArea
            Config={{
              Value: CommentBody,
            }}
            Value={CommentBody}
            WithLabel={false}
            Rows="5"
            ChangeValue={(name, value) => setCommentBody(value)}
          />

          {Files.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
              {Files.map((f, i) => (
                <Chip
                  key={f.name + i}
                  size="small"
                  label={f.name}
                  onDelete={() =>
                    setFiles((prev) => prev.filter((_, n) => n !== i))
                  }
                />
              ))}
            </Box>
          ) : null}
        </div>

        {/* The patient has been able to attach photos to a question since
            2026-09-14; until now the doctor could read them and not reply in
            kind. Same allowlist and 10-file cap the server enforces. */}
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          aria-label={t("Файл хавсаргах")}
          onChange={(e) => {
            const picked = Array.from(e.target.files || []);
            setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES));
            e.target.value = "";
          }}
        />
        <Tooltip title={t("Файл хавсаргах")}>
          <span>
            <IconButton
              size="small"
              aria-label={t("Файл хавсаргах")}
              disabled={Saving || Files.length >= MAX_FILES}
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Button
          color="info"
          size="sm"
          onClick={SaveComment}
          // A file-only answer is legitimate - an annotated ECG needs no words.
          disabled={
            Saving || (!CommentBody.trim() && Files.length === 0) || !PatientId
          }
          style={{ boxShadow: "none" }}
        >
          {Saving ? t("Илгээж байна...") : t("Send")}
        </Button>
      </Paper>
    </Box>
  );
}
