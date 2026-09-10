import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import NotFound from "view/NotFound.jsx";
import { setAlert } from "store/reducers/system";
import { openTab } from "store/reducers/system/tabs";

import TabPanel from "./TabPanel";
import TabStrip from "./TabStrip";
import useTabActions from "./useTabActions";
import {
  buildRouteIndex,
  defaultTitle,
  lookupRoute,
  tabKey,
} from "./routeIndex";

/**
 * The tab host. Replaces the layout's <Routes>.
 *
 * <Routes> only ever did URL -> component matching, and it renders exactly one
 * match. Since every admin route path is a static string - there is not one
 * `/:param` segment across the six route files - a flat Map does the same
 * matching while letting us render every open page at once and hide all but the
 * active one. That is what makes unsaved form input survive navigation.
 *
 * The location stays the single source of truth for WHICH tab is active; Redux
 * only records which tabs exist. Exactly one effect writes activation, so the
 * address bar, the sidebar highlight and the strip can never disagree - and
 * browser Back/Forward work with no extra code: Back to an open tab's url
 * re-activates it without unmounting, Back to a closed one recreates it, which
 * is a correct undo.
 */

// Past this the sticky strip gets unwieldy and mounted pages start to add up.
// A warning, not a cap - the doctor decides.
const SOFT_LIMIT = 12;

export default function PageTabs({
  routes,
  layoutPath = "/admin",
  homePath,
  scrollRef,
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((s) => s.tabs.items);
  const activeKey = useSelector((s) => s.tabs.activeKey);

  const { requestClose, confirm } = useTabActions(homePath);
  const warned = useRef(false);

  // CheckRole reads localStorage, which does not change mid-session, so keying
  // this on `routes` alone is safe today. Revisit if roles become dynamic.
  const routeIndex = useMemo(
    () => buildRouteIndex(routes, layoutPath),
    [routes, layoutPath],
  );

  const entry = lookupRoute(routeIndex, location.pathname);
  const key = tabKey(location.pathname, location.search);
  const isLayoutRoot =
    location.pathname === layoutPath || location.pathname === layoutPath + "/";

  // THE only writer of activeKey: a location change opens the tab, or focuses
  // the one already holding that url.
  useEffect(() => {
    if (!entry) return;
    dispatch(
      openTab({
        key,
        url: location.pathname + location.search,
        pathname: location.pathname,
        search: location.search,
        routeKey: entry.key,
        title: defaultTitle(entry, location.search),
      }),
    );
  }, [key, entry, location.pathname, location.search, dispatch]);

  // Per-tab scroll position. All panels share one scrolling ancestor, so without
  // this every tab switch would inherit the previous tab's scroll - land
  // halfway down a long form because the grid you just left was scrolled there.
  //
  // Recorded on scroll rather than at switch time: by the time an activation
  // effect runs the panels have already swapped, the content height has changed,
  // and the browser may have clamped scrollTop to the new height.
  const scrollPos = useRef({});

  useEffect(() => {
    const el = scrollRef && scrollRef.current;
    if (!el || !activeKey) return undefined;
    const onScroll = () => {
      scrollPos.current[activeKey] = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeKey, scrollRef]);

  // Layout effect, so the restore happens before paint and the reader never
  // sees the page flash at the wrong offset.
  useLayoutEffect(() => {
    const el = scrollRef && scrollRef.current;
    if (!el || !activeKey) return;
    // The immutability rule traces `el` back to a prop and calls this a prop
    // mutation. It is not: `el` is a DOM node, and assigning scrollTop is the
    // only way to scroll one. The ref itself is never reassigned.
    // eslint-disable-next-line react-hooks/immutability
    el.scrollTop = scrollPos.current[activeKey] || 0;
  }, [activeKey, scrollRef]);

  // Forget positions for tabs that no longer exist, so the map cannot grow
  // unbounded across a long shift.
  useEffect(() => {
    const live = new Set(items.map((s) => s.key));
    Object.keys(scrollPos.current).forEach((k) => {
      if (!live.has(k)) delete scrollPos.current[k];
    });
  }, [items]);

  // Grids and charts that measured themselves while hidden come back 0px wide.
  // One synthetic resize on activation heads off a whole family of those.
  useEffect(() => {
    if (!activeKey) return undefined;
    const id = window.requestAnimationFrame(() =>
      window.dispatchEvent(new window.Event("resize")),
    );
    return () => window.cancelAnimationFrame(id);
  }, [activeKey]);

  useEffect(() => {
    if (items.length > SOFT_LIMIT && !warned.current) {
      warned.current = true;
      dispatch(
        setAlert({
          type: "warning",
          message: t("Хэт олон цонх нээлттэй байна. Ашиглахгүйг нь хаана уу."),
        }),
      );
    }
    if (items.length <= SOFT_LIMIT) warned.current = false;
  }, [items.length, dispatch, t]);

  if (isLayoutRoot) return <Navigate to={homePath} replace />;

  return (
    <>
      {confirm}
      <TabStrip
        routeIndex={routeIndex}
        homePath={homePath}
        onSelect={(tab) => navigate(tab.url)}
        onClose={requestClose}
      />
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {items.map((tab) => (
          <TabPanel
            key={tab.key}
            tab={tab}
            routeIndex={routeIndex}
            active={!!entry && tab.key === activeKey}
            onClose={() => requestClose(tab)}
          />
        ))}
        {/* Unknown or role-denied url: no tab is created, so a typo cannot
            litter the strip, and the doctor can click straight back into work. */}
        {!entry ? <NotFound HomePath={layoutPath} /> : null}
      </div>
    </>
  );
}
