/**
 * NO LIVE CONSUMER as of the home-rail rebuild - AnalyticsRail was its only
 * caller and has been deleted. Kept deliberately: it is fully domain-agnostic
 * (labels/values in, line out) and it is the only chart renderer in this app
 * that draws visibly on a white card - customComponents/Chart/Chart.jsx
 * hardcodes white strokes. Deleting it would re-create a solved problem.
 */
import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { colors } from "@/theme/colors";

// Filler is registered here on purpose. The app's other chart component sets
// `fill: true` without registering it, which is why its "gradient area" is
// really just a line - the fill silently never renders.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

/**
 * Tickets over time.
 *
 * A new renderer rather than customComponents/Chart/Chart.jsx, which hardcodes
 * white strokes and points because it was built to sit inside a coloured
 * gradient CardHeader - on a white card it draws nothing visible.
 *
 * Deliberate choices, in the order they matter:
 *  - ONE series, so there is no legend. The card's title names the measure;
 *    a legend box for a single line is furniture.
 *  - The line carries the identity colour; every number and label on the card
 *    stays in ink tokens. Text never wears the series colour.
 *  - Axes and grid are recessive: no vertical grid, a hairline horizontal grid,
 *    no axis borders. The data is the only thing with contrast.
 *  - A hover tooltip with an index-mode crosshair, because a chart the reader
 *    cannot interrogate is a picture of data rather than data.
 */
export default function TrendChart({ labels, values, height = 150 }) {
  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values,
          borderColor: colors.brand.cyan,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            if (!chart.chartArea) return "rgba(24,168,232,0.10)";
            const g = chart.ctx.createLinearGradient(
              0,
              chart.chartArea.top,
              0,
              chart.chartArea.bottom,
            );
            g.addColorStop(0, "rgba(24,168,232,0.22)");
            g.addColorStop(1, "rgba(24,168,232,0.00)");
            return g;
          },
          pointRadius: 0,
          // Invisible until hovered, then big enough to actually hit.
          pointHoverRadius: 5,
          pointHoverBackgroundColor: colors.brand.cyanInk,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
          // The hit target is much larger than the mark, so hovering a thin
          // line does not require pixel accuracy.
          pointHitRadius: 24,
        },
      ],
    }),
    [labels, values],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.brand.ink,
          titleFont: { size: 12, weight: "600" },
          bodyFont: { size: 12 },
          padding: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            color: colors.brand.inkDim,
            font: { size: 10 },
            maxRotation: 0,
            autoSkipPadding: 18,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.brand.hairline, drawBorder: false },
          ticks: {
            color: colors.brand.inkDim,
            font: { size: 10 },
            precision: 0,
            maxTicksLimit: 4,
          },
        },
      },
    }),
    [],
  );

  return (
    <Box sx={{ height, minWidth: 0 }}>
      <Line data={data} options={options} />
    </Box>
  );
}
