import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Helper from "helper";

/**
 * Owns the rehabilitation content list for the admin page.
 *
 * `/api/RehabContent/GetList` returns every exercise with its movements, count,
 * length and which movement carries the cover photo, so the gallery renders from
 * one read rather than a request per tile.
 *
 * The API layer is callback-style (`CallService` never resolves with data), so
 * everything here ends in a callback - the same shape `AdviceFeed/useFeed.js`
 * uses.
 */
export function useRehabContent(includeInactive = false) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /** Хариуг төлөвт буулгах — зөвхөн дуудлагын callback дотроос. */
  const apply = useCallback((res) => {
    if (!alive.current) return;
    setLoading(false);
    if (res && res.Success) {
      setItems(res.Data || []);
      setCategories((res.Option && res.Option.Categories) || []);
      setError(null);
    } else {
      setError((res && res.Message) || "Уншиж чадсангүй");
    }
  }, []);

  const load = useCallback(
    (quiet = false) => {
      if (!quiet) setLoading(true);
      Helper.BaseCrudHelper.CallService(
        "/RehabContent/GetList",
        { IncludeInactive: includeInactive },
        apply,
      );
    },
    [apply, includeInactive],
  );

  // Анхны уншилт. Төлөв нь зөвхөн `apply`-д, өөрөөр хэлбэл хариу ирэхэд
  // солигдоно — effect-ийн биед setState дуудахгүй.
  useEffect(() => {
    Helper.BaseCrudHelper.CallService(
      "/RehabContent/GetList",
      { IncludeInactive: includeInactive },
      apply,
    );
  }, [apply, includeInactive]);

  /**
   * Write a new order. The list is moved locally first so the card does not
   * jump back under the cursor, then re-read so the server stays the truth.
   */
  const reorder = useCallback(
    (ObjectName, Ids, onDone) => {
      Helper.BaseCrudHelper.CallService(
        "/RehabContent/Reorder",
        { ObjectName, Ids },
        (res) => {
          if (!alive.current) return;
          if (!res || !res.Success) {
            setError((res && res.Message) || "Дарааллыг хадгалж чадсангүй");
          }
          load(true);
          if (onDone) onDone(res);
        },
      );
    },
    [load],
  );

  return {
    items,
    categories,
    loading,
    error,
    setError,
    reload: load,
    reorder,
    setItems,
  };
}

/**
 * One `/RehabContent/*` call as a promise that always resolves with the
 * envelope (never rejects), so a handler can `await` it and read `.Success`.
 */
export function rehabCall(route, body) {
  return new Promise((resolve) => {
    Helper.BaseCrudHelper.CallService(
      `/RehabContent/${route}`,
      body || {},
      (res) =>
        resolve(
          res || { Success: false, Message: "Сервертэй холбогдож чадсангүй" },
        ),
    );
  });
}

/**
 * A short-lived URL for one movement's photo or clip.
 *
 * A browser `<img>`/`<video>` cannot send the auth header, so the server mints a
 * ticket scoped to one file and one user (`/api/Media/t/<ticket>`, one hour).
 * Results are cached per movement+kind for the life of the page; an expired
 * ticket simply fails to load and a reload mints a new one.
 */
const linkCache = new Map();
const inFlight = new Set();
const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function publish(key, url) {
  linkCache.set(key, url);
  listeners.forEach((cb) => cb());
}

export function useMediaLink(movementId, kind = "thumb", enabled = true) {
  const key = `${movementId}:${kind}`;
  // Гаднын сан (linkCache) руу бичих нь effect дотор setState биш — компонент
  // зөвхөн уншиж, өөрчлөгдөхөд дахин зурагдана.
  const url = useSyncExternalStore(subscribe, () =>
    linkCache.has(key) ? linkCache.get(key) : null,
  );

  useEffect(() => {
    if (!enabled || !movementId) return;
    if (linkCache.has(key) || inFlight.has(key)) return;
    inFlight.add(key);
    Helper.BaseCrudHelper.CallService(
      "/RehabContent/GetMediaLink",
      { MovementId: movementId, Kind: kind },
      (res) => {
        inFlight.delete(key);
        publish(key, res && res.Success && res.Data ? res.Data.Url : null);
      },
    );
  }, [key, movementId, kind, enabled]);

  return url;
}

/** Forget cached links for a movement after its clip or photo was replaced. */
export function forgetMediaLinks(movementId) {
  linkCache.delete(`${movementId}:thumb`);
  linkCache.delete(`${movementId}:video`);
}
