import React, { useCallback, useEffect, useState } from "react";
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
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import BaseDialog from "customComponents/BaseDialog";
import LoadError from "customComponents/LoadError";
import StatusChip from "customComponents/StatusChip";
import { rehabCall, useRehabContent } from "./useRehabContent";
import { panelSx, labelRoomSx, Section, NumField, DirtyDot } from "./rehabUi";
import DayBandsEditor from "./DayBandsEditor";

/**
 * Хөтөлбөр — өвчний бүлэг бүрийн өдрийн дасгалын дараалал (RehabProgram +
 * RehabProgramBlock). Блок нь дасгалын сангаас дасгал сонгоно; хугацаа нь
 * өдрөөр шатална (DayBandsEditor).
 *
 * Хөтөлбөрийн контент эмнэлзүйн шийдвэр: MnCardio_test дээрх мөрүүд xlsx-ээс
 * буулгасан НООРОГ. Шинэ хөтөлбөр скриптээр үүснэ, энд засна.
 */
const KINDS = {
  video: { label: "Видео дасгал", icon: OndemandVideoIcon },
  timed: { label: "Хугацаатай (алхалт, дугуй, шат)", icon: DirectionsWalkIcon },
  vitals: { label: "Үзүүлэлт хэмжих", icon: MonitorHeartOutlinedIcon },
  image: { label: "Зурагтай заавар", icon: ImageOutlinedIcon },
};

const programDraft = (p) => ({
  Name: p.Name || "",
  Description: p.Description || "",
  HasHrTarget: p.HasHrTarget !== false,
  DefaultIntensityPct:
    p.DefaultIntensityPct === null || p.DefaultIntensityPct === undefined
      ? ""
      : p.DefaultIntensityPct,
  WarningTemplate: p.WarningTemplate || "",
  IsActive: p.IsActive !== false,
});

export default function ProgramBuilder() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [block, setBlock] = useState(null);
  const { items: exercises } = useRehabContent(true);

  const load = useCallback(async () => {
    const res = await rehabCall("GetPrograms");
    setLoading(false);
    if (!res.Success) return setError(res.Message || "Уншиж чадсангүй");
    setError(null);
    setPrograms(res.Data || []);
    return undefined;
  }, []);

  useEffect(() => {
    let alive = true;
    rehabCall("GetPrograms").then((res) => {
      if (!alive) return;
      setLoading(false);
      if (res.Success) setPrograms(res.Data || []);
      else setError(res.Message || "Уншиж чадсангүй");
    });
    return () => {
      alive = false;
    };
  }, []);

  const current =
    programs.find((p) => p.Id === programId) ||
    (programId === null ? programs[0] : null) ||
    null;

  if (loading) return <Skeleton variant="rounded" height={420} />;
  if (error && !programs.length)
    return <LoadError Message={error} Retry={load} />;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        alignItems: "start",
        gridTemplateColumns: { xs: "1fr", md: "260px minmax(0, 1fr)" },
      }}
    >
      <Box sx={{ ...panelSx, p: 2 }}>
        <Typography variant="h5" component="div" sx={{ mb: 1.5 }}>
          Хөтөлбөрүүд
        </Typography>
        <Stack spacing={0.75}>
          {programs.map((p) => {
            const on = current && p.Id === current.Id;
            return (
              <Box
                key={p.Id}
                role="button"
                tabIndex={0}
                aria-current={on ? "true" : undefined}
                onClick={() => setProgramId(p.Id)}
                onKeyDown={(e) =>
                  e.key === "Enter" ? setProgramId(p.Id) : null
                }
                sx={{
                  p: 1.25,
                  cursor: "pointer",
                  borderRadius: radius.md,
                  border: `1px solid ${on ? colors.brand.cyanDeep : colors.brand.hairline}`,
                  bgcolor: on ? colors.brand.tintSolid : colors.brand.surface,
                  "&:hover": { bgcolor: colors.brand.tintSolid },
                  "&:focus-visible": {
                    outline: `2px solid ${colors.brand.focus}`,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ fontWeight: 600 }}
                >
                  {p.Name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                >
                  {p.Code} · {p.Blocks.length} блок
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {current ? (
        <Box sx={{ ...panelSx, p: 2 }}>
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          <ProgramForm key={current.Id} program={current} onSaved={load} />
          <BlockList
            program={current}
            onEdit={(b) => setBlock(b)}
            onAdd={() =>
              setBlock({
                ProgramId: current.Id,
                Kind: "video",
                DurationSteps: [],
              })
            }
            onChanged={load}
            onError={setError}
            onLocalOrder={(Blocks) =>
              setPrograms(
                programs.map((p) =>
                  p.Id === current.Id ? { ...p, Blocks } : p,
                ),
              )
            }
          />
        </Box>
      ) : (
        <Box sx={{ ...panelSx, p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Хөтөлбөр бүртгэгдээгүй байна.
          </Typography>
        </Box>
      )}

      {block && (
        <BlockDialog
          block={block}
          exercises={exercises}
          onClose={() => setBlock(null)}
          onSaved={() => {
            setBlock(null);
            load();
          }}
        />
      )}
    </Box>
  );
}

function ProgramForm({ program, onSaved }) {
  const [baseline, setBaseline] = useState(() => programDraft(program));
  const [draft, setDraft] = useState(baseline);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await rehabCall("SaveProgram", { Id: program.Id, ...draft });
    setSaving(false);
    if (!res.Success) return setError(res.Message || "Хадгалж чадсангүй");
    setBaseline(draft);
    onSaved();
    return undefined;
  };

  const example = draft.WarningTemplate
    ? draft.WarningTemplate.split("{target}").join("118")
    : "";

  return (
    <Section no={1} title={`Хөтөлбөр · ${program.Code}`}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField
          label="Нэр"
          value={draft.Name}
          onChange={(e) => set({ Name: e.target.value })}
          size="small"
          fullWidth
          required
        />
        <TextField
          label="Тайлбар"
          value={draft.Description}
          onChange={(e) => set({ Description: e.target.value })}
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
        >
          <FormControlLabel
            control={
              <Switch
                checked={draft.HasHrTarget}
                onChange={(e) => set({ HasHrTarget: e.target.checked })}
              />
            }
            label="Зорилтот зүрхний цохилт тооцно"
          />
          <NumField
            label="Анхдагч эрчим (%)"
            value={draft.DefaultIntensityPct}
            min={1}
            max={100}
            width={170}
            onChange={(v) => set({ DefaultIntensityPct: v })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={draft.IsActive}
                onChange={(e) => set({ IsActive: e.target.checked })}
              />
            }
            label="Идэвхтэй"
          />
        </Stack>
        <TextField
          label="Дасгалын өмнөх анхааруулга"
          value={draft.WarningTemplate}
          onChange={(e) => set({ WarningTemplate: e.target.value })}
          size="small"
          fullWidth
          multiline
          minRows={2}
          helperText="{target} гэсэн хэсэгт өвчтөний зорилтот цохилт орно."
        />
        {example && (
          <Typography variant="caption" color="text.secondary" component="div">
            Жишээ (зорилт 118): {example}
          </Typography>
        )}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            onClick={save}
            disabled={!dirty || saving}
            sx={gridToolbarButtonSx.primary}
          >
            {saving ? "Хадгалж байна…" : "Хадгалах"}
          </Button>
          <Button
            onClick={() => setDraft(baseline)}
            disabled={!dirty}
            sx={gridToolbarButtonSx.neutral}
          >
            Буцаах
          </Button>
          <DirtyDot dirty={dirty} />
        </Stack>
      </Box>
    </Section>
  );
}

ProgramForm.propTypes = { program: PropTypes.object, onSaved: PropTypes.func };

function BlockList({
  program,
  onEdit,
  onAdd,
  onChanged,
  onError,
  onLocalOrder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const blocks = program.Blocks;
  const ids = blocks.map((b) => b.Id);

  const onDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      blocks,
      ids.indexOf(active.id),
      ids.indexOf(over.id),
    );
    onLocalOrder(next);
    const res = await rehabCall("Reorder", {
      ObjectName: "RehabProgramBlock",
      Ids: next.map((b) => b.Id),
    });
    if (!res.Success) onError(res.Message || "Дарааллыг хадгалж чадсангүй");
    onChanged();
  };

  const remove = async (b) => {
    if (!window.confirm(`«${b.Title}» блокийг хөтөлбөрөөс хасах уу?`)) return;
    const res = await rehabCall("RemoveBlock", { BlockId: b.Id });
    if (!res.Success) onError(res.Message || "Хасаж чадсангүй");
    onChanged();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Section
        no={2}
        title="Өдрийн блокууд"
        hint="Апп дээр энэ дарааллаар тоглоно. Чирж дараалуулна."
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={gridToolbarButtonSx.neutral}
          >
            Блок нэмэх
          </Button>
        }
      >
        {blocks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Блок алга.
          </Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <Stack spacing={0.75}>
                {blocks.map((b, i) => (
                  <BlockRow
                    key={b.Id}
                    block={b}
                    index={i}
                    onEdit={() => onEdit(b)}
                    onRemove={() => remove(b)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Section>
    </Box>
  );
}

BlockList.propTypes = {
  program: PropTypes.object,
  onEdit: PropTypes.func,
  onAdd: PropTypes.func,
  onChanged: PropTypes.func,
  onError: PropTypes.func,
  onLocalOrder: PropTypes.func,
};

function bandsLabel(b) {
  const steps = b.DurationSteps || [];
  if (steps.length) {
    return steps
      .map(
        (s) =>
          `${s.fromDay}${s.toDay ? `–${s.toDay}` : "+"} өдөр: ${s.min} мин`,
      )
      .join(" · ");
  }
  if (b.DurationSec) return `${Math.round(b.DurationSec / 60)} мин`;
  return b.Kind === "video" ? "хөдөлгөөнүүдийн хугацаагаар" : "";
}

function BlockRow({ block, index, onEdit, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.Id,
  });
  const kind = KINDS[block.Kind] || KINDS.video;
  const Icon = kind.icon;
  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
        borderRadius: radius.md,
        border: `1px solid ${colors.brand.hairline}`,
        bgcolor: colors.brand.surface,
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        title="Чирж дараалуулах"
        sx={{ display: "flex", color: colors.brand.inkDim, cursor: "grab" }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Typography
        variant="subtitle2"
        component="span"
        sx={{ width: 20, color: colors.brand.cyanInk }}
      >
        {index + 1}
      </Typography>
      <Icon sx={{ color: colors.brand.cyanDeep }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: 600 }}
          noWrap
        >
          {block.Title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          component="div"
          noWrap
        >
          {block.Kind === "video" && block.Exercise
            ? `${block.Exercise.Code} ${block.Exercise.Name} · `
            : `${kind.label} · `}
          {bandsLabel(block)}
        </Typography>
      </Box>
      {block.ShowFromDay > 1 && (
        <Tooltip title={`${block.ShowFromDay}-р өдрөөс нээгдэнэ`}>
          <Box sx={{ display: "flex" }}>
            <StatusChip
              Tone="neutral"
              Label={`${block.ShowFromDay}-р өдрөөс`}
            />
          </Box>
        </Tooltip>
      )}
      {block.Kind === "video" &&
        block.Exercise &&
        block.Exercise.IsActive === false && (
          <Tooltip title="Сонгосон дасгал идэвхгүй — апп дээр хоосон гарна">
            <Box sx={{ display: "flex" }}>
              <StatusChip Tone="warning" Label="Дасгал идэвхгүй" />
            </Box>
          </Tooltip>
        )}
      <IconButton size="small" aria-label="Засах" onClick={onEdit}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" aria-label="Хасах" onClick={onRemove}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

BlockRow.propTypes = {
  block: PropTypes.object,
  index: PropTypes.number,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
};

function BlockDialog({ block, exercises, onClose, onSaved }) {
  const [draft, setDraft] = useState(() => ({
    Title: block.Title || "",
    Kind: block.Kind || "video",
    ExerciseId: block.ExerciseId || "",
    DurationMin: block.DurationSec ? Math.round(block.DurationSec / 60) : "",
    DurationSteps: (block.DurationSteps || []).map((s) => ({
      ...s,
      toDay: s.toDay ?? "",
    })),
    ShowFromDay: block.ShowFromDay || "",
    CheckInEverySec: block.CheckInEverySec || 120,
    GuideText: block.GuideText || "",
  }));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await rehabCall("SaveBlock", {
      Id: block.Id || null,
      ProgramId: block.ProgramId,
      Title: draft.Title,
      Kind: draft.Kind,
      ExerciseId: draft.ExerciseId || null,
      DurationSec: draft.DurationMin
        ? parseInt(draft.DurationMin, 10) * 60
        : null,
      DurationSteps: draft.DurationSteps.map((s) => ({
        fromDay: s.fromDay,
        toDay: s.toDay === "" ? null : s.toDay,
        min: s.min,
      })),
      ShowFromDay: draft.ShowFromDay || null,
      CheckInEverySec: draft.CheckInEverySec,
      GuideText: draft.GuideText,
    });
    setSaving(false);
    if (!res.Success) return setError(res.Message || "Хадгалж чадсангүй");
    onSaved();
    return undefined;
  };

  return (
    <BaseDialog
      Title={block.Id ? "Блок засах" : "Шинэ блок"}
      Width="720px"
      Close={onClose}
      ShowSave
      Save={save}
      SaveButtonText={saving ? "Хадгалж байна…" : "Хадгалах"}
    >
      <Stack spacing={2} sx={{ pt: 1, ...labelRoomSx }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Блокийн нэр"
            value={draft.Title}
            onChange={(e) => set({ Title: e.target.value })}
            size="small"
            required
            sx={{ flex: 1 }}
          />
          <TextField
            select
            InputLabelProps={{ shrink: true }}
            label="Төрөл"
            value={draft.Kind}
            onChange={(e) => set({ Kind: e.target.value })}
            size="small"
            sx={{ width: { sm: 260 } }}
          >
            {Object.entries(KINDS).map(([k, v]) => (
              <MenuItem key={k} value={k}>
                {v.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {draft.Kind === "video" && (
          <TextField
            select
            InputLabelProps={{ shrink: true }}
            label="Дасгалын сангаас дасгал"
            value={draft.ExerciseId}
            onChange={(e) => set({ ExerciseId: e.target.value })}
            size="small"
            required
          >
            {exercises.map((e) => (
              <MenuItem key={e.Id} value={e.Id}>
                {e.Code} — {e.Name} ({e.MovementCount} хөдөлгөөн)
                {e.IsActive === false ? " · идэвхгүй" : ""}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box>
          <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
            Өдрөөр шатлах хугацаа
          </Typography>
          <DayBandsEditor
            bands={draft.DurationSteps}
            onChange={(DurationSteps) => set({ DurationSteps })}
          />
        </Box>

        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          <NumField
            label="Тогтмол хугацаа (мин)"
            value={draft.DurationMin}
            min={1}
            width={190}
            helperText="Шатлал таарахгүй өдөр"
            onChange={(v) => set({ DurationMin: v })}
          />
          <NumField
            label="Хэдэн дэх өдрөөс"
            value={draft.ShowFromDay}
            min={1}
            width={170}
            helperText="Хоосон бол эхнээс"
            onChange={(v) => set({ ShowFromDay: v })}
          />
          {draft.Kind === "timed" && (
            <NumField
              label="Пульс асуух (сек тутам)"
              value={draft.CheckInEverySec}
              min={30}
              width={200}
              onChange={(v) => set({ CheckInEverySec: v })}
            />
          )}
        </Stack>

        <TextField
          label="Заавар (мөр бүрт нэг)"
          value={draft.GuideText}
          onChange={(e) => set({ GuideText: e.target.value })}
          size="small"
          multiline
          minRows={3}
          fullWidth
        />
      </Stack>
    </BaseDialog>
  );
}

BlockDialog.propTypes = {
  block: PropTypes.object,
  exercises: PropTypes.array,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};
