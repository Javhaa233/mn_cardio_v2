import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useTranslation } from "react-i18next";

import Helper from "helper";
import BaseDateSelect from "customComponents/BaseDateSelect";
import { TilePanel } from "customComponents/Home/Tiles";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import TrendChart from "./TrendChart";

/**
 * Ticket analytics, as one section of the home rail.
 *
 * Deliberately a single panel rather than the four stacked ones this used to
 * be: it now sits alongside "Миний өнөөдрийн ажил" and "Мэдэгдэл" in the same
 * rail, and four panels of statistics would push the working panels off the
 * screen. It is built on TilePanel for the same reason - one card style in one
 * column.
 *
 * Everything here comes from a single /Advice/GetStats call, scoped with the
 * same visibility rule as the feed itself, so the numbers reconcile with what
 * the reader can actually see rather than being a second plausible answer.
 *
 * Fetches independently: a slow or failing rail must never blank the feed, and
 * vice versa.
 */
export default function AnalyticsRail({ compact = false }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Bucket size follows the span, so the line always has enough points to be
    // a line. Weeks over a 7-day range yields two dots and reads as a broken
    // chart rather than as a quiet week.
    let granularity = "day";
    if (range && range.StartDate && range.EndDate) {
      const days =
        (new Date(range.EndDate) - new Date(range.StartDate)) / 86400000;
      if (days > 180) granularity = "month";
      else if (days > 45) granularity = "week";
    }

    // Yield first: a setState run synchronously in an effect body cascades an
    // extra render pass.
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      Helper.AdviceHelper.GetStats(
        {
          StartDate: range && range.StartDate,
          EndDate: range && range.EndDate,
          Granularity: granularity,
        },
        (res) => {
          // The range can change while a request is in flight; a late response
          // must not overwrite the newer one.
          if (cancelled) return;
          setLoading(false);
          if (!res || res.Success === false) {
            setError(true);
            return;
          }
          setError(false);
          setData(res.Data || null);
        },
      );
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const kpi = (data && data.Kpi) || {};
  const byStatus = (data && data.ByStatus) || [];
  const series = (data && data.Series) || { labels: [], series: [[]] };
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.Count));

  const KPIS = [
    { label: t("Нийт тасалбар"), value: kpi.Total },
    { label: t("Нээлттэй"), value: kpi.Open },
    { label: t("Хаагдсан"), value: kpi.Closed },
    { label: t("Хариулт"), value: kpi.Comments },
  ];

  const num = (v) =>
    v === null || v === undefined ? "—" : Number(v).toLocaleString();

  // Phones get the numbers without the chart - the statistics should not vanish
  // just because the screen is narrow.
  if (compact) {
    return (
      <Box
        sx={{
          display: "flex",
          gap: space[3],
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          pb: space[2],
          mb: space[4],
        }}
      >
        {KPIS.map((k) => (
          <Box
            key={k.label}
            sx={{
              flex: "0 0 150px",
              scrollSnapAlign: "start",
              backgroundColor: colors.brand.surface,
              border: `1px solid ${colors.brand.hairline}`,
              borderRadius: radius.lg,
              p: space[3],
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: colors.brand.ink,
              }}
            >
              {loading ? <Skeleton width="60%" /> : num(k.value)}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.brand.inkDim }}>
              {k.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <TilePanel
      Title={t("Тасалбарын тойм")}
      Variant="panel"
      Action={
        <BaseDateSelect
          AutoLoad
          DefaultValueDisable
          // A year, not this component's usual week. Ticket volume is measured
          // in weeks and months, and the newest activity in the live data is
          // months old - a 7-day opening view is an empty chart.
          DefaultRange="1"
          ChangeValue={(v) => setRange(v)}
        />
      }
    >
      {error ? (
        <Typography variant="body2" sx={{ color: colors.label.error }}>
          {t("Мэдээллийг ачаалж чадсангүй")}
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: space[3],
              mb: space[3],
            }}
          >
            {KPIS.map((k) => (
              <Box key={k.label} sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: colors.brand.ink,
                  }}
                >
                  {loading ? <Skeleton width="60%" /> : num(k.value)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: colors.brand.inkDim }}
                  noWrap
                >
                  {k.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Skeleton variant="rectangular" height={110} />
          ) : series.labels.length ? (
            <TrendChart
              labels={series.labels}
              values={series.series[0] || []}
              height={110}
            />
          ) : (
            <Typography variant="body2" sx={{ color: colors.brand.inkDim }}>
              {t("Энэ хугацаанд тасалбар алга")}
            </Typography>
          )}

          {!loading && byStatus.length ? (
            <Box
              sx={{
                mt: space[3],
                pt: space[3],
                borderTop: `1px solid ${colors.brand.hairline}`,
              }}
            >
              {byStatus.map((s) => (
                <Box key={s.Key} sx={{ mb: space[2] }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: space[2],
                    }}
                  >
                    {/* Label and number are ink; only the bar carries the
                        status colour. Text never wears the series colour. */}
                    <Typography
                      variant="caption"
                      sx={{ color: colors.brand.inkDim }}
                      noWrap
                    >
                      {t(s.Label)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.brand.ink, fontWeight: 600 }}
                    >
                      {s.Count.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: "3px",
                      height: "5px",
                      borderRadius: radius.pill,
                      backgroundColor: colors.brand.tint,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width:
                          Math.max(2, Math.round((s.Count / maxStatus) * 100)) +
                          "%",
                        height: "100%",
                        borderRadius: radius.pill,
                        // Status is a STATE, so it uses the reserved status
                        // palette and every row carries its label - colour
                        // never carries the meaning alone.
                        backgroundColor:
                          s.Key === "n"
                            ? colors.brand.cyan
                            : s.Key === "y"
                              ? colors.status.normal
                              : colors.brand.hairlineStrong,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : null}
        </>
      )}
    </TilePanel>
  );
}
