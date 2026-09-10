import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { colors } from "@/theme/colors";
import OpenTabsMenu from "./OpenTabsMenu";

/**
 * Geometry. Uniform by construction: every tab is exactly this wide whether its
 * label is "Home" or "Patient info · AA12345678", so the row never looks ragged.
 */
const TAB_W = 148;
const TAB_H = 30;
const TAB_GAP = 3;
const ARROW_W = 24;

/**
 * The open-tabs strip, directly under the top bar and visually separated from
 * the page content by its own hairline.
 *
 * Deliberately NOT MUI <Tabs>: its <Tab> renders a <button>, and the close X has
 * to be a button too - a button inside a button is invalid HTML, and the X click
 * would also bubble into a tab change. A plain flex row of role="tab" divs lets
 * the X stopPropagation cleanly.
 *
 * The all-tabs menu lives at the right END OF THIS ROW rather than up in the top
 * bar: it is a tab control, so it belongs with the tabs, and it stays pinned
 * while the tabs themselves scroll under it.
 */
export default function TabStrip({ routeIndex, onSelect, onClose, homePath }) {
  const { t } = useTranslation();
  const items = useSelector((s) => s.tabs.items);
  const activeKey = useSelector((s) => s.tabs.activeKey);

  const scrollerRef = useRef(null);
  const [overflow, setOverflow] = useState(false);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setOverflow(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
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

  const scrollBy = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = TAB_W + TAB_GAP;
    // Always land on a tab boundary rather than mid-tab.
    const pages = Math.max(1, Math.floor(el.clientWidth / step));
    el.scrollBy({ left: direction * pages * step, behavior: "smooth" });
  };

  if (!items.length) return null;

  const arrow = (direction, Icon) => (
    <IconButton
      size="small"
      onClick={() => scrollBy(direction)}
      aria-label={direction < 0 ? t("Буцах") : t("Дараах")}
      sx={{
        width: ARROW_W,
        height: TAB_H,
        flex: "0 0 auto",
        borderRadius: "6px",
        color: colors.brand.inkMuted,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
    </IconButton>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: `${TAB_GAP}px`,
        flex: "0 0 auto",
        mb: "6px",
        minWidth: 0,
        px: "2px",
        // The strip owns a baseline the tabs sit on; the active tab breaks it,
        // which is what visually joins it to the page below.
        borderBottom: `1px solid ${colors.brand.hairline}`,
      }}
    >
      {overflow ? arrow(-1, ChevronLeftIcon) : null}

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
          // The arrows are the affordance; a scrollbar under a 30px strip is
          // noise.
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((tab) => {
          const entry = routeIndex.byKey.get(tab.routeKey);
          const Icon = entry && entry.icon;
          const isActive = tab.key === activeKey;
          const label =
            tab.titleOverride ||
            (tab.title.base ? t(tab.title.base) : "") +
              (tab.title.suffix ? " · " + tab.title.suffix : "");

          return (
            <Box
              key={tab.key}
              data-key={tab.key}
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              title={label}
              onClick={() => onSelect(tab)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(tab);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flex: `0 0 ${TAB_W}px`,
                width: TAB_W,
                height: TAB_H,
                px: "7px",
                boxSizing: "border-box",
                position: "relative",
                borderRadius: "7px 7px 0 0",
                cursor: "pointer",
                fontSize: "12.5px",
                // The active tab is the page you are on: it is white, it carries
                // an accent bar, and it breaks the strip's baseline so it reads
                // as continuous with the content below. Everything else recedes.
                //
                // The inactive fill is a BRAND tint, not a neutral grey. The
                // canvas behind this strip is `brand.canvas` (#eaf2f8), a cool
                // pale blue; the old #e9ecef was a warm neutral, and a warm grey
                // on a cool ground is what made an unfocused tab look dirty
                // rather than merely quiet. `tint` over that canvas lands near
                // #daeaf4 - the same hue as everything around it, one step down
                // in lightness, so the tab recedes by VALUE instead of by going
                // muddy.
                backgroundColor: isActive
                  ? colors.background.primary
                  : colors.brand.tint,
                color: isActive ? colors.button.primary : colors.brand.inkMuted,
                fontWeight: isActive ? 600 : 400,
                border: `1px solid ${colors.brand.hairline}`,
                borderBottom: isActive
                  ? `1px solid ${colors.background.primary}`
                  : `1px solid ${colors.brand.hairline}`,
                mb: isActive ? "-1px" : 0,
                "&::before": isActive
                  ? {
                      content: '""',
                      position: "absolute",
                      left: -1,
                      right: -1,
                      top: -1,
                      height: "2px",
                      borderRadius: "7px 7px 0 0",
                      backgroundColor: colors.button.primary,
                    }
                  : undefined,
                // Hover LIFTS an inactive tab toward the active look - white
                // fill, ink text - which is the behaviour every browser tab
                // strip has trained people to expect. It cannot be mistaken for
                // the active tab: that one also carries the accent bar, the blue
                // 600-weight label and the broken baseline.
                "&:hover": {
                  backgroundColor: colors.background.primary,
                  color: isActive ? colors.button.primary : colors.brand.ink,
                },
                "&:focus": { outline: "none" },
                "&:focus-visible": {
                  outline: `2px solid ${colors.button.primary}`,
                  outlineOffset: "-2px",
                },
              }}
            >
              {Icon && typeof Icon !== "string" ? (
                <Icon
                  sx={{ fontSize: 15, flex: "0 0 auto", color: "inherit" }}
                />
              ) : null}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Box>
              {tab.dirty ? (
                <Box
                  aria-label={t("Хадгалаагүй")}
                  sx={{
                    flex: "0 0 auto",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: colors.button.primary,
                  }}
                />
              ) : null}
              <IconButton
                size="small"
                aria-label={t("Хаах")}
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(tab);
                }}
                sx={{
                  flex: "0 0 auto",
                  width: 16,
                  height: 16,
                  color: "inherit",
                  "& .MuiSvgIcon-root": { fontSize: 13 },
                }}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      {overflow ? arrow(1, ChevronRightIcon) : null}

      {/* Pinned: stays put while the tabs scroll under it. */}
      <Box sx={{ flex: "0 0 auto", pb: "1px" }}>
        <OpenTabsMenu
          routeIndex={routeIndex}
          onSelect={onSelect}
          onClose={onClose}
          homePath={homePath}
          size={TAB_H}
        />
      </Box>
    </Box>
  );
}
