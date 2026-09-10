import { editors } from "newComponents/BaseControls/BaseField";
import { getLookupDataStore, list } from "utils/rest/dataSource";
import i18n from "i18n";

export default (dispatch) => {
  return {
    objectName: "TurulhiinGajig",
    title: i18n.t("Congenital malformation"),
    keyField: "id",
    labelField: "name",
    fields: {
      Id: { label: "Id", editor: { [editors.textBox]: {} } },
      col1: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM",
              maskInvalidMessage: "Формат буруу байна",
              maskChar: "",
              maskRules: {
                S: /[1-2]/,
                H: /[0,9]/,
                M: /[0-9]/,
              },
            },
          },
        },
      },
      col2: {
        label: "Үзлэгийн төрөл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op996859"] },
              }),
          },
        },
      },
      col3: {
        label: "Эрүүл мэндийн байгууллага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op997846"] },
              }),
          },
        },
      },
      col4: {
        label: "Зүрх судасны эрсдэлт хүчин зүйлс",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op436"] },
              }),
          },
        },
      },
      col5: {
        label: "Зовиур",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op1442"] },
              }),
          },
        },
      },
      col6: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col7: {
        label: "Жин (кг)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col8: {
        label: "Өндөр (см)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col9: {
        label: "АД (мм.муб)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col10: {
        label: "ЗЦ (уд/мин)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col11: {
        label: "АТ (уд/мин)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col12: {
        label: "Сатураци (%)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col13: {
        label: "Зүрхний Төрөлхийн Гажгийн -ын захын шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op999262"] },
              }),
          },
        },
      },
      col14: {
        label: "ЗТГ-ын уушгины шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op250"] },
              }),
          },
        },
      },
      col15: {
        label: "ЗТГ-ын зүрхний шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op2840"] },
              }),
          },
        },
      },
      col16: {
        label: "ЗТГ-ын хэвлийн шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op1852"] },
              }),
          },
        },
      },
      col17: {
        label: "Шуугианы шинж чанар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op1647"] },
              }),
          },
        },
      },
      col18: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col19: {
        label: "Улаан эс (х1012/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col20: {
        label: "Цагаан эс (x10^9/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col21: {
        label: "Ялтас эс (x10^9/л) ",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col22: {
        label: "Гемоглобин (г/дл)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col23: {
        label: "Kали (ммоль/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col24: {
        label: "Натри (ммоль/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col25: {
        label: "Креатинин",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col26: {
        label: "Мочевин (ОУН/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col27: {
        label: "Альбумин (г/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col28: {
        label: "eGFR (мл/мин)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col29: {
        label: "Алат (ОУН/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col30: {
        label: "СРБ (мг/дл)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col31: {
        label: "Асат (ОУН/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col32: {
        label: "ГГТ (ОУН/л)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col33: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col34: { label: "QRS бүрдэл (мс)", editor: { [editors.textBox]: {} } },
      col35: {
        label: "Зүрхний хэм",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op5430"] },
              }),
          },
        },
      },
      col36: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col37: {
        label: "Зүрхний хориг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op5243"] },
              }),
          },
        },
      },
      col38: { label: "Бусад", editor: { [editors.textBox]: {} } },

      // Зүрхний хэт авиан оношилгоо (ойрын үеийн)
      col39: {
        // label: "(ойрын үеийн) Огноо",
        label: " Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
        label: "Qp/Qs",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col41: {
        label: "LVDd (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col42: {
        label: "LVDs (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col43: {
        label: "IVSd (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col44: {
        label: "Lvmassi (тооцоолох)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col45: {
        label: "E/e’  (Med)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col46: {
        label: "E/e’  (Lat)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      // col45: {
      //   label: "e’  (Med)",
      //   editor: {
      //     [editors.numberBox]: {
      //       config: { format: { type: "fixedPoint", precision: 0 } },
      //     },
      //   },
      // },
      // col46: {
      //   label: "e’  (Lat)",
      //   editor: {
      //     [editors.numberBox]: {
      //       config: { format: { type: "fixedPoint", precision: 0 } },
      //     },
      //   },
      // },
      col47: {
        label: "Дундаж E/e’ (тооцоолох)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col48: {
        label: "LV GLS",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col49: {
        label: "ТХТЦоорхой байрлал",
        editor: { [editors.textArea]: {} },
      },
      col50: {
        label: "Шунтын чиглэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op4256"] },
              }),
          },
        },
      },
      col51: {
        label: "Шунтын урсгалын хурд: m/s",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col52: {
        label: "ХХТЦоорхой байрлал",
        editor: { [editors.textArea]: {} },
      },
      col53: {
        label: "Шунтын чиглэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op4256"] },
              }),
          },
        },
      },
      col54: {
        label: "Шунтын урсгалын хурд (m/s)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col55: {
        label: "Артерийн битүүрээгүй цорго",
        editor: { [editors.textArea]: {} },
      },
      col56: {
        label: "Үлдэц зуйван цонх ",
        editor: { [editors.textArea]: {} },
      },
      col57: {
        label: "RVOT vel. m/s",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col58: {
        label: "гипертрофи",
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
      col59: {
        label: "LV",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col60: {
        label: "LV ханын зузаан (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col61: {
        label: "LA ",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col62: {
        label: "LA ханын зузаан (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col63: {
        label: "PA : MPA (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col64: {
        label: "Rb (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col65: {
        label: "Lb (mm)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col66: {
        label: "PH: SPAP",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op969468"] },
              }),
          },
        },
      },
      col67: {
        // label: "Хавхлагын эмгэг",
        label: "",
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
      col68: { label: "Аортын хавхлага", editor: { [editors.textArea]: {} } },
      col69: {
        label: "Аортын хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op968480"] },
              }),
          },
        },
      },
      col70: {
        label: "Хоёр хавтаст хавхлага",
        editor: { [editors.textArea]: {} },
      },
      col71: {
        label: "Хоёр хавтаст хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op968685"] },
              }),
          },
        },
      },
      col72: {
        label: "Гурван хавтаст хавхлага",
        editor: { [editors.textArea]: {} },
      },
      col73: {
        label: "Гурван хавтаст хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op972077"] },
              }),
          },
        },
      },
      col74: {
        label: "Уушгины артерийн хавхлага",
        editor: { [editors.textArea]: {} },
      },
      col75: {
        label: "Уушгины артерийн хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op972282"] },
              }),
          },
        },
      },
      col76: {
        label: "Дүгнэлт: /Зүрхний ямар гажиг/",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op970884"] },
              }),
          },
        },
      },
      col77: { label: "Бусад", editor: { [editors.textBox]: {} } },

      //
      col78: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col79: {
        label: "ТТЕ (ТХТЦ-н хэмжээ)",
        editor: { [editors.textBox]: {} },
      },
      col80: {
        label: "ТEЕ (ТХТЦ-н хэмжээ)",
        editor: { [editors.textBox]: {} },
      },
      col81: {
        label: "Ирмэгүүд Anteroinferior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col82: {
        label: "Ирмэгүүд Anteroinferior",
        editor: { [editors.textBox]: {} },
      },
      col83: {
        label: "Ирмэгүүд Posterosuperior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col84: {
        label: "Ирмэгүүд Posterosuperior",
        editor: { [editors.textBox]: {} },
      },
      col85: {
        label: "Ирмэгүүд Aortic",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col86: { label: "Ирмэгүүд Aortic", editor: { [editors.textBox]: {} } },
      col87: {
        label: "Ирмэгүүд Posterior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col88: { label: "Ирмэгүүд Posterior", editor: { [editors.textBox]: {} } },
      col89: {
        label: "Ирмэгүүд Inferior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col90: { label: "Ирмэгүүд Inferior", editor: { [editors.textBox]: {} } },
      col91: {
        label: "Ирмэгүүд Superior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col92: { label: "Ирмэгүүд Superior", editor: { [editors.textBox]: {} } },
      col93: { label: "LA уртын хэмжээ", editor: { [editors.textBox]: {} } },
      col94: {
        label: "MV (AML-c LA-н posterior хана хүртэлх хэмжээ)",
        editor: { [editors.textBox]: {} },
      },
      col95: { label: "Венийн буруу оролт", editor: { [editors.textBox]: {} } },
      col96: { label: "УАД", editor: { [editors.textBox]: {} } },
      col97: { label: "БХ-н хэмжээ", editor: { [editors.textBox]: {} } },
      col98: { label: "БТ-н хэмжээ", editor: { [editors.textBox]: {} } },
      col99: { label: "TAPSE (mm)", editor: { [editors.textBox]: {} } },
      col100: { label: "Уушгины артери", editor: { [editors.textBox]: {} } },
      col101: {
        label: "Шунтын чиглэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op976865"] },
              }),
          },
        },
      },
      col102: {
        label: "БТ-н дундаж даралт",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col103: {
        label: "ЗТ-н дундаж даралт",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col104: {
        label: "УА-н дундаж даралт",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col105: {
        label: "Баллооны хэмжээ",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col106: {
        label: "ASD occlude-н xэмжээ",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col107: {
        label: "Fluoroscopy-хугацаа",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col108: { label: "Эмболи (агаарын)", editor: { [editors.textBox]: {} } },
      col109: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col110: {
        label: "QP/QS",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col111: {
        label: "RA",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col112: {
        label: "LA",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col113: {
        label: "RV",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col114: {
        label: "LV",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col115: {
        label: "PA",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col116: {
        label: "PH",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col117: {
        label: "PVR",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col118: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col119: {
        label: "Дүгнэлт",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op977070"] },
              }),
          },
        },
      },
      col120: {
        // label: "АХФС/ АРХ/ АРНС зөвлөсөн эсэх",
        labe: "",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op975486"] },
              }),
          },
        },
      },
      col121: {
        label: "Хэрэв АХФС зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op975878"] },
              }),
          },
        },
      },
      col122: { label: "Бусад, бичнэ үү", editor: { [editors.textBox]: {} } },
      col123: {
        label: "Хэрэв АРХ зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op979064"] },
              }),
          },
        },
      },
      col124: { label: "Бусад, бичнэ үү", editor: { [editors.textBox]: {} } },
      col125: {
        label: "Хэрэв АРНС зөвлөсөн бол тунг бичнэ үү",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col126: {
        label: "Дээрхээс аль нэгийг зөвлөөгүй бол шалтгааныг сонгоно уу",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op979474"] },
              }),
          },
        },
      },
      col127: { label: "Бусад,бичих", editor: { [editors.textBox]: {} } },
      col128: {
        // label: "Бета хориглогч зөвлөсөн эсэх",
        label: "",
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
      col129: {
        label:
          "Хэрэв ТИЙМ бол бета-хориглогчийн нэршлийг сонгож, тунг бичнэ үү",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op978281"] },
              }),
          },
        },
      },
      col130: { label: "Бусад, бичнэ үү", editor: { [editors.textArea]: {} } },
      col131: {
        label: "Хэрэв ҮГҮЙ бол шалтгааныг сонгоно уу",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op981468"] },
              }),
          },
        },
      },
      col132: { label: "Бусад, бичнэ үү", editor: { [editors.textBox]: {} } },
      col133: {
        // label: "Минералокортикоид рецепторын антагонист зөвлөсөн эсэх",
        label: "",
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
      col134: {
        label: "Хэрэв ТИЙМ бол эмийн нэршлийг сонгож, тунг бичнэ үү",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op980275"] },
              }),
          },
        },
      },
      col135: {
        label: "Тун (мг/хоног)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col136: {
        label: "Хэрэв ҮГҮЙ бол шалтгааныг сонгоно уу",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op980685"] },
              }),
          },
        },
      },
      col137: { label: "Бусад, бичнэ үү", editor: { [editors.textBox]: {} } },
      col138: {
        // label: "Антитромботик зөвлөсөн эсэх",
        label: "",
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
      col139: {
        label: "Хэрэв ТИЙМ бол эмийн нэршлийг сонгоно уу",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op984263"] },
              }),
          },
        },
      },
      col140: { label: "Бусад, бичнэ үү", editor: { [editors.textBox]: {} } },
      col141: {
        // label: "Дигоксин",
        label: "",
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
      col142: {
        label: "Тун (мг/хоног)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col143: {
        // label: "Шээс хөөх эмүүд",
        label: "",
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
      col144: {
        label: "Хэрэв ТИЙМ бол эмийн нэршлийг сонгож, тунг бичнэ үү",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op986461"] },
              }),
          },
        },
      },
      col145: {
        label: "Тун (мг/хоног)",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col146: {
        label: "",
        // label: "ХЯНАЛТ",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op986666"] },
              }),
          },
        },
      },
      col147: { label: "Тэмдэглэл", editor: { [editors.textArea]: {} } },
      col148: {
        label: "Мэс засалд орох үеийн (жин/өндөр/кг/см)",
        editor: { [editors.textBox]: {} },
      },
      col149: {
        label: "Мэс засалд орох үеийн нас",
        editor: { [editors.textBox]: {} },
      },
      col150: {
        label: "Мэс засалд орсон хугацаа",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col151: {
        label: "Мэс заслын өмнөх онош",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op985679"] },
              }),
          },
        },
      },
      col152: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col153: {
        label: "Төлөвлөсөн мэс засал",
        editor: { [editors.textBox]: {} },
      },
      col154: {
        label: "Хийгдсэн мэс засал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op951096"] },
              }),
          },
        },
      },
      col155: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col156: {
        label: "Нэмэлтээр хийгдсэн ажилбар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op949512"] },
              }),
          },
        },
      },
      col157: {
        // label: "Мэс заслын үеийн хүндрэл",
        label: "",
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
      col158: {
        label: "Тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op953108"] },
              }),
          },
        },
      },
      col159: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col160: {
        // label: "Мэс заслын дараах хожуу үеийн хүндрэл",
        label: "",
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
      col161: {
        label: "Тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op951916"] },
              }),
          },
        },
      },
      col162: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col163: {
        label: "Мэс заслын өмнө тасагт хэвтсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col164: { label: "Нийт хугацаа", editor: { [editors.textBox]: {} } },
      col165: {
        label: "Перфузийн хугацаа",
        editor: {
          [editors.numberBox]: {
            config: { format: { type: "fixedPoint", precision: 0 } },
          },
        },
      },
      col166: {
        label: "Аорт хавчсан хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col167: {
        label: "Мэдээгүйжүүлгийн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col168: {
        label: "Экстубаци хийгдсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col169: {
        label: "Мэс заслын дараах эрчимт эмчилгээний хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col170: {
        label: "Мэс заслын дараа тасагт хэвтсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col171: {
        label: "Эмнэлэгт нийт хэвтсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },

      //
      col172: {
        label: "Мэс засалд орох үеийн жин/өндөр",
        editor: { [editors.textBox]: {} },
      },
      col173: {
        label: "Мэс засалд орох үеийн нас",
        editor: { [editors.textBox]: {} },
      },
      col174: {
        label: "Мэс заслын өмнөх онош",
        editor: { [editors.textBox]: {} },
      },
      col175: {
        label: "Мэс заслын өмнө тасагт хэвтсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col176: {
        label: "Мэс заслын дараа тасагт хэвтсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col177: {
        label: "Эмнэлэгт нийт хэвтсэн хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col178: {
        label: "Төлөвлөсөн мэс засал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op952121"] },
              }),
          },
        },
      },
      col179: {
        label: "Хийгдсэн мэс засал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op952121"] },
              }),
          },
        },
      },
      col180: { label: "QP>QS харьцаа", editor: { [editors.textBox]: {} } },
      col181: { label: "Баллооны хэмжээ", editor: { [editors.textBox]: {} } },
      col182: {
        label: "ASD occlude-н xэмжээ",
        editor: { [editors.textBox]: {} },
      },
      col183: {
        label: "Fluoroscopy-хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col184: {
        // label: "БТ Хэмжээ Эмчилгээний өмнөх өдөр",
        label: "Эмчилгээний өмнөх өдөр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op955698"] },
              }),
          },
        },
      },
      col185: {
        // label: "БТ Хэмжээ Эмчилгээний 1дэх өдөр",
        label: "Эмчилгээний 1дэх өдөр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op955698"] },
              }),
          },
        },
      },
      col186: {
        // label: "БТ Хэмжээ Эмнэлгээс гарах өдөр",
        label: "Эмнэлгээс гарах өдөр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op955698"] },
              }),
          },
        },
      },
      col187: {
        // label: "БХ Хэмжээ Эмчилгээний өмнөх өдөр",
        label: "Эмчилгээний өмнөх өдөр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op955698"] },
              }),
          },
        },
      },
      col188: {
        // label: "БХ Хэмжээ Эмчилгээний 1дэх өдөр",
        label: "Эмчилгээний 1дэх өдөр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op955698"] },
              }),
          },
        },
      },
      col189: {
        // label: "БХ Хэмжээ Эмнэлгээс гарах өдөр",
        label: "Эмнэлгээс гарах өдөр",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op955698"] },
              }),
          },
        },
      },
      col190: {
        // label: "УАД Ихсэлт Эмчилгээний өмнөх өдөр",
        label: "",
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
      col191: {
        label: "Тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op960692"] },
              }),
          },
        },
      },
      col192: {
        label: "УАД Ихсэлт Эмчилгээний 1дэх өдөр",
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
      col193: {
        label: "Тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op960692"] },
              }),
          },
        },
      },
      col194: {
        label: "УАД Ихсэлт Эмнэлгээс гарах өдөр",
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
      col195: {
        label: "Тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op960692"] },
              }),
          },
        },
      },
      col196: {
        label: "Үлдэгдэл шунт Эмчилгээний өмнөх өдөр",
        editor: { [editors.textBox]: {} },
      },
      col197: {
        label: "Үлдэгдэл шунт Эмчилгээний 1дэх өдөр",
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
      col198: {
        label: "Үлдэгдэл шунт Эмнэлгээс гарах өдөр",
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
      col199: {
        label: "Перикардын шингэн Эмчилгээний өмнөх өдөр",
        editor: { [editors.textBox]: {} },
      },
      col200: {
        label: "Перикардын шингэн Эмчилгээний 1дэх өдөр",
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
      col201: {
        label: "Перикардын шингэн Эмнэлгээс гарах өдөр",
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
      col202: {
        label: "Хийн Эмболи Эмчилгээний өмнөх өдөр",
        editor: { [editors.textBox]: {} },
      },
      col203: {
        label: "Хийн Эмболи Эмчилгээний 1дэх өдөр",
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
      col204: {
        label: "Хийн Эмболи Эмнэлгээс гарах өдөр",
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
      col205: {
        label: "Device Эмболи Эмчилгээний өмнөх өдөр",
        editor: { [editors.textBox]: {} },
      },
      col206: {
        label: "Device Эмболи Эмчилгээний 1дэх өдөр",
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
      col207: {
        label: "Device Эмболи Эмнэлгээс гарах өдөр",
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
      col208: {
        label: "Тромбоэмболи Эмчилгээний өмнөх өдөр",
        editor: { [editors.textBox]: {} },
      },
      col209: {
        label: "Тромбоэмболи Эмчилгээний 1дэх өдөр",
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
      col210: {
        label: "Тромбоэмболи Эмнэлгээс гарах өдөр",
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
      col211: {
        label: "Амплатцер эмчилгээний дараа хүндрэл гарсан эсэх",
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
      col212: {
        label: "Тийм бол",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op966710"] },
              }),
          },
        },
      },
      col213: {
        label: "Амплацтер эмчилгээ хийлгээгүй шалгаан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op932128"] },
              }),
          },
        },
      },
      col214: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col215: {
        label: "ХЯНАЛТЫН ҮЗЛЭГИЙН ХУГАЦАА",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op929948"] },
              }),
          },
        },
      },
      col216: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col217: {
        label: "ЗОВИУР",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op1442"] },
              }),
          },
        },
      },
      col218: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col219: { label: "БОДИТ ҮЗЛЭГ", editor: { [editors.textBox]: {} } },
      col220: { label: "Жин (кг)", editor: { [editors.textBox]: {} } },
      col221: { label: "Өндөр (см)", editor: { [editors.textBox]: {} } },
      col222: { label: "АД (мм.муб)", editor: { [editors.textBox]: {} } },
      col223: { label: "ЗЦ (уд/мин)", editor: { [editors.textBox]: {} } },
      col224: { label: "АТ (уд/мин)", editor: { [editors.textBox]: {} } },
      col225: { label: "Сатураци (%)", editor: { [editors.textBox]: {} } },
      col226: {
        label: "Зүрхний төрөлхийн гажгийн захын шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op933544"] },
              }),
          },
        },
      },
      col227: {
        label: "ЗТГ-ын уушгины шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op250"] },
              }),
          },
        },
      },
      col228: {
        label: "ЗТГ-ын зүрхний шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op2840"] },
              }),
          },
        },
      },
      col229: {
        label: "ЗТГ-ын хэвлийн шинж тэмдэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op1852"] },
              }),
          },
        },
      },
      col230: {
        label: "Шуугианы шинж чанар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op936730"] },
              }),
          },
        },
      },
      col231: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col232: {
        // label: "Улаан эс: х1012/л",
        label: "Улаан эс (х1012/л)",
        editor: { [editors.textBox]: {} },
      },
      col233: {
        // label: "Цагаан эс:x109/л",
        label: "Цагаан эс (x10^9/л)",
        editor: { [editors.textBox]: {} },
      },
      col234: {
        // label: "Ялтас эс: x109/л",
        label: "Ялтас эс (x10^9/л)",
        editor: { [editors.textBox]: {} },
      },
      col235: {
        // label: "Гемоглобин:г/дл",
        label: "Гемоглобин (г/дл)",
        editor: { [editors.textBox]: {} },
      },
      col236: {
        // label: "Kали:ммоль/л",
        label: "Kали (ммоль/л)",
        editor: { [editors.textBox]: {} },
      },
      col237: {
        // label: "Натри:ммоль/л",
        label: "Натри (ммоль/л)",
        editor: { [editors.textBox]: {} },
      },
      col238: {
        // label: "Креатинин:мкмоль/л, мг/дл",
        label: "Креатинин",
        editor: { [editors.textBox]: {} },
      },
      col239: {
        // label: "Мочевин:ОУН/л",
        label: "Мочевин (ОУН/л)",
        editor: { [editors.textBox]: {} },
      },
      // col240: {
      //   label: "(сонгох)",
      //   editor: { [editors.textBox]: {} },
      // },
      col241: {
        // label: "Альбумин:г/л",
        label: "Альбумин (г/л)",
        editor: { [editors.textBox]: {} },
      },
      col242: {
        // label: "eGFR:мл/мин",
        label: "eGFR (мл/мин)",
        editor: { [editors.textBox]: {} },
      },
      col243: {
        label: "Алат: (ОУН/л) СРБ: (мг/дл)",
        editor: { [editors.numberBox]: {} },
      },
      col244: { label: "Асат: (ОУН/л)", editor: { [editors.numberBox]: {} } },
      col245: { label: "ГГТ: (ОУН/л)", editor: { [editors.numberBox]: {} } },
      col246: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col247: { label: "QRS бүрдэл (мс)", editor: { [editors.textBox]: {} } },
      col248: {
        label: "Зүрхний хэм",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op935742"] },
              }),
          },
        },
      },
      col249: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col250: {
        label: "Зүрхнйи хориг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op5243"] },
              }),
          },
        },
      },
      col251: {
        label: "Огноо",
        editor: {
          [editors.textBox]: {
            config: {
              mask: "SHMM-LM-JM",
              maskInvalidMessage: "Огноо алдаатай байна",
              maskChar: "",
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
      col252: { label: "Qp/Qs", editor: { [editors.textBox]: {} } },
      col253: { label: "LVDd (mm)", editor: { [editors.textBox]: {} } },
      col254: { label: "LVDsmm", editor: { [editors.textBox]: {} } },
      col255: { label: "IVSd (mm)", editor: { [editors.textBox]: {} } },
      col256: {
        label: "LVmassi (тооцоолох)",
        editor: { [editors.textBox]: {} },
      },
      col257: { label: "E/e’( Med, Lat)", editor: { [editors.textBox]: {} } },
      col258: {
        label: "Дундаж E/e’(тооцоолох)",
        editor: { [editors.textBox]: {} },
      },
      col259: {
        label: "LVEF (Simpson method):%",
        editor: { [editors.textBox]: {} },
      },
      col260: { label: "LV GLS: ", editor: { [editors.textBox]: {} } },
      col261: {
        label: "ТХТЦоорхой байрлал, хэлбэр, хэмжээ мм",
        editor: { [editors.textBox]: {} },
      },
      col262: {
        label: "Шунтын чиглэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op4256"] },
              }),
          },
        },
      },
      col263: {
        // label: "Шунтын урсгалын хурд: m/s",
        label: "Шунтын урсгалын хурд (m/s)",
        editor: { [editors.textBox]: {} },
      },
      col264: {
        label: "ХХТЦоорхой байрлал, хэлбэр, хэмжээ (мм)",
        editor: { [editors.textBox]: {} },
      },
      col265: {
        label: "Шунтын чиглэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op4256"] },
              }),
          },
        },
      },
      col266: {
        label: "Шунтын урсгалын хурд (m/s)",
        editor: { [editors.textBox]: {} },
      },
      col267: {
        label: "Артерийн битүүрээгүй цорго",
        editor: { [editors.textBox]: {} },
      },
      col268: {
        label: "Үлдэц зуйван цонх ",
        editor: { [editors.textBox]: {} },
      },
      col269: { label: "RVOT vel (m/s)", editor: { [editors.textBox]: {} } },
      col270: {
        label: "Гипертрофи",
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
      col271: {
        label: "RV, ханын зузаан  (mm)",
        editor: { [editors.textBox]: {} },
      },
      col272: {
        label: "RA, ханын зузаан  (mm)",
        editor: { [editors.textBox]: {} },
      },
      col273: { label: "TAPSE (mm)", editor: { [editors.textBox]: {} } },
      col274: { label: "RV FAC", editor: { [editors.textBox]: {} } },
      col275: { label: "RV strain", editor: { [editors.textBox]: {} } },
      col276: { label: "LVOT vel. m/s", editor: { [editors.textBox]: {} } },
      col277: {
        label: "Гипертрофи",
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
      col278: {
        label: "LV, ханын зузаан (mm)",
        editor: { [editors.textBox]: {} },
      },
      col279: {
        label: "LA, ханын зузаан (mm)",
        editor: { [editors.textBox]: {} },
      },
      col280: { label: "PA, MPA (mm)", editor: { [editors.textBox]: {} } },
      col281: { label: "Rbmm", editor: { [editors.textBox]: {} } },
      col282: { label: "Lbmm", editor: { [editors.textBox]: {} } },
      col283: { label: "PH: SPAP", editor: { [editors.textBox]: {} } },
      col284: {
        label: "Аортын хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op968480"] },
              }),
          },
        },
      },
      col285: { label: "Аортын хавхлага", editor: { [editors.textBox]: {} } },
      col286: {
        label: "Хоёр хавтаст хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op939748"] },
              }),
          },
        },
      },
      col287: {
        label: "Хоёр хавтаст хавхлага",
        editor: { [editors.textBox]: {} },
      },
      col288: {
        label: "Гурван хавтаст хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op943326"] },
              }),
          },
        },
      },
      col289: {
        label: "Гурван хавтаст хавхлага",
        editor: { [editors.textBox]: {} },
      },
      col290: {
        label: "Уушгины артерийн хавхлага",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op943140"] },
              }),
          },
        },
      },
      col291: {
        label: "Уушгины артерийн хавхлага",
        editor: { [editors.textBox]: {} },
      },
      col292: {
        label: "Дүгнэлт: /Зүрхний ямар гажиг/",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op970884"] },
              }),
          },
        },
      },
      col293: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col294: {
        label: "Огноо",
        editor: {
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
      col295: {
        label: "ТТЕ (ТХТЦ-н хэмжээ)",
        editor: { [editors.textBox]: {} },
      },
      col296: {
        label: "ТEЕ (ТХТЦ-н хэмжээ)",
        editor: { [editors.textBox]: {} },
      },
      col297: {
        label: "Ирмэгүүд Anteroinferior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col298: {
        label: "Ирмэгүүд Anteroinferior",
        editor: { [editors.textBox]: {} },
      },
      col299: {
        label: "Ирмэгүүд Posterosuperior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col300: {
        label: "Ирмэгүүд Posterosuperior",
        editor: { [editors.textBox]: {} },
      },
      col301: {
        label: "Ирмэгүүд Aortic",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col302: { label: "Ирмэгүүд Aortic", editor: { [editors.textBox]: {} } },
      col303: {
        label: "Ирмэгүүд Posterior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col304: {
        label: "Ирмэгүүд Posterior",
        editor: { [editors.textBox]: {} },
      },
      col305: {
        label: "Ирмэгүүд Inferior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col306: { label: "Ирмэгүүд Inferior", editor: { [editors.textBox]: {} } },
      col307: {
        label: "Ирмэгүүд Superior",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op971089"] },
              }),
          },
        },
      },
      col308: { label: "Ирмэгүүд Superior", editor: { [editors.textBox]: {} } },
      col309: { label: "LA уртын хэмжээ", editor: { [editors.textBox]: {} } },
      col310: {
        label: "MV (AML-c LA-н posterior хана хүртэлх хэмжээ)",
        editor: { [editors.textBox]: {} },
      },
      col311: {
        label: "Венийн буруу оролт",
        editor: { [editors.textBox]: {} },
      },
      col312: { label: "УАД", editor: { [editors.textBox]: {} } },
      col313: { label: "БХ-н хэмжээ", editor: { [editors.textBox]: {} } },
      col314: { label: "БТ-н хэмжээ", editor: { [editors.textBox]: {} } },
      col315: { label: "TAPSE (mm)", editor: { [editors.textBox]: {} } },
      col316: { label: "Уушгины артери", editor: { [editors.textBox]: {} } },
      col317: {
        label: "Шунтын чиглэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op976865"] },
              }),
          },
        },
      },
      col318: {
        label: "БТ-н дундаж даралт",
        editor: { [editors.textBox]: {} },
      },
      col319: {
        label: "ЗТ-н дундаж даралт",
        editor: { [editors.textBox]: {} },
      },
      col320: {
        label: "УА-н дундаж даралт",
        editor: { [editors.textBox]: {} },
      },
      col321: { label: "Баллооны хэмжээ", editor: { [editors.textBox]: {} } },
      col322: {
        label: "ASD occlude-н xэмжээ",
        editor: { [editors.textBox]: {} },
      },
      col323: {
        label: "Fluoroscopy-хугацаа",
        editor: { [editors.textBox]: {} },
      },
      col324: { label: "Эмболи (агаарын)", editor: { [editors.textBox]: {} } },
    },
  };
};

export const layout = [
  {
    "grp|АМБУЛАТОРИЙН ҮЗЛЭГИЙН БҮРТГЭЛ|4|4": [
      "f|col1|2",
      "|2",
      "f|col2|4",
      // "|2",
      "f|col3|4",
      "f|col4|4",
      "f|col5|4",
      "f|col6|3",
      "|",
      {
        "grp|Бодит үзлэг|4|4": [
          "f|col7|2",
          "|2",
          "f|col8|2",
          "|2",
          "f|col9|2",
          "|2",
          "f|col10|2",
          "|2",
          "f|col11|2",
          "|2",
          "f|col12|2",
          "|2",
        ],
      },
    ],
  },
  {
    "grp|ОНОШИЛГОО, ШИНЖИЛГЭЭ|4|2": [
      {
        "grp|Лабораторийн шинжилгээ|4|4": [
          "f|col13|4",
          "f|col14|4",
          "f|col15|4",
          "f|col16|4",
          "f|col17|4",
          "f|col18|2",
          "|2",
          "f|col19|2",
          "f|col20|2",
          "f|col21|2",
          "f|col22|2",
          "f|col23|2",
          "f|col24|2",
          "f|col25|2",
          "f|col26|2",
          "f|col27|2",
          "f|col28|2",
          "f|col29|2",
          "f|col30|2",
          "f|col31|2",
          "f|col32|2",
        ],
      },
      {
        "grp|Зүрхний цахилгаан бичлэг|4|4": [
          "f|col33|2",
          "|2",
          "f|col34|2",
          "|2",
          "f|col35|4",
          "f|col36|4",
          "f|col37|4",
          "f|col38|4",
        ],
      },
      {
        "grp|Зүрхний хэт авиан оношилгоо|4|4": [
          "f|col39|2",
          "|2",
          "f|col40|2",
          "f|col41|2",
          "f|col42|2",
          "f|col43|2",
          "f|col44|2",
          "f|col45|2",
          "f|col46|2",
          "f|col47|2",
          "f|col48|2",
          "f|col49|2",
          "f|col50|4",
          "f|col51|4",
          "f|col52|4",
          "f|col53|4",
          "f|col54|4",
          "f|col55|4",
          "f|col56|4",
          "f|col57|2",
          "|2",
          "f|col58|2",
          "f|col59|2",
          "f|col60|2",
          "f|col61|2",
          "f|col62|2",
          "f|col63|2",
          "f|col64|2",
          "f|col65|2",
          "f|col66|4",
        ],
      },
    ],
  },
  {
    "grp|Хавхлагын эмгэг|4|4": [
      "f|col67|2",
      "|2",
      "f|col68|4",
      "f|col69|4",
      "f|col70|4",
      "f|col71|4",
      "f|col72|4",
      "f|col73|4",
      "f|col74|4",
      "f|col75|4",
      "f|col76|4",
      "f|col77|4",
    ],
  },
  {
    "grp|Улаан хоолойн зүрхний хэт авиан шинжилгээ|4|4": [
      "f|col78|2",
      "|2",
      "f|col79|4",
      "f|col80|4",
      {
        "grp|Ирмэгүүд|4|4": [
          "f|col81|4",
          "f|col82|4",
          "f|col83|4",
          "f|col84|4",
          "f|col85|4",
          "f|col86|4",
          "f|col87|4",
          "f|col88|4",
          "f|col89|4",
          "f|col90|4",
          "f|col91|4",
          "f|col92|4",
        ],
      },
      "f|col93|4",
      "f|col94|4",
      "f|col95|4",
      "f|col96|4",
      "f|col97|4",
      "f|col98|4",
      "f|col99|4",
      "f|col100|4",
      "f|col101|4",
      "f|col102|4",
      "f|col103|4",
      "f|col104|4",
      "f|col105|4",
      "f|col106|4",
      "f|col107|4",
      "f|col108|4",
    ],
  },

  {
    "grp|Катетр ангиографи|4|4": [
      "f|col109|2",
      "|2",
      "f|col110|2",
      "f|col111|2",
      "f|col112|2",
      "f|col113|2",
      "f|col114|2",
      "f|col115|2",
      "f|col116|2",
      "f|col117|2",
    ],
  },

  {
    "Титэм судсан дотуурх оношилгоо |4|4": ["f|col118|2", "|2", "f|col119|4"],
  },

  {
    "grp|ЭМИЙН ЭМЧИЛГЭЭ|4|4": [
      {
        "grp|АХФС/ АРХ/ АРНС зөвлөсөн эсэх|4|4": [
          "f|col120|3",
          "|",
          "f|col121|4",
          "f|col122|4",
          "f|col123|4",
          "f|col124|4",
          "f|col125|4",
          "f|col126|4",
          "f|col127|4",
        ],
      },
      {
        "grp|Бета хориглогч зөвлөсөн эсэх|4|4": [
          "f|col128|2",
          "|2",
          "f|col129|4",
          "f|col130|4",
          "f|col131|4",
          "f|col132|4",
        ],
      },
      {
        "grp|Минералокортикоид рецепторын антагонист зөвлөсөн эсэх|4|4": [
          "f|col133|2",
          "|2",
          "f|col134|4",
          "f|col135|4",
          "f|col136|4",
          "f|col137|4",
        ],
      },
      {
        "grp|Антитромботик зөвлөсөн эсэх|4|4": [
          "f|col138|2",
          "|2",
          "f|col139|4",
          "f|col140|4",
        ],
      },
      { "grp|Дигоксин|4|4": ["f|col141|2", "|2", "f|col142|4"] },
      {
        "grp|Шээс хөөх эмүүд|4|4": [
          "f|col143|2",
          "|2",
          "f|col144|4",
          "f|col145|4",
        ],
      },
    ],
  },

  {
    "grp|ХЯНАЛТ|4|4": [
      { "grp|Амбулаториор давтан үзэх|4|4": ["f|col146|4", "f|col147|4"] },
    ],
  },

  {
    "grp|НЭЭЛТТЭЙ ЗҮРХНИЙ МЭС ЗАСАЛ|4|4": [
      {
        "grp|Мэс засал эмчилгээ|4|4": [
          "f|col148|4",
          "f|col149|4",
          "f|col150|4",
          "f|col151|4",
          "f|col152|4",
          "f|col153|4",
          "f|col154|4",
          "f|col155|4",
          "f|col156|4",
        ],
      },
      {
        "grp|Мэс заслын үеийн хүндрэл|4|4": [
          "f|col157|2",
          "2",
          "f|col158|4",
          "f|col159|4",
        ],
      },
      { "grp|Мэс заслын дараах эрт үеийн хүндрэл|4|4": [] },
      {
        "grp|Мэс заслын хугацаа|4|4": [
          "f|col164|4",
          "f|col165|4",
          "f|col166|4",
          "f|col167|4",
        ],
      },
      {
        "grp|Мэс заслын дараах хожуу үеийн хүндрэл|4|4": [
          "f|col160|2",
          "2",
          "f|col161|4",
          "f|col162|4",
          "f|col163|4",
        ],
      },
      "f|col168|4",
      "f|col169|4",
      "f|col170|4",
      "f|col171|4",
    ],
  },

  {
    "grp|СУДСАН ДОТУУРХ АЖИЛБАР|4|4": [
      "f|col172|4",
      "f|col173|4",
      "f|col174|4",
      "f|col175|4",
      "f|col176|4",
      "f|col177|4",
      "f|col178|4",
      "f|col179|4",
      "f|col180|4",
      "f|col181|4",
      "f|col182|4",
      "f|col183|4",
      { "grp|БТ Хэмжээ|4|4": ["f|col184|4", "f|col185|4", "f|col186|4"] },
      { "grp|БХ Хэмжээ|4|4": ["f|col187|4", "f|col188|4", "f|col189|4"] },
      { "grp|БХ Хэмжээ|4|4": [] },
    ],
  },

  "f|col190|",
  "f|col191|",
  "f|col192|",
  "f|col193|",
  "f|col194|",
  "f|col195|",
  "f|col196|",
  "f|col197|",
  "f|col198|",
  "f|col199|",
  "f|col200|",
  "f|col201|",
  "f|col202|",
  "f|col203|",
  "f|col204|",
  "f|col205|",
  "f|col206|",
  "f|col207|",
  "f|col208|",
  "f|col209|",
  "f|col210|",
  "f|col211|",
  "f|col212|",
  "f|col213|",
  "f|col214|",
  "f|col215|",
  "f|col216|",
  "f|col217|",
  "f|col218|",
  "f|col219|",
  "f|col220|",
  "f|col221|",
  "f|col222|",
  "f|col223|",
  "f|col224|",
  "f|col225|",
  "f|col226|",
  "f|col227|",
  "f|col228|",
  "f|col229|",
  "f|col230|",
  "f|col231|",
  "f|col232|",
  "f|col233|",
  "f|col234|",
  "f|col235|",
  "f|col236|",
  "f|col237|",
  "f|col238|",
  "f|col239|",
  // "f|col240|",
  "f|col241|",
  "f|col242|",
  "f|col243|",
  "f|col244|",
  "f|col245|",
  "f|col246|",
  "f|col247|",
  "f|col248|",
  "f|col249|",
  "f|col250|",
  "f|col251|",
  "f|col252|",
  "f|col253|",
  "f|col254|",
  "f|col255|",
  "f|col256|",
  "f|col257|",
  "f|col258|",
  "f|col259|",
  "f|col260|",
  "f|col261|",
  "f|col262|",
  "f|col263|",
  "f|col264|",
  "f|col265|",
  "f|col266|",
  "f|col267|",
  "f|col268|",
  "f|col269|",
  "f|col270|",
  "f|col271|",
  "f|col272|",
  "f|col273|",
  "f|col274|",
  "f|col275|",
  "f|col276|",
  "f|col277|",
  "f|col278|",
  "f|col279|",
  "f|col280|",
  "f|col281|",
  "f|col282|",
  "f|col283|",
  "f|col284|",
  "f|col285|",
  "f|col286|",
  "f|col287|",
  "f|col288|",
  "f|col289|",
  "f|col290|",
  "f|col291|",
  "f|col292|",
  "f|col293|",
  "f|col294|",
  "f|col295|",
  "f|col296|",
  "f|col297|",
  "f|col298|",
  "f|col299|",
  "f|col300|",
  "f|col301|",
  "f|col302|",
  "f|col303|",
  "f|col304|",
  "f|col305|",
  "f|col306|",
  "f|col307|",
  "f|col308|",
  "f|col309|",
  "f|col310|",
  "f|col311|",
  "f|col312|",
  "f|col313|",
  "f|col314|",
  "f|col315|",
  "f|col316|",
  "f|col317|",
  "f|col318|",
  "f|col319|",
  "f|col320|",
  "f|col321|",
  "f|col322|",
  "f|col323|",
  "f|col324|",
];
