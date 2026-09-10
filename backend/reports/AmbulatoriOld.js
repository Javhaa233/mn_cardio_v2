const ObjectHelper = require('../helper/ObjectHelper');

function Ambulatori(Data, BeginDate) {
  var Number = 1;
  return `
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons"
    />
    <style type="text/css">
      html {
        zoom: 1.45;
      }
      body {
        margin: 0 auto;
        font-family: "Roboto", "Arial", sans-serif;
        font-size: 7px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 7px;
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
        max-height: 100px;
      }

      .trBody td {
        vertical-align: middle;
        text-align: center;
      }

      .charTable {
        table-layout: fixed;
        width: 100%;
        position: absolute;
        left: 0;
        right: -1px;
        top: auto;
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
        font-size: 6px;
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
    </style>
  </head>
  <body>
    <div style="padding: 8px 16px; font-weight: normal; width: 679px">
      <div>
        <span style="font-size: 10px; font-weight: 400">${BeginDate ? BeginDate : ''}</span>
      </div>
      <div style="clear: both">
        <div style="width: 30%; float: right; text-align: center">
          <span style="display: block"
            >ЭМСайдын 2013 оны 11 сарын 450 тоот тушаалаар батлав.</span
          >
          <span style="display: block; font-weight: bold"
            >Эрүүл мэндийн бүртгэлийн маягт АМ-1Б</span
          >
        </div>
        <div style="clear: both"></div>
      </div>
      <div style="text-align: center">
        <h4 style="font-size: 10px; padding: 0; margin: 0">
          ЭМЧИЙН ҮЗЛЭГИЙН БҮРТГЭЛ
        </h4>
      </div>
      <div>
        <p style="padding: 0; margin: 0">Кабинетын нэр: ___________________</p>
        <p style="padding: 0; margin: 0">
          Эмчийн нэр: __________________________________
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
              <th rowspan="3" class="text-center" style="width: 100px">
                Эцэг /эх/-ийн нэр,<br />
                Нэр <br />Регистрийн дугаар
              </th>
              <th rowspan="3" class="text-center" style="width: 100px">
                Тогтмол хаяг
              </th>
              <th rowspan="3">
                <span class="thRotate">Мэргэжил</span>
              </th>
              <th rowspan="3">
                <span class="thRotate">Боловсрол</span>
              </th>
              <th rowspan="3" class="text-center">
                Ажлын газрын хаяг,<br />
                /хүүхэд бол гэрт,<br />
                цэцэрлэг, <br />сургуульд <br />ЭМД-ын дугаар
              </th>
              <th rowspan="3">Нас</th>
              <th rowspan="3">Хүйс</th>
              <th colspan="5" style="height: 10px" class="text-center">
                Үзлэгийн төрөл
              </th>
              <th rowspan="3" class="text-center" style="width: 10px">
                Үндсэн онош /ӨОУА-10/
              </th>
              <th rowspan="3">
                <span class="thRotate">
                  Осол гэмтлийн шалтгаан V00- V99, W00-W99, X00-X99, Y00-
                  Y99</span
                >
              </th>
              <th colspan="2" class="text-center">Өвчлөл</th>
              <th rowspan="3">
                <span class="thRotate"
                  >АМ13 А маягт илгээсэн эсэх тийм-(+), үгүй (-)</span
                >
              </th>
              <th colspan="2" style="height: 25px" class="text-center">
                Хийгдсэн<br />эмчилгээ
              </th>
              <th rowspan="3">
                <span class="thRotate">
                  Цочмог сул саа саажилттай эсэх тийм-(+), үгүй (-)</span
                >
              </th>
            </tr>
            <tr>
              <th colspan="2" style="text-align: center">
                <span class="thRotate" style="max-height: 44px"
                  >Өвчний учир амбулаторид</span
                >
              </th>
              <th rowspan="2">
                <span class="thRotate">Урьдчилан сэргийлэх үзлэг</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Идэвхитэй хяналт</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Дуудлагаар гэрийн үзлэг</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Шинэ</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Хуучин</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Эмийн эмчилгээ</span>
              </th>
              <th rowspan="2">
                <span class="thRotate">Мэс ажилбар</span>
              </th>
            </tr>
            <tr>
              <th>
                <span class="thRotate">анх</span>
              </th>
              <th>
                <span class="thRotate">Давтан</span>
              </th>
            </tr>
            <tr class="thNumber">
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
            Data &&
            Data.length > 0 &&
            Data.map((value, key) => {
              return `
          <tr class="trBody">
            <td style="padding: 4px 0">
              <span style="font-size: 6px; line-height: 0.8">
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
                  value.Patient ? value.Patient.p_lastname : ''
                }<br />${value.Patient ? value.Patient.p_firstname : ''}</div>
              ${
                value.Patient &&
                `<table class="charTable">
              <tbody>
                <tr>
                ${Array.from(value.Patient.p_registration)
                  .map((char) => {
                    return `<td>${char + ''}</td>`;
                  })
                  .join('')}
                </tr>
              </tbody>
            </table>`
              }
            </td>
            <td>${value.Patient.p_address}</td>
            <td>${value.Patient.p_occupation}</td>
            <td>${value.Patient.p_education}</td>
            <td style="position: relative">
            ${
              value.Patient &&
              `<table class="charTable">
            <tbody>
              <tr>
              ${
                value.Patient.p_health_insurance &&
                Array.from(value.Patient.p_health_insurance)
                  .map((char) => {
                    return `<td>${char + ''}</td>`;
                  })
                  .join('')
              }
              </tr>
            </tbody>
          </table>`
            }
            </td>
            <td></td>
            <td></td>
            <td style="position: relative">
            ${
              value.type_exam1 && value.type_exam1 !== '' && value.type_exam1 === '1'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }
              1
            </td>
            <td>
            ${
              value.type_exam1 && value.type_exam1 !== '' && value.type_exam1 === '2'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }
                2
            </td>
            <td>
            ${
              value.type_exam2 && value.type_exam2 !== '' && value.type_exam2 === '3'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }
                3
            </td>
            <td>
            ${
              value.type_exam2 && value.type_exam2 !== '' && value.type_exam2 === '4'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }
            4
            </td>
            <td>
            ${
              value.type_exam2 && value.type_exam2 !== '' && value.type_exam2 === '5'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }
            5
            </td>
            <td>${
              value.LastJournal
                ? value.LastJournal.j_label
                  ? value.LastJournal.j_label
                  : value.LastJournal.JournalRef.jr_label
                : ''
            }</td>
            <td></td>
            <td>
            ${
              value.disease && value.disease !== '' && value.disease === '1'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }</td>
            <td>
            ${
              value.disease && value.disease !== '' && value.disease === '2'
                ? `
            <div
              style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 8px;
                width: 6px;
                border-radius: 50%;
                border: 2px solid #333;
              "
            ></div>`
                : ''
            }</td>
            <td>
            ${
              value.referred_by_13a && value.referred_by_13a !== '' && value.referred_by_13a === 'y'
                ? '+'
                : '-'
            }</td>
            <td>-</td>
            <td>-</td>
            <td>
            ${value.paralysis && value.paralysis !== '' && value.paralysis === 'y' ? '+' : '-'}</td>
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
