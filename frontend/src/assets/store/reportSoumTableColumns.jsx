const HeaderArray = [
  [
    { Name: "orgname", Text: "", colSpan: 2 },
    { Name: "date", Text: "", colSpan: 12 },
  ],
  [
    { Text: "№", rowSpan: 2 },
    { Text: "Байгууллагын нэр:", rowSpan: 2 },
    { Text: "Эрэгтэй", rowSpan: 2 },
    { Text: "Эмэгтэй", rowSpan: 2 },
    { Text: "<40", rowSpan: 2 },
    { Text: "≥ 40", rowSpan: 2 },
    { Text: "Нийт  шинээр үнэлгээнд хамрагдсан хүний тоо", rowSpan: 2 },
    {
      Text: "ЗСӨ-НИЙ ЭРСДЭЛ БУУРУУЛАХ ЭМЧИЛГЭЭНД БҮРТГЭГДСЭН ХҮНИЙ ТОО",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        textDecoration: "uppercase",
      },
      colSpan: 7,
    },
  ],
  [
    { Text: "ЗСӨ-ний түүхтэй" },
    { Text: "ЧШ-гийн нефропати-г оролцуулаад бөөрний архаг өвчтэй" },
    { Text: "ЗСӨ-ний эрсдэл  ≥ 30% " },
    { Text: "ЗСӨ-ний эрсдэл  <30% " },
    { Text: "Нийт шинээр бүртгэгдсэн" },
    { Text: "Артерийн гипертензитэй" },
    { Text: "Чихрийн шижинтэй" },
  ],
];

const RowColumns = [
  "Number",
  "orgName",
  "genderF",
  "genderM",
  "ageLt40",
  "ageGte40",
  "allPatCnt",
  "isCVD",
  "shijinAndBuur",
  "riskGte30",
  "riskLt30",
  "newPatCnt",
  "arterCnt",
  "TsusniiSahar",
];

export { HeaderArray, RowColumns };
