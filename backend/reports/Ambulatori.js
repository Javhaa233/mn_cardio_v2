const ObjectHelper = require('../helper/ObjectHelper');
const tt = require('./translate');

/**
 * Every cell in this report is raw `${}` interpolation into a template literal,
 * and columns 14/16/20 are free-typed nvarchar(200) coming from the examination
 * form. A single `<` in a diagnosis would otherwise swallow the rest of the
 * table, so anything that reaches the page as text goes through here.
 */
function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** the paper form's тийм(+) / үгүй(-) cells */
function yn(value) {
  return value && value !== '' && (value === 'y' || value === '1') ? '+' : '-';
}

/**
 * Form АМ-1Б — «ЭМЧИЙН ҮЗЛЭГИЙН БҮРТГЭЛ», appendix 11 of Minister of Health
 * order А/611 (2019-12-30). This is the upgrade tender's form 4.1.
 *
 * The table below follows the А/611 layout, 22 numbered columns. It previously
 * followed the SUPERSEDED 2013 order-450 layout, which is a different form: it
 * had five examination-type columns instead of six, an "Осол гэмтлийн шалтгаан
 * V00-Y99" column where А/611 has "Өвчний шалтгаан /ӨОУА-10/", "АМ13 А маягт
 * илгээсэн эсэх" where А/611 has "Дээд шатлалд илгээсэн эсэх", and
 * "Эмийн эмчилгээ / Мэс ажилбар / Цочмог сул саа" in columns 20-22 where А/611
 * has "Хийгдсэн ажилбар /ҮОУА-9/ / Хүндрэлтэй өртсөн эсэх / Хөдөлмөрийн чадвар
 * түр алдалтын хоног". Because every one of the old 22 slots was occupied, the
 * five Visit columns added for А/611 (exam_type_icd, cause_icd10,
 * procedure_icd9, has_complication, incapacity_days) had nowhere to print and
 * two cells were hardcoded to "-".
 *
 * Source of truth for the layout: `word/media/image5.png` inside
 * `MN cardio upgrade.docx`, the tender's own scan of the form.
 *
 * TWO GAPS THAT ARE ЗСҮТ'S TO CLOSE, not ours to invent:
 *   * Column 12 «Гэрийн эргэлтээр» has no backing field. А/611 has six
 *     examination-type columns; the old form had five, and `type_exam2` only
 *     codes 3/4/5. The cell renders empty until a code exists for it.
 *   * `Visit.paralysis` («Цочмог сул саа сажилттай эсэх») has no column in
 *     А/611 at all. It is still captured, and is no longer printed.
 *
 * @param Data        hydrated Visit rows, each with Patient and LastJournal
 * @param BeginDate   start of the printed period, shown top-left
 * @param Meta        { DoctorName, CabinetName, EndDate } for the form header
 */
function Ambulatori(Data, BeginDate, Meta) {
  var Number = 1;

  const DoctorName = esc(Meta && Meta.DoctorName);
  const CabinetName = esc(Meta && Meta.CabinetName);
  const PeriodText = esc(
    BeginDate && Meta && Meta.EndDate
      ? BeginDate + ' — ' + Meta.EndDate
      : BeginDate || ''
  );

  const Education = function (education) {
    const EducationList = [
      'Primary education',
      'Lower secondary education',
      'Upper secondary education',
      'Tertiary education',
      'Vocational education',
    ];

    return tt(EducationList[education], 'mn');
  };

  return `<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons"
    />
    <title>Ambulatori 2013.11.26_orig_ext</title>
    <style rel="stylesheet" type="text/css">
      html { zoom: 1; }
      body {
        margin: 0 auto;
        font-family: "Roboto", "Arial", sans-serif;
        font-size: 11px;
        width: 1200px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }

      table th {
        text-align: left;
        padding: 0 2px;
        border: 1px solid #666666;
        font-weight: 400;
      }

      table td {
        padding: 1px 4px;
        vertical-align: top;
        border: 1px solid #666666;
      }

      table tr.tableHeader {
        color: #fff;
        font-weight: 500;
        margin: 2px 0;
      }

      table tr.subheader {
        background-color: #999999;
      }

      .text-center {
        text-align: center;
      }

      .thNumber th {
        text-align: center;
      }

      .thRotate {
        writing-mode: vertical-rl;
        text-align: left;
        transform: rotate(180deg);
        -ms-transform: rotate(180deg);
        -webkit-transform: rotate(180deg);
        -moz-transform: rotate(180deg);
        max-height: 180px;
      }

      .trBody td {
        vertical-align: middle;
        text-align: center;
      }

      .charTable {
        table-layout: fixed;
        position: absolute;
        left: 0;
        right: -1px;
        bottom: 0;
        border-bottom: none;
        border-left: none;
        border-right: none;
      }

      .charTable tbody tr {
        height: 10px;
      }

      .charTable tbody tr td {
        border-bottom: none;
        font-size: 10px;
      }

      .charTable tbody tr td:first-child {
        border-left: none;
        border-bottom: none;
      }

      .charTable tbody tr td:last-child {
        border-right: none;
        border-bottom: none;
      }

      .tdDiv {
        padding: 2px;
      }

      /* Check Div */
      .checkDiv {
        float: left;
        position: relative;
        border: 1px solid #ccc;
        width: 8px;
        height: 8px;
        margin: 1px 2px 2px 0;
      }

      .checkSpan {
        position: absolute;
        top: -7px;
        font-size: 14px;
        font-weight: 600;
        /* visibility: "visible"; */
      }

      /* tsagirag */
      .tsagirag {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 16px;
        width: 12px;
        border-radius: 50%;
        border: 2px solid #333;
      }

      /* Print CSS */
      
      @page {size: landscape}

      @media print  and (orientation:landscape){
        html {
          zoom: 1;
        }
        body {
          margin: 0 auto;
          font-family: "Roboto", "Arial", sans-serif;
          font-size: 11px;
          width: 1200px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        table th {
          text-align: left;
          padding: 0 2px;
          border: 1px solid #666666;
          font-weight: 400;
        }

        table td {
          padding: 1px 4px;
          vertical-align: top;
          border: 1px solid #666666;
        }

        table tr.tableHeader {
          color: #fff;
          font-weight: 500;
          margin: 2px 0;
        }

        table tr.subheader {
          background-color: #999999;
        }

        .text-center {
          text-align: center;
        }

        .thNumber th {
          text-align: center;
        }

        .thRotate {
          writing-mode: vertical-rl;
          text-align: left;
          transform: rotate(180deg);
          -ms-transform: rotate(180deg);
          -webkit-transform: rotate(180deg);
          -moz-transform: rotate(180deg);
          max-height: 180px;
        }

        .trBody td {
          vertical-align: middle;
          text-align: center;
        }

        .charTable {
          table-layout: fixed;
          position: absolute;
          left: 0;
          right: -1px;
          bottom: 0;
          border-bottom: none;
          border-left: none;
          border-right: none;
        }

        .charTable tbody tr {
          height: 10px;
        }

        .charTable tbody tr td {
          border-bottom: none;
          font-size: 10px;
        }

        .charTable tbody tr td:first-child {
          border-left: none;
          border-bottom: none;
        }

        .charTable tbody tr td:last-child {
          border-right: none;
          border-bottom: none;
        }

        .tdDiv {
          padding: 2px;
        }

        /* Check Div */
        .checkDiv {
          float: left;
          position: relative;
          border: 1px solid #ccc;
          width: 8px;
          height: 8px;
          margin: 1px 2px 2px 0;
        }

        .checkSpan {
          position: absolute;
          top: -7px;
          font-size: 14px;
          font-weight: 600;
          /* visibility: "visible"; */
        }

        /* tsagirag */
        .tsagirag {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 16px;
          width: 12px;
          border-radius: 50%;
          border: 2px solid #333;
        }
      }
    </style>
  </head>
  <body>
    <div>
      <div>
        <span style="font-size: 14px; font-weight: 500">${PeriodText}</span>
      </div>
      <div style="clear: both">
        <div style="width: 34%; float: right; text-align: center">
          <span style="display: block"
            >Эрүүл мэндийн сайдын 2019 оны 12 дугаар сарын 30-ны өдрийн</span
          >
          <span style="display: block"
            >А/611 дүгээр тушаалын арваннэгдүгээр хавсралт</span
          >
          <span style="display: block; font-weight: bold"
            >Эрүүл мэндийн бүртгэлийн маягт АМ-1Б</span
          >
        </div>
        <div style="clear: both"></div>
      </div>
      <div style="text-align: center">
        <h4 style="font-size: 14px; padding: 0; margin: 0">
          ЭМЧИЙН ҮЗЛЭГИЙН БҮРТГЭЛ
        </h4>
      </div>
      <div>
        <p style="padding: 0; margin: 0">Кабинетын нэр: ${CabinetName || '___________________'}</p>
        <p style="padding: 0; margin: 0">
          Эмчийн нэр: ${DoctorName || '__________________________________'}
        </p>
      </div>
      <div style="margin-top: 3px">
        <table>
          <thead>
            <tr>
              <th rowspan="3">
                <span class="thRotate"> Сар &#47;өдөр</span>
              </th>
              <th rowspan="3">№</th>
              <th rowspan="3" class="text-center" style="width: 200px">
                Эцэг /эх/-ийн нэр,<br />
                Нэр <br />Регистрийн дугаар
              </th>
              <th rowspan="3" class="text-center" style="width: 180px">
                Тогтмол хаяг
              </th>
              <th rowspan="3">
                <span class="thRotate">Ажил, мэргэжил</span>
              </th>
              <th rowspan="3" style="width: 30px">
                <span class="thRotate">Боловсрол</span>
              </th>
              <th rowspan="3" class="text-center">
                Ажлын газрын хаяг,<br />
                /хүүхэд бол гэрт,<br />
                цэцэрлэг, <br />сургуульд <br />ЭМД-ын дугаар
              </th>
              <th rowspan="3">Нас</th>
              <th rowspan="3">Хүйс</th>
              <th colspan="6" style="height: 40px" class="text-center">
                Эмчийн үзлэг
              </th>
              <th rowspan="3" class="text-center" style="width: 40px">
                Үзлэгийн төрөл /Z00-Z40/
              </th>
              <th rowspan="3" class="text-center" style="width: 40px">
                Үндсэн онош /ӨОУА-10/
              </th>
              <th rowspan="3" class="text-center" style="width: 40px">
                Өвчний шалтгаан /ӨОУА-10/
              </th>
              <th colspan="2" class="text-center">Өвчлөл</th>
              <th rowspan="3">
                <span class="thRotate"
                  >Дээд шатлалд илгээсэн эсэх тийм-(+), үгүй (-)</span
                >
              </th>
              <th rowspan="3" class="text-center" style="width: 40px">
                Хийгдсэн ажилбар /ҮОУА-9/
              </th>
              <th rowspan="3">
                <span class="thRotate"
                  >Хүндрэлтэй өртсөн эсэх тийм-(+), үгүй (-)</span
                >
              </th>
              <th rowspan="3">
                <span class="thRotate"
                  >Хөдөлмөрийн чадвар түр алдалтын хоног</span
                >
              </th>
            </tr>
            <tr>
              <th colspan="2" style="text-align: center">
                <span class="thRotate" style="max-height: 88px"
                  >Өвчний учир амбулаторт</span
                >
              </th>
              <th rowspan="2">
                <span class="thRotate">Урьдчилан сэргийлэх</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Идэвхтэй хяналтаар</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Гэрийн эргэлтээр</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Дуудлагаар гэрийн</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Шинэ</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Хуучин</span>
              </th>
            </tr>
            <tr>
              <th>
                <span class="thRotate">Анх</span>
              </th>
              <th>
                <span class="thRotate">Давтан</span>
              </th>
            </tr>
            <tr class="thNumber">
              <th>А</th>
              <th>Б</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
              <th>6</th>
              <th>7</th>
              <th>8</th>
              <th>9</th>
              <th>10</th>
              <th>11</th>
              <th>12</th>
              <th>13</th>
              <th>14</th>
              <th>15</th>
              <th>16</th>
              <th>17</th>
              <th>18</th>
              <th>19</th>
              <th>20</th>
              <th>21</th>
              <th>22</th>
            </tr>
          </thead>
          <tbody>
          ${
            // `Data && Data.length > 0 && Data.map(...)` printed the literal
            // string "false" into the table body for an empty date range.
            !Data || Data.length === 0
              ? '<tr><td colspan="24" style="padding: 12px; text-align: center">Тухайн хугацаанд үзлэг бүртгэгдээгүй байна.</td></tr>'
              : Data.map((value, key) => {
              return `
          <tr class="trBody">
            <td style="padding: 4px 0">
              <span style="font-size: 10px; line-height: 0.8">
              ${new Date(value.visit_date).getFullYear()}
                <br /><br />
                ${ObjectHelper.getRomanizeMonth(
                  new Date(value.visit_date).getMonth() + 1
                )}/${new Date(value.visit_date).getDate()}</span
              >
            </td>
            <td>${Number++}</td>
            <td style="position: relative">
                <div style="min-height: 30px">${
                  value.Patient ? esc(value.Patient.p_lastname) : ''
                }<br />${value.Patient ? esc(value.Patient.p_firstname) : ''}</div>
              ${
                // p_registration is nullable, and Array.from(null) throws -
                // one dangling PatientId used to take the whole report down.
                value.Patient && value.Patient.p_registration
                  ? `<table class="charTable">
              <tbody>
                <tr>
                ${Array.from(String(value.Patient.p_registration))
                  .map((char) => {
                    return `<td>${esc(char)}</td>`;
                  })
                  .join('')}
                </tr>
              </tbody>
            </table>`
                  : ''
              }
            </td>
            <td>${value.Patient ? esc(value.Patient.p_address) : ''}</td>
            <td>${value.Patient ? esc(value.Patient.p_occupation) : ''}</td>
            <td>${value.Patient ? esc(Education(value.Patient.p_education)) : ''}</td>
            <td style="position: relative">
            ${
              value.Patient && value.Patient.p_health_insurance
                ? `<table class="charTable">
            <tbody>
              <tr>
              ${Array.from(String(value.Patient.p_health_insurance))
                .map((char) => {
                  return `<td>${esc(char)}</td>`;
                })
                .join('')}
              </tr>
            </tbody>
          </table>`
                : ''
            }
            </td>
            <!-- АМ-1Б columns 6 and 7: Нас, Хүйс. Both were rendered as empty
                 cells even though findAllAmbulatori already joins them - Age is
                 a VIRTUAL on Patient and Gender is a joined view. -->
            <td>${value.Patient && value.Patient.Age ? value.Patient.Age : ''}</td>
            <td>${
              value.Patient && value.Patient.Gender && value.Patient.Gender.label
                ? value.Patient.Gender.label
                : ''
            }</td>
            <td style="position: relative">
            ${
              value.type_exam1 && value.type_exam1 !== '' && value.type_exam1 === '1'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }
              1
            </td>
            <td style="position: relative">
            ${
              value.type_exam1 && value.type_exam1 !== '' && value.type_exam1 === '2'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }
                2
            </td>
            <td style="position: relative">
            ${
              value.type_exam2 && value.type_exam2 !== '' && value.type_exam2 === '3'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }
                3
            </td>
            <td style="position: relative">
            ${
              value.type_exam2 && value.type_exam2 !== '' && value.type_exam2 === '4'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }
            4
            </td>
            <!-- АМ-1Б column 12 «Гэрийн эргэлтээр». А/611 has SIX
                 examination-type columns; the superseded 2013 form had five and
                 type_exam2 only codes 3/4/5, so there is no value to ring here.
                 Left blank deliberately - inventing a code would put a mark on
                 a statutory register. On the list for ЗСҮТ. -->
            <td style="position: relative">
            5
            </td>
            <td style="position: relative">
            ${
              value.type_exam2 && value.type_exam2 !== '' && value.type_exam2 === '5'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }
            6
            </td>
            <!-- 14 Үзлэгийн төрөл /Z00-Z40/ -->
            <td>${esc(value.exam_type_icd)}</td>
            <!-- 15 Үндсэн онош /ӨОУА-10/. main_diagnosis is written by
                 CustomSave from the ICD picker; the journal label is the
                 fallback for older rows that predate it. -->
            <td>${
              value.main_diagnosis
                ? esc(value.main_diagnosis)
                : value.LastJournal
                  ? esc(
                      value.LastJournal.j_label
                        ? value.LastJournal.j_label
                        : value.LastJournal.JournalRef && value.LastJournal.JournalRef.jr_label
                    )
                  : ''
            }</td>
            <!-- 16 Өвчний шалтгаан /ӨОУА-10/ -->
            <td>${esc(value.cause_icd10)}</td>
            <td style="position: relative">
            ${
              value.disease && value.disease !== '' && value.disease === '1'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }</td>
            <td style="position: relative">
            ${
              value.disease && value.disease !== '' && value.disease === '2'
                ? `
            <div class="tsagirag"></div>`
                : ''
            }</td>
            <!-- 19 Дээд шатлалд илгээсэн эсэх -->
            <td>${yn(value.referred_by_13a)}</td>
            <!-- 20 Хийгдсэн ажилбар /ҮОУА-9/ -->
            <td>${esc(value.procedure_icd9)}</td>
            <!-- 21 Хүндрэлтэй өртсөн эсэх. has_complication stores a yorn
                 dico value, so it maps to +/- like the referral cell above. -->
            <td>${yn(value.has_complication)}</td>
            <!-- 22 Хөдөлмөрийн чадвар түр алдалтын хоног -->
            <td>${
              value.incapacity_days === null || value.incapacity_days === undefined
                ? ''
                : esc(value.incapacity_days)
            }</td>
          </tr>`;
            }).join('')
          }
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>

`;
}

module.exports = Ambulatori;
