/**
 * Words for the rehab codes the server sends, kept identical to the doctor
 * app (mobile/app/lib/features/doctor/doctor_rehab_plan.dart and
 * rehab/rehab_player_models.dart) so a doctor reads the same thing on both.
 * Codes: backend/helper/RehabPlayer.js STOP_SYMPTOMS / FINISH_STATUSES.
 */
export const SESSION_STATUS = {
  started: "Эхэлсэн",
  completed: "Дууссан",
  stopped: "Биеийн байдлаас зогсоосон",
  abandoned: "Дундуур орхисон",
};

export const STOP_SYMPTOMS = {
  chest_pain: "Цээж өвдөх, шахах",
  dizzy: "Толгой эргэх",
  breathless: "Амьсгаадах",
  palpitations: "Зүрх хүчтэй дэлсэх",
  nausea: "Дотор муухайрах",
  other: "Бусад",
};

export const PLAN_STATUS = {
  active: "Идэвхтэй",
  paused: "Түр зогссон",
  ended: "Дууссан",
};
