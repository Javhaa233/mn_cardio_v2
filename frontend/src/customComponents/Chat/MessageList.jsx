import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Fab, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import MessageBubble from "customComponents/Chat/MessageBubble";
import {
  dayLabel,
  isNewDay,
  isSameRun,
  messageKey,
} from "customComponents/Chat/chatUtils";

const NEAR_BOTTOM_PX = 80;
const LOAD_OLDER_PX = 120;

/**
 * The scrolling conversation.
 *
 * Three behaviours here were declared but never wired up in the old component,
 * and each is the difference between a usable thread and an unusable one:
 * scrollToBottom existed and was never called; showScrollBottom was declared and
 * never set; and there was no onScroll at all, so the page cursor never advanced
 * and "load older" was unreachable.
 *
 * A plain scrolling Box rather than OverlayScrollbarsComponent: anchor
 * preservation needs direct, synchronous access to scrollHeight/scrollTop on the
 * element that actually scrolls, and reaching through the library's nested
 * viewport for that is a source of bugs, not of polish.
 */
export default function MessageList({
  Messages,
  Loading,
  LoadingOlder,
  HasMore,
  OnLoadOlder,
  OnReachBottom,
  IsTypingRemote,
  OnRetry,
  UploadProgress,
}) {
  const { t } = useTranslation();
  const viewportRef = useRef(null);
  const atBottomRef = useRef(true);
  const prevHeightRef = useRef(0);
  const prevLenRef = useRef(0);
  const [showJump, setShowJump] = useState(false);

  /**
   * DOM only - deliberately sets no state.
   *
   * The layout effect below calls this, and a synchronous setState inside an
   * effect causes a cascading render. It does not need one: the programmatic
   * scroll fires a scroll event, and handleScroll is the single place that
   * decides whether the jump button is visible. One writer for that flag.
   */
  const scrollToBottom = useCallback((behavior) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: behavior || "auto" });
    atBottomRef.current = true;
  }, []);

  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance < NEAR_BOTTOM_PX;
    atBottomRef.current = atBottom;
    setShowJump(!atBottom);

    if (atBottom && OnReachBottom) OnReachBottom();

    if (
      el.scrollTop < LOAD_OLDER_PX &&
      HasMore &&
      !LoadingOlder &&
      OnLoadOlder
    ) {
      // Remember the height BEFORE the older page is prepended; the effect below
      // uses it to keep the reader's eye on the same message.
      prevHeightRef.current = el.scrollHeight;
      OnLoadOlder();
    }
  }, [HasMore, LoadingOlder, OnLoadOlder, OnReachBottom]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const grew = Messages.length - prevLenRef.current;
    const prependedHeight = prevHeightRef.current;
    prevLenRef.current = Messages.length;

    // Older messages were prepended: hold the scroll position by exactly the
    // height that was inserted above the viewport. Without this the thread jumps
    // to the top every time an older page arrives.
    if (prependedHeight && el.scrollHeight > prependedHeight && grew > 0) {
      el.scrollTop += el.scrollHeight - prependedHeight;
      prevHeightRef.current = 0;
      return;
    }

    const last = Messages[Messages.length - 1];
    const mineIsLast = last && last.IsMine;
    if (atBottomRef.current || mineIsLast) {
      // Instant when the room is first painted, smooth for an arrival.
      scrollToBottom(grew === Messages.length ? "auto" : "smooth");
    }
  }, [Messages, scrollToBottom]);

  useEffect(() => {
    prevLenRef.current = 0;
    prevHeightRef.current = 0;
    atBottomRef.current = true;
  }, []);

  if (Loading && Messages.length === 0) {
    return (
      <Centered>
        <CircularProgress size={24} />
      </Centered>
    );
  }

  if (!Loading && Messages.length === 0) {
    return (
      <Centered>
        <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
          {t("Мессеж алга. Эхний мессежээ бичнэ үү")}
        </Typography>
      </Centered>
    );
  }

  return (
    <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
      <Box
        ref={viewportRef}
        onScroll={handleScroll}
        sx={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          px: 1.5,
          py: 1,
        }}
      >
        {LoadingOlder ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        ) : null}

        {!HasMore && Messages.length > 0 ? (
          <Typography
            variant="caption"
            component="div"
            sx={{ textAlign: "center", color: colors.brand.inkMuted, py: 1 }}
          >
            {t("Ярианы эхлэл")}
          </Typography>
        ) : null}

        {Messages.map((m, i) => {
          const prev = i > 0 ? Messages[i - 1] : null;
          const next = i < Messages.length - 1 ? Messages[i + 1] : null;
          const newDay = isNewDay(prev, m);
          const sameRunAsPrev = isSameRun(prev, m);
          const sameRunAsNext = isSameRun(m, next);

          return (
            <React.Fragment key={messageKey(m)}>
              {newDay ? (
                <DaySeparator label={dayLabel(m.CreateDate, t)} />
              ) : null}
              <MessageBubble
                Message={m}
                // Avatar and name on the first message of a run only; the time
                // on the last. In a 550px dock this is the biggest density win
                // available.
                ShowAvatar={!sameRunAsPrev}
                ShowName={!sameRunAsPrev}
                ShowTime={!sameRunAsNext}
                OnRetry={OnRetry}
                UploadPercent={
                  UploadProgress && m.ClientMsgId
                    ? UploadProgress[m.ClientMsgId]
                    : undefined
                }
              />
            </React.Fragment>
          );
        })}

        {IsTypingRemote ? (
          <Typography
            variant="caption"
            component="div"
            sx={{ color: colors.brand.inkMuted, pl: 5, pt: 0.5 }}
          >
            {t("Бичиж байна...")}
          </Typography>
        ) : null}
      </Box>

      {showJump ? (
        <Fab
          size="small"
          aria-label={t("Доош очих")}
          onClick={() => scrollToBottom("smooth")}
          sx={{
            position: "absolute",
            right: 16,
            bottom: 12,
            bgcolor: colors.brand.cyanInk,
            color: "#fff",
            "&:hover": { bgcolor: colors.brand.cyanInkHover },
          }}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      ) : null}
    </Box>
  );
}

function DaySeparator({ label }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
      <Typography
        variant="caption"
        component="span"
        sx={{
          px: 1.25,
          py: 0.25,
          borderRadius: radius.pill,
          bgcolor: colors.brand.tint,
          color: colors.brand.inkMuted,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function Centered({ children }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        textAlign: "center",
      }}
    >
      {children}
    </Box>
  );
}
