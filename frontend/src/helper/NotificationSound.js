/**
 * The "you have a new notification" chime.
 *
 * Synthesised with the Web Audio API rather than an .mp3: there is no audio
 * asset in the repo to reuse, and a two-note sine chime is a few lines.
 *
 * Browsers refuse to start audio before the user has interacted with the page.
 * The AudioContext is therefore created (or resumed) on the first pointer or key
 * event, and a chime requested before that is silently skipped - a sound that
 * cannot play must never throw into the socket handler that asked for it.
 *
 * Throttled: a burst of notifications (a group chat, a reconnect replaying
 * several rows) plays one chime, not a stutter.
 */

const THROTTLE_MS = 1500;

let context = null;
let lastPlayedAt = 0;

function GetContext() {
  if (context) return context;
  const Ctor =
    typeof window !== "undefined" &&
    (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch (ex) {
    context = null;
  }
  return context;
}

function Unlock() {
  const ctx = GetContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

if (typeof window !== "undefined") {
  const opts = { capture: true, passive: true };
  ["pointerdown", "keydown", "touchstart"].forEach((Event) =>
    window.addEventListener(Event, Unlock, opts),
  );
}

function Tone(ctx, Frequency, StartAt, Duration) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(Frequency, StartAt);
  gain.gain.setValueAtTime(0.0001, StartAt);
  gain.gain.exponentialRampToValueAtTime(0.18, StartAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, StartAt + Duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(StartAt);
  osc.stop(StartAt + Duration + 0.05);
}

export function PlayNotificationSound() {
  const Now = Date.now();
  if (Now - lastPlayedAt < THROTTLE_MS) return;

  const ctx = GetContext();
  if (!ctx || ctx.state !== "running") return;

  lastPlayedAt = Now;
  try {
    const t0 = ctx.currentTime;
    Tone(ctx, 880, t0, 0.18); // A5
    Tone(ctx, 1318.5, t0 + 0.12, 0.28); // E6
  } catch (ex) {
    // Audio is a nicety; never let it break the caller.
  }
}

export default PlayNotificationSound;
