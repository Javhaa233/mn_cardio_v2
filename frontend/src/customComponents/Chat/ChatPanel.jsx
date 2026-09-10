import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";

import RoomList from "customComponents/Chat/RoomList";
import Conversation from "customComponents/Chat/Conversation";
import MembersPanel from "customComponents/Chat/MembersPanel";
import NewChatDialog from "customComponents/Chat/NewChatDialog";
import { useChatContext } from "customComponents/Chat/ChatContext";

/**
 * Panel layout: RoomList | Conversation | MembersPanel.
 *
 * At xs the dock is already calc(100vw - 20px), so there is no room for two
 * columns: the list and the conversation become one column at a time, with a
 * back arrow, rather than being squeezed into an unusable split.
 */
export default function ChatPanel() {
  const chat = useChatContext();
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("sm"));

  const [showMembers, setShowMembers] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  const showList = !isNarrow || !chat.activeRoomId;
  const showConversation = !isNarrow || !!chat.activeRoomId;

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {showList ? <RoomList OnNewChat={() => setShowNewChat(true)} /> : null}

      {showConversation ? (
        <Conversation
          OnToggleMembers={() => setShowMembers((v) => !v)}
          ShowBack={isNarrow}
          OnBack={chat.CloseRoom}
        />
      ) : null}

      {showMembers && !isNarrow && chat.activeRoomId ? (
        // Keyed by room so switching conversations remounts the panel - that is
        // what lets its `loading` start true instead of being set inside an
        // effect.
        <MembersPanel
          key={chat.activeRoomId}
          OnClose={() => setShowMembers(false)}
        />
      ) : null}

      <NewChatDialog Open={showNewChat} OnClose={() => setShowNewChat(false)} />
    </Box>
  );
}
