import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import Helper from "helper";
import useConfirm from "@hooks/useConfirm";
import { colors } from "@/theme/colors";
import { setAlert } from "store/reducers/system";
import DoctorPicker from "customComponents/Chat/DoctorPicker";
import { useChatContext } from "customComponents/Chat/ChatContext";

/**
 * Who is in this room.
 *
 * Three bugs from the version inlined in ChatList.jsx are fixed here:
 *
 *   - the user search called /BaseData/GetList, which is not a mounted route
 *     (the real one is /BaseObject/, and for chat it is now /Chat/SearchUsers),
 *     so the picker always reported "no users found";
 *   - add and remove both called Helper.ShowMessage, which does not exist in
 *     src/helper/index.js, so every SUCCESSFUL add threw a TypeError inside the
 *     callback. The app-wide toast that does exist is setAlert + <Notify>,
 *     already mounted at layouts/Admin.jsx:189;
 *   - removal used a raw window.confirm.
 *
 * Adding is only offered for group rooms. Adding someone to an existing 1:1
 * room would hand them the whole prior history - for a doctor/patient room that
 * is a disclosure of clinical conversation - so the server refuses it and the
 * UI does not pretend otherwise.
 */
export default function MembersPanel({ OnClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const chat = useChatContext();
  const room = chat.activeRoom;
  // ShowConfirm returns a MUI element, not a promise - this hook is the app's
  // wrapper that keeps it in state and renders it. Replaces the raw
  // window.confirm the old panel used.
  const { confirm, confirmDialog } = useConfirm();

  const [members, setMembers] = useState([]);
  // Starts true rather than being flipped inside the effect: a synchronous
  // setState in an effect body causes a cascading render. ChatPanel gives this
  // component a key of the room id, so switching rooms remounts it and this
  // initial value is correct again.
  const [loading, setLoading] = useState(true);

  const isGroup = room && room.RoomType === "GR";
  const isPatient = String(chat.LogedUser && chat.LogedUser.RoleId) === "4";
  const canManage = isGroup && !isPatient;

  const load = useCallback(() => {
    if (!room) return;
    Helper.ChatHelper.GetChatRoomUsers(room.ChatRoomId, (res) => {
      setLoading(false);
      if (res && res.Success)
        setMembers(Array.isArray(res.Data) ? res.Data : []);
    });
  }, [room]);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (success, message) => dispatch(setAlert({ success, message }));

  const addUser = (UserId) => {
    if (!UserId || !room) return;
    Helper.ChatHelper.AddUserToChatRoom(
      { ChatRoomId: room.ChatRoomId, UserId, UserType: "S" },
      (res) => {
        notify(
          !!(res && res.Success),
          (res && res.Message) || t("Алдаа гарлаа"),
        );
        if (res && res.Success) {
          load();
          chat.LoadRooms();
        }
      },
    );
  };

  const removeUser = (member) => {
    if (!room) return;
    confirm(t("Энэ хэрэглэгчийг хасах уу?"), () => {
      Helper.ChatHelper.RemoveUserFromChatRoom(
        {
          ChatRoomId: room.ChatRoomId,
          UserId: member.UserId,
          UserType: member.UserType,
        },
        (res) => {
          notify(
            !!(res && res.Success),
            (res && res.Message) || t("Алдаа гарлаа"),
          );
          if (res && res.Success) {
            load();
            chat.LoadRooms();
          }
        },
      );
    });
  };

  if (!room) return null;

  const active = members.filter((m) => String(m.IsActive) === "1");

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        borderLeft: `1px solid ${colors.brand.hairline}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${colors.brand.hairline}`,
        }}
      >
        <Typography variant="h6" component="div" sx={{ flex: 1 }}>
          {t("Гишүүд")}
        </Typography>
        <IconButton size="small" onClick={OnClose} aria-label={t("Хаах")}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {canManage ? (
        <Box sx={{ p: 1, borderBottom: `1px solid ${colors.brand.hairline}` }}>
          <DoctorPicker Height={200} OnPick={(d) => addUser(d.UserId)} />
        </Box>
      ) : null}

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={20} />
          </Box>
        ) : null}

        <List disablePadding>
          {active.map((m) => (
            <ListItem
              key={`${m.UserType}-${m.UserId}`}
              secondaryAction={
                canManage && !m.IsMe ? (
                  <Tooltip title={t("Хасах")}>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => removeUser(m)}
                      aria-label={t("Хасах")}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null
              }
            >
              <ListItemAvatar sx={{ minWidth: 42 }}>
                <Avatar
                  src={m.ImageSrc || undefined}
                  sx={{ width: 32, height: 32 }}
                >
                  {(m.Name || "?").charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{ variant: "body2", component: "div" }}
                secondaryTypographyProps={{
                  variant: "caption",
                  component: "div",
                }}
                primary={m.IsMe ? `${m.Name} (${t("Би")})` : m.Name}
                secondary={m.OrganizationName || m.profession || ""}
              />
            </ListItem>
          ))}
        </List>

        {!loading && active.length === 0 ? (
          <Typography
            variant="body2"
            component="div"
            sx={{ p: 2, textAlign: "center", color: colors.brand.inkMuted }}
          >
            {t("Гишүүн алга")}
          </Typography>
        ) : null}
      </Box>

      {confirmDialog}
    </Box>
  );
}
