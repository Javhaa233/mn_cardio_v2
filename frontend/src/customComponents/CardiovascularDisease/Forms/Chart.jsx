import React, { Component } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Legend,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import Box from "@mui/material/Box";

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Legend,
  Title,
  Tooltip,
  Filler,
);

class Chart extends Component {
  render() {
    const { Data = null, chartType = "line", Id } = this.props;

    if (Data) {
      var x = Data[2] ? Data[2].slice(1) : []; // x-axis values
      var columns = Data[0] ? Data[0].slice(1) : []; // first data series
      var rows = Data[1] ? Data[1].slice(1) : []; // second data series

      var labels = x;
      var datasets = [];

      if (columns.length > 0) {
        datasets.push({
          label: "Series 1",
          data: columns,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        });
      }

      if (rows.length > 0) {
        datasets.push({
          label: "Series 2",
          data: rows,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        });
      }

      if (datasets.length === 0) {
        return null;
      }

      const chartData = {
        labels: labels,
        datasets: datasets,
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Value",
            },
          },
        },
      };

      let ChartComponent;
      if (chartType === "bar") {
        ChartComponent = Bar;
      } else {
        ChartComponent = Line;
      }

      // Shorter on a phone: a 400px chart plus its legend fills an entire
      // screen, so the form around it disappears while you read it. Width was
      // already fluid (`maintainAspectRatio: false`); only height was pinned.
      return (
        <Box sx={{ height: { xs: "260px", sm: "400px" }, width: "100%" }}>
          <ChartComponent data={chartData} options={options} />
        </Box>
      );
    }
    return null;
  }
}

export default Chart;
