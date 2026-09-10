import customHistory from "customHistory";

/**
 * Turns a real <a href> into in-app navigation.
 *
 * The anchor keeps its href on purpose: hovering still shows the destination,
 * and ctrl/middle-click still opens a real window for the rare case someone
 * genuinely wants one. Only the plain left click is intercepted, so it opens a
 * tab instead of tearing down the session.
 *
 * Usage:  <a href={url} onClick={navClick(url)}>
 */
export default function navClick(href, before) {
  return (event) => {
    // Let the browser handle the gestures that mean "somewhere else, please".
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    if (!href || !String(href).startsWith("/")) return;

    event.preventDefault();
    before && before();
    customHistory.push(href);
  };
}
