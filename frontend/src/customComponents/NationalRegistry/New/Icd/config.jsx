import { editors } from "newComponents/BaseControls/BaseField";
import { getLookupDataStore, list } from "utils/rest/dataSource";
import i18n from "i18n";

export default (dispatch) => {
  return {
    objectName: "InvType",
    title: i18n.t("InvType"),
    keyField: "id",
    labelField: "name",
    fields: {
      Id: { label: "Id", editor: { [editors.textBox]: {} } },

      col1: {
        label: "Эмнэлгийн нэр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op413460"] },
              }),
          },
        },
      },
      col2: {
        label: "ICD суулгасан огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col3: {
        label: "ICD суулгах үеийн нас",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col4: {
        label: "ICD суулгасан байдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op414466"] },
              }),
          },
        },
      },
      col5: {
        label: "Хэвтсэн огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col6: { label: "Эмчийн нэр", editor: { [editors.textBox]: {} } },
      col7: {
        label: "Гарсан огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col8: {
        label: "Хяналтанд байх эмнэлгийн нэр",
        editor: { [editors.textBox]: {} },
      },
      col9: {
        label: "ICD бүртгэлийн төвд зөвхөн хамаарна. Код",
        editor: { [editors.textBox]: {} },
      },
      col10: {
        label: "Илэрч буй шинж тэмдгүүд: (хэд хэдийг сонгож болно)",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op379082"] },
              }),
          },
        },
      },
      //Хэм алдагдлын хэлбэр (хэд хэдийг сонгож болно)
      col11: {
        label: "",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op379884"] },
              }),
          },
        },
      },
      col12: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col13: {
        label: "", //Зүрхний суурь эмгэг
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op377909"] },
              }),
          },
        },
      },
      col14: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col15: {
        label: "Зүүн ховдлын EF (%)",
        editor: { [editors.textBox]: {} },
      },
      col16: {
        label: "Артерийн даралт ихсэлт",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op378710"] },
              }),
          },
        },
      },
      col17: {
        label: "Өөх тосны солилцооны өөрчлөлт",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op381486"] },
              }),
          },
        },
      },
      col18: {
        label: "Чихрийн шижин",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op382287"] },
              }),
          },
        },
      },
      col19: {
        label:
          "Зүрхний ишеми өвчин эрт насандаа оношлогдсон удамшлын өгүүлэмж: (эр<50 нас, эм>55 нас)",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col20: {
        label: "Зүрхний гэнэтийн үхэл болж байсан удамшлын өгүүлэмж",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col21: {
        label: "Тамхидалт",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op383890"] },
              }),
          },
        },
      },
      col22: {
        label:
          "Тамхидалт Хэрэв өдөр бүр, хааяа бол өдөрт дунджаар татдаг тамхины тоо бичих",
        editor: { [editors.textBox]: {} },
      },
      col23: {
        label: "Хэрэхийн шалтгаант зүрхний эмгэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col24: {
        label: "Хавхлагын гажиг/мэс засал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col25: {
        label: "Хавхлагын гажиг/мэс засал ",
        editor: { [editors.textBox]: {} },
      },
      col26: {
        label: "Кардиомиопати",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col27: {
        label: "Зүрхний архаг дутагдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col28: {
        label: "Миокардит",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col29: {
        label: "Халдварт эндокардит",
        editor: { [editors.textBox]: {} },
      },
      col30: { label: "Үүсгэч", editor: { [editors.textBox]: {} } },
      col31: {
        label: "Бөөрний дутагдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op386088"] },
              }),
          },
        },
      },
      col32: {
        label: "Тархины судасны хүндрэл өмнө нь тохиолдсон",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op385101"] },
              }),
          },
        },
      },
      col33: {
        label: "ТСДЭ хийлгэж байсан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col34: {
        label: "Ажилбар хийлгэсэн огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col35: {
        label: "CABG хийлгэж байсан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544188"] },
              }),
          },
        },
      },
      col36: {
        label: "Ажилбар хийлгэсэн огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col37: {
        label: "", //Бусад
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op570945"] },
              }),
          },
        },
      },
      col38: {
        label: "Хэрэв тийм бол тодорхой бичих",
        editor: { [editors.textBox]: {} },
      },
      col39: {
        label: "Элетродийн бэхэлгээ",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op388883"] },
              }),
          },
        },
      },
      col40: {
        label: "Элетродийн бэхэлгээ",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op388883"] },
              }),
          },
        },
      },
      col41: {
        label: "Элетродийн бэхэлгээ",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op388883"] },
              }),
          },
        },
      },
      col42: {
        label: "Хатгалт хийсэн судас",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op391082"] },
              }),
          },
        },
      },
      col43: {
        label: "Хатгалт хийсэн судас",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op391082"] },
              }),
          },
        },
      },
      col44: {
        label: "Хатгалт хийсэн судас",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op391082"] },
              }),
          },
        },
      },
      col45: {
        label: "Элетродийн загвар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op389703"] },
              }),
          },
        },
      },
      col46: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col47: {
        label: "Элетродийн загвар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op389703"] },
              }),
          },
        },
      },
      col48: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col49: {
        label: "Элетродийн загвар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op389703"] },
              }),
          },
        },
      },
      col50: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col51: {
        label: "Электродийн байрлал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op393281"] },
              }),
          },
        },
      },
      col52: {
        label: "Электродийн байрлал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op392293"] },
              }),
          },
        },
      },
      col53: {
        label: "Баруун хажуу байрлалд",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op392107"] },
              }),
          },
        },
      },
      col54: {
        label: "Зүүн хажуу байрлалд",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op392498"] },
              }),
          },
        },
      },
      col55: {
        label: "Электродийн загвар No",
        editor: { [editors.textBox]: {} },
      },
      col56: {
        label: "Электродийн загвар No",
        editor: { [editors.textBox]: {} },
      },
      col57: {
        label: "Электродийн загвар No",
        editor: { [editors.textBox]: {} },
      },
      col58: {
        label: "Электродийн сериал No",
        editor: { [editors.textBox]: {} },
      },
      col59: {
        label: "Электродийн сериал No",
        editor: { [editors.textBox]: {} },
      },
      col60: {
        label: "Электродийн сериал No",
        editor: { [editors.textBox]: {} },
      },
      col61: { label: "P/R амплитуди (mV)", editor: { [editors.textBox]: {} } },
      col62: { label: "P/R амплитуди (mV)", editor: { [editors.textBox]: {} } },
      col63: { label: "P/R амплитуди (mV)", editor: { [editors.textBox]: {} } },
      col64: { label: "Slew rate (V/s)", editor: { [editors.textBox]: {} } },
      col65: { label: "Slew rate (V/s)", editor: { [editors.textBox]: {} } },
      col66: { label: "Slew rate (V/s)", editor: { [editors.textBox]: {} } },
      col67: {
        label: "Pacing threshold (V) @ 0.5 ms",
        editor: { [editors.textBox]: {} },
      },
      col68: {
        label: "Pacing threshold (V) @ 0.5 ms",
        editor: { [editors.textBox]: {} },
      },
      col69: {
        label: "Pacing threshold (V) @ 0.5 ms",
        editor: { [editors.textBox]: {} },
      },
      col70: {
        label: "Resistance (at 5V) Ohm",
        editor: { [editors.textBox]: {} },
      },
      col71: {
        label: "Resistance (at 5V) Ohm",
        editor: { [editors.textBox]: {} },
      },
      col72: {
        label: "Resistance (at 5V) Ohm",
        editor: { [editors.textBox]: {} },
      },
      col73: {
        label: "Электродийн хэлбэр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op395684"] },
              }),
          },
        },
      },
      col74: { label: "Slew rate", editor: { [editors.textBox]: {} } },
      col75: { label: "Pacing threshold", editor: { [editors.textBox]: {} } },
      col76: { label: "pacing impedance", editor: { [editors.textBox]: {} } },
      col77: { label: "Pulse Generator", editor: { [editors.textBox]: {} } },
      col78: {
        label: "", //Загвар
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op389703"] },
              }),
          },
        },
      },
      col79: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col80: { label: "Модел №", editor: { [editors.textBox]: {} } },
      col81: { label: "Сериал №", editor: { [editors.textBox]: {} } },
      col82: {
        label: "Байрлал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op394697"] },
              }),
          },
        },
      },
      col83: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col84: {
        label: "Тест хийгдсэн",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op570945"] },
              }),
          },
        },
      },
      col85: {
        label:
          "Хэрэв тийм бол 10J-ийн аюулгүй хязгаартай тэнцүү эсвэл илүү байсан ?",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op570945"] },
              }),
          },
        },
      },
      col86: {
        label: "Ажилбар хийгдсэн нийт хугацаа (мин/сек)",
        editor: { [editors.textBox]: {} },
      },
      col87: {
        label: "Флюроскопи хийгдсэн нийт хугацаа(мин/сек)",
        editor: { [editors.textBox]: {} },
      },
      col88: {
        label: "Гадаргуугийн тун (mGy.cm2",
        editor: { [editors.textBox]: {} },
      },
      col89: { label: "Арьсны тун (mGy)", editor: { [editors.textBox]: {} } },
      col90: {
        label: "", //Хүндрэл (эмнэлэгт байх үеийн)
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op359928"] },
              }),
          },
        },
      },
      col91: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col92: {
        label: "Анх суулгасан огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col93: {
        label: "Өмнө нь үүсгүүрийг сольсон огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col94: {
        label: "", //Загвар
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op389703"] },
              }),
          },
        },
      },
      col95: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col96: { label: "Модел №", editor: { [editors.textBox]: {} } },
      col97: { label: "Сериал №", editor: { [editors.textBox]: {} } },
      col98: {
        label: "Байрлал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op394697"] },
              }),
          },
        },
      },
      col99: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col100: {
        label: "", //Шалтгаан
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op358940"] },
              }),
          },
        },
      },
      col101: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col102: {
        label: "Электродийг эргүүлж авах",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op359145"] },
              }),
          },
        },
      },
      col103: {
        label: "Электродийг эргүүлж авсан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op570945"] },
              }),
          },
        },
      },
      col104: {
        label: "Электрод байрлуулсан огноо",
        editor: {
          config: {
            [editors.textBox]: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "_",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
                L: /[0,1]/,
                J: /[0-3]/,
              },
            },
          },
        },
      },
      col105: {
        label: "", //Байрлал
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op362331"] },
              }),
          },
        },
      },
      col106: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col107: {
        label: "", //Загвар
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op389703"] },
              }),
          },
        },
      },
      col108: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col109: { label: "Модел №", editor: { [editors.textBox]: {} } },
      col110: { label: "Сериал №", editor: { [editors.textBox]: {} } },
      col111: {
        label: "", //Шалтгаан
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op361139"] },
              }),
          },
        },
      },
      col112: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col113: {
        label: "ICD-ийн хэлбэр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op315078"] },
              }),
          },
        },
      },
    },
  };
};

export const layout = [
  {
    "grp|Эмнэлэгт хэвтэх үеийн бүртгэл|4|2": [
      "f|col1|4",
      "f|col2|2",
      "|2",
      "f|col3|2",
      "|2",
      "f|col4|3",
      "|",
      "f|col5|2",
      "|2",
      "f|col6|3",
      "|",
      "f|col7|2",
      "|2",
      "f|col8|3",
      "|",
      "f|col9|3",
    ],
  },
  {
    "grp|Өвчний түүх болон эрсдэлт хүчин зүйлс|4|2": [
      "f|col10|4",
      {
        "grp|Хэм алдагдлын хэлбэр (хэд хэдийг сонгож болно)|8|4": [
          "f|col11|5",
          "f|col12|3",
        ],
      },
      { "grp|Зүрхний суурь эмгэг|8|4": ["f|col13|5", "f|col14|3"] },
      "f|col15|2",
    ],
  },
  {
    "grp|Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс|4|2": [
      "f|col16|4",
      "f|col17|4",
      "f|col18|4",
      "f|col19|4",
      "f|col20|4",
      "f|col21|4",
      "f|col22|2",
    ],
  },
  {
    "grp|Бусад онцлох өвчний түүх|4|2": [
      "f|col23|4",
      "f|col24|4",
      "f|col25|2",
      "|2",
      "f|col26|4",
      "f|col27|4",
      "f|col28|4",
      "f|col29|4", ////---------
      "f|col30|4",
      "f|col31|4",
      "f|col32|4",
      "f|col33|4",
      "f|col34|2",
      "|2",
      "f|col35|4",
      "f|col36|2",
      "|2",
      { "grp|Бусад|8|4": ["f|col37|8", "f|col38|4"] },
    ],
  },

  {
    "grp|ICD суулгах ажилбар|4|2": [
      "f|col113|4",
      {
        "grp|Баруун тосгуур|4|4": [
          "f|col39|4",
          "f|col42|4",
          "f|col45|4",
          "f|col46|2",
          "|2",
          "f|col51|4",
          "f|col55|4",
          "f|col58|4",
          "f|col61|4",
          "f|col64|4",
          "f|col67|4",
          "f|col70|4",
        ],
      },
      {
        "grp|Баруун ховдол|4|4": [
          "f|col40|4",
          "f|col43|4",
          { "grp|Элетродийн загвар|8|4": ["f|col47|5", "f|col48|3"] },
          "f|col52|4",
          "f|col56|4",
          "f|col59|4",
          "f|col62|4",
          "f|col65|4",
          "f|col68|4",
          "f|col71|4",
        ],
      },
      {
        "grp|Зүүн ховдол|4|4": [
          "f|col41|4",
          "f|col44|4",
          "f|col49|4",
          "f|col50|2",
          "|2",
          { "grp|Электродийн байрлал|4|4": ["f|col53|4", "f|col54|4"] },
          "f|col57|4",
          "f|col60|4",
          "f|col63|4",
          "f|col66|4",
          "f|col69|4",
          "f|col72|4",
        ],
      },
    ],
  },
  {
    "grp|Төхөөрөмжийн пейсмейкерийн үзүүлэлтүүд|4|2": [
      "f|col73|4",
      "f|col74|2",
      "|2",
      "f|col75|2",
      "|2",
      "f|col76|2",
    ],
  },
  {
    "grp|Төхөөрөмжийн пейсмейкерийн үзүүлэлтүүд|4|2": [
      "f|col77|4",
      { "grp|Загвар|8|4": ["f|col78|5", "f|col79|3"] },
      "f|col80|2",
      "|2",
      "f|col81|2",
      "|2",
      "f|col82|4",
      "f|col83|2",
    ],
  },
  {
    "grp|Дефибрилляторийн зааг тест (DFT testing)|4|2": [
      "f|col84|2",
      "|2",
      "f|col85|2",
      "|2",
      "f|col86|2",
      "|2",
      "f|col87|2",
      "|2",
      "f|col88|2",
      "|2",
      "f|col89|2",
    ],
  },

  {
    "grp|Хүндрэл (эмнэлэгт байх үеийн)|6|2": ["f|col90|4", "f|col91|2"],
  },
  {
    "grp|Багажийг дахин суулгах болон эргүүлж авах|4|2": [
      "f|col92|2",
      "|2",
      "f|col93|2",
    ],
  },
  {
    "grp|Үүсгүүрийг эргүүлж авах|4|2": [
      { "grp|Загвар|8|4": ["f|col94|5", "f|col95|3"] },
      "f|col96|2",
      "|2",
      "f|col97|2",
      "|2",
      "f|col98|4",
      { "grp|Шалтгаан|8|4": ["f|col100|5", "f|col101|3"] },
    ],
  },
  {
    "grp|Электродийг эргүүлж авах|4|2": [
      "f|col103|4",
      "f|col104|2",
      "|2",
      { "grp|Байрлал|8|4": ["f|col105|5", "f|col106|3"] },
      { "grp|Загвар|8|4": ["f|col107|5", "f|col108|3"] },
      "f|col109|2",
      "|2",
      "f|col110|2",
      "|2",
      { "grp|Шалтгаан|8|4": ["f|col111|5", "f|col112|3"] },
    ],
  },
  // "f|col99|",
  // "f|col102|",
];
