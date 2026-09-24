import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import { NumField } from "./rehabUi";
import {
  MAX_CUES,
  MAX_CUE_TEXT,
  cueKind,
  cueErrors,
  CUE_VISIBLE_SEC,
} from "./rehabFormat";

/**
 * Хөдөлгөөний явцад гарах мессежүүд (RehabMovement.Cues).
 *
 *   Эхлэхэд            хөдөлгөөн эхлэхэд нэг удаа (AtSec 0)
 *   N дахь секундэд    сет бүрийн ажлын N дахь секундэд (зөвхөн хугацаатай)
 *   N-р сет эхлэхэд    тухайн сет эхлэхэд (AtSet N)
 *
 * Доорх зурвас нь нэг сетийн ажлыг цагийн тэнхлэгээр харуулж, мессеж бүр хаана
 * гарахыг тэмдэглэнэ — эмч дэлгэцийг төсөөлөхгүйгээр харна.
 */
export default function CueTimeline({ cues, onChange, mode, workSec, sets }) {
  const errors = cueErrors(cues, { Mode: mode, WorkSec: workSec, Sets: sets });
  const timed = mode === "time";

  const update = (i, patch) =>
    onChange(cues.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const remove = (i) => onChange(cues.filter((_, j) => j !== i));
  const add = () => {
    const hasStart = cues.some((c) => cueKind(c) === "start");
    const next = !hasStart
      ? { AtSec: 0, AtSet: null, Text: "" }
      : timed
        ? {
            AtSec: Math.max(1, Math.floor((parseInt(workSec, 10) || 2) / 2)),
            AtSet: null,
            Text: "",
          }
        : {
            AtSec: null,
            AtSet: Math.min(2, Math.max(1, parseInt(sets, 10) || 1)),
            Text: "",
          };
    onChange([...cues, next]);
  };

  const setKind = (i, kind) => {
    if (kind === "start") update(i, { AtSec: 0, AtSet: null });
    if (kind === "sec") update(i, { AtSec: 1, AtSet: null });
    if (kind === "set") update(i, { AtSec: null, AtSet: 1 });
  };

  return (
    <Box>
      {cues.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Мессеж алга. Эхлэхэд өгөх зааварчилгаа, дундуур нь сануулах үг нэмж
          болно.
        </Typography>
      )}

      <Stack spacing={1.25}>
        {cues.map((c, i) => {
          const kind = cueKind(c);
          return (
            <Stack
              key={i}
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ md: "flex-start" }}
            >
              <TextField
                select
                size="small"
                label="Хэзээ"
                InputLabelProps={{ shrink: true }}
                value={kind}
                onChange={(e) => setKind(i, e.target.value)}
                sx={{ width: { md: 170 } }}
              >
                <MenuItem value="start">Эхлэхэд</MenuItem>
                <MenuItem value="sec" disabled={!timed}>
                  Секундэд
                </MenuItem>
                <MenuItem value="set" disabled={(parseInt(sets, 10) || 1) < 2}>
                  Сет эхлэхэд
                </MenuItem>
              </TextField>
              {kind === "sec" && (
                <NumField
                  label="Секунд"
                  value={c.AtSec}
                  min={1}
                  onChange={(v) => update(i, { AtSec: v })}
                  width={100}
                />
              )}
              {kind === "set" && (
                <NumField
                  label="Сет"
                  value={c.AtSet}
                  min={1}
                  onChange={(v) => update(i, { AtSet: v })}
                  width={90}
                />
              )}
              <TextField
                size="small"
                label="Мессеж"
                value={c.Text || ""}
                onChange={(e) => update(i, { Text: e.target.value })}
                inputProps={{ maxLength: MAX_CUE_TEXT }}
                error={!!errors[i]}
                helperText={
                  errors[i] || `${String(c.Text || "").length}/${MAX_CUE_TEXT}`
                }
                sx={{ flex: 1 }}
              />
              <Tooltip title="Мессеж хасах">
                <IconButton
                  aria-label="Мессеж хасах"
                  onClick={() => remove(i)}
                  sx={{ mt: 0.25 }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        })}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        onClick={add}
        disabled={cues.length >= MAX_CUES}
        sx={{ ...gridToolbarButtonSx.neutral, mt: 1.5 }}
      >
        Мессеж нэмэх
      </Button>

      {timed && parseInt(workSec, 10) > 0 && cues.length > 0 && (
        <TimeBar cues={cues} workSec={parseInt(workSec, 10)} />
      )}
    </Box>
  );
}

CueTimeline.propTypes = {
  cues: PropTypes.array,
  onChange: PropTypes.func,
  mode: PropTypes.oneOf(["time", "reps"]),
  workSec: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sets: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

/** Нэг сетийн ажил 0…workSec — мессеж бүрийн харагдах 4 секунд тэмдэглэгдэнэ. */
function TimeBar({ cues, workSec }) {
  const marks = cues
    .map((c, i) => ({
      i,
      kind: cueKind(c),
      at: cueKind(c) === "set" ? 0 : parseInt(c.AtSec, 10) || 0,
    }))
    .filter((m) => m.at < workSec);
  const pct = (s) => `${Math.min(100, (s / workSec) * 100)}%`;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        component="div"
        sx={{ mb: 0.5 }}
      >
        Нэг сетийн ажил ({workSec} сек) — мессеж бүр {CUE_VISIBLE_SEC} секунд
        харагдана
      </Typography>
      <Box
        sx={{
          position: "relative",
          height: 28,
          borderRadius: radius.sm,
          bgcolor: colors.brand.tintSolid,
          border: `1px solid ${colors.brand.hairline}`,
          overflow: "hidden",
        }}
      >
        {marks.map((m) => (
          <Tooltip key={m.i} title={cues[m.i].Text || "(хоосон)"}>
            <Box
              sx={{
                position: "absolute",
                top: 3,
                bottom: 3,
                left: pct(m.at),
                width: `max(${pct(CUE_VISIBLE_SEC)}, 18px)`,
                borderRadius: radius.xs,
                // cyan нь текстэд бүдэг (2.5:1) — дугаар нь ink өнгөөр.
                bgcolor:
                  m.kind === "sec"
                    ? colors.brand.cyan
                    : colors.brand.tintSolidHover,
                border: `1px solid ${colors.brand.cyanDeep}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: colors.brand.ink, fontWeight: 700 }}
              >
                {m.i + 1}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          0
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {workSec} сек
        </Typography>
      </Stack>
    </Box>
  );
}

TimeBar.propTypes = { cues: PropTypes.array, workSec: PropTypes.number };
