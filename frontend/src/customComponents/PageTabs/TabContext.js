import { createContext, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";

import { setTabDirty, setTabTitle } from "store/reducers/system/tabs";

/**
 * What a page can know about the tab it is rendered inside.
 *
 * `url` matters more than it looks. Several pages read
 * `document.location.href` in componentDidMount to pull ?RegisterNo= out of the
 * URL. With every page kept mounted and chunks loading lazily, mount can happen
 * AFTER the doctor has switched tabs - at which point document.location belongs
 * to a different patient. Mount-time reads must use this url; event-time reads
 * can keep using document.location, because only the active tab receives clicks.
 */
export const TabContext = createContext(null);

export function useTabContext() {
  return useContext(TabContext);
}

/**
 * Lets a page name its own tab, overriding the route-derived default.
 */
export function useTabTitle(title) {
  const ctx = useTabContext();
  const dispatch = useDispatch();
  const key = ctx && ctx.tabKey;

  useEffect(() => {
    if (key && title) dispatch(setTabTitle({ key, title }));
  }, [key, title, dispatch]);
}

/**
 * Lets a page report unsaved changes, so closing its tab asks first.
 *
 * FAILS OPEN by design: a page that never calls this closes with no prompt.
 * The alternative - assuming dirty - would prompt on every grid close and train
 * doctors to click through the one dialog that actually matters.
 */
export function useTabDirty(isDirty) {
  const ctx = useTabContext();
  const dispatch = useDispatch();
  const key = ctx && ctx.tabKey;

  useEffect(() => {
    if (!key) return undefined;
    dispatch(setTabDirty({ key, dirty: !!isDirty }));
    return undefined;
  }, [key, isDirty, dispatch]);

  // Clear on unmount so a closed-and-reopened tab never inherits a stale flag.
  useEffect(() => {
    if (!key) return undefined;
    return () => {
      dispatch(setTabDirty({ key, dirty: false }));
    };
  }, [key, dispatch]);
}
