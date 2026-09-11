import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { List, ListItem, Avatar, Box, Typography, Paper } from "@mui/material";

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
  const [Alert, setAlert] = useState(null);
  // Null when rendered in a layout with no chat dock.
  const chat = useChatContext();

  const listRef = useRef(null);

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

  const SaveComment = async () => {
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    if (!CommentBody.trim() || !LogedUser) return;

    await Helper.BaseCrudHelper.BaseCreate(
      {
        ObjectName: "VisitComments",
        Data: {
          user_id: LogedUser.Id,
          comment: CommentBody,
          is_doctor: "1",
          patient_id: PatientId,
        },
      },
      (resData) => {
        if (resData?.Success) {
          setCommentBody("");
          GetCommentData();
        }
      },
    );
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
        </div>
        <Button
          color="info"
          size="sm"
          onClick={SaveComment}
          style={{ boxShadow: "none" }}
        >
          {t("Send")}
        </Button>
      </Paper>
    </Box>
  );
}
