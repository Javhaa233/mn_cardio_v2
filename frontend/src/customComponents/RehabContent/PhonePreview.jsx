import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { activeCue } from "./rehabFormat";

/**
 * Гар утасны тоглуулагч дээр хэрхэн харагдахыг ойролцоогоор үзүүлнэ.
 *
 * Хоёр дэлгэц — тоглуулагчийн (mobile app, features/rehab) бүтцээр:
 *   Бэлтгэл     "ДАРААГИЙН ДАСГАЛ": нэр, зорилт, алхмууд, анхааруулга
 *   Гүйцэтгэл   бичлэг дээр сет, үлдсэн хугацаа, тухайн секундийн мессеж
 *
 * Энэ нь загвар, тоглуулагч биш: гүйлгэгчээр секунд, сетийг сонгож мессеж бүр
 * хаана гарахыг шалгана.
 */
export default function PhonePreview({ draft, videoUrl, thumbUrl }) {
  const [screen, setScreen] = useState("prep");
  const [second, setSecond] = useState(0);
  const [set, setSet] = useState(1);

  const timed = draft.Mode === "time";
  const work = Math.max(1, parseInt(draft.WorkSec, 10) || 1);
  const sets = Math.max(1, parseInt(draft.Sets, 10) || 1);
  const target = timed
    ? `${work} секунд`
    : `${parseInt(draft.Reps, 10) || 0} удаа`;
  const cue = activeCue(draft.Cues || [], {
    second: timed ? second : 0,
    set: Math.min(set, sets),
  });

  return (
    <Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        fullWidth
        value={screen}
        onChange={(e, v) => v && setScreen(v)}
        sx={{ mb: 1 }}
      >
        <ToggleButton value="prep">Бэлтгэл</ToggleButton>
        <ToggleButton value="work">Гүйцэтгэл</ToggleButton>
      </ToggleButtonGroup>

      <Box
        aria-label="Гар утасны урьдчилсан харагдац"
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "9 / 16",
          borderRadius: "22px",
          border: `6px solid ${colors.brand.ink}`,
          bgcolor: colors.brand.ink,
          overflow: "hidden",
          color: colors.text.white,
        }}
      >
        <Media
          videoUrl={videoUrl}
          thumbUrl={thumbUrl}
          dim={screen === "prep"}
        />

        {screen === "prep" ? (
          <Box
            sx={{ position: "absolute", inset: 0, p: 1.5, overflowY: "auto" }}
          >
            <Typography
              variant="overline"
              component="div"
              sx={{ opacity: 0.8 }}
            >
              ДАРААГИЙН ДАСГАЛ
            </Typography>
            <Typography variant="h5" component="div" sx={{ mb: 0.5 }}>
              {draft.Name || "Хөдөлгөөний нэр"}
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              {sets > 1 ? `${sets} сет × ${target}` : target}
            </Typography>
            {draft.WarningText && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: radius.sm,
                  bgcolor: colors.status.dangerInk,
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 18, flex: "none" }} />
                <Typography variant="caption" component="div">
                  {draft.WarningText}
                </Typography>
              </Stack>
            )}
            {draft.Steps.length > 0 && (
              <Box component="ol" sx={{ m: 0, pl: 2.25 }}>
                {draft.Steps.map((s, i) => (
                  <Typography
                    key={i}
                    component="li"
                    variant="caption"
                    sx={{ mb: 0.25 }}
                  >
                    {s}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                p: 1.25,
                background:
                  "linear-gradient(rgba(12,34,51,.75), rgba(12,34,51,0))",
              }}
            >
              <Typography
                variant="caption"
                component="div"
                sx={{ opacity: 0.85 }}
              >
                {sets > 1 ? `Сет ${Math.min(set, sets)}/${sets}` : "Нэг сет"}
              </Typography>
              <Typography variant="subtitle2" component="div">
                {draft.Name || "Хөдөлгөөний нэр"}
              </Typography>
            </Box>

            {cue && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  position: "absolute",
                  left: 10,
                  right: 10,
                  top: "38%",
                  p: 1,
                  borderRadius: radius.md,
                  bgcolor: "rgba(12,34,51,.86)",
                  border: `1px solid ${colors.brand.cyan}`,
                }}
              >
                <ChatBubbleOutlineIcon
                  sx={{ fontSize: 18, color: colors.brand.cyan, flex: "none" }}
                />
                <Typography variant="caption" component="div">
                  {cue.Text || "(хоосон мессеж)"}
                </Typography>
              </Stack>
            )}

            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: 1.5,
                textAlign: "center",
                background:
                  "linear-gradient(rgba(12,34,51,0), rgba(12,34,51,.8))",
              }}
            >
              <Typography variant="h2" component="div">
                {timed ? work - second : parseInt(draft.Reps, 10) || 0}
              </Typography>
              <Typography
                variant="caption"
                component="div"
                sx={{ opacity: 0.85 }}
              >
                {timed ? "секунд үлдлээ" : "удаа давтана"}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {screen === "work" && (
        <Box sx={{ mt: 1 }}>
          {timed && (
            <>
              <Typography variant="caption" color="text.secondary">
                Секунд: {second}
              </Typography>
              <Slider
                size="small"
                min={0}
                max={work - 1}
                value={Math.min(second, work - 1)}
                onChange={(e, v) => setSecond(v)}
                aria-label="Секунд"
              />
            </>
          )}
          {sets > 1 && (
            <ToggleButtonGroup
              exclusive
              size="small"
              value={Math.min(set, sets)}
              onChange={(e, v) => v && setSet(v)}
            >
              {Array.from({ length: sets }, (_, i) => (
                <ToggleButton key={i} value={i + 1}>
                  {i + 1}-р сет
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Box>
      )}
    </Box>
  );
}

PhonePreview.propTypes = {
  draft: PropTypes.object.isRequired,
  videoUrl: PropTypes.string,
  thumbUrl: PropTypes.string,
};

function Media({ videoUrl, thumbUrl, dim }) {
  const sx = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: dim ? 0.35 : 1,
  };
  if (videoUrl)
    return (
      <Box
        component="video"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        sx={sx}
      />
    );
  if (thumbUrl) return <Box component="img" src={thumbUrl} alt="" sx={sx} />;
  return (
    <Box sx={{ ...sx, display: "grid", placeItems: "center" }}>
      <SelfImprovementIcon sx={{ fontSize: 64, color: colors.brand.cyan }} />
    </Box>
  );
}

Media.propTypes = {
  videoUrl: PropTypes.string,
  thumbUrl: PropTypes.string,
  dim: PropTypes.bool,
};
