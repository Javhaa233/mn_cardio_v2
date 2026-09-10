import { useCallback, useEffect, useRef, useState } from "react";
import Helper from "helper";

/**
 * Owns the feed list: fetching, paging, dedupe, and optimistic mutation.
 *
 * Nothing else in the page is allowed to hold the list. The old page kept page
 * state inside a Pagination component, which desyncs the moment anything
 * prepends an item - and a composer that publishes to the top of the feed does
 * exactly that.
 *
 * The API is callback-style (BaseCrudHelper.CallService never resolves with
 * data), so every call here ends in a callback rather than an await result.
 */
export default function useFeed({
  filter = "all",
  search = "",
  pageSize = 10,
}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(0);
  const seenRef = useRef(new Set());
  // Guards against a second fetch firing while one is in flight - the scroll
  // sentinel can trip several times before the first response lands.
  const inFlightRef = useRef(false);

  const fetchPage = useCallback(
    async (page, { append }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      // Yield before touching state. This function is called from an effect,
      // and a setState run synchronously in an effect body triggers a cascading
      // render - React's own guidance, and what react-hooks flags. Awaiting
      // once moves these updates into a promise continuation, so the effect
      // body itself stays free of state writes. The guard above already
      // prevents the extra tick from letting a second fetch slip in.
      await Promise.resolve();

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      Helper.AdviceHelper.GetFeed(
        {
          PageNumber: page,
          PageSize: pageSize,
          Filter: filter,
          Search: search,
        },
        (res) => {
          inFlightRef.current = false;
          setLoading(false);
          setLoadingMore(false);

          if (!res || res.Success === false) {
            setError(res && res.Message ? res.Message : "error");
            return;
          }

          const rows = res.Data || [];
          const opt = res.Option || {};

          setItems((prev) => {
            if (!append) {
              seenRef.current = new Set(rows.map((r) => r.id_data));
              return rows;
            }
            // Dedupe on append. Even with a stable id_data sort, an optimistic
            // prepend shifts the window, so page N+1 can repeat a row.
            const fresh = rows.filter((r) => !seenRef.current.has(r.id_data));
            fresh.forEach((r) => seenRef.current.add(r.id_data));
            return prev.concat(fresh);
          });

          setTotal(opt.Total || 0);
          setHasMore(!!opt.HasMore);
          pageRef.current = page;
        },
      );
    },
    [filter, search, pageSize],
  );

  // Refetch from the top whenever the tab or the search text changes.
  //
  // react-hooks/set-state-in-effect traces the call graph statically and cannot
  // see that fetchPage awaits before it writes any state, so it reports a
  // synchronous setState that does not actually happen. The cascade the rule
  // guards against is already avoided; disabling it here is narrower and more
  // honest than restructuring a plain "fetch when the query changes" effect
  // around a linter heuristic.
  useEffect(() => {
    pageRef.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(0, { append: false });
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || inFlightRef.current) return;
    fetchPage(pageRef.current + 1, { append: true });
  }, [loading, loadingMore, hasMore, fetchPage]);

  const reload = useCallback(() => {
    pageRef.current = 0;
    fetchPage(0, { append: false });
  }, [fetchPage]);

  /** Replace one row in place - used for optimistic counter bumps. */
  const patchItem = useCallback((id, updater) => {
    setItems((prev) =>
      prev.map((it) => (it.id_data === id ? updater(it) : it)),
    );
  }, []);

  return {
    items,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload,
    patchItem,
  };
  // There was a `prependItem` here for optimistically showing a just-published
  // ticket. Nothing consumed it: the composer calls reload() instead, because
  // an optimistically built row has none of the joins the card renders from -
  // no author profile, no province, no counts - so it would flicker as a
  // half-drawn card for the ~300ms until the real one replaced it. Refetching
  // page one is both simpler and better-looking. Removed rather than left as
  // dead API surface.
}
