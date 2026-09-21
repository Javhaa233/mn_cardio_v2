import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Badge, Box, Card, Fab, Zoom } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

import { colors } from "@/theme/colors";
import { elevation, radius } from "@/theme/tokens";
import ChatPanel from "customComponents/Chat/ChatPanel";
import ChatToast from "customComponents/Chat/ChatToast";
import { useChatContext } from "customComponents/Chat/ChatContext";

// Module-level so it keeps its identity - a fresh arrow every render would
// change the Escape effect's dependencies on every render.
const NOOP = () => {};

/**
 * The floating chat dock.
 *
 * Filename kept so layouts/Admin.jsx's import does not move. All state now lives
 * in ChatProvider, which the layout mounts around this.
 *
 * Three fixes to the dock itself:
 *
 * 1. zIndex 9999 -> 1200 (MUI's `drawer`). At 9999 the dock sat ABOVE MUI's
 *    Dialog (1300), so the new-chat dialog rendered underneath it. 1200 still
 *    clears the sidebar (1032) and navbar (1030), and lets Dialog and the
 *    Lightbox (13000) sit above the dock where they belong.
 *
 * 2. Click-outside is gone. It closed on ANY outside mousedown, and both
 *    NewChatDialog and Lightbox portal to document.body - so the dock vanished
 *    mid-interaction whenever you clicked inside one of them. Close on the FAB
 *    or Escape. Nobody expects a messenger to close because they clicked a table.
 *
 * 3. The badge counts unread messages. It used to be `chatRooms.length`, so a
 *    doctor in six conversations saw a permanent red "6" that never changed and
 *    meant nothing. It is `cyanInk`, NOT `error`/`urgent`: in a cardiology EMR an
 *    unread-message badge and a critical-value alert must not look alike, and
 *    CLAUDE.md reserves the one saturated colour for the genuinely urgent thing.
 */
/**
 * `BottomOffset` is how far the dock sits above the bottom of the viewport.
 *
 * The default 30 is the geometry this dock has always had and is what the
 * doctor shell still gets. The patient portal raises it on phones, where a
 * fixed bottom navigation bar occupies the lower 56px: the button is 60px
 * tall sitting at 30, so it spans 30-90px and would otherwise paint straight
 * over two of the five tabs at zIndex 1200.
 *
 * A prop rather than a `useIsPhone()` check inside this component, because
 * this component is shared with layouts/Admin.jsx - a role check here would
 * move the button on a doctor's phone, where there is no bar to clear.
 */
export default function Chat({ BottomOffset = 30 }) {
  const { t } = useTranslation();
  const chat = useChatContext();

  const isOpen = chat ? chat.isOpen : false;
  const setIsOpen = chat ? chat.setIsOpen : NOOP;
  const unread = chat ? chat.unreadTotal : 0;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  // Rendered outside a provider (or before login) - nothing to show.
  if (!chat || !chat.MyUserId) return null;

  return (
    <Box
      sx={{ position: "fixed", bottom: BottomOffset, right: 30, zIndex: 1200 }}
    >
      <Zoom in={isOpen} unmountOnExit>
        <Card
          elevation={0}
          role="dialog"
          aria-label={t("Чат")}
          sx={{
            position: "absolute",
            bottom: 80,
            right: 0,
            width: { xs: "calc(100vw - 20px)", sm: 600, md: 950 },
            maxWidth: "calc(100vw - 20px)",
            height: 550,
            // 140 = the panel's 80px offset from the button plus headroom. The
            // button's own offset is added so a raised dock does not push the
            // panel off the top of the screen.
            maxHeight: `calc(100vh - ${60 + BottomOffset + 50}px)`,
            display: "flex",
            flexDirection: "column",
            borderRadius: radius.lg,
            overflow: "hidden",
            bgcolor: colors.brand.surface,
            border: `1px solid ${colors.brand.hairline}`,
            boxShadow: elevation[4],
          }}
        >
          <ChatPanel />
        </Card>
      </Zoom>

      <Fab
        color="primary"
        aria-label={t("Чат")}
        onClick={() => {
          if (!isOpen) chat.RequestNotifyPermission();
          setIsOpen(!isOpen);
        }}
        sx={{
          width: 60,
          height: 60,
          background: colors.brand.gradient,
          boxShadow: elevation[2],
          "&:hover": {
            background: colors.brand.gradient,
            filter: "brightness(1.08)",
          },
        }}
      >
        {isOpen ? (
          <CloseIcon sx={{ fontSize: 30 }} />
        ) : (
          <Badge
            badgeContent={unread}
            max={99}
            invisible={unread === 0}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: colors.brand.cyanInk,
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 700,
                minWidth: 20,
                height: 20,
                borderRadius: radius.pill,
                border: "2px solid #fff",
                top: -5,
                right: -5,
              },
            }}
          >
            {/* 30px is well above the 24px floor, so a cyan-family glyph is a
                legal use of the accent here. */}
            <ChatIcon sx={{ fontSize: 30 }} />
          </Badge>
        )}
      </Fab>

      <ChatToast />
    </Box>
  );
}

Chat.propTypes = {
  /** Distance in px from the viewport bottom. Raised where a bottom bar sits. */
  BottomOffset: PropTypes.number,
};
