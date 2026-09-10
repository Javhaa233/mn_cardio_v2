import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import Helper from "helper";
import Comment from "customComponents/Advice/Comment";
import CreateComment from "customComponents/Advice/CreateComment";
import { PREVIEW_LIMIT, toPreviewComment } from "./CommentPreview";
import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";

// One view per ticket per session. Expanding, collapsing and re-expanding a
// card is navigation, not readership, and counting it would inflate every
// number on the page.
const viewed = new Set();

/**
 * The replies under one feed card.
 *
 * Mounts only when the reader expands a card, so a 20-card page does not fetch
 * 20 threads. Comment and CreateComment are reused unchanged - between them
 * they already implement liking, 5-star rating, attachments and the composer,
 * and CreateComment's `SaveComment({Comment, Files}, done)` prop is exactly the
 * seam this needs.
 */
export default function ReplyThread({ AdviceId, Advice, onPatch }) {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const logedUser = useRef(Helper.AuthHelper.GetLogedUserLocal());

  const load = () => {
    Helper.AdviceHelper.GetComments(AdviceId, (res) => {
      setLoading(false);
      if (!res || res.Success === false) {
        setError(true);
        return;
      }
      setError(false);
      const list = res.Data || [];
      setComments(list);

      // Push the loaded thread back into the card's inline preview. Without
      // this, posting a reply and then collapsing the card leaves the bubbles
      // showing the thread as it was BEFORE the reply - the count moved, the
      // text did not, and the card contradicts itself.
      //
      // The count is set absolutely rather than incremented, so it also
      // self-corrects against replies other people posted while this page sat
      // open. This is the thread's own list, which is the freshest truth the
      // client has.
      onPatch &&
        onPatch(AdviceId, (d) => ({
          ...d,
          CommentQty: list.length,
          Comments: list.slice(0, PREVIEW_LIMIT).map(toPreviewComment),
        }));
    });
  };

  useEffect(() => {
    load();

    if (!viewed.has(AdviceId)) {
      viewed.add(AdviceId);
      const user = logedUser.current;
      // The detail page has a race here - it calls this before its LogedUser
      // state is set, so it posts UserId: undefined. Reading from the ref keeps
      // the value present at call time.
      if (user && user.Id) {
        Helper.AdviceHelper.SaveAdviceViews(AdviceId, user, () => {});
        onPatch &&
          onPatch(AdviceId, (d) => ({ ...d, ViewQty: (d.ViewQty || 0) + 1 }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AdviceId]);

  /**
   * Save a reply, then attach its files.
   *
   * The order is not incidental: File rows are keyed by LinkedObjectId, so the
   * comment must exist before its attachments can point at it. This is the
   * sequence AdviceDetail already uses; it is reproduced rather than
   * reinvented.
   */
  const saveComment = ({ Comment: Text, Files }, done) => {
    const hasText = Text && Text.replace(/\s/g, "").length > 0;
    if (!hasText && (!Files || !Files.length)) return;

    Helper.AdviceHelper.SaveComment(AdviceId, Text, (res) => {
      if (!res || !res.Success) {
        done && done();
        return;
      }
      onPatch &&
        onPatch(AdviceId, (d) => ({
          ...d,
          CommentQty: (d.CommentQty || 0) + 1,
        }));

      if (Files && Files.length && res.Data && res.Data.DataId) {
        Helper.BaseCrudHelper.BaseUploadFile(
          {
            LinkedObjectInfo: {
              LinkedObjectName: "AdviceComment",
              LinkedObjectId: res.Data.DataId,
              FieldName: "Files",
            },
            Value: Files,
          },
          () => {
            done && done();
            load();
          },
        );
      } else {
        done && done();
        load();
      }
    });
  };

  return (
    <Box
      data-stop
      onClick={(e) => e.stopPropagation()}
      sx={{
        backgroundColor: colors.background.surface,
        borderTop: `1px solid ${colors.brand.hairline}`,
        px: space[4],
        py: space[3],
        cursor: "default",
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: space[4] }}>
          <CircularProgress size={22} />
        </Box>
      ) : error ? (
        <Typography variant="body2" sx={{ color: colors.label.error }}>
          {t("Хариултыг ачаалж чадсангүй")}
        </Typography>
      ) : (
        <>
          {comments.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: colors.brand.inkDim, mb: space[3] }}
            >
              {t("Хараахан хариулт алга. Эхний хариултыг бичнэ үү.")}
            </Typography>
          ) : (
            comments.map((c) => (
              <Comment
                key={c.id_data}
                Data={c}
                AdviceUserId={Advice ? Advice.id : null}
                ChangeLike={load}
              />
            ))
          )}

          <CreateComment
            AdviceId={AdviceId}
            LogedUser={logedUser.current}
            IsDisabled={Advice && Advice.adv_ticket_closed === "y"}
            SaveComment={saveComment}
          />
        </>
      )}
    </Box>
  );
}
