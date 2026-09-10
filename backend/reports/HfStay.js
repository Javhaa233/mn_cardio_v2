function HfStay(Data) {
  const { HfStayData, HfLifeStoryData, HfLabTreatmentData, HfTreatmentDischargeData, PatientData } =
    Data;

  return `<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <style>
      html {
          zoom: 1.45;
      }
      body {
        margin: 0 auto;
        font-family: Helvetica, "Arial", sans-serif;
        font-size: 7px;
      }

      * {
        box-sizing: border-box;
      }

      .main {
        width: 565px;
        overflow: hidden;
        padding: 0 15px 0 15px;
      }

      .header {
        text-align: center;
        font-size: 9px;
        padding: 2px;
        font-weight: 500;
        margin: 0 25% 10px 25%;
      }

      table {
        width: 100%;
        border: 1px solid #666666;
        border-collapse: collapse;
        font-size: 6px;
      }

      table tr {
      }

      table th {
        background-color: #000;
        text-align: left;
        padding: 0 4px;
      }

      table td {
        border: 1px solid #666666;
        padding: 1px 4px;
        vertical-align: top;
      }

      .tableHeader {
        color: #fff;
        font-weight: 500;
        margin: 2px 0;
      }

      table tr.subheader {
        background-color: #999999;
      }

      /* Check Div */
      .checkDiv {
        float: left;
        position: relative;
        border: 1px solid #ccc;
        width: 6px;
        height: 6px;
        margin: 0 2px 1px 0;
      }

      .checkSpan {
        position: absolute;
        top: -4px;
        font-size: 8px;
        font-weight: 500;
        /* visibility: "visible"; */
      }
    </style>
  </head>
  <body>
    <div class="main">
      <h5 class="header">
        ЗҮРХНИЙ ДУТАГДАЛТАЙ ХЭВТЭН ЭМЧЛҮҮЛЭГЧДИЙН БҮРТГЭЛИЙН АСУУМЖ
      </h5>
      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="2">
                <h5 class="tableHeader">ЭМЧЛҮҮЛЭГЧДИЙН ТАЛААРХ МЭДЭЭЛЭЛ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 30%">Эмчлүүлэгчийн овог</td>
              <td style="width: 70%">${PatientData ? PatientData.p_lastname : ''}</td>
            </tr>
            <tr>
              <td style="width: 30%">Эмчлүүлэгчийн нэр</td>
              <td style="width: 70%">${PatientData ? PatientData.p_firstname : ''}</td>
            </tr>
            <tr>
              <td style="width: 30%">Регистрийн дугаар</td>
              <td style="width: 70%">
                <div style="float: left; margin-right: 4px">РД:</div>
                ${
                  PatientData && PatientData.p_registration && PatientData.p_registration != ''
                    ? PatientData.p_registration
                    : `
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>`
                }
              </td>
            </tr>
            <tr>
              <td style="width: 30%">Утасны дугаар</td>
              <td style="width: 70%">
                ${
                  PatientData && PatientData.p_telephone && PatientData.p_telephone != ''
                    ? PatientData.p_telephone
                    : `
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>`
                }
              </td>
            </tr>
            <tr>
              <td style="width: 30%">Гэрийн хаяг</td>
              <td style="width: 70%">
                ${PatientData ? PatientData.p_address : ''}</td>
            </tr>
            <tr>
              <td style="width: 30%">Холбоо барих хүний утас</td>
              <td style="width: 70%"></td>
            </tr>
            <tr>
              <td style="width: 30%">Төрсөн огноо</td>
              <td style="width: 70%">
                ${PatientData ? PatientData.p_birthday : ''}</td>
            </tr>
            <tr>
              <td style="width: 30%">Нас</td>
              <td style="width: 70%">
                ${
                  PatientData && PatientData.Age && PatientData.Age != ''
                    ? PatientData.Age
                    : `
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>
                <div class="checkDiv"></div>`
                }
              </td>
            </tr>
            <tr>
              <td style="width: 30%">Хүйс</td>
              <td style="width: 70%">
                ${
                  PatientData && PatientData.p_gender && PatientData.p_gender != ''
                    ? PatientData.p_gender == 'M'
                      ? 'Эрэгтэй'
                      : 'Эмэгтэй'
                    : ''
                }</td>
            </tr>
            <tr>
              <td style="width: 30%">Яс үндэс</td>
              <td style="width: 70%"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 2 -->
      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="4">
                <h5 class="tableHeader">ЭМНЭЛЭГТ ХЭВТЭХ ҮЕИЙН МЭДЭЭЛЭЛ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 30%">Хэвтсэн огноо</td>
              <td style="width: 45%" colspan="2"></td>
              <td style="width: 25%"></td>
            </tr>
            <tr>
              <td>Зүрхний дутагдал оншлогдсон огноо</td>
              <td colspan="2"></td>
              <td></td>
            </tr>
            <tr>
              <td>Эмнэлэгт хэвтсэн шалтгаан / Давтан үзүүлсэн шалтгаан</td>
              <td colspan="2">
                <div style="float: left; margin-right: 3px">
                  <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.StayReason === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Зүрхний дутагдал сэдрэл,
                </div>

                <div style="float: left; margin-right: 3px">
                  <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.StayReason === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Зүрхний цочмог дутагдал,
                </div>
                <div style="float: left; margin-right: 3px">
                  <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.StayReason === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Давтан үзлэг,
                </div>
                <div style="float: left; margin-right: 3px">
                  <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.StayReason === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Бусад
                </div>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Зүрхний дутагдал оншлогдоод хэр хугацаа өнгөрсөн</td>
              <td style="width: 22%">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.DurationOfHf === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                6 сараас дотогш(&#60;6 сар)
              </td>
              <td style="width: 23%">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.DurationOfHf === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                6 сар ба түүнээс дээш хугацаа (&#62;= 6 сар)
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.DurationOfHf === '-1' || !HfStayData.DurationOfHf
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 3 -->

      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="7">
                <h5 class="tableHeader">АМЬДРАЛЫН ХЭВ МАЯГ, АМЬДРАЛЫН ЧАНАР</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 30%">
                Иргэний амьдралын хэв маяг ба амьдралын чанарын хэсгийн
                асуултуудыг асуусан уу?
              </td>
              <td style="width: 12%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.AskedLife === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td style="width: 32%" colspan="3">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.AskedLife === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td style="width: 26%" colspan="2"></td>
            </tr>
            <tr>
              <td>Гэрлэлт</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Marriage === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Гэрлэсэн
              </td>
              <td colspan="2" style="width: 20%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Marriage === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Гэрлээгүй
              </td>
              <td style="width: 12%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Marriage === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Бэлэвсэн
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Marriage === '-1' || !HfLifeStoryData.Marriage
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Ажлын нөхцөл</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.WorkCondition === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хэвийн
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.WorkCondition === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хүнд
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.WorkCondition === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хортой
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.WorkCondition === '-1' || !HfLifeStoryData.WorkCondition
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Хөдөлгөөн засал эмчилгээнд хамрагдсан байдал</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalTherapy === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalTherapy === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalTherapy === '-1' || !HfLifeStoryData.PhysicalTherapy
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Зүрхний дутагдлын боловсрол олгох сургалтын хөтөлбөр</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.HfEducation === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.HfEducation === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.HfEducation === '-1' || !HfLifeStoryData.HfEducation
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Тамхи татах зуршил</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Smoking === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хэзээ ч татаж байгаагүй
              </td>
              <td style="width: 10%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Smoking === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                6 сараас дээш хугацаанд тамхинаас гарсан
              </td>
              <td style="width: 10%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Smoking === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                6 сараас доош хугацаанд тамхинаас гарсан
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Smoking === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Татдаг гэхдээ өдөр бүр биш
              </td>
              <td style="width: 13%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Smoking === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Өдөр бүр татдаг
              </td>
              <td style="width: 13%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Smoking === '-1' || !HfLifeStoryData.Smoking
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>
                Архи, <br />
                Та долоо хоногт хэдэн удаа стандарт уулт ууж байна вэ?
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingWeekly === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                &#60;1-г долоо хоногт
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingWeekly === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                1-4 стандарт уулт 7 хоногт
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingWeekly === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                5-9 стандарт уулт 7 хоногт
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingWeekly === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                10-14 стандарт уулт 7 хоногт
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingWeekly === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                15 ба түүнээс дээш стандарт уулт 7 хоногт
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingWeekly === '-1' || !HfLifeStoryData.DrinkingWeekly
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>
                Архи, <br />
                Та хэр давтамжтай стандарт уулт уудаг вэ? (Эмэгтэй бол 4
                стандарт уулт, эрэгтэй бол 5 стандарт уулт)
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingLoop === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хэзээ ч үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingLoop === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хэдэн сард нэг удаа
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingLoop === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Сар бүр
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingLoop === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                7 хоног бүр
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingLoop === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Заримдаа өдөр бүр
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DrinkingLoop === '-1' || !HfLifeStoryData.DrinkingLoop
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3.1 -->

      <div style="margin-bottom: 12px">
        <table class="table">
          <tbody>
            <tr class="subheader">
              <td colspan="6">Биеийн биометрик хэмжилтүүд</td>
            </tr>
            <tr>
              <td style="width: 16%">Ядрах</td>
              <td style="width: 16%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Fatigue === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ядрахгүй, хөдөлгөөний энгийн идэвхи хязгаарлагдахгүй
              </td>
              <td style="width: 16%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Fatigue === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ядрана, энгийн хөдөлгөөний идэвхи хязгаарлагдана
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Fatigue === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ядарснаас хөдөлгөөний идэвхи тодорхой хэмжээнд хязгаарлагдаж,
                энгийнээс бага идэвхид ядарна (алхах зай >20-100 метр хүрч
                богиносно)ь тайван үеэс бусад үед тухгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Fatigue === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ядарч хөдөлгөөний идэвхи хязгаарлагдана, тайван суух үед ч
                зовиуртай, ихэвчлэн хэвтэнэ
              </td>
              <td style="width: 10%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Fatigue === '-1' || !HfLifeStoryData.Fatigue
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Амьсгаадах</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Dyspnea === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Амьсгаадахгүй, хөдөлгөөний энгийн идэвхи хязгаарлагдахгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Dyspnea === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Амьсгаадна, , энгийн хөдөлгөөний идэвхи хязгаарлагдана
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Dyspnea === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Амьсгаадаж хөдөлгөөний идэвхи тодорхой хэмжээнд хязгаарлагдаж,
                энгийнээс бага идэвхид амьсгаадна (алхах зай >20-100 метр хүрч
                богиносно)ь тайван үеэс бусад үед тухгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Dyspnea === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Амьсгаадаж хөдөлгөөний идэвхи хязгаарлагдана, тайван суух үед ч
                зовиуртай, ихэвчлэн хэвтэнэ
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Dyspnea === '-1' || !HfLifeStoryData.Dyspnea
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Хөдөлгөөний идэвхи</td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalActivity === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Алхаж явахад ямар ч асуудалгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalActivity === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Алхаж явахад бага зэргийн асуудалтай
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalActivity === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Орноосоо босож чадахгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PhysicalActivity === '-1' ||
                        !HfLifeStoryData.PhysicalActivity
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Өөрөө өөртөө үйлчлэх</td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.SelfService === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Өөрөө өөртөө үйлчлэхэд ямарч асуудалгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.SelfService === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хувцасаа өмсөх болон усанд ороход зарим асуудал гардаг
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.SelfService === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хувцас өмсөх болон усанд орж чадахгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.SelfService === '-1' || !HfLifeStoryData.SelfService
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Өдөр тутмын амьдралын идэвхи</td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DailyActivity === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Өдөр тутмын ажлаа хийхэд зовиургүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DailyActivity === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Өдөр тутмын ажлаа хийхэд заримдаа зовиур илэрнэ
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DailyActivity === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Өдөр тутмын ажлаа хийхэд бэрхшээлтэй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.DailyActivity === '-1' || !HfLifeStoryData.DailyActivity
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Өвдөлт, тааламжгүй байдал</td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PainDiscomfort === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Өвдөлт болон таагүй байдал огт байхгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PainDiscomfort === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Дунд зэргийн өвдөлт болон таагүй байдал байдаг
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PainDiscomfort === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Их хэмжээний өвдөлт болон таагүй байдал байдаг
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.PainDiscomfort === '-1' || !HfLifeStoryData.PainDiscomfort
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Сэтгэл түгжилт, сэтгэл гутрал</td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Anxiety === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Би сэтгэл санаагаар унадаггүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Anxiety === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Би бага зэрэг сэтгэл санаагаар унадаг
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Anxiety === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Би маш их сэтгэл санаагаар унадаг
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.Anxiety === '-1' || !HfLifeStoryData.Anxiety
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Амьдралын чанар</td>
              <td colspan="2">
                  ${HfLifeStoryData ? HfLifeStoryData.LifeQuality : ''}</td>
              <td colspan="3">
                0-100 (100=Өөрийн эрүүл мэндээ маш сайнаар төсөөлж байна, <br />
                0=Өөрийн эрүүл мэндээ маш муугаар төсөөлж байна)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="page-break-after: always;"></div>

      <!-- 3.2 -->

      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">ӨВЧНИЙ ТҮҮХ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 24%">Өмнө нь зүрхний шигдээсээр өвдсөн</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_hf === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_hf === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_hf === '-1' || !HfLifeStoryData.hist_hf
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Титэм судасны цусан хангамж сэргээх</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_revasc === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_revasc === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                GABG
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_revasc === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                PCI
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_revasc === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                GABG + PCI
              </td>
              <td style="width: 10%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_revasc === '-1' || !HfLifeStoryData.hist_revasc
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Артерийн гипертензи</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_hypertension === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_hypertension === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_hypertension === '-1' ||
                        !HfLifeStoryData.hist_hypertension
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Тосгуурын жирвэгнээ <br />/чичиргээ</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_attrfib === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_attrfib === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_attrfib === '-1' || !HfLifeStoryData.hist_attrfib
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Чихрийн шижин</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_diabetes === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_diabetes === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                ЧШ1
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_diabetes === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                ЧШ2
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_diabetes === '-1' || !HfLifeStoryData.hist_diabetes
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Уушгины архаг бөглөрөлтөт өвчин</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_copd === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_copd === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_copd === '-1' || !HfLifeStoryData.hist_copd
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Зүрхний хавхлагын өвчин</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvedisease === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvedisease === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvedisease === '-1' ||
                        !HfLifeStoryData.hist_valvedisease
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Зүрхний хавхлагын мэс засал</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvesurgery === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvesurgery === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Аорт
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvesurgery === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Митрал
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvesurgery === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Аорт + Митрал
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_valvesurgery === '-1' ||
                        !HfLifeStoryData.hist_valvesurgery
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Тэлэгдлийн кардиомиопати</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_dcm === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_dcm === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_dcm === '-1' || !HfLifeStoryData.hist_dcm
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td>Анхдагч шалтгаан</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Артерийн даралт ихсэлт
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Зүрхний цус хомсрол
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тэлэгдэлийн кардиомиопати
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Архины шалтгаантай кардиомиопати
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Зүрхний хавхлагын өвчин
              </td>
              <td style="width: 8%">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '6'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Бусад
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLifeStoryData
                      ? HfLifeStoryData.hist_primary === '-1' || !HfLifeStoryData.hist_primary
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!--4 -->
      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">ҮЗЛЭГ ШИНЖИЛГЭЭ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 24%">Хэвтэх үе Киллипийн ангилал</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Killip === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Зовиургүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Killip === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Нойтон хэрчигнүүр
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Killip === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Уушгины цочмог хаван
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Killip === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Зүрхний шок
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Killip === '-1' || !HfLabTreatmentData.Killip
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 22%">Өндөр</td>
              <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.Height ? HfLabTreatmentData.Height : ''
                  }см</td>
              <td></td>
              <td></td>
              <td></td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.Height
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="display: inline-block; width: 100%; margin-bottom: 20px">
        <div style="float: left; width: 48%; margin-right: 4%">
          <table class="table">
            <thead>
              <tr>
                <th colspan="8">
                  <h5 class="tableHeader">0-24 цаг</h5>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 45%">Жин</td>
                <td style="width: 28%">
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_weight
                      ? HfLabTreatmentData.a_weight
                      : ''
                  }кг</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_weight
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Систолын даралт</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_sys ? HfLabTreatmentData.a_sys : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_weight
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Диастолын даралт</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_dias ? HfLabTreatmentData.a_dias : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_dias
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>ЗЦТ (удаа/мин)</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_hrate
                      ? HfLabTreatmentData.a_hrate
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_hrate
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Гемоглобин</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_hb ? HfLabTreatmentData.a_hb : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_hb
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Креатинин</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_creat
                      ? HfLabTreatmentData.a_creat
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_creat
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Кали</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_kali ? HfLabTreatmentData.a_kali : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_kali
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Натри</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_natri
                      ? HfLabTreatmentData.a_natri
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_natri
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>NT-pro.BNP</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_ntprobnp
                      ? HfLabTreatmentData.a_ntprobnp
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_ntprobnp
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>BNP</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.a_bnp ? HfLabTreatmentData.a_bnp : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.a_bnp
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>
                  <span style="margin: 2px 0 2px 0">&nbsp;</span></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>
                  <span style="margin: 3px 0 3px 0">&nbsp;</span></td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>Нью-Йоркийн ангилал</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Nyha === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  I
                </td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Nyha === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  II
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="float: left; width: 48%">
          <table class="table">
            <thead>
              <tr>
                <th colspan="8">
                  <h5 class="tableHeader">24 цагийн дараа</h5>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="width: 45%">Жин</td>
                <td style="width: 28%">
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_weight
                      ? HfLabTreatmentData.b_weight
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_weight
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Систолын даралт</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_sys ? HfLabTreatmentData.b_sys : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_sys
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Диастолын даралт</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_dias ? HfLabTreatmentData.b_dias : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_dias
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>ЗЦТ (удаа/мин)</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_hrate
                      ? HfLabTreatmentData.b_hrate
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_hrate
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Гемоглобин</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_hb ? HfLabTreatmentData.b_hb : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_hb
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Креатинин</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_creat
                      ? HfLabTreatmentData.b_creat
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_creat
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Кали</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_kali ? HfLabTreatmentData.b_kali : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_kali
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Натри</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_natri
                      ? HfLabTreatmentData.b_natri
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_natri
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>NT-pro.BNP</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_ntprobnp
                      ? HfLabTreatmentData.b_ntprobnp
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_ntprobnp
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>BNP</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_bnp ? HfLabTreatmentData.b_bnp : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_bnp
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Ферритин</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_ferrit
                      ? HfLabTreatmentData.b_ferrit
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_ferrit
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>Трансферрины ханалт</td>
                <td>
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.b_transferrin
                      ? HfLabTreatmentData.b_transferrin
                      : ''
                  }</td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? !HfLabTreatmentData.b_transferrin
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
              <tr>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Nyha === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  III
                </td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Nyha === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  IV
                </td>
                <td>
                  <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Nyha === '-1' || !HfLabTreatmentData.Nyha
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!--4 -->
      <div style="margin-bottom: 0px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">ОНОШИЛГОО</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 24%">ЗЦБ хэмнэл</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Синусын хэмнэл
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тосгуурын жирвэг/чичиргээн
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Пейсмейкер хэм
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Бусад
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === '-1' || !HfLabTreatmentData.EcgRhythm
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 22%">Гиссийн зүүн хөлийн хориг</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.EcgRhythm === '-1' || !HfLabTreatmentData.EcgRhythm
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 22%">QRS өргөн</td>
              <td colspan="5">
                  ${HfLabTreatmentData && HfLabTreatmentData.Qrs ? HfLabTreatmentData.Qrs : ''}</td>
            </tr>
            <tr>
              <td style="width: 22%">EF тодорхойлсон аргачлал</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.LvefMethod === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                ЗХАШ
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.LvefMethod === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Соронзон резонанст томографи
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.LvefMethod === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Сцинтографи
              </td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td style="width: 22%">EF тодорхойлсон огноо</td>
              <td colspan="5">
                  ${
                    HfLabTreatmentData && HfLabTreatmentData.LvefDate
                      ? HfLabTreatmentData.LvefDate
                      : ''
                  }</td>
            </tr>
            <tr>
              <td style="width: 22%">EF%</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Lvef === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                LVEF ≥50%
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Lvef === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                LVEF 40-49%
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Lvef === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                LVEF 30-39%
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Lvef === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                LVEF&#60;30%
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Lvef === '-1' || !HfLabTreatmentData.Lvef
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 22%">Цээжний рентген дүгнэлт</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.ChestXray === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.ChestXray === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Хэвийн
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.ChestXray === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Уушгины зогсонгошил
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.ChestXray === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                2 + 3
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.ChestXray === '-1' || !HfLabTreatmentData.ChestXray
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 22%">Спирометрийн дүгнэлт</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Spirometry === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Spirometry === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Spirometry === '-1' || !HfLabTreatmentData.Spirometry
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 4.1 -->
      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">СУДСААР ХИЙГДСЭН ЭМЧИЛГЭЭ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 24%">Гогцооны шээс хөөгч</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.DiuerticDone === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.DiuerticDone === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  <span class="checkSpan"> ✓ </span>
                </div>
                Тийм бол огноог бичих
              </td>
              <td>
              ${
                HfLabTreatmentData &&
                HfLabTreatmentData.DiuerticDone === 'y' &&
                HfLabTreatmentData.DiureticDate
                  ? HfLabTreatmentData.DiureticDate
                  : `
                <div style="clear: both; width: 100%">
                  <div style="float: left; margin-right: 5px">
                    <div style="width: 100%">
                      <div class="checkDiv"></div>
                      <div class="checkDiv"></div>
                      <div class="checkDiv"></div>
                      <div class="checkDiv"></div>
                    </div>
                    <div style="width: 100%">
                      <span>оооо</span>
                    </div>
                  </div>
                  <div style="float: left; margin-right: 5px">
                    <div style="width: 100%">
                      <div class="checkDiv"></div>
                      <div class="checkDiv"></div>
                    </div>
                    <div style="width: 100%">
                      <span>сс</span>
                    </div>
                  </div>
                  <div style="float: left">
                    <div style="width: 100%">
                      <div class="checkDiv"></div>
                      <div class="checkDiv"></div>
                    </div>
                    <div style="width: 100%">
                      <span>өө</span>
                    </div>
                  </div>
                </div>
                <div style="clear: both"></div>
                <div style="width: 100%">
                  <div style="float: left">
                    <div class="checkDiv"></div>
                    <div class="checkDiv"></div>
                    <div style="float: left; margin-right: 3px">цц</div>
                  </div>
                  <div style="float: left">
                    <div class="checkDiv"></div>
                    <div class="checkDiv"></div>
                    <div style="float: left">мм</div>
                  </div>
                </div>`
              }
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.DiuerticDone === '-1' || !HfLabTreatmentData.DiuerticDone
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 22%">Төлөвлөөгүй инотроп дэмжлэг</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Inotropic === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Inotropic === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Добутамин
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Inotropic === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Лефозимендан
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Inotropic === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Милринон
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Inotropic === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Бусад
              </td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfLabTreatmentData
                      ? HfLabTreatmentData.Inotropic === '-1' || !HfLabTreatmentData.Inotropic
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 5 -->
      <div style="page-break-after:always;"></div>
      <div style="margin-bottom: 12px">
        <table class="table" border="1">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">ГАРАХ ҮЕИЙН ЭМЧИЛГЭЭ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 24%" rowspan="9">АХФС</td>
              <td rowspan="9">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.inhibitor === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.inhibitor === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="9">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.inhibitor === '-1' ||
                        !HfTreatmentDischargeData.inhibitor
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">мг тун/хоног</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Периндоприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '1'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Лизинноприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '2'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Рамиприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '3'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Эналаприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '4'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Каптоприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '5'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '6'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Фозиноприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '6'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.inhibitor === 'y'
                      ? HfTreatmentDischargeData.inhibitor_tablet === '7'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Кинаприл
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.inhibitor === 'y' &&
                    HfTreatmentDischargeData.inhibitor_tablet === '7'
                      ? HfTreatmentDischargeData.inhibitor_dose
                      : ''
                  }</td>
            </tr>
            <!-- АРХ -->
            <tr>
              <td style="width: 24%" rowspan="8" style="writing-mode: vertical-rl; border-right: 1px solid black;">АРХ</td>
              <td rowspan="8" style="writing-mode: vertical-rl;">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.arb === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.arb === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="8">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.arb === '-1' || !HfTreatmentDischargeData.arb
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">мг тун/хоног</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arb === 'y'
                      ? HfTreatmentDischargeData.arb_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Валсартан
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arb === 'y' &&
                    HfTreatmentDischargeData.arb_tablet === '1'
                      ? HfTreatmentDischargeData.arb_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arb === 'y'
                      ? HfTreatmentDischargeData.arb_tablet === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Лозартан
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arb === 'y' &&
                    HfTreatmentDischargeData.arb_tablet === '2'
                      ? HfTreatmentDischargeData.arb_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arb === 'y'
                      ? HfTreatmentDischargeData.arb_tablet === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ирбесартан
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arb === 'y' &&
                    HfTreatmentDischargeData.arb_tablet === '3'
                      ? HfTreatmentDischargeData.arb_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arb === 'y'
                      ? HfTreatmentDischargeData.arb_tablet === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Кандесартан
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arb === 'y' &&
                    HfTreatmentDischargeData.arb_tablet === '4'
                      ? HfTreatmentDischargeData.arb_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arb === 'y'
                      ? HfTreatmentDischargeData.arb_tablet === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Телмисартан
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arb === 'y' &&
                    HfTreatmentDischargeData.arb_tablet === '5'
                      ? HfTreatmentDischargeData.arb_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arb === 'y'
                      ? HfTreatmentDischargeData.arb_tablet === '6'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Эпросартан
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arb === 'y' &&
                    HfTreatmentDischargeData.arb_tablet === '6'
                      ? HfTreatmentDischargeData.arb_dose
                      : ''
                  }</td>
            </tr>
            <!-- Бетахориглогч -->
            <tr>
              <td style="width: 24%" rowspan="9">Бетахориглогч</td>
              <td rowspan="9">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.beta === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.beta === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="9">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.beta === '-1' || !HfTreatmentDischargeData.beta
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">мг тун/хоног</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Бисопролол
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '1'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Карведилол
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '2'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Атенолол
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '3'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Метопролол
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '4'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Пропраноло
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '5'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '6'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Лабеталол
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '6'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.beta === 'y'
                      ? HfTreatmentDischargeData.beta_tablet === '7'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Соталол
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.beta === 'y' &&
                    HfTreatmentDischargeData.beta_tablet === '7'
                      ? HfTreatmentDischargeData.beta_dose
                      : ''
                  }</td>
            </tr>
            <!-- Минералкортикойд рецепторийн антагонист -->
            <tr>
              <td style="width: 24%" rowspan="4">
                Минералкортикойд рецепторийн антагонист
              </td>
              <td rowspan="4">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.mra === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.mra === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="4">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.mra === '-1' || !HfTreatmentDischargeData.mra
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">мг тун/хоног</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.mra === 'y'
                      ? HfTreatmentDischargeData.mra_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Спиронолактон
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.mra === 'y' &&
                    HfTreatmentDischargeData.mra_tablet === '1'
                      ? HfTreatmentDischargeData.mra_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.mra === 'y'
                      ? HfTreatmentDischargeData.mra_tablet === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Эплеренон
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.mra === 'y' &&
                    HfTreatmentDischargeData.mra_tablet === '2'
                      ? HfTreatmentDischargeData.mra_dose
                      : ''
                  }</td>
            </tr>
            <!-- Ангиотензины рецептор нефрилизины хориглогч -->
            <tr>
              <td style="width: 24%" rowspan="5">
                Ангиотензины рецептор нефрилизины хориглогч
              </td>
              <td rowspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.arni === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.arni === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.arni === '-1' || !HfTreatmentDischargeData.arni
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">Tab-ийн тоо</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arni === 'y'
                      ? HfTreatmentDischargeData.arni_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Сакубитрил/Валсартан 24/26
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '1'
                      ? HfTreatmentDischargeData.arni_tablet_number === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '1'
                      ? HfTreatmentDischargeData.arni_tablet_number === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                1
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '1'
                      ? HfTreatmentDischargeData.arni_tablet_number === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                2
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arni === 'y'
                      ? HfTreatmentDischargeData.arni_tablet === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Сакубитрил/Валсартан 49/51
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '2'
                      ? HfTreatmentDischargeData.arni_tablet_number === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '2'
                      ? HfTreatmentDischargeData.arni_tablet_number === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                1
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '2'
                      ? HfTreatmentDischargeData.arni_tablet_number === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                2
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.arni === 'y'
                      ? HfTreatmentDischargeData.arni_tablet === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Сакубитрил/Валсартан 97/103
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '3'
                      ? HfTreatmentDischargeData.arni_tablet_number === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '3'
                      ? HfTreatmentDischargeData.arni_tablet_number === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                1
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.arni === 'y' &&
                    HfTreatmentDischargeData.arni_tablet === '3'
                      ? HfTreatmentDischargeData.arni_tablet_number === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                2
              </td>
            </tr>
            <!-- Синусын зангилааг дарангуйлагч -->
            <tr>
              <td style="width: 24%" rowspan="3">
                Синусын зангилааг дарангуйлагч
              </td>
              <td rowspan="3">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.sinus_inhibitor === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.sinus_inhibitor === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="3">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.sinus_inhibitor === '-1' ||
                        !HfTreatmentDischargeData.sinus_inhibitor
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">мг тун/хоног</span>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.sinus_inhibitor === 'y'
                      ? HfTreatmentDischargeData.sinus_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ивабрадин
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.sinus_inhibitor === 'y' &&
                    HfTreatmentDischargeData.sinus_tablet === '1'
                      ? HfTreatmentDischargeData.sinus_dose
                      : ''
                  }</td>
            </tr>
            <!-- Гогцооны шээс хөөгч -->
            <tr>
              <td style="width: 24%" rowspan="5" style="border-right-width: 2px;">Гогцооны шээс хөөгч</td>
              <td rowspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.loop_diuretics === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.loop_diuretics === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td rowspan="5">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.loop_diuretics === '-1' ||
                        !HfTreatmentDischargeData.loop_diuretics
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span style="font-weight: bold">Эмийн нэр</span>
              </td>
              <td colspan="3">
                <span style="font-weight: bold">Тун</span>
              </td>
            </tr>
            <tr>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.loop_diuretics === 'y'
                      ? HfTreatmentDischargeData.loop_diuretics_tablet === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Фуросемид
              </td>
              <td>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '1'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  24 цаг
                </div>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '1'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Хааяа
                </div>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '1'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '-1' &&
                        !HfTreatmentDischargeData.loop_diuretics_cycle
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </div>
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '1'
                      ? HfTreatmentDischargeData.loop_diuretics_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.loop_diuretics === 'y'
                      ? HfTreatmentDischargeData.loop_diuretics_tablet === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Торасемид
              </td>
              <td>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '2'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  24 цаг
                </div>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '2'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Хааяа
                </div>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '2'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '-1' &&
                        !HfTreatmentDischargeData.loop_diuretics_cycle
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </div>
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '2'
                      ? HfTreatmentDischargeData.loop_diuretics_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData && HfTreatmentDischargeData.loop_diuretics === 'y'
                      ? HfTreatmentDischargeData.loop_diuretics_tablet === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Буметанид
              </td>
              <td>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '3'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  24 цаг
                </div>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '3'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Хааяа
                </div>
                <div style="clear: both; display: inline-block; width: 100%;">
                  <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '3'
                      ? HfTreatmentDischargeData.loop_diuretics_cycle === '-1' &&
                        !HfTreatmentDischargeData.loop_diuretics_cycle
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                  </div>
                  Мэдэхгүй
                </div>
              </td>
              <td colspan="3">
                  ${
                    HfTreatmentDischargeData &&
                    HfTreatmentDischargeData.loop_diuretics === 'y' &&
                    HfTreatmentDischargeData.loop_diuretics_tablet === '3'
                      ? HfTreatmentDischargeData.loop_diuretics_dose
                      : ''
                  }</td>
            </tr>
            <tr>
              <td style="width: 24%">Тиазид болон бусад шээс хөөгч</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OtherDiuretic === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OtherDiuretic === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td></td>
              <td colspan="3"></td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OtherDiuretic === '-1' ||
                        !HfTreatmentDischargeData.OtherDiuretic
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Дигиталис</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Digitalis === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Digitalis === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td></td>
              <td colspan="3"></td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Digitalis === '-1' ||
                        !HfTreatmentDischargeData.Digitalis
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Статин</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Statin === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Statin === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td></td>
              <td colspan="3"></td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Statin === '-1' || !HfTreatmentDischargeData.Statin
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Нитрат</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Nitrat === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Nitrat === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td></td>
              <td colspan="3"></td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Nitrat === '-1' || !HfTreatmentDischargeData.Nitrat
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Уухаар антикоагулянт</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OralAnticoagulant === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OralAnticoagulant === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Варфарин
              </td>
              <td></td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OralAnticoagulant === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                NOAK
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.OralAnticoagulant === '-1' ||
                        !HfTreatmentDischargeData.OralAnticoagulant
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Антиагрегант</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Antiagregant === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Antiagregant === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td></td>
              <td colspan="3"></td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.Antiagregant === '-1' ||
                        !HfTreatmentDischargeData.Antiagregant
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Төхөөрөмж эмчилгээ</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.DeviceTherapy === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.DeviceTherapy === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Пейсмекер
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.DeviceTherapy === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                CRT-P
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.DeviceTherapy === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                CRT-D
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.DeviceTherapy === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                ICD
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfTreatmentDischargeData
                      ? HfTreatmentDischargeData.DeviceTherapy === '-1' ||
                        !HfTreatmentDischargeData.DeviceTherapy
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin-bottom: 12px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">ӨВЧТӨНД ӨГӨХ МЭДЭЭЛЭЛ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 24%">Зүрхний дутагдлын тухай мэдээлэл өгсөн</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGivenInfo === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGivenInfo === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGivenInfo === '-1' || !HfStayData.IsGivenInfo
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Иргэн өр гэрт өгсөн</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsFamilyGivenInfo === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsFamilyGivenInfo === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsFamilyGivenInfo === '-1' || !HfStayData.IsFamilyGivenInfo
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">
                Өвчний тавилан, өвчний явцын тухай мэдээлэл өгсөн
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGivenDestinyInfo === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGivenDestinyInfo === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGivenDestinyInfo === '-1' || !HfStayData.IsGivenDestinyInfo
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Хөнгөвчлөх эмчилгээ шаардлагатай юу?</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsNeededPalliative === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsNeededPalliative === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsNeededPalliative === '-1' || !HfStayData.IsNeededPalliative
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
            <tr>
              <td style="width: 24%">Иргэний хөнгөвчлөх эмчилгээний төрөл</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.PalliativeType === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.PalliativeType === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Ерөнхий хөнгөвчлөх эмчилгээ
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.PalliativeType === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тусгай хөнгөвчлөх эмчилгээ
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.PalliativeType === '-1' || !HfStayData.PalliativeType
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Мэдэхгүй
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin-bottom: 0px">
        <table class="table">
          <thead>
            <tr>
              <th colspan="8">
                <h5 class="tableHeader">ЦААШИД ХЯНАХ ТӨЛӨВЛӨГӨӨ</h5>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 35%">Эмнэлэгээс гарсан хугацаа</td>
              <td colspan="3">
                  ${
                    HfStayData && HfStayData.OutDate && HfStayData.OutDate !== ''
                      ? HfStayData.OutDate
                      : `
                        <div class="checkDiv"></div>
                        <div class="checkDiv"></div>
                        <div class="checkDiv"></div>
                        <div class="checkDiv"></div>
                        <div style="float: left; margin-right: 3px">оооо</div>
                        <div class="checkDiv"></div>
                        <div class="checkDiv"></div>
                        <div style="float: left; margin-right: 3px">сс</div>
                        <div class="checkDiv"></div>
                        <div class="checkDiv"></div>
                        <div style="float: left">өө</div>`
                  }
              </td>
            </tr>
            <tr>
              <td>Эмнэлгээс гарах үеийн биеийн байдал</td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.OutCondition === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Сайжирсан,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.OutCondition === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Эдгэрсэн,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.OutCondition === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Хэвэндээ,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.OutCondition === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Дордсон,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.OutCondition === '5'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Нас барсан,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.OutCondition === '6'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Бусад</div>
              </td>
            </tr>
            <tr>
              <td>Асран хамгаалагчид мэдээлэлд хамрагдсан эсэх</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGuardianGivenInfo === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGuardianGivenInfo === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsGuardianGivenInfo === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тодорхойгүй
              </td>
            </tr>
            <tr>
              <td>Хяналтанд байх эмнэлгийн шатлал</td>
              <td colspan="3">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.MonitoringLevel === '1'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">
                  Гуравдугаар шатлал,
                </div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.MonitoringLevel === '2'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">
                  Хоёрдугаар шатлал,
                </div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.MonitoringLevel === '3'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">ӨЭМТ,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.MonitoringLevel === '4'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Бусад,</div>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.MonitoringLevel === '5' || !HfStayData.MonitoringLevel
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                <div style="float: left; margin-right: 3px">Мэдэхгүй</div>
              </td>
            </tr>
            <tr>
              <td>Зүрхний дутагдлын амбулаторид хянах шаардлагатай</td>
              <td>
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsMonitoringAmbulatory === 'n'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Үгүй
              </td>
              <td colspan="2">
                <div class="checkDiv">
                  ${
                    HfStayData
                      ? HfStayData.IsMonitoringAmbulatory === 'y'
                        ? `<span class="checkSpan"> ✓ </span>`
                        : ''
                      : ''
                  }
                </div>
                Тийм
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = HfStay;
