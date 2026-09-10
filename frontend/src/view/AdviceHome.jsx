import React, { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme/colors";
import { space, radius, elevation } from "@/theme/tokens";

import FeedLayout from "customComponents/AdviceFeed/FeedLayout";
import FilterBar from "customComponents/AdviceFeed/FilterBar";
import FeedCard from "customComponents/AdviceFeed/FeedCard";
import FeedSkeleton from "customComponents/AdviceFeed/FeedSkeleton";
import PostComposer from "customComponents/AdviceFeed/PostComposer";
import RailColumn from "customComponents/AdviceFeed/RailColumn";
import useRailPrefs from "customComponents/AdviceFeed/useRailPrefs";
import useFeed from "customComponents/AdviceFeed/useFeed";
import AnalyticsRail from "customComponents/AdviceFeed/AnalyticsRail";

import HomeWorkToday from "customComponents/Home/HomeWorkToday";
import HomeNotifications from "customComponents/Home/HomeNotifications";
import HomeMonitoringPatients from "customComponents/Home/HomeMonitoringPatients";
import HomeQuickActions from "customComponents/Home/HomeQuickActions";

/**
 * The doctor's home screen: a full-width feed of тасалбар, with rails carrying
 * the rest of the doctor's day.
 *
 * This page owns almost nothing. It holds the current tab and search text,
 * hands them to useFeed, and arranges the pieces.
 *
 * WHY THE RAILS LOOK LIKE THIS. They used to be one AnalyticsRail: four stacked
 * panels of ticket totals, a ticket trend chart, and two ticket bar charts, all
 * from one GetStats call - the same dataset four ways. Opening the app therefore
 * told a doctor how many тасалбар exist and nothing about their own day. The
 * rails now carry today's work, the patients under their monitoring, unread
 * notifications, and the six screens they open daily.
 *
 * Statistics are back, but as ONE panel and in last place - the four-ways
 * version was the thing worth deleting, not the numbers themselves. A doctor
 * who wants to know whether the ticket load is rising has nowhere else to look,
 * and the panel shares the feed's own visibility scope so the two agree.
 *
 * The working panels stay at the top and the rail stays short: quick actions
 * moves to the left column at xl, and the monitoring list only appears at lg and
 * up, because at 300px its name-plus-register-number rows wrap and it costs five
 * extra server-side queries. Past roughly a viewport's height a sticky rail
 * stops behaving like one, so anything added here should displace something.
 */
function AdviceHome() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [railPrefs, toggleRail] = useRailPrefs();
  const sentinelRef = useRef(null);
  const composerRef = useRef(null);

  const {
    items,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload,
    patchItem,
  } = useFeed({ filter, search, pageSize: 10 });

  // Infinite scroll. rootMargin starts the next page well before the reader
  // reaches the bottom, so the feed rarely shows its own loading state.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: null, rootMargin: "600px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore]);

  const focusComposer = useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const btn = el.querySelector("button");
    if (btn) btn.focus();
  }, []);

  const emptyState = (
    <Box
      sx={{
        textAlign: "center",
        py: space[12],
        px: space[4],
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
      }}
    >
      <ForumOutlinedIcon
        sx={{ fontSize: 44, color: colors.brand.hairlineStrong }}
      />
      <Typography variant="h3" sx={{ mt: space[3], color: colors.brand.ink }}>
        {/* Filtered-to-empty is a different situation from nothing-exists, and
            saying so is the difference between "try another filter" and
            "write the first one". */}
        {search || filter !== "all"
          ? t("Шүүлтэд тохирох тасалбар олдсонгүй")
          : t("Тасалбар байхгүй байна")}
      </Typography>
      <Box sx={{ mt: space[4] }}>
        {search || filter !== "all" ? (
          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
          >
            {t("Шүүлт цэвэрлэх")}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={focusComposer}
            sx={{
              backgroundColor: colors.brand.cyanInk,
              "&:hover": { backgroundColor: colors.brand.ink },
            }}
          >
            {t("Эхний тасалбараа нийтлэх")}
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        // No background of its own: the canvas is declared once, on the shell's
        // Content. No maxWidth either - the page is full width now.
        color: colors.brand.ink,
        width: "100%",
        minWidth: 0,
        flex: "1 1 auto",
      }}
    >
      <FeedLayout
        railCollapsed={railPrefs.rail}
        contextCollapsed={railPrefs.context}
        mobileStats={<HomeWorkToday compact />}
        rail={
          <RailColumn
            id="home-rail"
            side="right"
            collapsed={railPrefs.rail}
            onToggle={() => toggleRail("rail")}
            count={4}
          >
            <HomeWorkToday />
            <HomeNotifications />
            {/* lg and up: see the rail note in this file's doc comment. */}
            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <HomeMonitoringPatients />
            </Box>
            {/* Below xl there is no left column, so quick actions live here. */}
            <Box sx={{ display: { xs: "block", xl: "none" } }}>
              <HomeQuickActions />
            </Box>
            {/* Last on purpose: the doctor's own day comes before aggregate
                statistics. Scoped identically to the feed beside it, so the two
                agree rather than offering two plausible answers. */}
            <AnalyticsRail />
          </RailColumn>
        }
        context={
          <RailColumn
            id="home-context"
            side="left"
            collapsed={railPrefs.context}
            onToggle={() => toggleRail("context")}
            count={1}
          >
            <HomeQuickActions />
          </RailColumn>
        }
      >
        <FilterBar
          filter={filter}
          onFilter={setFilter}
          search={search}
          onSearch={setSearch}
        />

        <Box ref={composerRef}>
          <PostComposer onPublished={() => reload()} />
        </Box>

        {loading ? (
          <FeedSkeleton count={3} />
        ) : error ? (
          <Box
            sx={{
              p: space[6],
              textAlign: "center",
              backgroundColor: colors.brand.surface,
              border: `1px solid ${colors.brand.hairline}`,
              borderRadius: radius.lg,
            }}
          >
            <Typography
              variant="body1"
              sx={{ color: colors.label.error, mb: space[3] }}
            >
              {t("Тасалбаруудыг ачаалж чадсангүй")}
            </Typography>
            <Button variant="outlined" onClick={reload}>
              {t("Дахин оролдох")}
            </Button>
          </Box>
        ) : items.length === 0 ? (
          emptyState
        ) : (
          <>
            {/* Only while a filter or search is narrowing the feed. Unfiltered
                this is a raw ticket total sitting at the top of the page -
                exactly the kind of number this screen was cleaned up to drop.
                Filtered, it answers "how many matched what I typed". */}
            {search || filter !== "all" ? (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: space[3],
                  color: colors.brand.inkDim,
                }}
              >
                {total.toLocaleString()} {t("тасалбар")}
              </Typography>
            ) : null}

            {items.map((item) => (
              <FeedCard key={item.id_data} Data={item} onPatch={patchItem} />
            ))}

            <Box ref={sentinelRef} sx={{ minHeight: "1px" }} />
            {loadingMore ? <FeedSkeleton count={1} /> : null}
            {!hasMore && items.length > 0 ? (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  py: space[6],
                  color: colors.brand.inkDim,
                }}
              >
                {t("Бүх тасалбарыг үзлээ")}
              </Typography>
            ) : null}
          </>
        )}
      </FeedLayout>

      {/* Phones have no room for the composer to sit open, so the primary
          action follows the reader instead. */}
      <Fab
        color="primary"
        aria-label={t("Шинэ тасалбар")}
        onClick={focusComposer}
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          right: 20,
          bottom: 100,
          backgroundColor: colors.brand.cyanInk,
          "&:hover": { backgroundColor: colors.brand.ink },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default AdviceHome;
