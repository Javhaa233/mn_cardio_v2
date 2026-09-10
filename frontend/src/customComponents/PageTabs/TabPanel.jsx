import { Suspense, useMemo } from "react";

import BaseLoading from "customComponents/BaseLoading.jsx";
import { TabContext } from "./TabContext";
import TabErrorBoundary from "./TabErrorBoundary";

/**
 * One open page. Rendered for EVERY open tab; only the active one is visible.
 *
 * `display: none` rather than unmounting is the whole feature - it is what keeps
 * a half-filled 200-field surgery form intact while the doctor looks at another
 * patient.
 *
 * Not the `hidden` attribute: its implied UA `display: none` loses to the inline
 * `display: flex` below, so the element would still be visible while telling
 * assistive tech it was not. `inert` + `aria-hidden` + an explicit display is
 * the honest combination, and `inert` also keeps hidden panels out of the
 * keyboard tab order.
 *
 * Suspense sits HERE, per panel, rather than once around the whole content area.
 * A suspending boundary never unmounts its siblings, so opening a heavy new page
 * leaves the previous tab's DOM - and its typed input - completely intact behind
 * the spinner.
 */
/* eslint-disable react-hooks/static-components */
/*
 * The rule above is disabled for this file, deliberately.
 *
 * It sees `routeIndex.byKey.get(...)` producing a component during render and
 * assumes a fresh identity each time. It is not: the route table's `component`
 * entries are module-level constants - React.lazy(...) or a wrapper function
 * declared once - and routeIndex is memoised, so the same reference comes back
 * on every render. That stability is precisely what stops a mounted page from
 * remounting and losing typed input.
 *
 * If anyone ever writes `component={() => <X/>}` inline in a route file, THAT is
 * the bug this rule is really pointing at. Fix it in the route file, not here.
 */
export default function TabPanel({ tab, routeIndex, active, onClose }) {
  const entry = routeIndex.byKey.get(tab.routeKey);
  const Component = entry && entry.component;

  const ctx = useMemo(
    () => ({
      tabKey: tab.key,
      url: tab.url,
      pathname: tab.pathname,
      search: tab.search,
    }),
    [tab.key, tab.url, tab.pathname, tab.search],
  );

  return (
    <TabContext.Provider value={ctx}>
      <div
        role="tabpanel"
        data-tab-key={tab.key}
        // Read by Helper.BaseHelper.GetElementInActiveTab: with two tabs open on
        // the same screen there are two elements carrying the same hardcoded id,
        // and a bare getElementById would return the hidden one.
        data-tab-active={active ? "true" : "false"}
        aria-hidden={!active}
        inert={active ? undefined : ""}
        style={{
          display: active ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <TabErrorBoundary onClose={onClose}>
          <Suspense fallback={<BaseLoading />}>
            {Component ? (
              <Component
                TabKey={tab.key}
                TabHref={tab.url}
                TabSearch={tab.search}
              />
            ) : null}
          </Suspense>
        </TabErrorBoundary>
      </div>
    </TabContext.Provider>
  );
}
