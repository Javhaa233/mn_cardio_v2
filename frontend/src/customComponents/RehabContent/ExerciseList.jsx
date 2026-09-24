import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import StatusChip from "customComponents/StatusChip";
import { useMediaLink } from "./useRehabContent";
import { fmtSec } from "./rehabFormat";
import { Thumb } from "./rehabUi";

/**
 * Дасгалын сангийн зүүн багана: бүх дасгал, хайлт, ангиллын шүүлтүүр.
 *
 * Чирж дараалуулах нь зөвхөн шүүлтгүй үед — шүүсэн жагсаалтын дараалал нь
 * бүтэн жагсаалтын дараалал биш тул тэр үед чирэх бариулыг нуудаг.
 */
export default function ExerciseList({
  items,
  categories,
  selectedId,
  query,
  category,
  showInactive,
  onQuery,
  onCategory,
  onShowInactive,
  onSelect,
  onNew,
  onReorder,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (e) =>
        (!category || e.CategoryCode === category) &&
        (!q || `${e.Code || ""} ${e.Name || ""}`.toLowerCase().includes(q)),
    );
  }, [items, query, category]);
  const canDrag = !query.trim() && !category;
  const ids = visible.map((e) => e.Id);

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onReorder(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  return (
    <Stack spacing={1.5} sx={{ minHeight: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5" component="div" sx={{ flex: 1 }}>
          Дасгалууд
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={onNew}
          sx={gridToolbarButtonSx.neutral}
        >
          Шинэ дасгал
        </Button>
      </Stack>

      <TextField
        size="small"
        placeholder="Нэр эсвэл кодоор хайх"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        select
        InputLabelProps={{ shrink: true }}
        SelectProps={{ displayEmpty: true }}
        size="small"
        label="Ангилал"
        value={category}
        onChange={(e) => onCategory(e.target.value)}
      >
        <MenuItem value="">Бүгд</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.Value} value={c.Value}>
            {c.Label}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={showInactive}
            onChange={(e) => onShowInactive(e.target.checked)}
          />
        }
        label={<Typography variant="body2">Идэвхгүйг харуулах</Typography>}
      />

      <Typography variant="caption" color="text.secondary">
        {visible.length} дасгал{canDrag ? " · чирж дараалуулна" : ""}
      </Typography>

      <Box
        sx={{ overflowY: "auto", maxHeight: "calc(100vh - 330px)", pr: 0.5 }}
      >
        {visible.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2, textAlign: "center" }}
          >
            Тохирох дасгал олдсонгүй
          </Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <Stack spacing={0.75}>
                {visible.map((e) => (
                  <ExerciseRow
                    key={e.Id}
                    exercise={e}
                    selected={e.Id === selectedId}
                    canDrag={canDrag}
                    onSelect={() => onSelect(e.Id)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    </Stack>
  );
}

ExerciseList.propTypes = {
  items: PropTypes.array,
  categories: PropTypes.array,
  selectedId: PropTypes.number,
  query: PropTypes.string,
  category: PropTypes.string,
  showInactive: PropTypes.bool,
  onQuery: PropTypes.func,
  onCategory: PropTypes.func,
  onShowInactive: PropTypes.func,
  onSelect: PropTypes.func,
  onNew: PropTypes.func,
  onReorder: PropTypes.func,
};

function ExerciseRow({ exercise, selected, canDrag, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise.Id,
    disabled: !canDrag,
  });
  const cover = useMediaLink(exercise.CoverMovementId, "thumb");
  const missing = exercise.MissingVideoCount || 0;

  return (
    <Box
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 0.75,
        pr: 1,
        cursor: "pointer",
        borderRadius: radius.md,
        border: `1px solid ${selected ? colors.brand.cyanDeep : colors.brand.hairline}`,
        bgcolor: selected ? colors.brand.tintSolid : colors.brand.surface,
        opacity: isDragging ? 0.6 : exercise.IsActive === false ? 0.65 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        "&:hover": { bgcolor: colors.brand.tintSolid },
        "&:focus-visible": {
          outline: `2px solid ${colors.brand.focus}`,
          outlineOffset: 1,
        },
      }}
    >
      {canDrag && (
        <Box
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="Чирж дараалуулах"
          sx={{
            display: "flex",
            color: colors.brand.inkDim,
            cursor: "grab",
            flex: "none",
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      )}
      <Thumb src={cover} width={44} height={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: 600 }}
          noWrap
          title={exercise.Name}
        >
          {exercise.Name || "Нэргүй дасгал"}
        </Typography>
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          noWrap
        >
          {exercise.Code} · {exercise.MovementCount} хөдөлгөөн
          {exercise.DurationSec > 0 ? ` · ${fmtSec(exercise.DurationSec)}` : ""}
        </Typography>
      </Box>
      {exercise.IsActive === false && (
        <StatusChip Tone="neutral" Label="Идэвхгүй" />
      )}
      {missing > 0 && (
        <Tooltip title={`${missing} хөдөлгөөнд бичлэг алга`}>
          <VideocamOffIcon
            fontSize="small"
            sx={{ color: colors.status.warningInk, flex: "none" }}
          />
        </Tooltip>
      )}
    </Box>
  );
}

ExerciseRow.propTypes = {
  exercise: PropTypes.object,
  selected: PropTypes.bool,
  canDrag: PropTypes.bool,
  onSelect: PropTypes.func,
};
