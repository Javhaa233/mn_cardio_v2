import React, { Component } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
);

class ChartBar extends Component {
  render() {
    const { Data = null } = this.props;

    if (Data) {
      var labels = Data[0] ? Data[0].slice(1) : []; // Get labels from first row, skipping first element
      var values = Data[1] ? Data[1].slice(1) : []; // Get values from second row, skipping first element

      // If we only have one array, treat it as values
      if (!Data[0] && Data[1]) {
        values = Data[1];
        labels = Array.from(
          { length: values.length },
          (_, i) => `Item ${i + 1}`,
        );
      } else if (Data[0] && !Data[1]) {
        values = Data[0].slice(1);
        labels = Data[0][0]
          ? [Data[0][0]]
          : Array.from({ length: values.length }, (_, i) => `Item ${i + 1}`);
      }

      const chartData = {
        labels: labels,
        datasets: [
          {
            label: "%",
            data: values,
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            borderColor: "rgba(53, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.y + "%";
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
      };

      return (
        <div style={{ height: "240px", width: "100%" }}>
          <Bar data={chartData} options={options} />
        </div>
      );
    }
    return null;
  }
}

export default ChartBar;
