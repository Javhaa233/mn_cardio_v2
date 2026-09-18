import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

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

import Helper from "helper";
import BaseDialog from "customComponents/BaseDialog";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { useMediaLink } from "./useRehabContent";
import MovementEditor from "./MovementEditor";

/**
 * Нэг дасгал: түүний талбарууд ба хөдөлгөөнүүдийн жагсаалт.
 *
 * Хөдөлгөөнийг чирж эсвэл сум товчоор дараалуулна — `RehabMovement.OrderNo`,
 * тоглуулагч яг энэ дарааллаар тоглуулна. Бичлэг, зураг нь хөдөлгөөн бүр дээр
 * (MovementEditor), учир нь дасгал нь давтагдах богино бичлэгүүдийн жагсаалт.
 */
export default function ExerciseEditor({ exercise, onClose, onSaved }) {
  const isNew = !exercise.Id;
  const [form, setForm] = useState({
    Code: exercise.Code || "",
    Name: exercise.Name || "",
    Description: exercise.Description || "",
    IsActive: exercise.IsActive !== false,
  });
  const [movements, setMovements] = useState(exercise.Movements || []);
  const [editingMovement, setEditingMovement] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const ids = useMemo(() => movements.map((m) => m.Id), [movements]);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const moveMovement = (from, to) => {
    if (to < 0 || to >= movements.length || from === to) return;
    const next = arrayMove(movements, from, to);
    setMovements(next);
    Helper.BaseCrudHelper.CallService(
      "/RehabContent/Reorder",
      { ObjectName: "RehabMovement", Ids: next.map((m) => m.Id) },
      (res) => {
        if (!res || !res.Success) {
          setError((res && res.Message) || "Дарааллыг хадгалж чадсангүй");
        }
      },
    );
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    moveMovement(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  const removeMovement = (movement) => {
    Helper.BaseCrudHelper.CallService(
      "/RehabContent/RemoveMovement",
      { MovementId: movement.Id },
      (res) => {
        if (res && res.Success) {
          setMovements((list) => list.filter((m) => m.Id !== movement.Id));
        } else {
          setError((res && res.Message) || "Хасаж чадсангүй");
        }
      },
    );
  };

  const save = () => {
    if (!form.Name.trim()) {
      setError("Дасгалын нэрийг оруулна уу");
      return;
    }
    setSaving(true);
    const Data = {
      Code: form.Code.trim() || null,
      Name: form.Name.trim(),
      Description: form.Description.trim() || null,
      IsActive: form.IsActive,
    };
    const done = (res) => {
      setSaving(false);
      if (res && res.Success) {
        onSaved();
      } else {
        setError((res && res.Message) || "Хадгалж чадсангүй");
      }
    };
    if (isNew) {
      Helper.BaseCrudHelper.BaseCreate(
        { ObjectName: "RehabExercise", Data },
        done,
      );
    } else {
      Helper.BaseCrudHelper.BaseUpdate(
        { ObjectName: "RehabExercise", Data: { ...Data, Id: exercise.Id } },
        done,
      );
    }
  };

  return (
    <BaseDialog
      Title={isNew ? "Шинэ дасгал" : "Дасгал засах"}
      Width="860px"
      Close={onClose}
      ShowSave
      Save={save}
      SaveButtonText={saving ? "Хадгалж байна…" : "Хадгалах"}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Дасгалын нэр"
            value={form.Name}
            onChange={set("Name")}
            fullWidth
            required
          />
          <TextField
            label="Код"
            value={form.Code}
            onChange={set("Code")}
            sx={{ width: { xs: "100%", sm: 160 } }}
          />
          <FormControlLabel
            control={
              <Switch checked={form.IsActive} onChange={set("IsActive")} />
            }
            label="Идэвхтэй"
          />
        </Stack>

        <TextField
          label="Тайлбар"
          value={form.Description}
          onChange={set("Description")}
          fullWidth
          multiline
          minRows={2}
        />

        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle1" component="div">
              Хөдөлгөөн ({movements.length})
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              disabled={isNew}
              onClick={() => setEditingMovement({ ExerciseId: exercise.Id })}
            >
              Хөдөлгөөн нэмэх
            </Button>
          </Stack>

          {isNew ? (
            <Typography variant="body2" color="text.secondary">
              Дасгалаа эхлээд хадгалсны дараа хөдөлгөөн нэмнэ.
            </Typography>
          ) : movements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Хөдөлгөөн алга. «Хөдөлгөөн нэмэх» дарж бичлэгтэй хөдөлгөөн
              үүсгэнэ.
            </Typography>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={ids}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={1}>
                  {movements.map((m, i) => (
                    <MovementRow
                      key={m.Id}
                      movement={m}
                      index={i}
                      total={movements.length}
                      onOpen={() => setEditingMovement(m)}
                      onMove={moveMovement}
                      onRemove={() => removeMovement(m)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Box>
      </Stack>

      {editingMovement && (
        <MovementEditor
          movement={editingMovement}
          exerciseId={exercise.Id}
          onClose={() => setEditingMovement(null)}
          onSaved={(saved) => {
            setEditingMovement(null);
            setMovements((list) => {
              const found = list.some((m) => m.Id === saved.Id);
              return found
                ? list.map((m) => (m.Id === saved.Id ? { ...m, ...saved } : m))
                : [...list, saved];
            });
          }}
        />
      )}
    </BaseDialog>
  );
}

ExerciseEditor.propTypes = {
  exercise: PropTypes.object,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};

function MovementRow({ movement, index, total, onOpen, onMove, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: movement.Id });
  const thumb = useMediaLink(movement.Id, "thumb", movement.HasThumb);

  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.md,
        bgcolor: isDragging ? colors.brand.canvas : "#fff",
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      style={{ touchAction: "none" }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{ display: "flex", cursor: "grab", color: colors.brand.inkDim }}
        title="Чирж дараалуулах"
      >
        <DragIndicatorIcon />
      </Box>

      <Box
        sx={{
          width: 44,
          height: 64,
          borderRadius: radius.sm,
          overflow: "hidden",
          bgcolor: colors.brand.canvas,
          display: "grid",
          placeItems: "center",
          flex: "none",
        }}
      >
        {thumb ? (
          <Box
            component="img"
            src={thumb}
            alt=""
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImageNotSupportedIcon
            fontSize="small"
            sx={{ color: colors.brand.inkDim }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" component="div" noWrap>
          {index + 1}. {movement.Name || "Нэргүй хөдөлгөөн"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {movement.WorkSec
            ? `${movement.WorkSec} сек`
            : movement.Reps
              ? `${movement.Reps} удаа`
              : "хугацаа заагаагүй"}
          {` · бэлтгэл ${movement.PrepSec || 10} сек`}
          {movement.RestSec ? ` · амралт ${movement.RestSec} сек` : ""}
        </Typography>
      </Box>

      <Tooltip title={movement.HasVideo ? "Бичлэгтэй" : "Бичлэггүй"}>
        {movement.HasVideo ? (
          <VideocamIcon sx={{ color: colors.status.successInk }} />
        ) : (
          <VideocamOffIcon sx={{ color: colors.status.warningInk }} />
        )}
      </Tooltip>

      <Stack direction="row" spacing={0.25}>
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
        <Button size="small" onClick={onOpen}>
          Засах
        </Button>
        <Tooltip title="Хасах">
          <IconButton size="small" onClick={onRemove}>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

MovementRow.propTypes = {
  movement: PropTypes.object,
  index: PropTypes.number,
  total: PropTypes.number,
  onOpen: PropTypes.func,
  onMove: PropTypes.func,
  onRemove: PropTypes.func,
};
