function PacemakerOne(Data) {
  var Risks = '';

  Data.risksObj
    ? Data.risksObj.map((risk, key) => {
        Risks += `<div style="font-size: 8px; margin-bottom: 2px; width: calc(100% - 95px); ">
                    ${risk.Label}
                  </div>`;
      })
    : '';
  var Diffs = '';

  Data.diffsObj
    ? Data.diffsObj.map((diff, key) => {
        Diffs += `<div style="font-size: 8px; margin-bottom: 2px; width: calc(100% - 95px); ">
                    ${diff.Label}
                  </div>`;
      })
    : '';

  const PlannedDate = Data.planned_date ? new Date(Data.planned_date) : new Date();

  return `<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width">
  </head>
  <body style="margin: 0 auto; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 9px;">
      <div
        style="
          padding: 0 15px 0 80px;
          font-weight: normal;
          width: 580px;
        "
      >
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 5px;
          "
        >
          <div style="float: left;">
            Өвчний түүхийн дугаар: 
            <span style="font-style: italic;">${
              Data.pat_history_id ? Data.pat_history_id : ''
            }</span>
          </div>
          <div style="float: right;">
            Тасаг: 
            <span style="font-style: italic;">${Data.department ? Data.department : ''}</span>
          </div>
        </div>
        <div style="width: calc(100% - 95px); text-align: center;">
          <h5 style="font-size: 12px; font-weight: bold; margin: 5px 0;">
            БАЙНГЫН ПЕЙСМЕЙКЕР СУУЛГАХ ЭМЧИЛГЭЭНИЙ ӨМНӨХ ДҮГНЭЛТ
          </h5>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 2px;
          "
        >
          <div style="display: inline-block; width: 30%;">
            Эцэг/эх/-ийн нэр: 
            <span style="font-style: italic;">${
              Data.Patient && Data.Patient.p_lastname ? Data.Patient.p_lastname : ''
            }</span>
          </div>
          <div style="display: inline-block; width: 30%;">
            Нэр: 
            <span style="font-style: italic;">${
              Data.Patient && Data.Patient.p_firstname ? Data.Patient.p_firstname : ''
            }</span>
          </div>
          <div style="display: inline-block; width: 20%;">
            Нас: 
            <span style="font-style: italic;">${
              Data.Patient && Data.Patient.Age ? Data.Patient.Age : ''
            }</span>
          </div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 5px;
          "
        >
          <div style="display: inline-block; width: 30%;">
            Хүйс: 
            <span style="font-style: italic;">${
              Data.Patient && Data.Patient.p_gender && Data.Patient.p_gender === 'M'
                ? 'Эрэгтэй'
                : 'Эмэгтэй'
            }</span>
          </div>
          <div style="display: inline-block; width: 30%;">
            Цусны бүлэг: 
            <span style="font-style: italic;">${
              Data.Patient.blood_typeObj ? Data.Patient.blood_typeObj.Label : ''
            }</span>
          </div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 5px;
          "
        >
          <div>Шинжилгээнд гарсан өөрчлөлт:</div>
          <div style="font-style: italic;">${
            Data.diagnostic_change ? Data.diagnostic_change : ''
          }</div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 5px;
          "
        >
          <div>Эмч нарын зөвөлгөөний онош; шийдвэр:</div>
          <div style="font-style: italic;">${Data.diag_decision ? Data.diag_decision : ''}</div>
        </div>
        <div style="display: inline-block; margin-bottom: 5px;">
          <div>
            Зөвлөх эмчийн гарын үсэг: <span style="font-style: italic;">${
              Data.zuvlukh_emchObj ? Data.zuvlukh_emchObj.Label : ''
            }</span>
          </div>
          <div>
            Эмчлэгч эмчийн гарын үсэг: <span style="font-style: italic;">${
              Data.emchlegch_emchObj ? Data.emchlegch_emchObj.Label : ''
            }</span>
          </div>
          <div>
            Эмчийн гарын үсэг: <span style="font-style: italic;">${
              Data.emchObj ? Data.emchObj.Label : ''
            }</span>
          </div>
        </div>
        <div style="width: calc(100% - 95px);">
          Байнгын пейсмейкер суулгах эмчилгээний үед болон дараа гарч болох
          эрсдэл; хүндрэл ба авах арга хэмжээ:
        </div>
        <div style="margin-left: 8px; min-height: 100px;">
          <span style="margin-left: 30px;  font-weight: 400;">
            Хүндрэл
          </span>
          <div style="width: calc(100% - 95px); font-style: italic;">
            ${Diffs}
          </div>
        </div>
        <div>
          <div style="margin-left: 8px; min-height: 100px; margin-bottom: 5px;">
            <span
              style="margin-left: 30px;  font-weight: 400;"
            >
              Эрсдэл
            </span>
            <div style="width: calc(100% - 95px); font-style: italic;">
              ${Risks}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 20px;
            "
          >
            <div>Байнгын пейсмейкер төхөөрөмжийн загварын заалт:</div>
            <div style="font-style: italic;">
              ${Data.device_modelObj ? Data.device_modelObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 5px;
            "
          >
            <div>Байнгын пейсмейкер суулгах эмчилгээний өмнөх онош:</div>
            <div style="font-style: italic;">${Data.prev_diagnosis ? Data.prev_diagnosis : ''}</div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 5px;
            "
          >
            <div>
              Эмчилгээг төлөвлөгөөт/яаралтай журмаар 
              ${PlannedDate.getFullYear()} оны 
              ${PlannedDate.getMonth() + 1} сарын 
              ${PlannedDate.getDate()}-ны өдөр төлөвлөв.
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 3px;
            "
          >
            <div style="float: left; width: 40%;">
              Гардан гүйцэтгэх эмч:
            </div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.operating_emchObj ? Data.operating_emchObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 3px;
            "
          >
            <div style="float: left; width: 40%;">Туслах эмч:</div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.tuslakh_emchObj ? Data.tuslakh_emchObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 2px;
            "
          >
            <div style="float: left; width: 40%;">
              Мэс заслын сувилагч:
            </div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.surgery_nurseObj ? Data.surgery_nurseObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 2px;
            "
          >
            <div style="float: left; width: 40%;">Инженер:</div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.engineerObj ? Data.engineerObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 2px;
            "
          >
            <div style="float: left; width: 40%;">Техникч:</div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.technicianObj ? Data.technicianObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 2px;
            "
          >
            <div style="float: left; width: 40%;">
              Мэдээгүйжүүлгийн эмч:
            </div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.anasthesia_emchObj ? Data.anasthesia_emchObj.Label : ''}
            </div>
          </div>
          <div
            style="
              display: inline-block;
              width: calc(100% - 95px);
              margin-bottom: 2px;
            "
          >
            <div style="float: left; width: 40%;">
              Мэдээгүйжүүлгийн сувилагч:
            </div>
            <div style="float: left; width: 40%; font-style: italic;">
              ${Data.anasthesia_nurseObj ? Data.anasthesia_nurseObj.Label : ''}
            </div>
          </div>
        </div>
      </div>
  </body>
</html>
`;
}

module.exports = PacemakerOne;
