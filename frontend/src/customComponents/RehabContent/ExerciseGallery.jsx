import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
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
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";
import { useRehabContent, useMediaLink } from "./useRehabContent";
import ExerciseEditor from "./ExerciseEditor";

/**
 * Сэргээн засах дасгалын сан (гар утасны тендер 2.7).
 *
 * Дасгалуудыг зурагтай нь хэсэг байдлаар харуулж, чирж эсвэл сум товчоор
 * дараалуулна. Дараалал нь `RehabExercise.OrderNo` — гар утасны апп дасгалыг
 * яг энэ дарааллаар харуулна.
 *
 * Чирэх нь хулганад, сум товч нь гар болон хүрэлцэхэд — 2026-09-18-ны сонголт.
 */
export default function ExerciseGallery() {
  const { items, loading, error, reload, reorder, setItems } =
    useRehabContent();
  const [editing, setEditing] = useState(null);

  const sensors = useSensors(
    // Богино хөдөлгөөнийг чирэлт гэж үзэхгүй — эс бөгөөс товч дарах бүр чирнэ.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => items.map((x) => x.Id), [items]);

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = arrayMove(items, from, to);
    setItems(next);
    reorder(
      "RehabExercise",
      next.map((x) => x.Id),
    );
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    move(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: GRID }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={210} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1, flexWrap: "wrap" }}
      >
        <Typography variant="body2" color="text.secondary">
          Дасгалыг чирж эсвэл сум товчоор дараалуулна. Дараалал нь гар утасны
          апп дээрх дараалал.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditing({ Movements: [] })}
        >
          Шинэ дасгал
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items.length === 0 ? (
        <Box sx={{ ...cardSx, p: 4, textAlign: "center" }}>
          <Typography variant="subtitle1">
            Дасгал бүртгэгдээгүй байна
          </Typography>
          <Typography variant="body2" color="text.secondary">
            «Шинэ дасгал» дарж эхний дасгалаа үүсгэнэ үү.
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: GRID }}>
              {items.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.Id}
                  exercise={exercise}
                  index={index}
                  total={items.length}
                  onOpen={() => setEditing(exercise)}
                  onMove={move}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      )}

      {editing && (
        <ExerciseEditor
          exercise={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload(true);
          }}
        />
      )}
    </Box>
  );
}

const GRID = "repeat(auto-fill, minmax(240px, 1fr))";

function ExerciseCard({ exercise, index, total, onOpen, onMove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.Id });
  const cover = useMediaLink(exercise.CoverMovementId, "thumb");
  const minutes = Math.round((exercise.DurationSec || 0) / 60);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        ...cardSx,
        p: 0,
        overflow: "hidden",
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      style={{ touchAction: "none" }}
    >
      <Box
        onClick={onOpen}
        sx={{
          position: "relative",
          height: 150,
          // Хатуу өндөр + overflow: зураг нь картын нэр, товчийг дарж болохгүй.
          overflow: "hidden",
          flex: "none",
          cursor: "pointer",
          background: colors.brand.canvas,
          display: "grid",
          placeItems: "center",
        }}
      >
        {cover ? (
          <Box
            component="img"
            src={cover}
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <SelfImprovementIcon
            sx={{ fontSize: 56, color: colors.brand.cyan }}
          />
        )}
        <Box
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            top: 6,
            left: 6,
            p: 0.5,
            borderRadius: radius.sm,
            bgcolor: "rgba(12,34,51,0.55)",
            color: "#fff",
            display: "flex",
            cursor: "grab",
          }}
          title="Чирж дараалуулах"
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
        <Chip
          size="small"
          label={`${index + 1}`}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            bgcolor: "rgba(12,34,51,0.55)",
            color: "#fff",
          }}
        />
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="subtitle1"
          component="div"
          onClick={onOpen}
          sx={{ cursor: "pointer" }}
          noWrap
          title={exercise.Name}
        >
          {exercise.Name || "Нэргүй дасгал"}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">
            {exercise.MovementCount} хөдөлгөөн
          </Typography>
          {minutes > 0 && (
            <Typography variant="caption" color="text.secondary">
              · {minutes} мин
            </Typography>
          )}
          {exercise.MovementCount > 0 &&
            !exercise.Movements.some((m) => m.HasVideo) && (
              <Tooltip title="Бичлэг хавсаргаагүй">
                <VideocamOffIcon
                  fontSize="small"
                  sx={{ color: colors.status.warningInk }}
                />
              </Tooltip>
            )}
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
          <Tooltip title="Дээш">
            <span>
              <IconButton
                size="small"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Доош">
            <span>
              <IconButton
                size="small"
                disabled={index === total - 1}
                onClick={() => onMove(index, index + 1)}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
          <Button size="small" onClick={onOpen}>
            Засах
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

/** Картын гадаргуу — UI дүрмийн radius.lg + hairline + elevation[1]. */
const cardSx = {
  bgcolor: "#fff",
  border: `1px solid ${colors.brand.hairline}`,
  borderRadius: radius.lg,
  boxShadow: elevation[1],
};

ExerciseCard.propTypes = {
  exercise: PropTypes.object,
  index: PropTypes.number,
  total: PropTypes.number,
  onOpen: PropTypes.func,
  onMove: PropTypes.func,
};
