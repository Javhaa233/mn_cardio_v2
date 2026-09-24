import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import { arrayMove } from "@dnd-kit/sortable";

import { colors } from "@/theme/colors";
import { dialogActionSx, dialogPaperSx } from "@/theme/controlStyles";
import LoadError from "customComponents/LoadError";
import { useRehabContent, rehabCall } from "./useRehabContent";
import { panelSx } from "./rehabUi";
import ExerciseList from "./ExerciseList";
import MovementList from "./MovementList";
import ExerciseForm from "./ExerciseForm";
import MovementPanel from "./MovementPanel";

/**
 * Дасгалын сан — сэргээн засах контентын үндсэн урсгал (2026-09-24).
 *
 *   зүүн     бүх дасгал: хайлт, ангилал, чирж дараалуулах
 *   дунд     сонгосон дасгалын хөдөлгөөнүүд нэг нэгээр, апп дээрх дарааллаар
 *   баруун   засварлагч: дасгалын мэдээлэл, эсвэл нэг хөдөлгөөн бүхэлдээ
 *            (тун, сет, анхааруулга, явцын мессеж, бичлэг) + утасны загвар
 *
 * Хадгалаагүй өөрчлөлттэй үед өөр зүйл сонгоход асууна — эмч урт мессеж бичээд
 * санамсаргүй дарж алдахгүй.
 */
export default function ExerciseLibrary() {
  const [showInactive, setShowInactive] = useState(false);
  const {
    items,
    categories,
    loading,
    error,
    setError,
    reload,
    reorder,
    setItems,
  } = useRehabContent(showInactive);

  const [pickedId, setExerciseId] = useState(null);
  // "exercise" | "newExercise" | "new" (шинэ хөдөлгөөн) | movement Id | null
  const [pane, setPane] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const dirty = useRef(false);
  const [confirm, setConfirm] = useState(null);

  const onDirtyChange = useCallback((d) => {
    dirty.current = d;
  }, []);

  /** Хадгалаагүй зүйл байвал эхлээд асууна. */
  const guard = (action) => {
    if (!dirty.current) return action();
    return setConfirm({
      title: "Хадгалаагүй өөрчлөлт байна",
      body: "Өөрчлөлтөө хадгалалгүй гарах уу?",
      yes: "Хадгалалгүй гарах",
      danger: true,
      onYes: () => {
        dirty.current = false;
        action();
      },
    });
  };

  // Юу ч сонгоогүй бол эхний дасгал — төлөвт бичихгүй, уншихдаа л тооцно.
  const exerciseId =
    pickedId !== null
      ? pickedId
      : pane !== "newExercise" && items.length
        ? items[0].Id
        : null;
  const exercise = items.find((e) => e.Id === exerciseId) || null;

  const movement =
    exercise && typeof pane === "number"
      ? (exercise.Movements || []).find((m) => m.Id === pane) || null
      : null;

  const editing = !!exercise && (pane === "new" || !!movement);

  const selectExercise = (Id) =>
    guard(() => {
      setExerciseId(Id);
      setPane(null);
    });

  const moveExercise = (from, to) => {
    const next = arrayMove(items, from, to);
    setItems(next);
    reorder(
      "RehabExercise",
      next.map((e) => e.Id),
    );
  };

  const moveMovement = (from, to) => {
    const live = exercise.Movements.filter((m) => m.IsActive !== false);
    const next = arrayMove(live, from, to);
    setItems(
      items.map((e) => (e.Id === exercise.Id ? { ...e, Movements: next } : e)),
    );
    reorder(
      "RehabMovement",
      next.map((m) => m.Id),
    );
  };

  const run = async (route, body, after) => {
    const res = await rehabCall(route, body);
    if (!res.Success) return setError(res.Message || "Үйлдэл амжилтгүй");
    reload(true);
    if (after) after(res.Data || {});
    return undefined;
  };

  const removeMovement = (m) =>
    setConfirm({
      title: "Хөдөлгөөн хасах",
      body: `«${m.Name}» хөдөлгөөнийг хасах уу? Апп дээр цаашид тоглогдохгүй.`,
      yes: "Хасах",
      danger: true,
      onYes: () =>
        run("RemoveMovement", { MovementId: m.Id }, () => {
          if (pane === m.Id) setPane(null);
        }),
    });

  if (loading && !items.length) {
    return (
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { lg: "300px 340px 1fr" },
        }}
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={420} />
        ))}
      </Box>
    );
  }
  if (error && !items.length)
    return <LoadError Message={error} Retry={() => reload()} />;

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          // Хөдөлгөөн засаж байхад дасгалын жагсаалт нуугдаж, засварлагч ба
          // утасны загвар зэрэгцэн багтана; «Бүх дасгал» товч буцаана.
          gridTemplateColumns: editing
            ? { xs: "1fr", md: "320px minmax(0, 1fr)" }
            : {
                xs: "1fr",
                md: "280px minmax(0, 1fr)",
                lg: "290px 330px minmax(0, 1fr)",
              },
        }}
      >
        <Box sx={{ ...panelSx, p: 2, display: editing ? "none" : "block" }}>
          <ExerciseList
            items={items}
            categories={categories}
            selectedId={exerciseId}
            query={query}
            category={category}
            showInactive={showInactive}
            onQuery={setQuery}
            onCategory={setCategory}
            onShowInactive={setShowInactive}
            onSelect={selectExercise}
            onNew={() =>
              guard(() => {
                setExerciseId(null);
                setPane("newExercise");
              })
            }
            onReorder={moveExercise}
          />
        </Box>

        {exercise && pane !== "newExercise" ? (
          <Box
            sx={{
              ...panelSx,
              p: 2,
              // Урт засварлагчийг гүйлгэхэд жагсаалт харагдсаар байна.
              position: { md: "sticky" },
              top: { md: 12 },
              maxHeight: { md: "calc(100vh - 150px)" },
              overflowY: { md: "auto" },
            }}
          >
            <MovementList
              exercise={exercise}
              categories={categories}
              selected={pane}
              onBack={editing ? () => guard(() => setPane(null)) : null}
              onSelectExercise={() => guard(() => setPane("exercise"))}
              onSelectMovement={(Id) => guard(() => setPane(Id))}
              onAddMovement={() => guard(() => setPane("new"))}
              onReorder={moveMovement}
              onDuplicate={(Id) =>
                run("DuplicateMovement", { MovementId: Id }, (d) =>
                  setPane(d.Id),
                )
              }
              onRemove={removeMovement}
              onDuplicateExercise={() =>
                run("DuplicateExercise", { ExerciseId: exercise.Id }, (d) => {
                  setShowInactive(true);
                  setExerciseId(d.Id);
                  setPane("exercise");
                })
              }
            />
          </Box>
        ) : (
          <Box sx={{ display: { xs: "none", lg: "block" } }} />
        )}

        <Box
          sx={{
            ...panelSx,
            p: 2,
            gridColumn: editing ? "auto" : { md: "1 / -1", lg: "auto" },
            minHeight: 320,
          }}
        >
          {pane === "newExercise" && (
            <ExerciseForm
              key="new-exercise"
              exercise={{}}
              categories={categories}
              onDirtyChange={onDirtyChange}
              onClose={() => guard(() => setPane(null))}
              onSaved={(Id) => {
                dirty.current = false;
                reload(true);
                setExerciseId(Id);
                setPane("exercise");
              }}
            />
          )}
          {exercise && pane === "exercise" && (
            <ExerciseForm
              key={`exercise-${exercise.Id}`}
              exercise={exercise}
              categories={categories}
              onDirtyChange={onDirtyChange}
              onClose={() => guard(() => setPane(null))}
              onSaved={() => reload(true)}
            />
          )}
          {exercise && (pane === "new" || movement) && (
            <MovementPanel
              key={movement ? `movement-${movement.Id}` : `new-${exercise.Id}`}
              movement={movement || {}}
              exerciseId={exercise.Id}
              onDirtyChange={onDirtyChange}
              onClose={() => guard(() => setPane(null))}
              onSaved={(Id) => {
                reload(true);
                if (pane === "new") {
                  dirty.current = false;
                  setPane(Id);
                }
              }}
            />
          )}
          {!(
            pane === "newExercise" ||
            (exercise && (pane === "exercise" || pane === "new" || movement))
          ) && <EmptyPane hasExercise={!!exercise} />}
        </Box>
      </Box>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        PaperProps={{ sx: dialogPaperSx }}
        maxWidth="xs"
        fullWidth
      >
        {confirm && (
          <>
            <DialogTitle component="div">
              <Typography variant="h5" component="div">
                {confirm.title}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2">{confirm.body}</Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setConfirm(null)}
                sx={dialogActionSx("neutral")}
              >
                Болих
              </Button>
              <Button
                onClick={() => {
                  const go = confirm.onYes;
                  setConfirm(null);
                  go();
                }}
                sx={dialogActionSx(confirm.danger ? "danger" : "primary")}
              >
                {confirm.yes}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function EmptyPane({ hasExercise }) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 280,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <TouchAppOutlinedIcon sx={{ fontSize: 40, color: colors.brand.cyan }} />
        <Typography variant="subtitle1" component="div">
          {hasExercise ? "Хөдөлгөөн сонгоно уу" : "Дасгал сонгоно уу"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hasExercise
            ? "Дундах жагсаалтаас хөдөлгөөн сонгож тун, анхааруулга, мессеж, бичлэгийг нь засна."
            : "Зүүн талаас дасгал сонгох эсвэл «Шинэ дасгал» дарна уу."}
        </Typography>
      </Box>
    </Box>
  );
}

EmptyPane.propTypes = { hasExercise: PropTypes.bool };
