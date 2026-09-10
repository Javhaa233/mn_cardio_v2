const HeaderArray = [
  [
    {
      Name: "month",
      Text: "Зүрх судасны өвчний хяналтын",
      colSpan: 13,
    },
  ],
  [
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Text: "" },
    { Name: "date", Text: "Огноо", colSpan: 4 },
  ],
  [{ Name: "hunam", Text: "Зорилтот хүн ам: *****", colSpan: 13 }],

  [
    { Name: "orgname", Text: "Байгууллагын нэр:", colSpan: 3 },
    { Name: "sent_date", Text: "Тайланг илгээсэн огноо:", colSpan: 4 },
    {
      Name: "udirdlagan_name",
      Text: "Тайланг зөвшөөрсөн удирдлага:",
      colSpan: 3,
    },
    { Name: "employeement", Text: "Тайланг гаргасан ажилтан: ", colSpan: 3 },
  ],
  [
    { Text: "ӨЭМТ-үүд:" },
    { Text: "Эрэгтэй" },
    { Text: "Эмэгтэй" },
    { Text: "18-39" },
    { Text: "40 өөс дээш" },
    { Text: "Нийт шинээр үнэлгээнд хамрагдсан хүний тоо" },
    { Text: "ЗСӨ-ний түүхтэй" },
    { Text: "ЧШ-гийн нефропати-г оролцуулаад бөөрний архаг өвчтэй" },
    { Text: "ЗСӨ-ний эрсдэл  ≥ 30%" },
    { Text: "ЗСӨ-ний эрсдэл  <30%" },
    { Text: "Нийт шинээр бүртгэгдсэн" },
    { Text: "Артерийн гипертензитэй" },
    { Text: "Чихрийн шижинтэй" },
  ],
  [{ Text: "ЗСӨ-ний 10 жилийн эрсдэлийг үнэлсэн байдал", colSpan: 13 }],
  [
    {
      Name: "ageGroup",
      Text: "Шинээр үнэлгээнд хамрагдсан хүний тоо, насны ангилалаар: ",
      colSpan: 13,
    },
  ],
];
const RowColumns = [
  "orgName",
  "genderF",
  "genderM",
  "ageLt40",
  "ageGte40",
  "allPatCnt",
  "isCVD",
  "buurniiArhagUwchin",
  "riskGte30",
  "riskLt30",
  "newPatCnt",
  "arterCnt",
  "tsusniiSahar",
];

export { HeaderArray, RowColumns };
