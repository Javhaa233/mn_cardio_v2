const data = {
  labels: ["2024-03-18", "2024-04-09", "2024-04-11"],
  datasets: [
    {
      label: "Систол даралт (мм.муб)",
      data: [105, 130, 124],
      fill: false,
      borderColor: "rgba(75,192,192,1)",
    },
    {
      label: "Дистол даралт (мм.муб)",
      data: [56, 76, 45],
      fill: false,
      borderColor: "#742774",
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: { color: "#323130", font: { size: 14 } },
    },
  },
  scales: {
    y: {
      min: 40,
      max: 160,
      ticks: {
        stepSize: 10,
      },
    },
    x: {},
  },
};

export { data, options };
