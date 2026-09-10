function PacemakerThree(Data) {
  var Risks = '';

  Data.risksObj
    ? Data.risksObj.map((risk, key) => {
        Risks += `<div style=" margin-bottom: 8px; width: calc(100% - 95px); ">
                    ${risk.Label}
                </div>`;
      })
    : '';
  var Diffs = '';

  Data.diffsObj
    ? Data.diffsObj.map((diff, key) => {
        Diffs += `<div style=" margin-bottom: 8px; width: calc(100% - 95px); ">
                    ${diff.Label}
                </div>`;
      })
    : '';

  const StartedDate = Data.started_date ? new Date(Data.started_date) : new Date();

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
          margin-bottom: 10px;
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
        <h5
          style="
            font-size: 12px;
            font-weight: 400;
            padding: 0 10%;
            margin: 5px 0;
          "
        >
          БАЙНГЫН ПЕЙСМЕЙКЕР СУУЛГАХ ЭМЧИЛГЭЭНИЙ ТЭМДЭГЛЭЛ
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
          Эцэг/эх/-ийн нэр: <span style="font-style: italic;">${
            Data.Patient && Data.Patient.p_lastname ? Data.Patient.p_lastname : ''
          }</span>
        </div>
        <div style="display: inline-block; width: 25%;">
          Нэр: <span style="font-style: italic;">${
            Data.Patient && Data.Patient.p_firstname ? Data.Patient.p_firstname : ''
          }</span>
        </div>
        <div style="display: inline-block; width: 25%;">
          РД: <span style="font-style: italic;">${
            Data.Patient && Data.Patient.p_registration ? Data.Patient.p_registration : ''
          }</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div style="display: inline-block; width: 30%;">
          Хүйс: <span style="font-style: italic;">${
            Data.Patient.p_gender === 'M' ? 'Эрэгтэй' : 'Эмэгтэй'
          }</span>
        </div>
        <div style="display: inline-block; width: 30%;">
          Нас: <span style="font-style: italic;">${
            Data.Patient.p_birthday
              ? new Date().getFullYear() - new Date(Data.Patient.p_birthday).getFullYear()
              : ''
          }</span>
        </div>
      </div>
      <div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div>Төлөвлөсөн эмчилгээний нэр:</div>
          <div style="font-style: italic;">${Data.treatment_name ? Data.treatment_name : ''}</div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div>Клиник оношийн үндэслэл</div>
          <div style="font-style: italic;">${
            Data.clinical_diagnosis ? Data.clinical_diagnosis : ''
          }</div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div>
            Эхэлсэн: ${StartedDate.getFullYear()} он 
            ${StartedDate.getMonth() + 1} сар
            ${StartedDate.getDate()} өдөр 
            ${Data.started_hour ? Data.started_hour : '00'} цаг 
            ${Data.started_min ? Data.started_min : '00'} мин
          </div>
          <div>
            Үргэлжилсэн: ${Data.dur_hour ? Data.dur_hour : '00'} цаг
            ${Data.dur_min ? Data.dur_min : '00'} мин
          </div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div>Байнгын пейсмейкер суулгах эмчилгээний бичлэг:</div>
          <div style="font-style: italic;">${Data.scriptum ? Data.scriptum : ''}</div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div style="display: -webkit-flex;">
            <div style="margin-right: 20px;">
              Рентген тун: ${Data.xray_dose ? Data.xray_dose : ''}
            </div>
            <div>Рентген хугацаа: ${Data.xray_time ? Data.xray_time : ''}</div>
          </div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div style="display: -webkit-flex; width: calc(100% - 95px);">
            <div style="margin-right: 10px;">Пейсмейкер:</div>
            <div style="margin-right: 10px;">
              Загвар: ${Data.pm_model ? Data.pm_model : ''}
            </div>
            <div style="margin-right: 10px;">
              Сери: ${Data.pm_serial ? Data.pm_serial : ''}
            </div>
            <div style="margin-right: 10px;">
              Байрлал: ${Data.pm_pos ? Data.pm_pos : ''}
            </div>
          </div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div style="float: left; width: 20%;">
            Баруун тосгуур:
          </div>
          <div style="float: left; width: 66%;">
            <div style="float: left; width: 50%;">
              Загвар: ${Data.bt_model ? Data.bt_model : ''}
            </div>
            <div style="float: left; width: 50%;">
              Сери: ${Data.bt_serial ? Data.bt_serial : ''}
            </div>
            <div style="float: left; width: 50%;">
              Байрлал: ${Data.bt_pos ? Data.bt_pos : ''}
            </div>
            <div style="float: left; width: 50%;">
              Мэдрэмж: ${Data.bt_sens ? Data.bt_sens : ''}
            </div>
            <div style="float: left; width: 50%;">
              Босго хүч: ${Data.bt_pow ? Data.bt_pow : ''}
            </div>
            <div style="float: left; width: 50%;">
              Эсэргүүцэл: ${Data.bt_res ? Data.bt_res : ''}
            </div>
          </div>
        </div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-bottom: 10px;
          "
        >
          <div style="float: left; width: 20%;">
            Баруун ховдол:
          </div>
          <div style="float: left; width: 66%;">
            <div style="float: left; width: 50%;">
              Загвар: ${Data.bh_model ? Data.bh_model : ''}
            </div>
            <div style="float: left; width: 50%;">
              Сери: ${Data.bt_serial ? Data.bt_serial : ''}
            </div>
            <div style="float: left; width: 50%;">
              Байрлал: ${Data.bh_pos ? Data.bh_pos : ''}
            </div>
            <div style="float: left; width: 50%;">
              Мэдрэмж: ${Data.bh_sens ? Data.bh_sens : ''}
            </div>
            <div style="float: left; width: 50%;">
              Босго хүч: ${Data.bh_pow ? Data.bh_pow : ''}
            </div>
            <div style="float: left; width: 50%;">
              Эсэргүүцэл: ${Data.bh_res ? Data.bh_res : ''}
            </div>
          </div>
        </div>
      </div>
      <div style="display: inline-block; width: calc(100% - 95px); margin-bottom: 10px;">
        <div>
          Байнгын пейсмейкер суулгах эмчилгээний үед авсан эдийн болон бусад шинжилгээ:
        </div>
        <div style="font-style: italic;">${Data.biopsy_and_other ? Data.biopsy_and_other : ''}</div>
      </div>
      <div style="display: inline-block; width: calc(100% - 95px); margin-bottom: 10px;">
        <div>
          Байнгын пейсмейкер суулгах эмчилгээний үед шархны арчдас авсан эсэх:
        </div>
        <div style="font-style: italic;">
          ${Data.about_woundObj ? Data.about_woundObj.Label : ''}
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>
          Байнгын пейсмейкер суулгах эмчилгээний дараах онош: Ds:
        </div>
        <div style="font-style: italic;">${Data.after_diagnosis ? Data.after_diagnosis : ''}</div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Мэдээгүйжүүлэлтийн хэлбэр:</div>
        <div style="font-style: italic;">${Data.anes_type ? Data.anes_type : ''}</div>
      </div>
      <div style="display: inline-block; width: calc(100% - 95px); margin-bottom: 10px;">
        Байнгын пейсмейкер суулгах эмчилгээ: <span style="font-style: italic;">${
          Data.pm_condObj ? Data.pm_condObj.Label : ''
        }</span>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Оёдол тавьсан утас:</div>
        <div
          style="
            display: inline-block;
            width: calc(100% - 95px);
            margin-left: 60px;
          "
        >
          <div>Бэхэлгээнд: <span style="font-style: italic;">${
            Data.wire_fix ? Data.wire_fix : ''
          }</span></div>
          <div>Арьсны дор: <span style="font-style: italic;">${
            Data.wire_under ? Data.wire_under : ''
          }</span></div>
          <div>Арьсанд: <span style="font-style: italic;">${
            Data.wire_skin ? Data.wire_skin : ''
          }</span></div>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>
          Эмчилгээний өмнө хэрэглэсэн антибиотек: 
        <span style="font-style: italic;">${Data.ab_before ? Data.ab_before : ''}</span>
        </div>
        <div>
          Эмчилгээний үед хэрэглэсэн антибиотек: 
        <span style="font-style: italic;">${Data.ab_during ? Data.ab_during : ''}</span>
        </div>
        <div>
          Эмчилгээний дараа хэрэглэсэн антибиотек: 
        <span style="font-style: italic;">${Data.ab_after ? Data.ab_after : ''}</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Гардан гүйцэтгэсэн эмч:</div>
        <div style="margin-left: 30px;">
          1. 
        <span style="font-style: italic;">${
          Data.operating_emchObj ? Data.operating_emchObj.Label : ''
        }</span>
        </div>
        <div style="margin-left: 30px;">
          2. 
        <span style="font-style: italic;">${
          Data.support_emchObj ? Data.support_emchObj.Label : ''
        }</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Сувилагч:</div>
        <div style="margin-left: 30px;">
          1. 
        <span style="font-style: italic;">${
          Data.surg_nurseObj ? Data.surg_nurseObj.Label : ''
        }</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Инженер:</div>
        <div style="margin-left: 30px;">
          1. 
        <span style="font-style: italic;">${Data.engineerObj ? Data.engineerObj.Label : ''}</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Техникч:</div>
        <div style="margin-left: 30px;">
          1. 
        <span style="font-style: italic;">${
          Data.technicianObj ? Data.technicianObj.Label : ''
        }</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Мэдээгүйжүүлэгч эмч:</div>
        <div style="margin-left: 30px;">
          1. ${Data.anes_emchObj ? Data.anes_emchObj.Label : ''}
        <span style="font-style: italic;">${
          Data.anes_nurseObj ? Data.anes_nurseObj.Label : ''
        }</span>
        </div>
      </div>
      <div
        style="
          display: inline-block;
          width: calc(100% - 95px);
          margin-bottom: 10px;
        "
      >
        <div>Мэдээгүйжүүлгийн сувилагч:</div>
        <div style="margin-left: 30px;">
          1. 
        <span style="font-style: italic;">${
          Data.anes_nurseObj ? Data.anes_nurseObj.Label : ''
        }</span>
        </div>
      </div>
      <div style="display: -webkit-flex; width: calc(100% - 95px);">
        Эмчлэгч эмч: 
        <span style="font-style: italic;">${Data.emchObj ? Data.emchObj.Label : ''}</span>
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = PacemakerThree;
