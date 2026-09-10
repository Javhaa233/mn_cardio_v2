import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Badge,
  Button,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { colors } from "@/theme/colors";
import { useChatContext } from "customComponents/Chat/ChatContext";
import {
  messagePreview,
  roomStampLabel,
} from "customComponents/Chat/chatUtils";

/**
 * The conversation sidebar.
 *
 * Three things the old Accounts.jsx got wrong are fixed here by construction:
 * its search box's onChange body was an empty comment, so typing filtered
 * nothing; every row carried an unconditional green "online" dot despite there
 * being no presence system anywhere in the app; and a row was a bare name, with
 * no last message, no timestamp and no unread count, in no particular order.
 *
 * The green dot is deleted rather than implemented. A permanently-green
 * indicator is a lie a doctor will act on - "they're online, they'll see it".
 */
export default function RoomList({ OnNewChat }) {
  const { t } = useTranslation();
  const chat = useChatContext();
  const [query, setQuery] = useState("");

  const rooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chat.rooms;
    return chat.rooms.filter((r) =>
      String(r.Name || "")
        .toLowerCase()
        .includes(q),
    );
  }, [chat.rooms, query]);

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: 300 },
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${colors.brand.hairline}`,
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          p: 1,
          borderBottom: `1px solid ${colors.brand.hairline}`,
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder={t("Нэрээр хайх")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ "aria-label": t("Нэрээр хайх") }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  fontSize="small"
                  sx={{ color: colors.brand.inkMuted }}
                />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title={t("Шинэ яриа")}>
          <IconButton
            size="small"
            onClick={OnNewChat}
            aria-label={t("Шинэ яриа")}
            sx={{
              bgcolor: colors.brand.cyanInk,
              color: "#fff",
              "&:hover": { bgcolor: colors.brand.cyanInkHover },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {chat.roomsLoading && chat.rooms.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        ) : null}

        {!chat.roomsLoading && rooms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ color: colors.brand.inkMuted, mb: query ? 0 : 2 }}
            >
              {query
                ? t("Илэрц олдсонгүй")
                : t("Яриа алга. Шинэ яриа эхлүүлнэ үү")}
            </Typography>
            {/* A doctor with no conversations yet used to see only this
                sentence and no way to act on it. The + button is small and in
                the corner; this is the obvious target. */}
            {!query ? (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={OnNewChat}
                sx={{
                  bgcolor: colors.brand.cyanInk,
                  "&:hover": { bgcolor: colors.brand.cyanInkHover },
                }}
              >
                {t("Эмч хайх")}
              </Button>
            ) : null}
          </Box>
        ) : null}

        <List disablePadding>
          {rooms.map((r) => {
            const unread = r.UnreadCount || 0;
            const active = r.ChatRoomId === chat.activeRoomId;
            return (
              <ListItemButton
                key={r.ChatRoomId}
                selected={active}
                onClick={() => chat.OpenRoom(r.ChatRoomId)}
                sx={{
                  alignItems: "flex-start",
                  "&.Mui-selected": { bgcolor: colors.brand.tint },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar
                    src={r.RoomImageSrc || undefined}
                    sx={{ width: 36, height: 36 }}
                  >
                    {(r.Name || "?").charAt(0)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primaryTypographyProps={{ component: "div" }}
                  secondaryTypographyProps={{ component: "div" }}
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        component="span"
                        noWrap
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontWeight: unread ? 600 : 400,
                          color: colors.brand.ink,
                        }}
                      >
                        {r.Name || t("Нэргүй")}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{ color: colors.brand.inkMuted, flexShrink: 0 }}
                      >
                        {roomStampLabel(r.LastActivityDate, t)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="caption"
                        component="span"
                        noWrap
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          color: colors.brand.inkMuted,
                        }}
                      >
                        {messagePreview(r.LastMessage, t)}
                      </Typography>
                      {unread > 0 ? (
                        <Badge
                          badgeContent={unread}
                          max={99}
                          sx={{
                            mr: 1,
                            "& .MuiBadge-badge": {
                              position: "static",
                              transform: "none",
                              bgcolor: colors.brand.cyanInk,
                              color: "#fff",
                            },
                          }}
                        />
                      ) : null}
                    </Box>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
