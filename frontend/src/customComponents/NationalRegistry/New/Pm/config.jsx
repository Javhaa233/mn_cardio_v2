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
      col2: { label: "Пейсмейкер суулгасан огноо", editor: {} },
      col3: {
        label: "Пейсмейкер суулгах үеийн нас",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col4: {
        label: "Пейсмейкер суулгасан байдал",
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
      col6: {
        label: "Эмчийн нэр",
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
        label: "Пейсмейкерийн бүртгэлийн төвд зөвхөн хамаарна. Код",
        editor: { [editors.textBox]: {} },
      },
      col10: {
        label: "", //III. Пейсмейкер эмчилгээний заалт (нэгийг нь сонгох)
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op46975"] },
              }),
          },
        },
      },
      col11: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col12: {
        label: "Пейсмейкер суулгах шаардлагатай: Абляци",
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
      col13: {
        label: "", //IV. Шинж тэмдэг (хэд хэдийг сонгож болно)
        editor: {
          [editors.checkBoxMulti]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op49546"] },
              }),
          },
        },
      },
      col14: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col15: {
        label: "", //V. Зүрхний үндсэн өвчин (нэгийг нь сонгох)
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op48558"] },
              }),
          },
        },
      },
      col16: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col17: {
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
      col18: {
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
      col19: {
        label: "Чихрийн шижин",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op51950"] },
              }),
          },
        },
      },
      col20: {
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
      col21: {
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
      col22: {
        label: "", //Тамхидалт:
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op51763"] },
              }),
          },
        },
      },
      col23: {
        label: "Хэрэв өдөр бүр, хааяа бол өдөрт дунджаар татдаг тамхины тоо",
        editor: { [editors.textBox]: {} },
      },
      col24: {
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
      col25: {
        label: "", //Хавхлагын гажиг/мэс засал:
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
      col26: {
        label: "Хэрэв тийм бол тодруулах",
        editor: { [editors.textArea]: {} },
      },
      col27: {
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
      col28: {
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
      col29: {
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
      col30: {
        label: "", //Халдварт эндокардит:
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
      col31: {
        label: "Хэрэв тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op264208"] },
              }),
          },
        },
      },
      col32: { label: "Үүсгэгч", editor: { [editors.textBox]: {} } },
      col33: {
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
      col34: {
        label: "", //Тархины судасны хүндрэл өмнө нь тохиолдсон:
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
      col35: {
        label: "Хэрэв тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op827824"] },
              }),
          },
        },
      },
      col36: {
        label: "", //ТСДЭ хийлэгж байсан
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
      col37: {
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
      col38: {
        label: "", //CABG хийлгэж байсан:
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
      col39: {
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
      col40: {
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
      col41: {
        label: "Хэрэв тийм бол тодорхой бичих",
        editor: { [editors.textBox]: {} },
      },
      col42: {
        label: "Хийгдсэн ажилбар (нэгийг сонгоно)",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op58956"] },
              }),
          },
        },
      },
      col43: {
        label: "", //Үүсгүүрийн төлөв (нэгийг сонгоно)
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op61546"] },
              }),
          },
        },
      },
      col44: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col45: {
        label: "Электродны хэлбэр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op62552"] },
              }),
          },
        },
      },
      col46: {
        label: "Электродийн туйл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op60558"] },
              }),
          },
        },
      },
      col47: {
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
      col48: {
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
      col49: {
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
      col50: {
        label: "", //Элетродийн бэхэлгээ:Байрлал
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op62962"] },
              }),
          },
        },
      },
      col51: {
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
      col52: {
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
      col53: {
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
      col54: {
        label: "Элетродийн загвар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op240261"] },
              }),
          },
        },
      },
      col55: {
        label: "Элетродийн загвар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op240261"] },
              }),
          },
        },
      },
      col56: {
        label: "Элетродийн загвар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op240261"] },
              }),
          },
        },
      },
      col57: {
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
      col58: {
        label: "Электродийн байрлал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op776354"] },
              }),
          },
        },
      },
      col59: {
        label: "Зүүн хажуу байрлалд",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op371161"] },
              }),
          },
        },
      },
      col60: {
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
      col61: {
        label: "Электродийн загвар No",
        editor: { [editors.textBox]: {} },
      },
      col62: {
        label: "Электродийн загвар No",
        editor: { [editors.textBox]: {} },
      },
      col63: {
        label: "Электродийн загвар No",
        editor: { [editors.textBox]: {} },
      },
      col64: {
        label: "Электродийн сериал No",
        editor: { [editors.textBox]: {} },
      },
      col65: {
        label: "Электродийн сериал No",
        editor: { [editors.textBox]: {} },
      },
      col66: {
        label: "Электродийн сериал No",
        editor: { [editors.textBox]: {} },
      },
      col67: { label: "P/R амплитуди (mV)", editor: { [editors.textBox]: {} } },
      col68: { label: "P/R амплитуди (mV)", editor: { [editors.textBox]: {} } },
      col69: { label: "P/R амплитуди (mV)", editor: { [editors.textBox]: {} } },
      col70: { label: "Slew rate (V/s)", editor: { [editors.textBox]: {} } },
      col71: { label: "Slew rate (V/s)", editor: { [editors.textBox]: {} } },
      col72: { label: "Slew rate (V/s)", editor: { [editors.textBox]: {} } },
      col73: {
        label: "Pacing threshold (V) @ 0.5 ms",
        editor: { [editors.textBox]: {} },
      },
      col74: {
        label: "Pacing threshold (V) @ 0.5 ms",
        editor: { [editors.textBox]: {} },
      },
      col75: {
        label: "Pacing threshold (V) @ 0.5 ms",
        editor: { [editors.textBox]: {} },
      },
      col76: {
        label: "Resistance (at 5V) Ohm",
        editor: { [editors.textBox]: {} },
      },
      col77: {
        label: "Resistance (at 5V) Ohm",
        editor: { [editors.textBox]: {} },
      },
      col78: {
        label: "Resistance (at 5V) Ohm",
        editor: { [editors.textBox]: {} },
      },
      col79: {
        label: "Загвар",
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
      col80: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col81: { label: "Модел №", editor: { [editors.textBox]: {} } },
      col82: { label: "Сериал №", editor: { [editors.textBox]: {} } },
      col83: {
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
      col84: {
        label: "Ажилбар хийгдсэн нийт хугацаа (мин/сек)",
        editor: { [editors.textBox]: {} },
      },
      col85: {
        label: "Флюроскопи хийгдсэн нийт хугацаа(мин/сек)",
        editor: { [editors.textBox]: {} },
      },
      col86: {
        label: "Гадаргуугийн тун (mGy.cm2",
        editor: { [editors.textBox]: {} },
      },
      col87: { label: "Арьсны тун (mGy)", editor: { [editors.textBox]: {} } },
      col88: {
        label: "", //IX. Хүндрэл (эмнэлэгт байх үеийн)
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op32981"] },
              }),
          },
        },
      },
      col89: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col90: { label: "Pulse Generator", editor: { [editors.textBox]: {} } },
      col91: {
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
      col92: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col93: { label: "Модел №", editor: { [editors.textBox]: {} } },
      col94: { label: "Сериал №", editor: { [editors.textBox]: {} } },
      col95: {
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
      col96: { label: "Бусад ", editor: { [editors.textBox]: {} } },
      col97: { label: "Электрод", editor: { [editors.textBox]: {} } },
      col98: {
        label: "Байрлал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op32199"] },
              }),
          },
        },
      },
      col99: {
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
      col100: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col101: { label: "Модел №", editor: { [editors.textBox]: {} } },
      col102: { label: "Сериал №", editor: { [editors.textBox]: {} } },
      col103: {
        label: "", //Шалтгаан
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op35385"] },
              }),
          },
        },
      },
      col104: { label: "Бусад", editor: { [editors.textBox]: {} } },
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
      "f|col6|2",
      "|2",
      "f|col7|2",
      "|2",
      "f|col8|2",
      "|2",
      "f|col9|3",
    ],
  },
  {
    "grp|Пейсмейкер эмчилгээний заалт|8|2": [
      "f|col10|8",
      "f|col11|6",
      "|2",
      "f|col12|8",
    ],
  },

  {
    "grp|Шинж тэмдэг (хэд хэдийг сонгож болно)|8|2": ["f|col13|8", "f|col14|6"],
  },
  {
    "grp|Зүрхний үндсэн өвчин (нэгийг нь сонгох)|8|2": [
      "f|col15|8",
      "f|col16|6",
    ],
  },

  {
    "grp|Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс|4|2": [
      "f|col17|4",
      "f|col18|4",
      "f|col19|4",
      "f|col20|4",
      "f|col21|4",
      { "grp|Тамхидалт|4|4": ["f|col22|4", "f|col23|2"] },
    ],
  },
  {
    "grp|Бусад онцлох өвчний түүх|4|2": [
      "f|col24|4",
      { "grp|Хавхлагын гажиг/мэс засал|4|4": ["f|col25|4", "f|col26|4"] },
      "f|col27|4",
      "f|col28|4",
      "f|col29|4",
      {
        "grp|Халдварт эндокардит|4|4": ["f|col30|4", "f|col31|4", "f|col32|4"],
      },
      "f|col33|4",
      {
        "grp|Тархины судасны хүндрэл өмнө нь тохиолдсон|4|4": [
          "f|col34|4",
          "f|col35|4",
        ],
      },
      { "grp|ТСДЭ хийлэгж байсан|4|4": ["f|col36|1", "f|col37|3"] },
      { "grp|CABG хийлгэж байсан:|4|4": ["f|col38|1", "f|col39|3"] },
      { "grp|Бусад|4|4": ["f|col40|1", "f|col41|3"] },
    ],
  },
  {
    "grp|Пейсмейкер суулгах ажилбар|4|2": [
      "f|col42|4",
      { "grp|Үүсгүүрийн төлөв|4|4": ["f|col43|4", "f|col44|4"] },
      "f|col45|4",
      "f|col46|4",
    ],
  },

  {
    "grp|Баруун тосгуур|4|2": [
      "f|col47|4",
      "f|col51|4",
      "f|col54|4",
      "f|col57|4",
      "f|col61|2",
      "|2",
      "f|col64|2",
      "|2",
      "f|col67|2",
      "|2",
      "f|col70|2",
      "|2",
      "f|col73|2",
      "|2",
      "f|col76|2",
      "|2",
    ],
  },
  {
    "grp|Баруун ховдол|4|2": [
      "f|col48|4",
      "f|col52|4",
      "f|col55|4",
      "f|col58|4",
      "f|col62|2",
      "|2",
      "f|col65|2",
      "|2",
      "f|col68|2",
      "|2",
      "f|col71|2",
      "|2",
      "f|col74|2",
      "|2",
      "f|col77|2",
      "|2",
    ],
  },
  {
    "grp|Байрлал|4|2": [
      "f|col50|4",
      "f|col49|4",
      "f|col53|4",
      "f|col56|4",
      { "grp|Электродийн байрлал|4|4": ["f|col60|4", "f|col59|4"] },

      "f|col63|2",
      "|2",
      "f|col66|2",
      "|2",
      "f|col69|2",
      "|2",
      "f|col72|2",
      "|2",
      "f|col75|2",
      "|2",
      "f|col78|2",
      "|2",
    ],
  },
  {
    "grp|Pulse Generator|4|2": [
      "f|col79|4",
      "f|col81|2",
      "|2",
      "f|col82|2",
      "|2",
      "f|col83|4",
      "|2",
    ],
  },

  "f|col84|2",
  "f|col85|2",
  "f|col86|2",
  "f|col87|2",
  {
    "grp|Хүндрэл (эмнэлэгт байх үеийн)|4|2": ["f|col88|4"],
  },

  {
    "grp|Пейсмейкерийг эргүүлж авах ажилбар (зөвхөн хуучин үүсгүүр болон электродийг авч буй үед бөглөнө)|4|2":
      [
        "f|col90|2",
        "|2",
        { "grp|Загвар|4|4": ["f|col91|2", "f|col92|2"] },

        "f|col93|2",
        "|2",
        "f|col94|2",
        "|2",
        { "grp|Шалтгаан|4|4": ["f|col95|2", "f|col96|2"] },
        "f|col97|2",
        "|2",
        "f|col98|4",
        { "grp|Загвар|4|4": ["f|col99|2", "f|col100|2"] },

        "f|col101|2",
        "|2",
        "f|col102|2",
        "|2",
        { "grp|Шалтгаан|4|4": ["f|col103|2", "f|col104|2"] },
      ],
  },
];
