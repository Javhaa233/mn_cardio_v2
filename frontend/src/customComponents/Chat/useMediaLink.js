import { useCallback, useEffect, useRef, useState } from "react";

import Helper from "helper";

/**
 * A playable URL for one chat attachment.
 *
 * WHY THIS IS NOT BaseDownloadFileBlob. Every other attachment in the app is
 * fetched as a blob and handed to URL.createObjectURL, because auth is
 * header-based and an <img> cannot send a header. For a photo that is fine. For
 * media it is not: a blob must arrive COMPLETE before the first frame plays,
 * cannot be seeked before it has, and sits in memory in full. A ten-minute
 * voice note would download entirely before making a sound, and a video would
 * hold ~35 MB per open bubble.
 *
 * So the server mints a short-lived URL instead and the element streams it with
 * real byte ranges. See backend/helper/MediaTicket.js for why that URL is safe
 * to put in a src attribute.
 *
 * LAZY BY DESIGN. Nothing is requested until `load()` is called, which happens
 * on the first press of play. A room with forty voice notes in its history
 * mints zero tickets while the reader scrolls past them.
 *
 * The returned url is live for an hour. Nothing here refreshes it on a timer -
 * a bubble nobody touched for an hour does not need a fresh ticket, and the
 * player asks again if a stale one ever fails.
 */
export default function useMediaLink(FileId) {
  /*
   * The result carries the id it belongs to, rather than being reset by an
   * effect when FileId changes.
   *
   * An effect that calls setState is a cascading render, and this project's
   * eslint config makes it an error - correctly, because the reset would land a
   * frame LATE: for one render the hook would hand back the previous file's URL
   * under the new id, which in a recycled list row means a bubble briefly
   * offering someone else's recording. Deriving it cannot go stale.
   */
  const [result, setResult] = useState({ forId: null, url: null, meta: null });
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState({ forId: null, message: null });

  const url = result.forId === FileId ? result.url : null;
  const meta = result.forId === FileId ? result.meta : null;
  const error = errorState.forId === FileId ? errorState.message : null;

  // Survives unmount so a late callback cannot setState on a dead component -
  // a real risk here, because the reader can scroll a bubble out of the
  // virtualised list while its ticket request is still in flight.
  const alive = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(
    (force) => {
      if (!FileId) return;
      if (inFlight.current) return;
      if (url && !force) return;

      inFlight.current = true;
      setLoading(true);
      setErrorState({ forId: FileId, message: null });

      Helper.ChatHelper.GetAttachmentLink({ FileId }, (res) => {
        inFlight.current = false;
        if (!alive.current) return;

        setLoading(false);
        if (!res || !res.Success || !res.Data || !res.Data.Url) {
          setErrorState({
            forId: FileId,
            message: (res && res.Message) || "Файл нээх боломжгүй байна",
          });
          return;
        }
        setResult({ forId: FileId, url: res.Data.Url, meta: res.Data });
      });
    },
    [FileId, url],
  );

  /** The ticket expired mid-session, or the file moved. Ask for a fresh one. */
  const refresh = useCallback(() => {
    setResult({ forId: null, url: null, meta: null });
    load(true);
  }, [load]);

  return { url, meta, loading, error, load, refresh };
}
