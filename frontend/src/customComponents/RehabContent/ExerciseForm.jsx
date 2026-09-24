import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";

import { gridToolbarButtonSx } from "@/theme/controlStyles";
import { rehabCall } from "./useRehabContent";
import { Section, DirtyDot, StickyBar } from "./rehabUi";

/**
 * Дасгалын толгой мэдээлэл: нэр, код, ангилал, тайлбар, анхааруулга, идэвх.
 *
 * Дасгалын анхааруулга нь эхний хөдөлгөөний өмнө нэг удаа харагдана;
 * хөдөлгөөн бүрийн анхааруулга тусдаа (MovementPanel). Шинэ дасгалд код
 * оруулахгүй бол сервер дараагийн EX-nn-г өгнө.
 */
const toDraft = (e) => ({
  Name: e.Name || "",
  Code: e.Code || "",
  CategoryCode: e.CategoryCode || "",
  Description: e.Description || "",
  WarningText: e.WarningText || "",
  IsActive: e.IsActive !== false,
});

export default function ExerciseForm({
  exercise,
  categories,
  onSaved,
  onDirtyChange,
  onClose,
}) {
  const [baseline, setBaseline] = useState(() => toDraft(exercise));
  const [draft, setDraft] = useState(baseline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const isNew = !exercise.Id;

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    if (dirtyRef.current !== dirty) {
      dirtyRef.current = dirty;
      if (onDirtyChange) onDirtyChange(dirty);
    }
  }, [dirty, onDirtyChange]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    if (!draft.Name.trim()) return setError("Дасгалын нэрийг оруулна уу");
    setSaving(true);
    setError(null);
    const res = await rehabCall("SaveExercise", {
      Id: exercise.Id || null,
      ...draft,
    });
    setSaving(false);
    if (!res.Success) return setError(res.Message || "Хадгалж чадсангүй");
    setBaseline(draft);
    setNotice(
      isNew ? "Дасгал нэмэгдлээ — одоо хөдөлгөөнөө нэмнэ үү" : "Хадгаллаа",
    );
    if (onSaved) onSaved(res.Data && res.Data.Id);
    return undefined;
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h4" component="div" sx={{ flex: 1 }}>
          {isNew ? "Шинэ дасгал" : "Дасгалын мэдээлэл"}
        </Typography>
        {onClose && (
          <Tooltip title="Хаах">
            <IconButton aria-label="Хаах" onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {notice && !error && !dirty && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <Section no={1} title="Үндсэн мэдээлэл">
        <Stack spacing={2}>
          <TextField
            label="Дасгалын нэр"
            value={draft.Name}
            onChange={(e) => set({ Name: e.target.value })}
            required
            fullWidth
            size="small"
            autoFocus={isNew}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Код"
              value={draft.Code}
              onChange={(e) => set({ Code: e.target.value })}
              size="small"
              placeholder={isNew ? "Автоматаар EX-nn" : ""}
              sx={{ width: { sm: 180 } }}
            />
            <TextField
              select
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              label="Ангилал"
              value={draft.CategoryCode}
              onChange={(e) => set({ CategoryCode: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">
                <em>Сонгоогүй</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.Value} value={c.Value}>
                  {c.Label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Тайлбар"
            value={draft.Description}
            onChange={(e) => set({ Description: e.target.value })}
            fullWidth
            multiline
            minRows={2}
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={draft.IsActive}
                onChange={(e) => set({ IsActive: e.target.checked })}
              />
            }
            label={
              draft.IsActive
                ? "Идэвхтэй — апп дээр харагдана"
                : "Идэвхгүй — апп дээр харагдахгүй"
            }
          />
        </Stack>
      </Section>

      <Section
        no={2}
        title="Анхааруулга"
        hint="Энэ дасгалын эхний хөдөлгөөний өмнө нэг удаа харагдана."
      >
        <TextField
          value={draft.WarningText}
          onChange={(e) => set({ WarningText: e.target.value })}
          placeholder="Жишээ нь: Толгой эргэвэл суугаад амарна уу."
          fullWidth
          multiline
          minRows={2}
          size="small"
        />
      </Section>

      <Box>
        <StickyBar>
          <Button
            onClick={save}
            disabled={saving || (!dirty && !isNew)}
            sx={gridToolbarButtonSx.primary}
          >
            {saving ? "Хадгалж байна…" : isNew ? "Дасгал үүсгэх" : "Хадгалах"}
          </Button>
          <Button
            onClick={() => setDraft(baseline)}
            disabled={!dirty}
            sx={gridToolbarButtonSx.neutral}
          >
            Буцаах
          </Button>
          <Box sx={{ flex: 1 }} />
          <DirtyDot dirty={dirty} />
        </StickyBar>
      </Box>
    </Stack>
  );
}

ExerciseForm.propTypes = {
  exercise: PropTypes.object.isRequired,
  categories: PropTypes.array,
  onSaved: PropTypes.func,
  onDirtyChange: PropTypes.func,
  onClose: PropTypes.func,
};
