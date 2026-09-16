import { useSyncExternalStore } from "react";

import Helper from "helper";

/**
 * How many doctor sign-up requests are waiting for a decision.
 *
 * The approvals screen answers that only once you are already on it, which is
 * exactly the failure this store exists to fix: nothing told an administrator
 * that requests were piling up. The sidebar subscribes and shows the number on
 * the menu item.
 *
 * A module store rather than a React context: the sidebar is mounted by two
 * layouts (Admin and Patient), and a context would need a provider in both for
 * a single integer.
 *
 * Deliberately NOT polled. It refreshes when a subscriber first appears, when
 * the tab is brought back to the front, and when the approvals screen has just
 * told it a fresher number - the list page already knows the count from its own
 * request, so an admin sitting on that screen costs no extra traffic at all.
 */

const THROTTLE_MS = 60 * 1000;
const ADMIN_ROLES = [1];

let Count = null; // null = not known yet; the sidebar shows nothing
let LastFetch = 0;
let Fetching = false;
const Listeners = new Set();

function Emit() {
  Listeners.forEach((Listener) => Listener());
}

function IsAdmin() {
  try {
    return Helper.AuthHelper.CheckRole(ADMIN_ROLES) === true;
  } catch {
    return false;
  }
}

/** The approvals list already paid for this number - take it for free. */
function SetCount(Value) {
  const Next = Number(Value);
  if (!Number.isFinite(Next)) return;
  LastFetch = Date.now();
  if (Next === Count) return;
  Count = Next;
  Emit();
}

function Refresh({ force = false } = {}) {
  if (!IsAdmin()) return;
  if (Fetching) return;
  if (!force && Date.now() - LastFetch < THROTTLE_MS) return;

  Fetching = true;
  Helper.BaseCrudHelper.CallService(
    "/UserRequest/PendingCount",
    {},
    (resData) => {
      Fetching = false;
      // A failed call leaves the previous value alone. A wrong badge is worse
      // than no badge, and "0" is a claim, not a gap.
      if (!resData || resData.Success === false || !resData.Data) return;
      SetCount(resData.Data.Pending);
    },
  );
}

function Subscribe(Listener) {
  Listeners.add(Listener);
  if (Listeners.size === 1) {
    Refresh();
    window.addEventListener("focus", OnFocus);
    document.addEventListener("visibilitychange", OnFocus);
  }
  return () => {
    Listeners.delete(Listener);
    if (Listeners.size === 0) {
      window.removeEventListener("focus", OnFocus);
      document.removeEventListener("visibilitychange", OnFocus);
    }
  };
}

function OnFocus() {
  if (document.visibilityState === "hidden") return;
  Refresh();
}

const GetSnapshot = () => Count;

/** Subscribe from a component. Returns null until a count is known. */
export function usePendingRequests() {
  return useSyncExternalStore(Subscribe, GetSnapshot, GetSnapshot);
}

export default { Set: SetCount, Refresh, GetSnapshot };
