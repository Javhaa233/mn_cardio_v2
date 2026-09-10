import { createSlice } from "@reduxjs/toolkit";

/**
 * Which pages the doctor has open, and which one is showing.
 *
 * The URL is the single source of truth for WHICH tab is active - this slice
 * only records which tabs EXIST. Exactly one effect (in BasePageTab) writes
 * activation, driven by the router's location, so the address bar and the strip
 * can never disagree.
 *
 * Deliberately NOT persisted. F5 rebuilds the list from the URL alone, which is
 * the "clean single tab on reload" behaviour, for free.
 *
 * This replaces an older `system.tabs` that held eight fixed nullable slots
 * keyed tab0..tab7 and identified a tab by pathname alone - so two patients
 * opened from the same route collided, and a ninth tab was silently dropped.
 * Nothing consumed it.
 */

const initialState = {
  // items[i] = { key, url, pathname, search, routeKey, title, titleOverride,
  //              dirty, openedAt, lastActiveAt }
  items: [],
  activeKey: null,
};

/**
 * Which tab takes over when the one at `closedIndex` goes away: the right
 * neighbour, else the left, else nothing.
 *
 * Exported so the component that dispatches closeTab computes the SAME
 * neighbour it navigates to. If the reducer and the navigation each worked it
 * out separately they could disagree for a render.
 */
export function nextActiveKey(items, closedIndex) {
  const remaining = items.filter((_, i) => i !== closedIndex);
  if (remaining.length === 0) return null;
  const next = remaining[closedIndex] || remaining[remaining.length - 1];
  return next ? next.key : null;
}

const slice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    openTab: (state, { payload }) => {
      const existing = state.items.find((tab) => tab.key === payload.key);
      if (existing) {
        // Opening something already open FOCUSES it. Never a duplicate, and
        // never a remount - that is what keeps half-typed forms alive.
        existing.lastActiveAt = Date.now();
      } else {
        state.items.push({
          ...payload,
          titleOverride: null,
          dirty: false,
          openedAt: Date.now(),
          lastActiveAt: Date.now(),
        });
      }
      state.activeKey = payload.key;
    },

    activateTab: (state, { payload }) => {
      const tab = state.items.find((s) => s.key === payload);
      if (!tab) return;
      tab.lastActiveAt = Date.now();
      state.activeKey = payload;
    },

    closeTab: (state, { payload }) => {
      const index = state.items.findIndex((tab) => tab.key === payload);
      if (index === -1) return;
      const wasActive = state.activeKey === payload;
      const successor = nextActiveKey(state.items, index);
      state.items.splice(index, 1);
      if (wasActive) state.activeKey = successor;
    },

    closeAllTabs: (state) => {
      state.items = [];
      state.activeKey = null;
    },

    setTabTitle: (state, { payload }) => {
      const tab = state.items.find((s) => s.key === payload.key);
      if (tab) tab.titleOverride = payload.title;
    },

    setTabDirty: (state, { payload }) => {
      const tab = state.items.find((s) => s.key === payload.key);
      if (tab) tab.dirty = !!payload.dirty;
    },
  },
});

export const {
  openTab,
  activateTab,
  closeTab,
  closeAllTabs,
  setTabTitle,
  setTabDirty,
} = slice.actions;

export default slice.reducer;
