import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Recording audio or video from the browser, for a chat message.
 *
 * THE FORMAT PROBLEM IS NOT SOLVED HERE, and it cannot be. MediaRecorder gives
 * you what the browser has: Chrome and Firefox write WebM/Opus, Safari writes
 * MP4/AAC. iOS plays only the second. A sender cannot know what the receiver
 * runs, so picking "the most compatible format the recorder supports" still
 * produces a clip half the recipients cannot play. The server normalises every
 * upload instead (backend/helper/MediaTranscode.js), which is the only place
 * that can guarantee it. What this hook does is ask for the best available
 * container so the common case needs no re-encoding at all.
 *
 * BITRATES ARE CAPPED HERE, and that is load-bearing. The chat upload limit is
 * 50 MB and deliberately not raised - formidable fixes its ceiling before it
 * knows which object the upload is for, so a higher one would make EVERY upload
 * readable to that size before it could be rejected. At 1.5 Mbps a three-minute
 * video lands near 35 MB, inside the cap with room to spare. Raising these
 * numbers without raising the cap produces uploads that fail after the user has
 * waited through them.
 *
 * TRACKS ARE RELEASED ON EVERY EXIT PATH, including unmount. A missed stop()
 * leaves the browser's recording indicator lit and the camera light on after
 * the user has closed the chat, which is alarming and looks like spyware.
 */

const AUDIO_MAX_MS = 10 * 60 * 1000; // tender-side decision, 10 minutes
const VIDEO_MAX_MS = 3 * 60 * 1000; // 3 minutes, ~35 MB at the bitrate below

const AUDIO_CANDIDATES = [
  "audio/mp4", // Safari - already the normalised target, no re-encode needed
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
];

const VIDEO_CANDIDATES = [
  "video/mp4;codecs=h264,aac", // best case: needs only a remux server-side
  "video/mp4",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickMimeType(candidates) {
  if (typeof window === "undefined" || !window.MediaRecorder) return null;
  for (let i = 0; i < candidates.length; i++) {
    try {
      if (window.MediaRecorder.isTypeSupported(candidates[i]))
        return candidates[i];
    } catch (ex) {
      /* isTypeSupported throws on some older builds rather than returning false */
    }
  }
  return null; // let the browser choose
}

/**
 * Name the file by WHAT IT IS, not just by its container.
 *
 * '.webm' and '.weba' are the same container; the difference is whether there
 * is a picture in it, and this function is the only place that knows - the
 * caller asked for a microphone or for a camera. Everything downstream
 * classifies on the extension (helper/MediaStream.js), so returning '.webm' for
 * a voice note makes it render as a black video frame.
 */
function extensionFor(mimeType, isVideo) {
  const m = String(mimeType || "").toLowerCase();
  if (m.indexOf("mp4") > -1) return isVideo ? "mp4" : "m4a";
  if (m.indexOf("ogg") > -1) return "ogg";
  return isVideo ? "webm" : "weba";
}

/** Why we cannot record, in the user's language, or null when we can. */
export function recorderUnavailableReason() {
  if (typeof window === "undefined") return null;

  // getUserMedia is only exposed in a secure context. On a plain-HTTP host
  // navigator.mediaDevices is simply undefined, which otherwise surfaces as an
  // incomprehensible TypeError the moment the button is pressed.
  if (!window.isSecureContext) {
    return "Бичлэг хийхийн тулд HTTPS холболт шаардлагатай";
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return "Таны хөтөч дуу/видео бичихийг дэмжихгүй байна";
  }
  if (!window.MediaRecorder) {
    return "Таны хөтөч дуу/видео бичихийг дэмжихгүй байна";
  }
  return null;
}

export default function useMediaRecorder({ Kind }) {
  const isVideo = Kind === "video";
  const maxMs = isVideo ? VIDEO_MAX_MS : AUDIO_MAX_MS;

  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startedAt = useRef(0);
  const tickRef = useRef(null);
  const resolveRef = useRef(null);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => {
        try {
          tr.stop();
        } catch (ex) {
          /* already stopped */
        }
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  // The safety net. Everything above is also called on the normal paths; this
  // is what covers a component torn down mid-recording.
  useEffect(
    () => () => {
      clearTick();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch (ex) {
          /* nothing to stop */
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => {
          try {
            tr.stop();
          } catch (ex) {
            /* already stopped */
          }
        });
        streamRef.current = null;
      }
    },
    [clearTick],
  );

  const start = useCallback(async () => {
    setError(null);

    const why = recorderUnavailableReason();
    if (why) {
      setError(why);
      return false;
    }

    const constraints = isVideo
      ? {
          audio: { echoCancellation: true, noiseSuppression: true },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        }
      : {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        };

    let media;
    try {
      media = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (ex) {
      const name = ex && ex.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError(
          isVideo
            ? "Камер, микрофон ашиглах зөвшөөрөл олгогдоогүй байна"
            : "Микрофон ашиглах зөвшөөрөл олгогдоогүй байна",
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError(isVideo ? "Камер олдсонгүй" : "Микрофон олдсонгүй");
      } else if (name === "NotReadableError") {
        setError("Төхөөрөмжийг өөр программ ашиглаж байна");
      } else {
        setError("Бичлэг эхлүүлэх боломжгүй байна");
      }
      return false;
    }

    streamRef.current = media;
    setStream(media);

    const mimeType = pickMimeType(
      isVideo ? VIDEO_CANDIDATES : AUDIO_CANDIDATES,
    );
    const options = {};
    if (mimeType) options.mimeType = mimeType;
    options.audioBitsPerSecond = 64000;
    if (isVideo) options.videoBitsPerSecond = 1500000;

    let rec;
    try {
      rec = new window.MediaRecorder(media, options);
    } catch (ex) {
      // A browser that rejects the options object still records with defaults;
      // failing the whole interaction over a bitrate hint would be worse.
      try {
        rec = new window.MediaRecorder(media);
      } catch (ex2) {
        releaseStream();
        setError("Бичлэг эхлүүлэх боломжгүй байна");
        return false;
      }
    }

    chunksRef.current = [];
    recorderRef.current = rec;

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    rec.onstop = () => {
      clearTick();
      const type =
        rec.mimeType || mimeType || (isVideo ? "video/webm" : "audio/webm");
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];

      const ms = Date.now() - startedAt.current;
      releaseStream();
      setRecording(false);
      setElapsedMs(0);

      const resolve = resolveRef.current;
      resolveRef.current = null;

      if (resolve) {
        if (!blob.size) {
          resolve(null);
          return;
        }
        const ext = extensionFor(type, isVideo);
        const stamp = new Date()
          .toISOString()
          .replace(/[-:T.]/g, "")
          .slice(0, 14);
        const name = `${isVideo ? "video" : "voice"}-${stamp}.${ext}`;
        // The File (not Blob) and the explicit name matter: BaseUploadFile does
        // formData.append("File"+n, File, FileInfo.Name), and an empty filename
        // produces a multipart part the backend cannot match to its Info field.
        const file = new File([blob], name, { type });
        resolve({
          FileSrc: null,
          File: file,
          Type: type,
          FileInfo: { Name: name, DurationMs: ms },
        });
      }
    };

    rec.onerror = () => {
      clearTick();
      releaseStream();
      setRecording(false);
      setError("Бичлэг хийхэд алдаа гарлаа");
      const resolve = resolveRef.current;
      resolveRef.current = null;
      if (resolve) resolve(null);
    };

    // A timeslice keeps chunks arriving during the recording rather than only
    // at stop, so a crash mid-recording still leaves usable data behind.
    rec.start(1000);
    startedAt.current = Date.now();
    setRecording(true);
    setElapsedMs(0);

    tickRef.current = setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsedMs(ms);
      if (
        ms >= maxMs &&
        recorderRef.current &&
        recorderRef.current.state === "recording"
      ) {
        try {
          recorderRef.current.stop();
        } catch (ex) {
          /* already stopping */
        }
      }
    }, 200);

    return true;
  }, [isVideo, maxMs, clearTick, releaseStream]);

  /** Stop and resolve with the recorded file, or null if nothing was captured. */
  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return Promise.resolve(null);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      try {
        rec.stop();
      } catch (ex) {
        resolveRef.current = null;
        resolve(null);
      }
    });
  }, []);

  /** Throw the recording away and release the devices. */
  const cancel = useCallback(() => {
    clearTick();
    const rec = recorderRef.current;
    resolveRef.current = null;
    chunksRef.current = [];

    if (rec && rec.state !== "inactive") {
      // Drop the handler first, or onstop still builds a blob and resolves
      // against a promise nobody is waiting on.
      rec.onstop = null;
      try {
        rec.stop();
      } catch (ex) {
        /* already stopped */
      }
    }
    releaseStream();
    setRecording(false);
    setElapsedMs(0);
  }, [clearTick, releaseStream]);

  return {
    recording,
    elapsedMs,
    maxMs,
    error,
    stream,
    start,
    stop,
    cancel,
    setError,
  };
}
