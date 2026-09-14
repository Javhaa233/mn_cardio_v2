import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { colors } from "@/theme/colors";
import { elevation, motion, radius } from "@/theme/tokens";
import { COARSE } from "@/theme.js";
import OpenTabsMenu from "./OpenTabsMenu";
import useTabActions from "./useTabActions";

/**
 * Geometry. Tabs size to their label between TAB_MIN and TAB_MAX, and shrink
 * toward TAB_MIN as more open - the way a browser's strip behaves - before the
 * strip starts to scroll. A fixed width wasted space on "Нүүр" and cut
 * "Хэрэглэгчийн хүсэлтүүд" to "Хэрэглэгчийн...".
 */
const TAB_MIN = 96;
const TAB_MAX = 240;
const TAB_H = 32;
const PINNED_W = 40;
const TAB_GAP = 2;
const ARROW_W = 26;

const tabLabel = (t, tab) =>
  tab.titleOverride ||
  (tab.title.base ? t(tab.title.base) : "") +
    (tab.title.suffix ? " · " + tab.title.suffix : "");

const tabSx = (isActive, pinned, dirty) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: pinned ? "center" : "flex-start",
  gap: "6px",
  flex: pinned ? `0 0 ${PINNED_W}px` : "0 1 auto",
  minWidth: pinned ? PINNED_W : TAB_MIN,
  maxWidth: pinned ? PINNED_W : TAB_MAX,
  height: TAB_H,
  padding: pinned ? 0 : "0 6px 0 10px",
  boxSizing: "border-box",
  position: "relative",
  borderRadius: `${radius.sm} ${radius.sm} 0 0`,
  cursor: "pointer",
  userSelect: "none",
  typography: "body2",
  fontWeight: isActive ? 600 : 400,
  // The active tab is the page you are on: white, framed, with an accent bar,
  // and it breaks the strip's baseline so it reads as joined to the page.
  // Inactive tabs sit on the canvas with no box at all - quiet until pointed at.
  color: isActive ? colors.brand.ink : colors.brand.inkMuted,
  backgroundColor: isActive ? colors.brand.surface : "transparent",
  border: "1px solid",
  borderColor: isActive ? colors.brand.hairline : "transparent",
  borderBottomColor: isActive ? colors.brand.surface : "transparent",
  marginBottom: isActive ? "-1px" : 0,
  transition: `background-color ${motion.fast}, color ${motion.fast}`,
  "&::before": isActive
    ? {
        content: '""',
        position: "absolute",
        left: -1,
        right: -1,
        top: -1,
        height: "2px",
        borderRadius: `${radius.sm} ${radius.sm} 0 0`,
        // A bar, not a word: `cyan` is allowed here (colors.js contrast rule).
        backgroundColor: colors.brand.cyan,
      }
    : undefined,
  "&:hover": isActive
    ? undefined
    : { backgroundColor: colors.brand.tint, color: colors.brand.ink },
  "&:focus": { outline: "none" },
  "&:focus-visible": {
    outline: `2px solid ${colors.brand.focus}`,
    outlineOffset: "-2px",
  },

  "& .TabIcon": {
    fontSize: 16,
    flex: "0 0 auto",
    color: isActive ? colors.brand.cyanInk : "inherit",
  },
  "& .TabLabel": {
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  // Close button: always on the active tab, on hover/focus elsewhere. An
  // unsaved tab shows a dot in the same slot, and hovering swaps it for the X -
  // so the dot is never hidden behind a button, and the width never jumps.
  "& .TabClose": {
    opacity: !dirty && isActive ? 1 : 0,
    transition: `opacity ${motion.fast}`,
  },
  "& .TabDirty": { opacity: 1, transition: `opacity ${motion.fast}` },
  "&:hover .TabClose, &:focus-within .TabClose": { opacity: 1 },
  "&:hover .TabDirty, &:focus-within .TabDirty": { opacity: 0 },
  // No hover on a touch screen: keep the X visible, tuck the dot into the corner.
  [COARSE]: {
    "& .TabClose": { opacity: 1 },
    "& .TabDirty": { opacity: 1, inset: "-4px -4px auto auto" },
  },
});

/**
 * The open-tabs strip, directly under the top bar and visually separated from
 * the page content by its own hairline.
 *
 * Deliberately NOT MUI <Tabs>: its <Tab> renders a <button>, and the close X has
 * to be a button too - a button inside a button is invalid HTML, and the X click
 * would also bubble into a tab change. A plain flex row of role="tab" divs lets
 * the X stopPropagation cleanly.
 *
 * What a doctor can do here, beyond clicking:
 *   - middle-click a tab to close it; right-click for close / close others /
 *     close to the right / close all
 *   - keyboard: arrows move between tabs, Home/End jump, Enter opens, Delete
 *     closes, Shift+F10 opens the menu (roving tabindex - one tab stop)
 *   - the mouse wheel scrolls an overflowing strip sideways
 * The home page is pinned: an icon-only tab with no close.
 *
 * The all-tabs menu lives at the right END OF THIS ROW rather than up in the top
 * bar: it is a tab control, so it belongs with the tabs, and it stays pinned
 * while the tabs themselves scroll under it.
 */
export default function TabStrip({ routeIndex, onSelect, onClose, homePath }) {
  const { t } = useTranslation();
  const items = useSelector((s) => s.tabs.items);
  const activeKey = useSelector((s) => s.tabs.activeKey);
  const { requestCloseMany, confirm } = useTabActions(homePath);

  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({
    overflow: false,
    left: false,
    right: false,
  });
  const [menu, setMenu] = useState(null); // { tab, x, y }

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    const left = overflow && el.scrollLeft > 1;
    const right =
      overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) =>
      prev.overflow === overflow && prev.left === left && prev.right === right
        ? prev
        : { overflow, left, right },
    );
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const frame = window.requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    // Most mice have no horizontal wheel: let the ordinary wheel scroll the
    // strip sideways while the pointer is over it.
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener("scroll", measure);
      el.removeEventListener("wheel", onWheel);
    };
  }, [measure, items.length]);

  // Keep the active tab in view when it changes from elsewhere - a sidebar
  // click, a grid link, browser Back.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !activeKey) return;
    const node = el.querySelector(
      `[data-key="${window.CSS.escape(activeKey)}"]`,
    );
    if (node) node.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeKey]);

  if (!items.length) return null;

  const isPinned = (tab) => !!homePath && tab.pathname === homePath;
  const closable = (tab) => !isPinned(tab);
  const homeTab = items.find(isPinned);
  // Roving tabindex: the strip is ONE tab stop, arrows move inside it.
  const focusKey = items.some((s) => s.key === activeKey)
    ? activeKey
    : items[0].key;

  const scrollBy = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(TAB_MIN, el.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  const focusTab = (index) => {
    const el = scrollerRef.current;
    if (!el) return;
    const nodes = el.querySelectorAll('[role="tab"]');
    const node = nodes[Math.max(0, Math.min(nodes.length - 1, index))];
    if (node) {
      node.focus();
      node.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  const openMenuAt = (tab, x, y) => setMenu({ tab, x, y });

  const onTabKeyDown = (event, tab, index) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        onSelect(tab);
        break;
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(items.length - 1);
        break;
      case "Delete":
        if (closable(tab)) {
          event.preventDefault();
          onClose(tab);
        }
        break;
      case "ContextMenu":
      case "F10":
        if (event.key === "ContextMenu" || event.shiftKey) {
          event.preventDefault();
          const box = event.currentTarget.getBoundingClientRect();
          openMenuAt(tab, box.left + 8, box.bottom);
        }
        break;
      default:
    }
  };

  // Context-menu targets, computed for the tab the menu was opened on.
  const menuTab = menu && items.find((s) => s.key === menu.tab.key);
  const menuIndex = menuTab ? items.indexOf(menuTab) : -1;
  const others = menuTab
    ? items.filter((s) => s.key !== menuTab.key && closable(s))
    : [];
  const toRight =
    menuIndex >= 0 ? items.slice(menuIndex + 1).filter(closable) : [];
  const allClosable = items.filter(closable);
  const run = (action) => {
    setMenu(null);
    action();
  };

  const arrow = (direction, Icon, enabled) => (
    <IconButton
      size="small"
      disabled={!enabled}
      onClick={() => scrollBy(direction)}
      aria-label={direction < 0 ? t("Буцах") : t("Дараах")}
      sx={{
        width: ARROW_W,
        height: TAB_H,
        flex: "0 0 auto",
        alignSelf: "center",
        borderRadius: radius.sm,
        color: colors.brand.inkMuted,
        "&:hover": { backgroundColor: colors.brand.tint },
        "&.Mui-disabled": { opacity: 0.35 },
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
    </IconButton>
  );

  // Fade whichever edge has more tabs beyond it.
  const fade = "16px";
  const mask =
    edges.left || edges.right
      ? `linear-gradient(to right, ${edges.left ? "transparent" : "black"} 0, black ${fade}, black calc(100% - ${fade}), ${edges.right ? "transparent" : "black"} 100%)`
      : "none";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: "4px",
        flex: "0 0 auto",
        marginBottom: "6px",
        minWidth: 0,
        paddingX: "2px",
        // The strip owns a baseline the tabs sit on; the active tab breaks it,
        // which is what visually joins it to the page below.
        borderBottom: `1px solid ${colors.brand.hairline}`,
      }}
    >
      {confirm}
      {edges.overflow ? arrow(-1, ChevronLeftIcon, edges.left) : null}

      <Box
        ref={scrollerRef}
        role="tablist"
        aria-label={t("Нээлттэй цонхнууд")}
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: `${TAB_GAP}px`,
          overflowX: "auto",
          scrollBehavior: "smooth",
          flex: "1 1 auto",
          minWidth: 0,
          // Just enough for the active tab's accent bar (top: -1px); this box
          // scrolls, so anything above its padding would be clipped.
          paddingTop: "2px",
          maskImage: mask,
          WebkitMaskImage: mask,
          // The arrows and the fade are the affordance; a scrollbar under a
          // 32px strip is noise.
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          // A hairline between two neighbouring inactive tabs, so a row of
          // borderless labels still reads as separate tabs.
          '& [role="tab"][aria-selected="false"] + [role="tab"][aria-selected="false"]::after':
            {
              content: '""',
              position: "absolute",
              left: `-${TAB_GAP / 2 + 1}px`,
              top: "9px",
              bottom: "9px",
              width: "1px",
              backgroundColor: colors.brand.hairlineStrong,
            },
        }}
      >
        {items.map((tab, index) => {
          const entry = routeIndex.byKey.get(tab.routeKey);
          const Icon = entry && entry.icon;
          const isActive = tab.key === activeKey;
          const pinned = isPinned(tab);
          const label = tabLabel(t, tab);

          return (
            <Box
              key={tab.key}
              data-key={tab.key}
              role="tab"
              tabIndex={tab.key === focusKey ? 0 : -1}
              aria-selected={isActive}
              aria-label={pinned ? label : undefined}
              title={label}
              onClick={() => onSelect(tab)}
              // Middle button: stop the browser's autoscroll, then close.
              onMouseDown={(event) => {
                if (event.button === 1) event.preventDefault();
              }}
              onAuxClick={(event) => {
                if (event.button === 1 && closable(tab)) {
                  event.preventDefault();
                  onClose(tab);
                }
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                openMenuAt(tab, event.clientX, event.clientY);
              }}
              onKeyDown={(event) => onTabKeyDown(event, tab, index)}
              sx={tabSx(isActive, pinned, tab.dirty)}
            >
              {Icon && typeof Icon !== "string" ? (
                <Icon className="TabIcon" aria-hidden />
              ) : null}
              {pinned ? null : <Box className="TabLabel">{label}</Box>}
              {pinned ? null : (
                <Box
                  sx={{
                    position: "relative",
                    flex: "0 0 auto",
                    width: 20,
                    height: 20,
                  }}
                >
                  {tab.dirty ? (
                    <Box
                      className="TabDirty"
                      role="img"
                      aria-label={t("Хадгалаагүй")}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        margin: "auto",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: colors.brand.cyanInk,
                      }}
                    />
                  ) : null}
                  <IconButton
                    className="TabClose"
                    size="small"
                    // Out of the tab order: the strip is one stop, and Delete
                    // closes the focused tab.
                    tabIndex={-1}
                    aria-label={t("Хаах")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onClose(tab);
                    }}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: 20,
                      height: 20,
                      padding: 0,
                      borderRadius: radius.xs,
                      color: "inherit",
                      "&:hover": {
                        backgroundColor: colors.brand.hairline,
                        color: colors.brand.ink,
                      },
                      "& .MuiSvgIcon-root": { fontSize: 14 },
                    }}
                  >
                    <CloseOutlinedIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {edges.overflow ? arrow(1, ChevronRightIcon, edges.right) : null}

      {/* Pinned: stays put while the tabs scroll under it. */}
      <Box sx={{ flex: "0 0 auto", alignSelf: "center", paddingTop: "2px" }}>
        <OpenTabsMenu
          routeIndex={routeIndex}
          onSelect={onSelect}
          onClose={onClose}
          homePath={homePath}
          size={TAB_H - 4}
        />
      </Box>

      <Menu
        open={!!menuTab}
        onClose={() => setMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={menu ? { top: menu.y, left: menu.x } : undefined}
        slotProps={{
          paper: {
            sx: {
              minWidth: 230,
              borderRadius: radius.sm,
              boxShadow: elevation[3],
              "& .MuiMenuItem-root": { typography: "body2" },
            },
          },
        }}
      >
        <MenuItem
          disabled={!menuTab || !closable(menuTab)}
          onClick={() => run(() => onClose(menuTab))}
        >
          {t("Хаах")}
        </MenuItem>
        <MenuItem
          disabled={others.length === 0}
          onClick={() => run(() => requestCloseMany(others, menuTab.key))}
        >
          {t("Бусад цонхыг хаах")}
        </MenuItem>
        <MenuItem
          disabled={toRight.length === 0}
          onClick={() => run(() => requestCloseMany(toRight, menuTab.key))}
        >
          {t("Баруун талын цонхнуудыг хаах")}
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={allClosable.length === 0}
          onClick={() =>
            run(() =>
              requestCloseMany(allClosable, homeTab ? homeTab.key : null),
            )
          }
        >
          {t("Бүх цонхыг хаах")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
