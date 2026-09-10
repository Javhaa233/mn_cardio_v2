import { useTranslation } from "react-i18next";
import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// react plugin for creating charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
// @mui/material components
import Box from "@mui/material/Box";

import styles from "assets/jss/material-dashboard-pro-react/views/chartsStyle.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

export default function Chart(props) {
  const { t } = useTranslation();
  const {
    Data = { labels: [], series: [[]] },
    type = "Bar",
    Options = {},
  } = props;
  const data = {
    labels: Data.labels,
    datasets: Data.series.map((s) => ({
      data: s,
      borderColor: "rgba(255, 255, 255, 1)",
      borderWidth: 2,
      pointBackgroundColor: "rgba(255, 255, 255, 1)",
      pointBorderColor: "rgba(255, 255, 255, 1)",
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: type === "Line",
      backgroundColor:
        type === "Line" ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0.8)",
      barPercentage: 0.6,
      tension: 0.4,
    })),
  };

  const defaultOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 11,
          },
          beginAtZero: true,
          padding: 10,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.15)",
          borderDash: [4, 4],
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Simple deep merge for scales specifically, or just use a merge utility if available
  // Here we'll just manually merge the scales if provided in Options
  const finalOptions = {
    ...defaultOptions,
    ...Options,
    plugins: {
      ...defaultOptions.plugins,
      ...Options.plugins,
    },
    scales: {
      x: {
        ...defaultOptions.scales.x,
        ...(Options.scales?.x || {}),
      },
      y: {
        ...defaultOptions.scales.y,
        ...(Options.scales?.y || {}),
      },
    },
  };

  return (
    <Box
      sx={{ ...styles.ctChart, backgroundColor: "transparent" }}
      style={{ height: "180px", padding: "10px 5px 0" }}
    >
      {type === "Line" ? (
        <Line options={finalOptions} data={data} />
      ) : (
        <Bar options={finalOptions} data={data} />
      )}
    </Box>
  );
}

Chart.propTypes = {
  Data: PropTypes.object,
  type: PropTypes.oneOf(["Bar", "Line"]),
  Options: PropTypes.object,
};
