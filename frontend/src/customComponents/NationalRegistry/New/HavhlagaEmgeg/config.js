import { editors } from "newComponents/BaseControls/BaseField";
import { list } from "utils/rest/dataSource";
import i18n from "i18n";

export default () => {
  return {
    objectName: "InvType",
    title: i18n.t("InvType"),
    keyField: "id",
    labelField: "name",
    fields: {
      Id: { label: "Id", editor: { [editors.textBox]: {} } },
      col1: {
        label: "Тогтмол хэрэглэж байгаа эм, тариа",
        editor: { [editors.textArea]: {} },
      },
      col2: {
        label: "Харвалт",
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
      col3: {
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
      col4: { label: "WBC", editor: { [editors.textBox]: {} } },
      col5: { label: "RBC", editor: { [editors.textBox]: {} } },
      col6: { label: "Hb", editor: { [editors.textBox]: {} } },
      col7: { label: "HCT", editor: { [editors.textBox]: {} } },
      col8: { label: "PLT", editor: { [editors.textBox]: {} } },
      col9: { label: "СОЭ", editor: { [editors.textBox]: {} } },
      col10: { label: "PT", editor: { [editors.textBox]: {} } },
      col11: { label: "INR", editor: { [editors.textBox]: {} } },
      col12: { label: "fibrinogen", editor: { [editors.textBox]: {} } },
      col13: { label: "TT", editor: { [editors.textBox]: {} } },
      col14: { label: "APTT", editor: { [editors.textBox]: {} } },
      col15: { label: "Мочевин", editor: { [editors.textBox]: {} } },
      col16: { label: "Креатинин", editor: { [editors.textBox]: {} } },
      col17: { label: "ASLO", editor: { [editors.textBox]: {} } },
      col18: { label: "CRB", editor: { [editors.textBox]: {} } },
      col19: { label: "RF", editor: { [editors.textBox]: {} } },
      col20: { label: "Нийт уураг (г/л)", editor: { [editors.textBox]: {} } },
      col21: { label: "Альбумин", editor: { [editors.textBox]: {} } },
      col22: { label: "АСАТ", editor: { [editors.textBox]: {} } },
      col23: { label: "АЛАТ", editor: { [editors.textBox]: {} } },
      col24: { label: "Нийт Билирубин", editor: { [editors.textBox]: {} } },
      col25: { label: "ГГТ", editor: { [editors.textBox]: {} } },
      col26: { label: "Глюкоз", editor: { [editors.textBox]: {} } },
      col27: {
        label: "HbsAg",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op535580"] },
              }),
          },
        },
      },
      col28: {
        label: "HCV",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op535580"] },
              }),
          },
        },
      },
      col29: {
        label: "Тэмбүү",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op535580"] },
              }),
          },
        },
      },
      col30: {
        label: "HIV",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op535580"] },
              }),
          },
        },
      },
      col31: {
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
      col32: {
        label: "Хэмнэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op538170"] },
              }),
          },
        },
      },
      col33: { label: "Бусад бичих", editor: { [editors.textBox]: {} } },
      col34: {
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
      col35: { label: "LVDd (mm)", editor: { [editors.textBox]: {} } },
      col36: { label: "LVDs (mm)", editor: { [editors.textBox]: {} } },
      col37: { label: "IVSd (mm)", editor: { [editors.textBox]: {} } },
      col38: { label: "PWd (mm)", editor: { [editors.textBox]: {} } },
      col39: {
        label: "Lvmassi (тооцоолох)",
        editor: { [editors.textBox]: {} },
      },
      col40: {
        label: "LVEF (Simpson method) %",
        editor: { [editors.textBox]: {} },
      },
      col41: { label: "LV GLS", editor: { [editors.textBox]: {} } },
      col42: {
        label: "LA volume ml (тооцоолох)",
        editor: { [editors.textBox]: {} },
      },
      col43: { label: "E/e’ (Med)", editor: { [editors.textBox]: {} } },
      col44: { label: "E/e’ (Lat)", editor: { [editors.textBox]: {} } },
      // col43: {
      //   label: "e’ (Med)",
      //   editor: { [editors.textBox]: {} },
      // },
      // col44: {
      //   label: "e’ (Lat)",
      //   editor: { [editors.textBox]: {} },
      // },
      col45: {
        label: "Дундаж E/e’ (тооцоолох)",
        editor: { [editors.textBox]: {} },
      },
      col46: {
        label: "Таславч e’ (см/сек)",
        editor: { [editors.textBox]: {} },
      },
      col47: {
        label: "Хажуу хана e’ (см/сек)",
        editor: { [editors.textBox]: {} },
      },
      col48: {
        label: "Уушгины артерийн систолын даралт (мм.муб)",
        editor: { [editors.textBox]: {} },
      },
      col49: { label: "TAPSE (мм)", editor: { [editors.textBox]: {} } },
      col50: { label: "RV FAC (%)", editor: { [editors.textBox]: {} } },
      col51: {
        label: "2 Хавтаст хавхлагын нарийсал",
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
      col52: {
        label: "Хавхлагын эмгэгийн шалтгаан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op536977"] },
              }),
          },
        },
      },
      col53: { label: "Бусад (бичих)", editor: { [editors.textBox]: {} } },
      col54: {
        label: "Хүндийн зэрэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op536791"] },
              }),
          },
        },
      },
      col55: {
        label: "2 хавтаст хавхлагын онгойлтын талбай (planometry) (см2)",
        editor: { [editors.textBox]: {} },
      },
      col56: { label: "(PNT) (см2)", editor: { [editors.textBox]: {} } },
      col57: { label: "MV mean PG (mmHg)", editor: { [editors.textBox]: {} } },
      col58: { label: "MV PHT", editor: { [editors.textBox]: {} } },
      col59: {
        label: "Вилкинсийн шалгуур оноо",
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
      col60: {
        label: "2 Хавтаст хавхлагын дутагдал",
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
      col61: {
        label: "Хавхлагын эмгэгийн шалтгаан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op536977"] },
              }),
          },
        },
      },
      col62: { label: "Бусад (бичих)", editor: { [editors.textBox]: {} } },
      col63: {
        label: "Хүндийн зэрэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op536791"] },
              }),
          },
        },
      },
      col64: { label: "MR EROA (см2)", editor: { [editors.textBox]: {} } },
      col65: { label: "MR Vena contract", editor: { [editors.textBox]: {} } },
      col66: { label: "MR Volume (ml)", editor: { [editors.textBox]: {} } },
      col67: {
        label: "MR Fraction rate (%)",
        editor: { [editors.textBox]: {} },
      },
      col68: {
        label: "MR урсгалын зүүн тосгуурт эзлэх хувь (%)",
        editor: { [editors.textBox]: {} },
      },
      col69: {
        label: "Гол судасны хавхлагын нарийсал",
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
      col70: {
        label: "Хавхлагын эмгэгийн шалтгаан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op539195"] },
              }),
          },
        },
      },
      col71: { label: "Бусад (бичих)", editor: { [editors.textBox]: {} } },
      col72: {
        label: "Хүндийн зэрэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op536791"] },
              }),
          },
        },
      },
      col73: {
        label: "Гол судасны хавхлагын онгойлтын талбай (planometry) (см2)",
        editor: { [editors.textBox]: {} },
      },
      col74: { label: "AoV mean PG (mmHg)", editor: { [editors.textBox]: {} } },
      col75: { label: "AoV V max (m/sec)", editor: { [editors.textBox]: {} } },
      col76: { label: "AoV PG max (mm)", editor: { [editors.textBox]: {} } },
      col77: {
        label: "Гол судасны хавхлагын дутагдал",
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
      col78: {
        label: "Хавхлагын эмгэгийн шалтгаан",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op539195"] },
              }),
          },
        },
      },
      col79: { label: " Бусад (бичих)", editor: { [editors.textBox]: {} } },
      col80: {
        label: "Хүндийн зэрэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op536791"] },
              }),
          },
        },
      },
      col81: { label: "AoReg PHT (m/sec)", editor: { [editors.textBox]: {} } },
      col82: { label: "AoR vol (ml)", editor: { [editors.textBox]: {} } },
      col83: { label: "AoR EROA (см2)", editor: { [editors.textBox]: {} } },
      col84: {
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
      col85: {
        label: "Дүгнэлт",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op541580"] },
              }),
          },
        },
      },
      col86: { label: "Бусад бичих", editor: { [editors.textBox]: {} } },
      col87: {
        label: "Цээжний рентген зураг: КТИ тодорхойлох (%)",
        editor: { [editors.textBox]: {} },
      },
      col88: { label: "Агатсоны оноо", editor: { [editors.numberBox]: {} } },
      col89: { label: "Кальцийн оноо", editor: { [editors.numberBox]: {} } },
      col90: {
        label: "Нян илэрсэн эсэх",
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
      col91: {
        label: "Нян / төрөл зүйлийг бичих",
        editor: { [editors.textBox]: {} },
      },
      col92: {
        label: "EuroScore Logistic (%)",
        editor: { [editors.textBox]: {} },
      },
      col93: { label: "Жин", editor: { [editors.textBox]: {} } },
      col94: { label: "Өндөр", editor: { [editors.textBox]: {} } },
      col95: {
        label: "Тамхи",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op545362"] },
              }),
          },
        },
      },
      col96: {
        label: "Чихрийн шижин",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op546163"] },
              }),
          },
        },
      },
      col97: {
        label: "Артерийн даралт ихсэлт",
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
      col98: {
        label: "Өөх тосны солилцооны өөрчлөлт",
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
      col99: {
        label: "Бөөрний эмгэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op544990"] },
              }),
          },
        },
      },
      col100: {
        label: "Уушгины архаг өвчин",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op547580"] },
              }),
          },
        },
      },
      col101: {
        label: "Бусад судасны эмгэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op548567"] },
              }),
          },
        },
      },
      col102: {
        label: "Тархины судасны эмгэг",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op546573"] },
              }),
          },
        },
      },
      col103: {
        label: "Мэдрэлийн үйл ажиллагааны алдагдал",
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
        label: "Гүрээний артерийн шум (Carotid bruits)",
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
      col105: {
        label: "Мэс заслын өмнөх зүрхний хэмнэл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op549965"] },
              }),
          },
        },
      },
      col106: { label: "Бусад", editor: { [editors.textBox]: {} } },
      col107: {
        label: "Гол судасны хавхлага нарийсал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col108: {
        label: "Гол судасны хавхлага дутагдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col109: {
        label: "Гол судасны хавхлагын мэс ажилбар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op549778"] },
              }),
          },
        },
      },
      col110: {
        label: "Гол судасны хавхлага имплантын төрөл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op552573"] },
              }),
          },
        },
      },
      col111: {
        label: "Митраль хавхлага нарийсал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col112: {
        label: "Митраль хавхлага дутагдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col113: {
        label: "Митраль хавхлагын мэс ажилбар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op549778"] },
              }),
          },
        },
      },
      col114: {
        label: "Митраль хавхлага имплантын төрөл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op551586"] },
              }),
          },
        },
      },
      col115: {
        label: "3 хавтаст хавхлага (трикуспид) нарийсал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col116: {
        label: "3 хавтаст хавхлага (трикуспид) дутагдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col117: {
        label: "3 хавтаст  (трикуспид) хавхлагын мэс ажилбар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op549778"] },
              }),
          },
        },
      },
      col118: {
        label: "3 хавтаст хавхлага (трикуспид) имплантын төрөл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op551586"] },
              }),
          },
        },
      },
      col119: {
        label: "УА-н хавхлага нарийсал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col120: {
        label: "УА-н хавхлага дутагдал",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op550971"] },
              }),
          },
        },
      },
      col121: {
        label: "УА-н хавхлагын мэс ажилбар",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op549778"] },
              }),
          },
        },
      },
      col122: {
        label: "УА-н хавхлага имплантын төрөл",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op518009"] },
              }),
          },
        },
      },
      col123: {
        label: "Имплантын код (4 код бичнэ)",
        editor: { [editors.textBox]: {} },
      },
      col124: {
        label: "St.Jude Medical",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op518214"] },
              }),
          },
        },
      },
      col125: {
        label: "Medtronic",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op521400"] },
              }),
          },
        },
      },
      col126: {
        label: "Бентал мэс ажилбар",
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
      col127: {
        label: "Дэвид мэс ажилбар",
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
      col128: {
        label: "Цус алдагдал",
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
        label: "Хэм алдагдал",
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
      col130: {
        label: "Тархины цус харвалт",
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
      col131: {
        label: "Олон эрхтэний дутагдал",
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
      col132: {
        label: "Үжил",
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
      col133: {
        label: "Мэс заслын дараах ЭХОКГ хяналт",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op522611"] },
              }),
          },
        },
      },
      col134: {
        label: "Хиймэл хавхлагын төрөл, хэмжээ",
        editor: { [editors.textBox]: {} },
      },
      col135: {
        label: "Мэс засал хийгдсэн огноо",
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
      col136: {
        label: "АД систол (мм.муб)",
        editor: { [editors.textBox]: {} },
      },
      col137: {
        label: "АД диастол (мм.муб)",
        editor: { [editors.textBox]: {} },
      },
      col138: { label: "Пульс (удаа/мин)", editor: { [editors.textBox]: {} } },
      col139: { label: "Өндөр (см)", editor: { [editors.textBox]: {} } },
      col140: { label: "Жин (кг)", editor: { [editors.textBox]: {} } },
      col141: { label: "БЖИ (кг/м2)", editor: { [editors.textBox]: {} } },
      col142: {
        label: "Хавхлагын гадуурх урсгал",
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
      col143: {
        label: "Хиймэл хавхлагын бүтэц, хөдөлгөөн",
        editor: {
          [editors.radioBox]: {
            config: { valueExpr: "id", displayExpr: "label" },
            dataSource: () =>
              list({
                objectName: "vwOptionValues",
                key: "id",
                options: { rootFilter: ["optionName", "=", "op526394"] },
              }),
          },
        },
      },
      col144: {
        label: "Хиймэл хавхлагын дундаж даралт (mean PG) (mmHg)",
        editor: { [editors.textBox]: {} },
      },
      col145: {
        label: "Регургитацийн хүндийн зэрэг",
        editor: { [editors.textBox]: {} },
      },
      col146: { label: "Зүүн тосгуур (см)", editor: { [editors.textBox]: {} } },
      col147: { label: "зүүн ховдлын (см)", editor: { [editors.textBox]: {} } },
      col148: {
        label: "Зүүн ховдлын агших чадвар (%)",
        editor: { [editors.textBox]: {} },
      },
      col149: {
        label: "УАД ихсэлт",
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
      col150: { label: "SPAP (mmHg)", editor: { [editors.textBox]: {} } },
      col151: { label: "INR", editor: { [editors.textBox]: {} } },
    },
  };
};

export const layout = [
  "f|col1|",
  "f|col2|",
  "f|col3|",
  "f|col4|",
  "f|col5|",
  "f|col6|",
  "f|col7|",
  "f|col8|",
  "f|col9|",
  "f|col10|",
  "f|col11|",
  "f|col12|",
  "f|col13|",
  "f|col14|",
  "f|col15|",
  "f|col16|",
  "f|col17|",
  "f|col18|",
  "f|col19|",
  "f|col20|",
  "f|col21|",
  "f|col22|",
  "f|col23|",
  "f|col24|",
  "f|col25|",
  "f|col26|",
  "f|col27|",
  "f|col28|",
  "f|col29|",
  "f|col30|",
  "f|col31|",
  "f|col32|",
  "f|col33|",
  "f|col34|",
  "f|col35|",
  "f|col36|",
  "f|col37|",
  "f|col38|",
  "f|col39|",
  "f|col40|",
  "f|col41|",
  "f|col42|",
  "f|col43|",
  "f|col44|",
  "f|col45|",
  "f|col46|",
  "f|col47|",
  "f|col48|",
  "f|col49|",
  "f|col50|",
  "f|col51|",
  "f|col52|",
  "f|col53|",
  "f|col54|",
  "f|col55|",
  "f|col56|",
  "f|col57|",
  "f|col58|",
  "f|col59|",
  "f|col60|",
  "f|col61|",
  "f|col62|",
  "f|col63|",
  "f|col64|",
  "f|col65|",
  "f|col66|",
  "f|col67|",
  "f|col68|",
  "f|col69|",
  "f|col70|",
  "f|col71|",
  "f|col72|",
  "f|col73|",
  "f|col74|",
  "f|col75|",
  "f|col76|",
  "f|col77|",
  "f|col78|",
  "f|col79|",
  "f|col80|",
  "f|col81|",
  "f|col82|",
  "f|col83|",
  "f|col84|",
  "f|col85|",
  "f|col86|",
  "f|col87|",
  "f|col88|",
  "f|col89|",
  "f|col90|",
  "f|col91|",
  "f|col92|",
  "f|col93|",
  "f|col94|",
  "f|col95|",
  "f|col96|",
  "f|col97|",
  "f|col98|",
  "f|col99|",
  "f|col100|",
  "f|col101|",
  "f|col102|",
  "f|col103|",
  "f|col104|",
  "f|col105|",
  "f|col106|",
  "f|col107|",
  "f|col108|",
  "f|col109|",
  "f|col110|",
  "f|col111|",
  "f|col112|",
  "f|col113|",
  "f|col114|",
  "f|col115|",
  "f|col116|",
  "f|col117|",
  "f|col118|",
  "f|col119|",
  "f|col120|",
  "f|col121|",
  "f|col122|",
  "f|col123|",
  "f|col124|",
  "f|col125|",
  "f|col126|",
  "f|col127|",
  "f|col128|",
  "f|col129|",
  "f|col130|",
  "f|col131|",
  "f|col132|",
  "f|col133|",
  "f|col134|",
  "f|col135|",
  "f|col136|",
  "f|col137|",
  "f|col138|",
  "f|col139|",
  "f|col140|",
  "f|col141|",
  "f|col142|",
  "f|col143|",
  "f|col144|",
  "f|col145|",
  "f|col146|",
  "f|col147|",
  "f|col148|",
  "f|col149|",
  "f|col150|",
  "f|col151|",
];
