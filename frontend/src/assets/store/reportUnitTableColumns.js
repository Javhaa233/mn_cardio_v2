const HeaderArray = [
  [
    {
      Text: "ЗСӨ-НИЙ  ХЯНАЛТЫН НЭГДСЭН  ХҮСНЭГТ",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        textDecoration: "uppercase",
      },
      colSpan: 8,
    },
    { Name: "year_month", Text: "", colSpan: 3 },
  ],
  [
    { Text: "№", rowSpan: 2 },
    { Text: "Сумын нэр", rowSpan: 2 },
    { Text: "ЗСӨ-ний нэр", rowSpan: 2 },
    { Text: "Байж болзошгүй хүний тоо", rowSpan: 2 },
    { Text: "Үзлэгт хамрагдсан хүний тоо", rowSpan: 2 },
    { Text: "Шинээр оношлогдсон хүний тоо", rowSpan: 2 },
    { Text: "Эмчилгээ хийлгэж байгаа хүний тоо", rowSpan: 2 },
    { Text: "Хяналтад авсан хүний тоо", rowSpan: 2 },
    { Text: "Гарсан өөрчлөлт", colSpan: 3 },
  ],
  [
    { Text: "Эдгэрсэн хүний тоо" },
    { Text: "Шилжсэн хүний тоо" },
    { Text: "Нас барсан хүний тоо" },
  ],
];
const RowColumns = [
  "Number",
  "SoumName",
  "CVDName",
  "bolzoshguiCount",
  "hamragdsanCount",
  "newDiagnosedCount",
  "treatmentCount",
  "activatedCount",
  "edgersenCount",
  "transferedCount",
  "nasBarsanCount",
];

export { HeaderArray, RowColumns };
