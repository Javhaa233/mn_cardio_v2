import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import MessageList from "customComponents/Chat/MessageList";
import Composer from "customComponents/Chat/Composer";
import { useChatContext } from "customComponents/Chat/ChatContext";

/**
 * One conversation: header, messages, composer - and the drop target.
 *
 * Drag-and-drop covers the whole pane rather than the composer, because that is
 * where a doctor will aim. This is the app's first drag-drop surface, so there
 * was no existing pattern to match.
 */
export default function Conversation({ OnToggleMembers, OnBack, ShowBack }) {
  const { t } = useTranslation();
  const chat = useChatContext();
  const composerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave fire once per child element, so a boolean alone
  // flickers the overlay off as the cursor crosses a message. Count depth.
  const depth = useRef(0);

  const room = chat.activeRoom;

  const markReadIfBottom = useCallback(() => {
    if (!room) return;
    const last = chat.messages[chat.messages.length - 1];
    if (last && last.Id) chat.MarkRead(room.ChatRoomId, last.Id);
  }, [chat, room]);

  const onDrop = (e) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length && composerRef.current) {
      composerRef.current.addFiles(files);
    }
  };

  if (!room) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
          {t("Яриа сонгоно уу")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        position: "relative",
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={onDrop}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${colors.brand.hairline}`,
        }}
      >
        {ShowBack ? (
          <IconButton size="small" onClick={OnBack} aria-label={t("Буцах")}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        ) : null}

        <Avatar
          src={room.RoomImageSrc || undefined}
          sx={{ width: 32, height: 32 }}
        >
          {(room.Name || "?").charAt(0)}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{ color: colors.brand.ink }}
          >
            {room.Name}
          </Typography>
          {room.RoomType === "GR" ? (
            <Typography
              variant="caption"
              component="div"
              sx={{ color: colors.brand.inkMuted }}
            >
              {(room.Members || []).length} {t("гишүүн")}
            </Typography>
          ) : null}
        </Box>

        <Tooltip title={t("Гишүүд")}>
          <IconButton
            size="small"
            onClick={OnToggleMembers}
            aria-label={t("Гишүүд")}
          >
            <GroupIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Silence is ambiguous: it can mean "nobody replied" or "you stopped
          receiving". In a clinical conversation the reader must be able to tell
          the difference, so the disconnected state is stated outright. */}
      {!chat.connected ? (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            bgcolor: colors.brand.tint,
            borderBottom: `1px solid ${colors.brand.hairline}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CircularProgress size={12} sx={{ color: colors.brand.cyanInk }} />
          <Typography variant="caption" sx={{ color: colors.brand.inkMuted }}>
            {t("Холболт тасарлаа. Дахин холбогдож байна...")}
          </Typography>
        </Box>
      ) : null}

      <MessageList
        Messages={chat.messages}
        Loading={chat.messagesLoading}
        LoadingOlder={chat.loadingOlder}
        HasMore={chat.hasMore}
        OnLoadOlder={() => chat.LoadOlder(room.ChatRoomId)}
        OnReachBottom={markReadIfBottom}
        IsTypingRemote={chat.isTypingRemote}
        OnRetry={chat.Retry}
        UploadProgress={chat.uploadProgress}
      />

      <Composer
        // Remounts per room, which is what makes the per-room draft work.
        key={room.ChatRoomId}
        ref={composerRef}
        Draft={chat.draft}
        OnDraftChange={(v) => chat.SetDraft(room.ChatRoomId, v)}
        OnSend={({ MessageText, Files }) =>
          chat.Send({ ChatRoomId: room.ChatRoomId, MessageText, Files })
        }
        OnTyping={(isTyping) =>
          Helper.ChatSocketHelper.EmitTyping(room.ChatRoomId, isTyping)
        }
      />

      {dragging ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.9)",
            // A 2px border is a legal use of `cyan` - it is not text.
            border: `2px dashed ${colors.brand.cyan}`,
            borderRadius: radius.md,
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{ color: colors.brand.cyanInk }}
          >
            {t("Файл энд буулгана уу")}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
