class BaseHelper {
  getUrlParam = function (url, name) {
    if (!url) url = document.location.href;
    name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results === null ? null : results[1];
  };

  /**
   * getElementById, scoped to the tab the doctor is actually looking at.
   *
   * With pages kept mounted, two tabs open on the same screen means two elements
   * carrying the same hardcoded id. A bare getElementById returns whichever is
   * first in document order - the OLDER, hidden one - so the write lands in an
   * invisible tab and the doctor sees nothing happen.
   *
   * TabPanel stamps `data-tab-active="true"` on the visible panel, so scoping the
   * query to it picks the right one. Falls back to getElementById wherever there
   * is no tab host at all (the patient layout, a standalone dialog).
   */
  GetElementInActiveTab = function (id) {
    if (!id) return null;
    try {
      const scoped = document.querySelector(
        '[data-tab-active="true"] #' + window.CSS.escape(id),
      );
      if (scoped) return scoped;
    } catch (ex) {
      // Malformed id, or no CSS.escape: fall through to the plain lookup.
    }
    return document.getElementById(id);
  };
}

export default new BaseHelper();
