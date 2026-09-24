import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { gridToolbarButtonSx } from "@/theme/controlStyles";
import { NumField } from "./rehabUi";

/**
 * Өдрөөр шатлах хугацаа (RehabProgramBlock.DurationSteps), JSON-гүй:
 *   1–7 өдөр → 10 мин,  8–14 өдөр → 15 мин,  15-аас хойш → 20 мин
 * "Хүртэл" хоосон бол "цааш бүх өдөр". Давхцал, дарааллыг сервер шалгана
 * (RehabContentController.CheckSteps); энд хамгийн түгээмэл алдааг шууд харуулна.
 */
export default function DayBandsEditor({ bands, onChange }) {
  const update = (i, patch) =>
    onChange(bands.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const add = () => {
    const last = bands[bands.length - 1];
    const from = last
      ? (parseInt(last.toDay, 10) || parseInt(last.fromDay, 10) || 0) + 1
      : 1;
    onChange([
      ...bands,
      { fromDay: from, toDay: "", min: last ? last.min : 10 },
    ]);
  };

  return (
    <Box>
      {bands.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Шатлалгүй — доорх тогтмол хугацаа эсвэл хөдөлгөөнүүдийн нийт хугацаа
          хэрэглэгдэнэ.
        </Typography>
      )}
      <Stack spacing={1}>
        {bands.map((b, i) => {
          const openEnded =
            b.toDay === "" || b.toDay === null || b.toDay === undefined;
          const notLast = i < bands.length - 1;
          return (
            <Stack
              key={i}
              direction="row"
              spacing={1}
              alignItems="flex-start"
              useFlexGap
              flexWrap="wrap"
            >
              <NumField
                label="Өдрөөс"
                value={b.fromDay}
                min={1}
                width={100}
                onChange={(v) => update(i, { fromDay: v })}
              />
              <NumField
                label="Хүртэл"
                value={openEnded ? "" : b.toDay}
                min={1}
                width={100}
                placeholder="цааш"
                error={openEnded && notLast}
                helperText={openEnded && notLast ? "Сүүлийн мөр биш" : " "}
                onChange={(v) => update(i, { toDay: v })}
              />
              <NumField
                label="Минут"
                value={b.min}
                min={1}
                max={240}
                width={100}
                onChange={(v) => update(i, { min: v })}
              />
              <IconButton
                aria-label="Мөр хасах"
                onClick={() => onChange(bands.filter((_, j) => j !== i))}
                sx={{ mt: 0.25 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>
      <Button
        startIcon={<AddIcon />}
        onClick={add}
        sx={{ ...gridToolbarButtonSx.neutral, mt: 1 }}
      >
        Шат нэмэх
      </Button>
    </Box>
  );
}

DayBandsEditor.propTypes = {
  bands: PropTypes.array,
  onChange: PropTypes.func,
};
