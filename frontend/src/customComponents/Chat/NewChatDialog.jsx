import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { setAlert } from "store/reducers/system";
import DoctorPicker from "customComponents/Chat/DoctorPicker";
import { useChatContext } from "customComponents/Chat/ChatContext";

/**
 * Start a conversation.
 *
 * A Dialog rather than an inline panel: the dock is 950x550 and collapses to
 * calc(100vw - 20px) at xs, where an inline picker would have to displace either
 * the room list or the conversation, and there is nothing to displace.
 *
 * The directory itself is Chat/DoctorPicker.jsx - a visible, always-populated
 * list. It replaced baseComponents/Controls/BaseLookUpGridLoad here because that
 * control shows an EMPTY popper until you type, which in a "who do I message?"
 * dialog reads as "there are no doctors". See the note at the top of
 * DoctorPicker for the full reasoning.
 */
export default function NewChatDialog({ Open, OnClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const chat = useChatContext();

  const [tab, setTab] = useState(0);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isPatient = String(chat.LogedUser && chat.LogedUser.RoleId) === "4";
  const groupMode = tab === 1 && !isPatient;

  const reset = () => {
    setGroupName("");
    setGroupMembers([]);
    setError(null);
    setBusy(false);
    setTab(0);
  };

  const close = () => {
    reset();
    OnClose();
  };

  /** One-to-one: picking a doctor IS the action. No second confirmation step. */
  const startDirect = (doctor) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    chat.StartChat(
      { UserId: doctor.UserId, UserType: doctor.UserType || "S" },
      (ok, _id, message) => {
        setBusy(false);
        if (ok) close();
        else setError(message || t("Алдаа гарлаа"));
      },
    );
  };

  const toggleGroupMember = (doctor) => {
    setGroupMembers((prev) =>
      prev.some((m) => m.UserId === doctor.UserId)
        ? prev.filter((m) => m.UserId !== doctor.UserId)
        : [...prev, doctor],
    );
  };

  const createGroup = () => {
    if (!groupName.trim() || groupMembers.length === 0) return;
    setBusy(true);
    setError(null);
    Helper.ChatHelper.CreateGroupRoom(
      {
        RoomName: groupName.trim(),
        Members: groupMembers.map((m) => ({
          UserId: m.UserId,
          UserType: m.UserType || "S",
        })),
      },
      (res) => {
        setBusy(false);
        if (res && res.Success && res.Data && res.Data.ChatRoomId) {
          chat.LoadRooms();
          chat.OpenRoom(res.Data.ChatRoomId);
          dispatch(
            setAlert({ success: true, message: t("Бүлгийн чат үүсгэлээ") }),
          );
          close();
        } else {
          setError((res && res.Message) || t("Алдаа гарлаа"));
        }
      },
    );
  };

  return (
    <Dialog open={Open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>{t("Шинэ яриа")}</DialogTitle>

      {/* A patient may only open a 1:1 chat with their own doctor, so the group
          tab is not offered - the server refuses it regardless. */}
      {!isPatient ? (
        <Tabs
          value={tab}
          onChange={(_e, v) => {
            setTab(v);
            setError(null);
          }}
          sx={{ px: 3, borderBottom: `1px solid ${colors.brand.hairline}` }}
        >
          <Tab label={t("Ганцаарчилсан")} />
          <Tab label={t("Бүлэг")} />
        </Tabs>
      ) : null}

      <DialogContent sx={{ pt: 2 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {groupMode ? (
          <>
            <TextField
              fullWidth
              size="small"
              label={t("Бүлгийн нэр")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mb: 2 }}
            />
            {groupMembers.length > 0 ? (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}
              >
                {groupMembers.map((m) => (
                  <Chip
                    key={m.UserId}
                    size="small"
                    label={m.Name}
                    onDelete={() => toggleGroupMember(m)}
                    sx={{
                      borderColor: colors.brand.hairline,
                      color: colors.brand.ink,
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : null}
          </>
        ) : (
          <Typography
            variant="body2"
            component="div"
            sx={{ mb: 1.5, color: colors.brand.inkMuted }}
          >
            {isPatient
              ? t("Өөрийн эмчийг сонгоно уу")
              : t("Эмчийг сонгоход яриа шууд эхэлнэ")}
          </Typography>
        )}

        <DoctorPicker
          Multiple={groupMode}
          SelectedIds={groupMembers.map((m) => m.UserId)}
          OnPick={groupMode ? toggleGroupMember : startDirect}
          Height={groupMode ? 260 : 320}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={close}>{t("Болих")}</Button>
        {groupMode ? (
          <Button
            variant="contained"
            disabled={!groupName.trim() || groupMembers.length === 0 || busy}
            onClick={createGroup}
            sx={{
              bgcolor: colors.brand.cyanInk,
              "&:hover": { bgcolor: colors.brand.cyanInkHover },
            }}
          >
            {t("Бүлэг үүсгэх")} ({groupMembers.length})
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
