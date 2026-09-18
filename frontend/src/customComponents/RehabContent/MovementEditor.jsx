import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import UploadIcon from "@mui/icons-material/Upload";

import Helper from "helper";
import BaseDialog from "customComponents/BaseDialog";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { useMediaLink, forgetMediaLinks } from "./useRehabContent";

/**
 * Нэг хөдөлгөөн: нэр, алхмууд, хугацаа/давталт, давтагдах бичлэг ба зураг.
 *
 * Бичлэг нь ерөнхий `/BaseObject/uploadFile`-ээр очно (эрхийн шалгалт,
 * өргөтгөл, хэмжээ бүгд тэнд), дараа нь `/RehabContent/SetMedia` мөрийг
 * зааж өгнө. Тиймээс энд ямар ч тусгай татах/хадгалах логик байхгүй.
 *
 * Бичлэгийн шаардлага: 9:16, 720×1280, дуугүй, 3–8 секунд, эхлэл төгсгөл нь
 * ижил байрлалтай (video/higgsfield-exercise-loops.md).
 */
export default function MovementEditor({
  movement,
  exerciseId,
  onClose,
  onSaved,
}) {
  const isNew = !movement.Id;
  const [form, setForm] = useState({
    Name: movement.Name || "",
    GuideText: movement.GuideText || "",
    Mode: movement.Reps ? "reps" : "time",
    WorkSec: movement.WorkSec || 30,
    Reps: movement.Reps || 8,
    PrepSec: movement.PrepSec || 10,
    RestSec: movement.RestSec || 0,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [savedId, setSavedId] = useState(movement.Id || null);

  const videoInput = useRef(null);
  const photoInput = useRef(null);
  const thumb = useMediaLink(savedId, "thumb", !!movement.HasThumb);
  const video = useMediaLink(savedId, "video", !!movement.HasVideo);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const num = (v, fallback) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  /** Хадгалаад Id-г буцаана (шинэ мөрд бичлэг хавсаргахад хэрэгтэй). */
  const persist = (after) => {
    if (!form.Name.trim()) {
      setError("Хөдөлгөөний нэрийг оруулна уу");
      return;
    }
    setSaving(true);
    const Data = {
      ExerciseId: exerciseId,
      Name: form.Name.trim(),
      GuideText: form.GuideText.trim() || null,
      // Цагаар эсвэл тоогоор — хоёул нэгэн зэрэг утгатай байвал тоглуулагч
      // хугацааг сонгоно, тиймээс нөгөөг нь цэвэрлэнэ.
      WorkSec: form.Mode === "time" ? num(form.WorkSec, 30) : null,
      Reps: form.Mode === "reps" ? num(form.Reps, 8) : null,
      PrepSec: Math.max(10, num(form.PrepSec, 10)),
      RestSec: num(form.RestSec, 0) || null,
      IsActive: true,
    };
    const done = (res) => {
      setSaving(false);
      if (!res || !res.Success) {
        setError((res && res.Message) || "Хадгалж чадсангүй");
        return;
      }
      const Id = savedId || (res.Data && (res.Data.DataId || res.Data.Id));
      setSavedId(Id);
      if (after) after(Id, Data);
    };
    if (savedId) {
      Helper.BaseCrudHelper.BaseUpdate(
        { ObjectName: "RehabMovement", Data: { ...Data, Id: savedId } },
        done,
      );
    } else {
      Helper.BaseCrudHelper.BaseCreate(
        { ObjectName: "RehabMovement", Data },
        done,
      );
    }
  };

  const upload = (file, kind) => {
    if (!file) return;
    const attach = (Id) => {
      if (!Id) {
        setError("Эхлээд хадгална уу");
        return;
      }
      setProgress(0);
      Helper.BaseCrudHelper.BaseUploadFile(
        {
          Value: [
            { File: file, Type: file.type, FileInfo: { Name: file.name } },
          ],
          LinkedObjectInfo: {
            LinkedObjectName: "RehabMovement",
            LinkedObjectId: Id,
            FieldName: kind === "video" ? "Loop" : "Thumb",
          },
        },
        (res) => {
          if (!res || res.Success === false) {
            setProgress(null);
            setError((res && res.Message) || "Файл байршуулж чадсангүй");
            return;
          }
          // Серверт дөнгөж хадгалсан файлаа зааж өгнө — байршуулалтын хариуны
          // бүтэц гэрээнд байхгүй тул түүнээс Id уншихгүй.
          Helper.BaseCrudHelper.CallService(
            "/RehabContent/SetMedia",
            { MovementId: Id, Kind: kind, UseLatest: true },
            (r) => {
              setProgress(null);
              if (r && r.Success) {
                forgetMediaLinks(Id);
                onSaved({
                  Id,
                  ...(kind === "video"
                    ? { HasVideo: true }
                    : { HasThumb: true }),
                  Name: form.Name.trim(),
                });
              } else {
                setError((r && r.Message) || "Холбож чадсангүй");
              }
            },
          );
        },
        (pct) => setProgress(pct),
      );
    };
    if (savedId) attach(savedId);
    else persist((Id) => attach(Id));
  };

  return (
    <BaseDialog
      Title={isNew ? "Шинэ хөдөлгөөн" : "Хөдөлгөөн засах"}
      Width="720px"
      Close={onClose}
      ShowSave
      Save={() =>
        persist((Id) =>
          onSaved({
            Id,
            Name: form.Name.trim(),
            GuideText: form.GuideText,
            WorkSec: form.Mode === "time" ? num(form.WorkSec, 30) : null,
            Reps: form.Mode === "reps" ? num(form.Reps, 8) : null,
            PrepSec: Math.max(10, num(form.PrepSec, 10)),
            RestSec: num(form.RestSec, 0) || null,
            HasVideo: !!movement.HasVideo,
            HasThumb: !!movement.HasThumb,
          }),
        )
      }
      SaveButtonText={saving ? "Хадгалж байна…" : "Хадгалах"}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Хөдөлгөөний нэр"
          value={form.Name}
          onChange={set("Name")}
          fullWidth
          required
        />

        <TextField
          label="Гүйцэтгэх алхам (мөр бүрт нэг)"
          value={form.GuideText}
          onChange={set("GuideText")}
          fullWidth
          multiline
          minRows={3}
          helperText="Апп дээр дугаарлагдаж харагдана."
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={form.Mode}
            onChange={(e, v) => v && setForm((f) => ({ ...f, Mode: v }))}
          >
            <ToggleButton value="time">Хугацаагаар</ToggleButton>
            <ToggleButton value="reps">Тоогоор</ToggleButton>
          </ToggleButtonGroup>

          {form.Mode === "time" ? (
            <TextField
              label="Үргэлжлэх (сек)"
              type="number"
              value={form.WorkSec}
              onChange={set("WorkSec")}
              sx={{ width: 160 }}
            />
          ) : (
            <TextField
              label="Давталт"
              type="number"
              value={form.Reps}
              onChange={set("Reps")}
              sx={{ width: 160 }}
            />
          )}
          <TextField
            label="Бэлтгэх (сек)"
            type="number"
            value={form.PrepSec}
            onChange={set("PrepSec")}
            sx={{ width: 160 }}
            helperText="Хамгийн багадаа 10"
          />
          <TextField
            label="Амралт (сек)"
            type="number"
            value={form.RestSec}
            onChange={set("RestSec")}
            sx={{ width: 160 }}
            helperText="0 бол амралтгүй"
          />
        </Stack>

        {progress !== null && (
          <Box>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption">
              Байршуулж байна… {progress}%
            </Typography>
          </Box>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <MediaSlot
            title="Давтагдах бичлэг"
            hint="9:16, 720×1280, дуугүй, 3–8 сек"
            has={!!video}
            onPick={() => videoInput.current && videoInput.current.click()}
            preview={
              video ? (
                <Box
                  component="video"
                  src={video}
                  controls
                  muted
                  loop
                  sx={{
                    width: "100%",
                    maxHeight: 220,
                    borderRadius: radius.sm,
                  }}
                />
              ) : null
            }
          />
          <MediaSlot
            title="Зураг"
            hint="Жагсаалт, өнөөдрийн дасгал дээр харагдана"
            has={!!thumb}
            onPick={() => photoInput.current && photoInput.current.click()}
            preview={
              thumb ? (
                <Box
                  component="img"
                  src={thumb}
                  alt=""
                  sx={{ width: "100%", maxHeight: 220, objectFit: "contain" }}
                />
              ) : null
            }
          />
        </Stack>

        <input
          ref={videoInput}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          hidden
          onChange={(e) => {
            upload(e.target.files && e.target.files[0], "video");
            e.target.value = "";
          }}
        />
        <input
          ref={photoInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            upload(e.target.files && e.target.files[0], "thumb");
            e.target.value = "";
          }}
        />
      </Stack>
    </BaseDialog>
  );
}

MovementEditor.propTypes = {
  movement: PropTypes.object,
  exerciseId: PropTypes.number,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};

function MediaSlot({ title, hint, has, preview, onPick }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        border: `1px dashed ${colors.brand.hairlineStrong}`,
        borderRadius: radius.md,
      }}
    >
      <Typography variant="subtitle2" component="div">
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
      <Box sx={{ my: 1, minHeight: 60 }}>
        {preview || (
          <Typography variant="body2" color="text.secondary">
            Хавсаргаагүй байна.
          </Typography>
        )}
      </Box>
      <Button size="small" startIcon={<UploadIcon />} onClick={onPick}>
        {has ? "Солих" : "Файл сонгох"}
      </Button>
    </Box>
  );
}

MediaSlot.propTypes = {
  title: PropTypes.string,
  hint: PropTypes.string,
  has: PropTypes.bool,
  preview: PropTypes.node,
  onPick: PropTypes.func,
};
