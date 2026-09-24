import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import RepeatIcon from "@mui/icons-material/Repeat";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import { useMediaLink, forgetMediaLinks, rehabCall } from "./useRehabContent";
import { Section, NumField, DirtyDot, StickyBar } from "./rehabUi";
import CueTimeline from "./CueTimeline";
import PhonePreview from "./PhonePreview";
import {
  MIN_PREP_SEC,
  cueErrors,
  fmtSec,
  movementSec,
  stepsFrom,
} from "./rehabFormat";

/**
 * Нэг хөдөлгөөний засварлагч — дасгалын сангийн баруун самбар.
 *
 * Бүгдийг нэг дор, нэг "Хадгалах"-аар: нэр ба алхмууд, тун (хугацаа эсвэл
 * давталт, сет, амралт), анхааруулга, явцын мессеж, бичлэг ба зураг. Хадгалах
 * нь /RehabContent/SaveMovement — мессежийн JSON-ийг сервер шалгана.
 *
 * Эцэг нь `key={movement.Id}`-ээр дахин үүсгэдэг тул ноорог энд л амьдарна;
 * өөр хөдөлгөөн рүү шилжихээс өмнө `onDirtyChange`-аар асууна.
 */
function toDraft(m) {
  return {
    Name: m.Name || "",
    Steps: stepsFrom(m.GuideText),
    Mode: m.Reps ? "reps" : "time",
    WorkSec: m.WorkSec || 30,
    Reps: m.Reps || 10,
    Sets: m.Sets || 1,
    SetRestSec: m.SetRestSec || 30,
    PrepSec: m.PrepSec || MIN_PREP_SEC,
    RestSec: m.RestSec || 0,
    WarningText: m.WarningText || "",
    Cues: Array.isArray(m.Cues) ? m.Cues : [],
  };
}

const WIDE = "@media (min-width: 1480px)";

export default function MovementPanel({
  movement,
  exerciseId,
  onSaved,
  onDirtyChange,
  onClose,
}) {
  const initial = useMemo(() => toDraft(movement), [movement]);
  const [draft, setDraft] = useState(initial);
  const [savedId, setSavedId] = useState(movement.Id || null);
  const [baseline, setBaseline] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [progress, setProgress] = useState(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    if (dirtyRef.current !== dirty) {
      dirtyRef.current = dirty;
      if (onDirtyChange) onDirtyChange(dirty);
    }
  }, [dirty, onDirtyChange]);

  const video = useMediaLink(savedId, "video", !!movement.HasVideo);
  const thumb = useMediaLink(savedId, "thumb", !!movement.HasThumb);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const cueProblems = cueErrors(draft.Cues, draft);
  const hasCueProblems = Object.keys(cueProblems).length > 0;

  /** Хадгалаад Id-г буцаана; алдаатай бол null. */
  const persist = async () => {
    if (!draft.Name.trim()) {
      setError("Хөдөлгөөний нэрийг оруулна уу");
      return null;
    }
    if (hasCueProblems) {
      setError("Мессежийн алдааг засна уу");
      return null;
    }
    setSaving(true);
    setError(null);
    const res = await rehabCall("SaveMovement", {
      Id: savedId,
      ExerciseId: exerciseId,
      Name: draft.Name,
      GuideText: draft.Steps.map((s) => s.trim())
        .filter(Boolean)
        .join("\n"),
      WorkSec: draft.Mode === "time" ? draft.WorkSec : null,
      Reps: draft.Mode === "reps" ? draft.Reps : null,
      Sets: draft.Sets,
      SetRestSec: draft.SetRestSec,
      PrepSec: draft.PrepSec,
      RestSec: draft.RestSec,
      WarningText: draft.WarningText,
      Cues: draft.Cues,
    });
    setSaving(false);
    if (!res.Success) {
      setError(res.Message || "Хадгалж чадсангүй");
      return null;
    }
    const Id = (res.Data && res.Data.Id) || savedId;
    setSavedId(Id);
    setBaseline(draft);
    setNotice("Хадгаллаа");
    if (onSaved) onSaved(Id);
    return Id;
  };

  const upload = async (file, kind) => {
    if (!file) return;
    const Id = savedId && !dirty ? savedId : await persist();
    if (!Id) return;
    setProgress(0);
    setError(null);
    Helper.BaseCrudHelper.BaseUploadFile(
      {
        Value: [{ File: file, Type: file.type, FileInfo: { Name: file.name } }],
        LinkedObjectInfo: {
          LinkedObjectName: "RehabMovement",
          LinkedObjectId: Id,
          FieldName: kind === "video" ? "Loop" : "Thumb",
        },
      },
      async (res) => {
        if (!res || res.Success === false) {
          setProgress(null);
          setError((res && res.Message) || "Файл байршуулж чадсангүй");
          return;
        }
        const r = await rehabCall("SetMedia", {
          MovementId: Id,
          Kind: kind,
          UseLatest: true,
        });
        setProgress(null);
        if (!r.Success) return setError(r.Message || "Холбож чадсангүй");
        forgetMediaLinks(Id);
        setNotice(
          kind === "video" ? "Бичлэг хавсаргалаа" : "Зураг хавсаргалаа",
        );
        if (onSaved) onSaved(Id);
        return undefined;
      },
      (pct) => setProgress(pct),
    );
  };

  const clearMedia = async (kind) => {
    if (!savedId) return;
    const r = await rehabCall("SetMedia", { MovementId: savedId, Kind: kind });
    if (!r.Success) return setError(r.Message || "Хасаж чадсангүй");
    forgetMediaLinks(savedId);
    if (onSaved) onSaved(savedId);
    return undefined;
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: "1fr",
        // theme xl нь 1920 — засварлагч ба утас зэрэгцэх нь 1480px-ээс.
        [WIDE]: { gridTemplateColumns: "minmax(0, 1fr) 250px" },
        alignItems: "start",
      }}
    >
      <Stack spacing={2} sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4" component="div" sx={{ flex: 1 }}>
            {savedId ? "Хөдөлгөөн засах" : "Шинэ хөдөлгөөн"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Нийт{" "}
            {fmtSec(
              movementSec({
                ...draft,
                Reps: draft.Mode === "reps" ? draft.Reps : 0,
              }),
            )}
          </Typography>
          <Tooltip title="Хаах">
            <IconButton aria-label="Хаах" onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {notice && !error && !dirty && (
          <Alert severity="success" onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        )}

        <Section no={1} title="Үндсэн мэдээлэл">
          <TextField
            label="Хөдөлгөөний нэр"
            value={draft.Name}
            onChange={(e) => set({ Name: e.target.value })}
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
          />
          <StepsEditor
            steps={draft.Steps}
            onChange={(Steps) => set({ Steps })}
          />
        </Section>

        <Section
          no={2}
          title="Тун"
          hint="Хугацаагаар бол таймер тоолно, тоогоор бол өвчтөн өөрөө тоолж дуусгана."
        >
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={draft.Mode}
              onChange={(e, v) => v && set({ Mode: v })}
            >
              <ToggleButton value="time">
                <TimerOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />{" "}
                Хугацаагаар
              </ToggleButton>
              <ToggleButton value="reps">
                <RepeatIcon fontSize="small" sx={{ mr: 0.5 }} /> Тоогоор
              </ToggleButton>
            </ToggleButtonGroup>
            {draft.Mode === "time" ? (
              <NumField
                label="Үргэлжлэх (сек)"
                value={draft.WorkSec}
                min={1}
                max={3600}
                onChange={(v) => set({ WorkSec: v })}
              />
            ) : (
              <NumField
                label="Давталт (удаа)"
                value={draft.Reps}
                min={1}
                max={200}
                onChange={(v) => set({ Reps: v })}
              />
            )}
            <NumField
              label="Сет"
              value={draft.Sets}
              min={1}
              max={20}
              width={90}
              onChange={(v) => set({ Sets: v })}
            />
            {parseInt(draft.Sets, 10) > 1 && (
              <NumField
                label="Сет хоорондын амралт (сек)"
                value={draft.SetRestSec}
                width={200}
                onChange={(v) => set({ SetRestSec: v })}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            <NumField
              label="Бэлтгэл (сек)"
              value={draft.PrepSec}
              min={MIN_PREP_SEC}
              helperText={`Доод тал нь ${MIN_PREP_SEC}`}
              onChange={(v) => set({ PrepSec: v })}
            />
            <NumField
              label="Дараа амрах (сек)"
              value={draft.RestSec}
              helperText="0 бол амралтгүй"
              onChange={(v) => set({ RestSec: v })}
            />
          </Stack>
        </Section>

        <Section
          no={3}
          title="Анхааруулга"
          hint="Бэлтгэлийн дэлгэц дээр улаан хайрцагт харагдана. Эмчилгээний үгийг сэргээн засахын эмч бичнэ."
        >
          <TextField
            value={draft.WarningText}
            onChange={(e) => set({ WarningText: e.target.value })}
            placeholder="Жишээ нь: Цээжээр өвдвөл даруй зогсооно уу."
            fullWidth
            multiline
            minRows={2}
            size="small"
          />
        </Section>

        <Section
          no={4}
          title="Явцын мессеж"
          hint="Хөдөлгөөн эхлэхэд болон дундуур нь бичлэг дээр гарах богино зааварчилгаа."
        >
          <CueTimeline
            cues={draft.Cues}
            onChange={(Cues) => set({ Cues })}
            mode={draft.Mode}
            workSec={draft.WorkSec}
            sets={draft.Sets}
          />
        </Section>

        <Section
          no={5}
          title="Бичлэг ба зураг"
          hint="Бичлэг: 9:16 (720×1280), дуугүй, эхлэл төгсгөл нь ижил байрлалтай давтагдах клип, 50 MB хүртэл. Файл сонгоход хөдөлгөөн эхлээд хадгалагдана."
        >
          {progress !== null && (
            <Box sx={{ mb: 1.5 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption">
                Байршуулж байна… {progress}%
              </Typography>
            </Box>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <DropSlot
              title="Давтагдах бичлэг"
              accept="video/mp4,video/quicktime,video/webm"
              url={video}
              kind="video"
              busy={progress !== null}
              onFile={(f) => upload(f, "video")}
              onClear={() => clearMedia("video")}
            />
            <DropSlot
              title="Зураг"
              accept="image/jpeg,image/png,image/webp"
              url={thumb}
              kind="thumb"
              busy={progress !== null}
              onFile={(f) => upload(f, "thumb")}
              onClear={() => clearMedia("thumb")}
            />
          </Stack>
        </Section>

        <StickyBar>
          <Button
            onClick={persist}
            disabled={saving || (!dirty && !!savedId)}
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
          <Box sx={{ flex: 1 }} />
          <DirtyDot dirty={dirty} />
        </StickyBar>
      </Stack>

      <Box sx={{ maxWidth: 280, [WIDE]: { position: "sticky", top: 16 } }}>
        <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
          Утсан дээр
        </Typography>
        <PhonePreview draft={draft} videoUrl={video} thumbUrl={thumb} />
      </Box>
    </Box>
  );
}

MovementPanel.propTypes = {
  movement: PropTypes.object.isRequired,
  exerciseId: PropTypes.number,
  onSaved: PropTypes.func,
  onDirtyChange: PropTypes.func,
  onClose: PropTypes.func,
};

/** Алхмууд — мөр бүр нэг алхам; Enter дараагийн мөрийг нэмнэ. */
function StepsEditor({ steps, onChange }) {
  const refs = useRef([]);
  const focusLater = useRef(null);
  useEffect(() => {
    if (focusLater.current !== null && refs.current[focusLater.current]) {
      refs.current[focusLater.current].focus();
      focusLater.current = null;
    }
  });
  const update = (i, v) => onChange(steps.map((s, j) => (j === i ? v : s)));
  const insertAfter = (i) => {
    const next = [...steps];
    next.splice(i + 1, 0, "");
    focusLater.current = i + 1;
    onChange(next);
  };
  const move = (i, to) => {
    if (to < 0 || to >= steps.length) return;
    const next = [...steps];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  return (
    <Box>
      <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
        Хэрхэн хийх вэ — алхмууд
      </Typography>
      <Stack spacing={1}>
        {steps.map((s, i) => (
          <Stack key={i} direction="row" spacing={0.5} alignItems="center">
            <Typography
              variant="body2"
              component="span"
              sx={{
                width: 22,
                textAlign: "right",
                color: colors.brand.inkMuted,
                flex: "none",
              }}
            >
              {i + 1}.
            </Typography>
            <TextField
              inputRef={(el) => {
                refs.current[i] = el;
              }}
              value={s}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertAfter(i);
                }
              }}
              size="small"
              fullWidth
              placeholder="Алхмын тайлбар"
            />
            <IconButton
              size="small"
              aria-label="Дээш"
              disabled={i === 0}
              onClick={() => move(i, i - 1)}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Доош"
              disabled={i === steps.length - 1}
              onClick={() => move(i, i + 1)}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Алхам хасах"
              onClick={() => onChange(steps.filter((_, j) => j !== i))}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button
        startIcon={<AddIcon />}
        onClick={() => insertAfter(steps.length - 1)}
        sx={{ ...gridToolbarButtonSx.neutral, mt: 1 }}
      >
        Алхам нэмэх
      </Button>
    </Box>
  );
}

StepsEditor.propTypes = { steps: PropTypes.array, onChange: PropTypes.func };

/** Чирж оруулах эсвэл сонгох файлын хайрцаг, урьдчилан харах нь дотроо. */
function DropSlot({ title, accept, url, kind, busy, onFile, onClear }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!busy) onFile(e.dataTransfer.files && e.dataTransfer.files[0]);
      }}
      sx={{
        flex: 1,
        p: 1.5,
        borderRadius: radius.md,
        border: `1px dashed ${over ? colors.brand.cyanDeep : colors.brand.hairlineStrong}`,
        bgcolor: over ? colors.brand.tint : "transparent",
      }}
    >
      <Typography variant="subtitle2" component="div">
        {title}
      </Typography>
      <Box sx={{ my: 1, minHeight: 90, display: "grid", placeItems: "center" }}>
        {url ? (
          kind === "video" ? (
            <Box
              component="video"
              src={url}
              controls
              muted
              loop
              sx={{ width: "100%", maxHeight: 220, borderRadius: radius.sm }}
            />
          ) : (
            <Box
              component="img"
              src={url}
              alt=""
              sx={{ width: "100%", maxHeight: 220, objectFit: "contain" }}
            />
          )
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Файлаа энд чирж оруулна уу
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        <Button
          startIcon={<UploadIcon />}
          disabled={busy}
          onClick={() => input.current && input.current.click()}
          sx={gridToolbarButtonSx.neutral}
        >
          {url ? "Солих" : "Файл сонгох"}
        </Button>
        {url && (
          <Button
            disabled={busy}
            onClick={onClear}
            sx={gridToolbarButtonSx.danger}
          >
            Хасах
          </Button>
        )}
      </Stack>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          onFile(e.target.files && e.target.files[0]);
          e.target.value = "";
        }}
      />
    </Box>
  );
}

DropSlot.propTypes = {
  title: PropTypes.string,
  accept: PropTypes.string,
  url: PropTypes.string,
  kind: PropTypes.string,
  busy: PropTypes.bool,
  onFile: PropTypes.func,
  onClear: PropTypes.func,
};
