import { useTranslation } from "react-i18next";
import React, { useState } from "react";
// @mui/material components
import { Avatar, IconButton, Rating, Typography, Box } from "@mui/material";

// @material-ui icons
import LikeIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
// custom components
import AdviceAttachments from "customComponents/AdviceFeed/AdviceAttachments";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";

/**
 * One reply, in the full thread.
 *
 * Rendered by BOTH the ticket detail page and the feed's expanded thread
 * (AdviceFeed/ReplyThread.jsx), which is why it was restyled in place rather
 * than forked - one edit, both screens.
 *
 * It wears the same bubble as AdviceFeed/CommentPreview.jsx so a reply looks
 * like a reply wherever the reader meets it. What it keeps that the preview
 * deliberately drops: liking, the author's 5-star rating, and the full
 * untruncated text. The preview is a glance; this is the conversation.
 *
 * Attachments go through AdviceAttachments, not the old AdviceFileInfo. That
 * component's hover download and zoom controls were unreachable - its `&:hover
 * $downloadDiv` selector is JSS syntax inside an emotion styled(), so it never
 * matched anything - and its viewer blocked Esc and could not page between
 * images. The PostMedia lightbox underneath does all three and fetches the
 * full-resolution original rather than the thumbnail. AdviceAttachments adds
 * the other half: a voice note gets a player rather than a download chip.
 */

// Reply photos are evidence attached to a message, not the subject of the
// screen. Bounding the column stops a portrait X-ray from running the whole
// page height.
const MEDIA_MAX_W = 420;

export default function Comment(props) {
  const { t } = useTranslation();
  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const { Data = null, AdviceUserId, ChangeLike } = props;

  const [Point, setPoint] = useState(
    Data && Data.AdviceCommentRate ? Data.AdviceCommentRate.Point : 0,
  );

  const options = Data && Data.AdviceCommentLike ? Data.AdviceCommentLike : [];
  const Liked = options.filter((s) => s.UserId === LogedUser.Id);

  const LikeOrUnlikeComment = async () => {
    if (Liked.length > 0) await RemoveAdviceCommentLike(Liked[0].Id);
    else if (Liked.length === 0) await SaveAdviceCommentLike(Data.id_data);
  };

  const RemoveAdviceCommentLike = async (AdviceCommentLikeId) => {
    await Helper.AdviceHelper.RemoveAdviceCommentLike(
      AdviceCommentLikeId,
      LogedUser,
      () => ChangeLike && ChangeLike(),
    );
  };

  const SaveAdviceCommentLike = async (AdviceCommentId) => {
    await Helper.AdviceHelper.SaveAdviceCommentLike(
      AdviceCommentId,
      LogedUser,
      () => ChangeLike && ChangeLike(),
    );
  };

  const SaveAdviceCommentRate = async (point) => {
    await Helper.AdviceHelper.SaveAdviceCommentRate(
      { AdviceCommentId: Data.id_data, Point: point },
      (resData) => resData && resData.Success && setPoint(point),
    );
  };

  if (!Data) return <Box />;

  const dp = Data.DoctorsProfile || {};
  const name = (Data.Users && Data.Users.UserName) || dp.FullName || "";
  const isAuthor = LogedUser.Id + "" === AdviceUserId + "";

  return (
    <Box
      sx={{
        display: "flex",
        gap: space[2],
        alignItems: "flex-start",
        mb: space[4],
      }}
    >
      <Avatar
        src={(dp.Files && dp.Files[0] && dp.Files[0].FileSrc) || undefined}
        sx={{
          width: 32,
          height: 32,
          flex: "0 0 auto",
          mt: "2px",
          fontSize: "13px",
          border: `1px solid ${colors.brand.hairline}`,
          backgroundColor: colors.brand.tint,
          color: colors.brand.cyanInk,
        }}
      >
        {(name || "?").slice(0, 1).toUpperCase()}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: "inline-block",
            maxWidth: "100%",
            backgroundColor: colors.brand.tint,
            borderRadius: radius.md,
            px: space[3],
            py: space[2],
          }}
        >
          {/* flow-root contains UserDialogLink's `float: left`. Without a
              block formatting context here the floated name escapes its own
              container and the reply text wraps up beside it, rendering as
              "DR. TSENGUUN.E14 хоногийн дараа..." on one line. The float lives
              in the shared UserDialogLink, used across several screens, so it
              is contained here rather than removed there. */}
          <Box sx={{ display: "flow-root" }}>
            <UserDialogLink UserId={Data.Users ? Data.Users.Id : null}>
              <Typography
                component="div"
                variant="subtitle2"
                // component="div", not the default: MUI maps subtitle1/subtitle2
                // to <h6>, and assets/scss/.../_misc.scss styles bare h6 with
                // `text-transform: uppercase; font-size: .8em; font-weight: 500`.
                // That silently UPPERCASED every doctor's name and overrode the
                // weight. CLAUDE.md's rule - emit no bare h1-h6 in new markup -
                // exists for exactly this.
                sx={{ color: colors.brand.ink, lineHeight: 1.3 }}
              >
                Dr. {name}
              </Typography>
            </UserDialogLink>
          </Box>
          {Data.adv_com_comment ? (
            <Typography
              variant="body2"
              sx={{
                color: colors.brand.ink,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {Data.adv_com_comment}
            </Typography>
          ) : null}
        </Box>

        {Array.isArray(Data.Files) && Data.Files.length > 0 ? (
          <Box
            sx={{
              maxWidth: MEDIA_MAX_W,
              borderRadius: radius.md,
              overflow: "hidden",
            }}
          >
            <AdviceAttachments Files={Data.Files} FullBleedMargin="0px" />
          </Box>
        ) : null}

        {/* Date, like and rating on one quiet line under the bubble - the way a
            chat surface puts its metadata, rather than in a CardActions bar
            that gave every reply the weight of a document. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: space[2],
            mt: "2px",
            minHeight: 24,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.brand.inkDim }}>
            {Data.date_creation || ""}
          </Typography>

          <IconButton
            onClick={() => LikeOrUnlikeComment()}
            size="small"
            aria-label={t(Liked.length > 0 ? "Unlike" : "Like")}
            sx={{ p: "2px", color: colors.brand.inkDim }}
          >
            {Liked.length > 0 ? (
              <ThumbUpAltIcon
                sx={{ fontSize: 15, color: colors.brand.cyanInk }}
              />
            ) : (
              <LikeIcon sx={{ fontSize: 15 }} />
            )}
          </IconButton>
          {options.length > 0 ? (
            <Typography variant="caption" sx={{ color: colors.brand.inkDim }}>
              {options.length}
            </Typography>
          ) : null}

          {/* Only the person who asked rates the answer they were given. */}
          {isAuthor ? (
            <Rating
              name={"rate-" + Data.id_data}
              size="small"
              // parseInt(null) is NaN, which MUI Rating renders as an
              // uncontrolled component and then warns about.
              value={Number(Point) || 0}
              onChange={(event, newValue) => SaveAdviceCommentRate(newValue)}
              sx={{
                ml: "auto",
                "& .MuiRating-iconFilled": { color: colors.status.warning },
                "& .MuiRating-iconHover": { color: colors.status.warning },
              }}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
