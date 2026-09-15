import React from "react";
// translation
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

// custom components
import UniCard from "customComponents/UniCard";
import ChatPanel from "customComponents/Chat/ChatPanel";

/**
 * 2.3 Эмчээс асуух асуулт — now the same conversation the doctor sees.
 *
 * This screen used to be its own channel: VisitCommentsForm wrote a
 * `VisitComments` row and VisitCommentsList read them back. Meanwhile the
 * portal also carries a chat dock in the corner, and the doctor's monitoring
 * roster now opens chat. A patient asking here while a doctor answered there
 * meant the answer arrived somewhere the patient was not looking.
 *
 * So the screen keeps its route, its path and its name, and becomes the chat.
 * One thread, both sides.
 *
 * ChatPanel needs nothing passed to it — it reads rooms, the active
 * conversation and the composer state from ChatProvider, which layouts/Patient
 * already wraps the whole portal in.
 *
 * THE /api/patient/questions ENDPOINTS ARE UNTOUCHED AND STILL LIVE. The mobile
 * app speaks only those, chat has no mobile client yet, and the tender's
 * acceptance for rows 36/37 is written against them. Nothing is retired until
 * the mobile side can follow; the history also stays readable to the doctor on
 * the patient card.
 *
 * A patient with no doctor yet is told "Зөвхөн өөрийн эмчтэй чатлах боломжтой".
 * That is not a regression: filing a question with an empty care team notified
 * nobody at all, silently, because there is no unassigned queue for questions.
 */
export default function VisitComments() {
  const { t } = useTranslation();

  return (
    <UniCard color="warning" title={t("Эмч нараас асуух асуулт")}>
      {/* A fixed height rather than a flex chain: UniCard's body is not a flex
          parent, and ChatPanel needs a bounded box to scroll its message list
          inside instead of growing the page. */}
      <Box sx={{ height: "70vh", minHeight: 420, display: "flex" }}>
        <ChatPanel />
      </Box>
    </UniCard>
  );
}
