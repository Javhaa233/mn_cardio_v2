import React from "react";
import { css } from "@emotion/css";
import PropTypes from "prop-types";
import { colors } from "@/theme/colors";

/**
 * Below `md`, a section box loses most of its horizontal padding and becomes
 * the horizontal scroll boundary for whatever it contains.
 *
 * TWO PROBLEMS, ONE PLACE
 *
 * 1. PADDING. These panels nest two and three deep on the long registry forms
 *    (`AtrialRhythmNewForm` puts five level-2 panels inside a level-1). Each
 *    level costs 10px of padding per side plus a border, so a field three
 *    levels down starts ~66px in from each edge - on a 360px phone that is a
 *    third of the screen spent on section chrome.
 *
 * 2. SCROLLING. The embedded clinical tables now carry a `minWidth` floor
 *    below `md` (see customFormStyles.js `customTable`) so they keep their real
 *    proportions instead of compressing to nothing. Something has to scroll
 *    them, and it must NOT be the page - a form where the whole page slides
 *    sideways loses the field you were reading. The section box is the right
 *    boundary: it is the nearest ancestor that owns a complete section.
 */
const compactPanel = {
  "@media (max-width: 959.95px)": {
    paddingLeft: "6px",
    paddingRight: "6px",
  },
};

/**
 * The horizontal scroller for wide content, on an INNER element.
 *
 * It must not go on the panel container itself. The section title is
 * `position: absolute` with `translateY(-50%)` so that it straddles the top
 * border - half of it sits OUTSIDE the container's box. Making that container
 * a scroll container clips everything outside it, which lops the top half off
 * every section heading. (Found exactly that way: the headings rendered
 * sliced in half on a phone.)
 *
 * On an inner wrapper the heading is unaffected, and the wide clinical tables
 * inside - which now carry a `minWidth` floor below `md`, see
 * customFormStyles.js - still scroll within their own section instead of
 * dragging the whole page sideways.
 */
const compactScroller = {
  "@media (max-width: 959.95px)": {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
};

const styles = {
  container: {
    position: "relative",
    border: `1px solid ${colors.border.default}`,
    backgroundColor: colors.background.surface,
    borderRadius: "4px",
    "&:after": {
      content: '""',
      display: "table",
      clear: "both",
    },
  },
  header: {
    position: "absolute",
    top: "0",
    transform: "translateY(-50%)",
    backgroundColor: colors.background.surface,
    padding: "0 10px",
    margin: "0",
    fontWeight: "500",
    whiteSpace: "normal",
    zIndex: 1,
  },
  // Level 1 specific
  level1Container: {
    padding: "20px 10px 15px",
    margin: "25px 0 10px",
  },
  level1Header: {
    left: "10px",
    color: colors.text.sectionHeading,
    fontSize: "16px",
    lineHeight: "1.2",
  },
  // Level 2 specific
  level2Container: {
    padding: "22px 10px 15px",
    margin: "20px 0 10px", // Reduced margin from original 38px to fit better inside L1
  },
  level2Header: {
    left: "15px",
    color: colors.text.sectionHeading,
    fontSize: "14px",
    lineHeight: "1.2",
  },
  // Level 3 specific
  level3Container: {
    padding: "20px 10px 15px",
    margin: "15px 0 5px",
    borderStyle: "dashed", // Distinguish level 3
  },
  level3Header: {
    left: "15px",
    color: colors.text.sectionHeading,
    fontSize: "13px",
    lineHeight: "1.2",
  },

  // A collapsed panel keeps its title, which sits ON the top border, so it
  // cannot collapse to zero height without the title overlapping whatever
  // follows.
  collapsed: {
    minHeight: "18px",
    paddingTop: "18px",
    paddingBottom: "0",
  },

  toggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    font: "inherit",
    color: "inherit",
    cursor: "pointer",
    textAlign: "left",
    // 44px would push the title off its border line, so the hit area is grown
    // downward with padding rather than by setting a height.
    "@media (pointer: coarse)": { padding: "6px 0" },
  },

  caret: (open) => ({
    display: "inline-block",
    transition: "transform 120ms ease",
    transform: open ? "rotate(90deg)" : "rotate(0deg)",
    fontSize: "0.9em",
  }),
};

const GroupPanel = ({
  title,
  children,
  level = 1,
  className = "",
  headerClassName = "",
  // Opt-in, and OFF by default on purpose. 35 files render GroupPanels today
  // and none of them expect a section to be closable; turning it on globally
  // would change every existing form at once. The long registry forms pass it
  // explicitly.
  collapsible = false,
  defaultOpen = true,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  let containerStyle = css(styles.container);
  let headerStyle = css(styles.header);

  if (level === 1) {
    containerStyle = css(
      styles.container,
      styles.level1Container,
      compactPanel,
    );
    headerStyle = css(styles.header, styles.level1Header);
  } else if (level === 2) {
    containerStyle = css(
      styles.container,
      styles.level2Container,
      compactPanel,
    );
    headerStyle = css(styles.header, styles.level2Header);
  } else if (level >= 3) {
    containerStyle = css(
      styles.container,
      styles.level3Container,
      compactPanel,
    );
    headerStyle = css(styles.header, styles.level3Header);
  }

  // Sections nest, so the heading rank has to follow `level` or a screen
  // reader hears one flat list of h4s. Font size, weight, colour and margin
  // are all pinned by `styles.header`, so the rendered appearance is
  // unchanged - this is a semantics-only change.
  // 1 -> h2, 2 -> h3, 3 -> h4, 4 -> h5, 5+ -> h6.
  const HeadingTag = `h${Math.min(6, Math.max(2, level + 1))}`;

  const collapsedContainer = collapsible && !open ? css(styles.collapsed) : "";

  return (
    <div className={`${containerStyle} ${collapsedContainer} ${className}`}>
      {title && (
        <HeadingTag className={`${headerStyle} ${headerClassName}`}>
          {collapsible ? (
            // A real <button> inside the heading, not a click handler on the
            // heading itself: the section has to be reachable and toggleable
            // from the keyboard, which the forms spec requires anyway.
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={css(styles.toggle)}
            >
              <span aria-hidden="true" className={css(styles.caret(open))}>
                &#9656;
              </span>
              {title}
            </button>
          ) : (
            title
          )}
        </HeadingTag>
      )}
      {(!collapsible || open) && (
        <div className={css(compactScroller)}>{children}</div>
      )}
    </div>
  );
};

GroupPanel.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  level: PropTypes.number,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  collapsible: PropTypes.bool,
  defaultOpen: PropTypes.bool,
};

export default GroupPanel;
