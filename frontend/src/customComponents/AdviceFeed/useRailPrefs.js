import { useCallback, useState } from "react";
import Helper from "helper";

/**
 * Remembers whether each home rail is collapsed, per user.
 *
 * One versioned key holding an object keyed by user id, following the only
 * existing precedent in the app (Chat/ChatList.jsx). One key to clear, and a
 * second doctor logging in on the same shared clinic workstation does not
 * inherit the first one's layout.
 */
const STORAGE_KEY = "HOME_RAILS_V1";

const loadAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (ex) {
    // Private browsing, cleared site data, or a browser set to block storage.
    return {};
  }
};

const currentUserId = () => {
  // GetLogedUserLocal returns null on an expired or cleared session. Falling
  // back keeps the page rendering instead of throwing on the way in.
  const User = Helper.AuthHelper.GetLogedUserLocal();
  return (User && User.Id) || "anon";
};

export default function useRailPrefs() {
  // Lazy initialiser rather than an effect: reading in an effect renders the
  // rails expanded and then snaps them shut, which reads as a glitch on every
  // single page load.
  const [prefs, setPrefs] = useState(() => {
    const saved = loadAll()[currentUserId()] || {};
    // Default is EXPANDED - the content is the point of this page.
    return { rail: saved.rail === true, context: saved.context === true };
  });

  const toggle = useCallback((which) => {
    setPrefs((prev) => {
      const next = { ...prev, [which]: !prev[which] };
      try {
        const all = loadAll();
        all[currentUserId()] = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch (ex) {
        // Quota or blocked storage: degrade to "not remembered", never crash.
      }
      return next;
    });
  }, []);

  return [prefs, toggle];
}
