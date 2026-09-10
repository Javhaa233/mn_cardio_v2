import Helper from "helper";

/**
 * Turns the nested route table into a flat lookup, and defines what makes two
 * open pages "the same tab".
 *
 * Every admin route path is a static string - there is not one `/:param`
 * segment across the six route files - so an exact Map lookup does everything
 * react-router's matcher did here, while letting the host render N pages at once
 * instead of the single match `<Routes>` allows.
 */

/**
 * Flattens the route table, resolving collapse groups (which nest up to three
 * deep) and applying the same role check the layout used to apply per route.
 */
export function buildRouteIndex(routes, layoutPath = "/admin") {
  const byKey = new Map();

  const walk = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((prop) => {
      if (prop.collapse) {
        walk(prop.views);
        return;
      }
      if (prop.layout !== layoutPath) return;
      if (Helper.AuthHelper.CheckRole(prop.roles) !== true) return;

      const key = String(prop.layout + prop.path).toLowerCase();
      // /Profile is declared twice with different roles; the first the current
      // user is allowed to see wins, exactly as the old <Routes> order did.
      if (!byKey.has(key)) byKey.set(key, { key, ...prop });
    });
  };

  walk(routes);
  return { byKey };
}

/** null means unknown path OR role-denied - both render NotFound, as before. */
export function lookupRoute(index, pathname) {
  if (!index || !pathname) return null;
  const key = String(pathname).replace(/\/+$/, "").toLowerCase();
  return index.byKey.get(key) || null;
}

/**
 * Tab identity.
 *
 * Pathname is lowercased because react-router matched case-insensitively, so
 * /admin/PatientInfo and /admin/patientinfo must not become two tabs. Query keys
 * are lowercased and sorted so ?a=1&b=2 and ?b=2&a=1 are one tab, and empty
 * values are dropped.
 *
 * Query VALUES keep their case. Register numbers are uppercased by the pages
 * themselves, and lowercasing one would merge two different patients into a
 * single tab.
 *
 * The result is used only as an identity string - the tab stores the original
 * unmodified url and navigates to that, so the address bar is never rewritten.
 */
export function tabKey(pathname, search) {
  const path = String(pathname || "")
    .replace(/\/+$/, "")
    .toLowerCase();

  const params = new URLSearchParams(search || "");
  const pairs = [];
  params.forEach((value, key) => {
    if (key && value !== "") pairs.push([key.toLowerCase(), value]);
  });
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const query = pairs.map(([k, v]) => k + "=" + v).join("&");
  return query ? path + "?" + query : path;
}

/**
 * The label a tab gets before any page overrides it.
 *
 * Stored raw (the route's source string) and passed through t() at render time,
 * so switching MN/EN relabels every open tab live.
 *
 * When the url carries a query, the first non-empty value is appended - so two
 * patient tabs read "Patient info · AA12345678" and "· BB87654321" with no page
 * changes and no extra fetch. That covers the "which tab is which patient"
 * problem for every route at once.
 */
export function defaultTitle(entry, search) {
  const base = (entry && entry.name) || "";
  const params = new URLSearchParams(search || "");
  let suffix = "";
  params.forEach((value) => {
    if (!suffix && value) suffix = value;
  });
  return { base, suffix };
}
