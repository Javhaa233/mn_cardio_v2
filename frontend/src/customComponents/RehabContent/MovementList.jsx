import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
import { doseLabel, fmtSec } from "./rehabFormat";
import { Thumb } from "./rehabUi";

/**
 * Сонгосон дасгалын хөдөлгөөнүүд, нэг нэгээр нь дугаартай картаар —
 * апп дээр тоглох дарааллаар. Карт дээр дарахад баруун талд засварлагч нээгдэнэ.
 */
export default function MovementList({
  exercise,
  categories,
  selected,
  onSelectExercise,
  onSelectMovement,
  onAddMovement,
  onReorder,
  onDuplicate,
  onRemove,
  onDuplicateExercise,
  onBack,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const movements = (exercise.Movements || []).filter(
    (m) => m.IsActive !== false,
  );
  const ids = movements.map((m) => m.Id);
  const category = categories.find((c) => c.Value === exercise.CategoryCode);

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onReorder(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  return (
    <Stack spacing={1.5}>
      {onBack && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ ...gridToolbarButtonSx.neutral, alignSelf: "flex-start" }}
        >
          Бүх дасгал
        </Button>
      )}
      <Box
        role="button"
        tabIndex={0}
        onClick={onSelectExercise}
        onKeyDown={(e) => (e.key === "Enter" ? onSelectExercise() : null)}
        sx={{
          p: 1.5,
          borderRadius: radius.md,
          cursor: "pointer",
          border: `1px solid ${selected === "exercise" ? colors.brand.cyanDeep : colors.brand.hairline}`,
          bgcolor:
            selected === "exercise"
              ? colors.brand.tintSolid
              : colors.brand.surface,
          "&:hover": { bgcolor: colors.brand.tintSolid },
          "&:focus-visible": { outline: `2px solid ${colors.brand.focus}` },
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
            >
              {exercise.Code}
              {category ? ` · ${category.Label}` : ""}
            </Typography>
            <Typography variant="h5" component="div">
              {exercise.Name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
            >
              {movements.length} хөдөлгөөн
              {exercise.DurationSec > 0
                ? ` · ойролцоогоор ${fmtSec(exercise.DurationSec)}`
                : ""}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {exercise.IsActive === false && (
              <StatusChip Tone="neutral" Label="Идэвхгүй" />
            )}
            {exercise.WarningText && (
              <Tooltip title="Анхааруулгатай">
                <WarningAmberIcon
                  fontSize="small"
                  sx={{ color: colors.status.dangerInk }}
                />
              </Tooltip>
            )}
            <EditOutlinedIcon
              fontSize="small"
              sx={{ color: colors.brand.inkDim }}
            />
          </Stack>
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle1" component="div" sx={{ flex: 1 }}>
          Хөдөлгөөнүүд
        </Typography>
        <Tooltip title="Бүх хөдөлгөөнтэй нь хуулж, идэвхгүй ноорог үүсгэнэ">
          <Button
            onClick={onDuplicateExercise}
            sx={gridToolbarButtonSx.neutral}
          >
            Дасгал хувилах
          </Button>
        </Tooltip>
      </Stack>

      {movements.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: radius.md,
            border: `1px dashed ${colors.brand.hairlineStrong}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Хөдөлгөөн алга. Эхний хөдөлгөөнөө нэмнэ үү.
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <Stack spacing={0.75}>
              {movements.map((m, i) => (
                <MovementCard
                  key={m.Id}
                  movement={m}
                  index={i}
                  selected={selected === m.Id}
                  onSelect={() => onSelectMovement(m.Id)}
                  onDuplicate={() => onDuplicate(m.Id)}
                  onRemove={() => onRemove(m)}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      <Button
        startIcon={<AddIcon />}
        onClick={onAddMovement}
        sx={{
          ...gridToolbarButtonSx.neutral,
          borderStyle: "dashed",
          height: 40,
          ...(selected === "new" ? { borderColor: colors.brand.cyanDeep } : {}),
        }}
      >
        Хөдөлгөөн нэмэх
      </Button>
    </Stack>
  );
}

MovementList.propTypes = {
  exercise: PropTypes.object.isRequired,
  categories: PropTypes.array,
  selected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSelectExercise: PropTypes.func,
  onSelectMovement: PropTypes.func,
  onAddMovement: PropTypes.func,
  onReorder: PropTypes.func,
  onDuplicate: PropTypes.func,
  onRemove: PropTypes.func,
  onDuplicateExercise: PropTypes.func,
  onBack: PropTypes.func,
};

function MovementCard({
  movement,
  index,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: movement.Id,
  });
  const thumb = useMediaLink(movement.Id, "thumb", !!movement.HasThumb);
  const [menu, setMenu] = useState(null);
  const cueCount = (movement.Cues || []).length;

  return (
    <Box
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 0.75,
        cursor: "pointer",
        borderRadius: radius.md,
        border: `1px solid ${selected ? colors.brand.cyanDeep : colors.brand.hairline}`,
        bgcolor: selected ? colors.brand.tintSolid : colors.brand.surface,
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        "&:hover": { bgcolor: colors.brand.tintSolid },
        "&:focus-visible": {
          outline: `2px solid ${colors.brand.focus}`,
          outlineOffset: 1,
        },
      }}
    >
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
      <Typography
        variant="subtitle2"
        component="span"
        sx={{
          width: 20,
          textAlign: "center",
          color: colors.brand.cyanInk,
          flex: "none",
        }}
      >
        {index + 1}
      </Typography>
      <Thumb src={thumb} width={40} height={52} iconSize="small" />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: 600 }}
          noWrap
          title={movement.Name}
        >
          {movement.Name}
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
          sx={{ mt: 0.25 }}
        >
          <StatusChip Tone="info" Label={doseLabel(movement)} />
          {!movement.HasVideo && (
            <Tooltip title="Бичлэг алга">
              <VideocamOffIcon
                sx={{ fontSize: 16, color: colors.status.warningInk }}
              />
            </Tooltip>
          )}
          {movement.WarningText && (
            <Tooltip title="Анхааруулгатай">
              <WarningAmberIcon
                sx={{ fontSize: 16, color: colors.status.dangerInk }}
              />
            </Tooltip>
          )}
          {cueCount > 0 && (
            <Tooltip title={`${cueCount} мессеж`}>
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <ChatBubbleOutlineIcon
                  sx={{ fontSize: 15, color: colors.brand.cyanInk }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: colors.brand.cyanInk }}
                >
                  {cueCount}
                </Typography>
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <IconButton
        size="small"
        aria-label="Үйлдэл"
        onClick={(e) => {
          e.stopPropagation();
          setMenu(e.currentTarget);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={menu}
        open={!!menu}
        onClose={() => setMenu(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            setMenu(null);
            onDuplicate();
          }}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          Хувилах
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenu(null);
            onRemove();
          }}
          sx={{ color: colors.status.dangerInk }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon
              fontSize="small"
              sx={{ color: colors.status.dangerInk }}
            />
          </ListItemIcon>
          Хасах
        </MenuItem>
      </Menu>
    </Box>
  );
}

MovementCard.propTypes = {
  movement: PropTypes.object,
  index: PropTypes.number,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onDuplicate: PropTypes.func,
  onRemove: PropTypes.func,
};
