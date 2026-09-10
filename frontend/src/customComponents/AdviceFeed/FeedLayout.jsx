import React from "react";
import Box from "@mui/material/Box";
import { layout, space } from "@/theme/tokens";
import { colors } from "@/theme/colors";

/**
 * The page grid, and nothing else. No domain knowledge lives here.
 *
 * CSS Grid rather than the app's GridContainer/GridItem: that pair works by
 * negative margins on a wrapper, which fights full-bleed media inside a card,
 * and it has no equivalent of `minmax(0, 1fr)`. That minmax is the only
 * reliable way to stop a wide photo from blowing out its track - a plain `1fr`
 * is min-content-sized and a 3000px image will simply widen the column.
 *
 * Track plan:
 *   xs/sm  single column; the rail's numbers move above the feed, its charts
 *          collapse. The stats never disappear entirely on a phone.
 *   md     feed + 300px rail
 *   lg     feed + 340px rail
 *   xl     260px context rail + feed + 380px rail
 *
 * The page is full width at every step. What is capped is the post body's line
 * length (`layout.feedMax`), because a 1900px line of Mongolian clinical text
 * is not readable. Using the width is not the same as stretching the text.
 *
 * Either rail can be collapsed by the reader, which narrows that track to
 * `layout.railCollapsed` (44px). The feed does NOT get wider when that happens -
 * `feedMax` still caps it and the leftover becomes margin - because the line
 * length above is a deliberate choice, not a consequence of the rails.
 */
export default function FeedLayout({
  children,
  rail,
  context,
  mobileStats,
  railCollapsed = false,
  contextCollapsed = false,
}) {
  const railW = (w) => (railCollapsed ? layout.railCollapsed : w);
  const ctxW = contextCollapsed ? layout.railCollapsed : layout.contextXl;

  return (
    <Box
      sx={{
        display: "grid",
        alignItems: "start",
        gap: { xs: space[3], sm: space[4], lg: space[5] },
        px: { xs: space[2], sm: space[4], lg: space[5] },
        pt: { xs: space[3], sm: space[4] },
        pb: space[10],
        width: "100%",
        boxSizing: "border-box",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: `minmax(0, 1fr) ${railW(layout.railMd)}`,
          lg: `minmax(0, 1fr) ${railW(layout.railLg)}`,
          xl: `${ctxW} minmax(0, 1fr) ${railW(layout.railXl)}`,
        },
      }}
    >
      {/* Context rail: xl only. Ordered first so tab order matches reading
          order on wide screens without any positional trickery. */}
      <Box
        sx={{
          display: { xs: "none", xl: "block" },
          position: "sticky",
          top: space[2],
          alignSelf: "start",
          // Same reason as the right rail below.
          maxHeight: `calc(100vh - ${space[4]})`,
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
        }}
      >
        {context}
      </Box>

      {/* Stats strip, phones only - the rail's numbers without its charts. */}
      <Box sx={{ display: { xs: "block", md: "none" }, minWidth: 0 }}>
        {mobileStats}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          // The cap is on line length, not on the page. Centring it inside its
          // own track keeps the leftover width as balanced margin instead of a
          // single odd gap against the rail.
          maxWidth: layout.feedMax,
          mx: "auto",
        }}
      >
        {children}
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          // Sticky resolves against MainPanel, the nearest scrolling ancestor.
          // PageTabs now wraps each page in a flex/minHeight:0 TabPanel in
          // between, which does not scroll and so does not capture this - but
          // it is why the chain is longer than it looks. Verified after the tab
          // system landed.
          position: "sticky",
          top: space[2],
          alignSelf: "start",
          minWidth: 0,
          // A sticky element taller than the viewport pins its TOP and leaves
          // its tail permanently below the fold - the page scrolls, the rail
          // does not, and the last panel is simply unreachable. Capping it at
          // the viewport and letting it scroll internally is what makes "add a
          // panel to the rail" a safe operation at all.
          //
          // This is not the calc(100vh - Npx) that PageContainer warns about.
          // That anti-pattern subtracts guessed chrome heights; this subtracts
          // only its own `top` offset, twice, so it stays correct whatever the
          // header does.
          maxHeight: `calc(100vh - ${space[4]})`,
          overflowY: "auto",
          overscrollBehavior: "contain",
          // Keep the scrollbar out of the way until it is wanted.
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.brand.hairlineStrong,
            borderRadius: "3px",
          },
        }}
      >
        {rail}
      </Box>
    </Box>
  );
}
