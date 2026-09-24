/**
 * Сэргээн засах контентын жижиг тооцоолол, текст.
 *
 * Серверийн дүрмийн толь: backend/helper/RehabDose.js (MovementsSec) ба
 * backend/helper/RehabCues.js (Validate). Эндхийнх нь зөвхөн хуудсан дээр шууд
 * анхааруулах зориулалттай — хадгалахад сервер дахин шалгана, тэр нь үнэн.
 */

export const MIN_PREP_SEC = 10;
export const MAX_CUES = 20;
export const MAX_CUE_TEXT = 200;
/** Мессеж дэлгэц дээр хэдэн секунд харагдах вэ (тоглуулагчтай ижил). */
export const CUE_VISIBLE_SEC = 4;

const int = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

/** 75 → "1:15", 40 → "40 сек". */
export function fmtSec(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  if (s < 60) return `${s} сек`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}:${String(r).padStart(2, "0")} мин` : `${m} мин`;
}

/** "3 × 10 удаа" / "30 сек" — картууд дээрх тун. */
export function doseLabel(m) {
  const sets = Math.max(1, int(m.Sets) || 1);
  const core =
    int(m.Reps) > 0 ? `${int(m.Reps)} удаа` : `${int(m.WorkSec)} сек`;
  return sets > 1 ? `${sets} × ${core}` : core;
}

/** Нэг хөдөлгөөний нийт секунд (давталттай бол ажлын хугацаа тооцогдохгүй). */
export function movementSec(m) {
  const sets = Math.max(1, int(m.Sets) || 1);
  return (
    Math.max(MIN_PREP_SEC, int(m.PrepSec)) +
    sets * (int(m.Reps) > 0 ? 0 : int(m.WorkSec)) +
    (sets - 1) * int(m.SetRestSec) +
    int(m.RestSec)
  );
}

export function cueKind(c) {
  if (c.AtSet !== null && c.AtSet !== undefined && c.AtSet !== "") return "set";
  return int(c.AtSec) === 0 ? "start" : "sec";
}

/** Хэзээ гарахыг хүний хэлээр: "Эхлэхэд", "15 дахь секундэд", "2-р сет эхлэхэд". */
export function cueWhen(c) {
  const kind = cueKind(c);
  if (kind === "start") return "Эхлэхэд";
  if (kind === "set") return `${int(c.AtSet)}-р сет эхлэхэд`;
  return `${int(c.AtSec)} дахь секундэд`;
}

/**
 * Серверийн RehabCues.Validate-ийн хуулбар — мөр бүрийн алдааг буцаана
 * (index → текст), хоосон бол алдаагүй.
 */
export function cueErrors(cues, { Mode, WorkSec, Sets }) {
  const out = {};
  const work = int(WorkSec);
  const sets = Math.max(1, int(Sets) || 1);
  cues.forEach((c, i) => {
    const text = String(c.Text || "").trim();
    const kind = cueKind(c);
    if (!text) out[i] = "Текст хоосон байна";
    else if (text.length > MAX_CUE_TEXT)
      out[i] = `${MAX_CUE_TEXT} тэмдэгтээс урт`;
    else if (kind === "set" && (int(c.AtSet) < 1 || int(c.AtSet) > sets))
      out[i] = `Сет 1–${sets} хооронд`;
    else if (kind === "sec" && Mode === "reps")
      out[i] = "Давталттай хөдөлгөөнд секунд биш, сет сонгоно";
    else if (kind === "sec" && (int(c.AtSec) < 0 || int(c.AtSec) >= work))
      out[i] = `${work} секундээс өмнө байна`;
  });
  return out;
}

/** Тухайн секундэд (нэг сетийн дотор) аль мессеж харагдаж байгаа вэ. */
export function activeCue(cues, { second, set }) {
  const visible = (at) => second >= at && second < at + CUE_VISIBLE_SEC;
  // Сетийн эхний мессеж ба эхлэлийн мессеж 0-р секундээс эхэлнэ.
  const hit =
    cues.find(
      (c) => cueKind(c) === "set" && int(c.AtSet) === set && visible(0),
    ) ||
    (set === 1 && cues.find((c) => cueKind(c) === "start" && visible(0))) ||
    [...cues]
      .filter((c) => cueKind(c) === "sec" && visible(int(c.AtSec)))
      .sort((a, b) => int(b.AtSec) - int(a.AtSec))[0];
  return hit || null;
}

/** GuideText (мөр бүрт нэг алхам) ↔ алхмын жагсаалт. */
export const stepsFrom = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
