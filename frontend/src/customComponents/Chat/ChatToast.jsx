import React from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { colors } from "@/theme/colors";
import { elevation, radius } from "@/theme/tokens";
import { useChatContext } from "customComponents/Chat/ChatContext";

/**
 * "П.Болормаа sent you a message" - a corner toast, not a modal.
 *
 * NOT the app-wide Notify/BaseAlert: that renders a centred alert dialog, which
 * is right for "saved successfully" and completely wrong for an incoming
 * message - it would interrupt a doctor mid-form, several times a conversation.
 *
 * Top-RIGHT, under the navbar's notification bell. Bottom-left sat on top of
 * the sidebar, and bottom-right would cover the chat dock it points to. The
 * same message also lands in the bell (one row per room), so the toast
 * appearing next to the bell ties the two together.
 *
 * The provider decides when to raise this: never while you are already looking
 * at that conversation, and the OS notification is used instead when the tab is
 * in the background, so one message never produces two alerts.
 */
export default function ChatToast() {
  const { t } = useTranslation();
  const chat = useChatContext();
  const toast = chat && chat.toast;

  if (!chat) return null;

  return (
    <Snackbar
      open={!!toast}
      onClose={(_e, reason) => {
        // Not on clickaway - a doctor clicking into a form should not silently
        // discard the only signal that someone messaged them.
        if (reason === "clickaway") return;
        chat.DismissToast();
      }}
      autoHideDuration={8000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      // Clear the navbar (the bell sits in it) instead of covering it.
      sx={{ top: { xs: 64, sm: 72 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          minWidth: 300,
          maxWidth: 380,
          p: 1.25,
          bgcolor: colors.brand.surface,
          border: `1px solid ${colors.brand.hairline}`,
          borderLeft: `3px solid ${colors.brand.cyan}`,
          borderRadius: radius.md,
          boxShadow: elevation[4],
        }}
      >
        <Avatar sx={{ width: 34, height: 34, bgcolor: colors.brand.cyanInk }}>
          {((toast && toast.SenderName) || "?").charAt(0)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            component="div"
            noWrap
            sx={{ color: colors.brand.ink }}
          >
            {(toast && toast.SenderName) || t("Шинэ мессеж")}
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{
              color: colors.brand.inkMuted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              overflowWrap: "anywhere",
            }}
          >
            {toast && toast.Text ? toast.Text : t("Хавсралт")}
          </Typography>

          <Button
            size="small"
            onClick={chat.OpenFromToast}
            sx={{
              mt: 0.5,
              p: 0,
              minWidth: 0,
              textTransform: "none",
              color: colors.brand.cyanInk,
            }}
          >
            {t("Нээх")}
          </Button>
        </Box>

        <IconButton
          size="small"
          onClick={chat.DismissToast}
          aria-label={t("Хаах")}
          sx={{ mt: -0.5, mr: -0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
