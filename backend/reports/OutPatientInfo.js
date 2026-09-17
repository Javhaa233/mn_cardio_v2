const ObjectHelper = require('../helper/ObjectHelper');

// Default logo as base64 (placeholder - can be updated with actual default logo)
const DEFAULT_LOGO = null;

function OutPatientInfo(
  Data,
  PatientData,
  InPatientInfo,
  Password,
  DischargeDate,
  OrganizationLogo
) {
  const LifeAdviceList = Data.LifeAdviceSelectObj || [];
  const MonitoringList = Data.MonitoringSelectObj || [];

  // Calculate password expiry date (6 months from discharge)
  const expireDate = new Date(DischargeDate);
  expireDate.setMonth(expireDate.getMonth() + 6);
  const expireDateStr = ObjectHelper.getDateYMD({ Date: expireDate });

  // Use organization logo if available, otherwise use default
  const logoSrc = OrganizationLogo || DEFAULT_LOGO;
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" style="height: 40px; width: auto;" alt="Logo" />`
    : '';

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>OutPatientInfo</title>
    <style>
      html {
        zoom: 1;
      }
      body {
        margin: 0 auto;
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 12px;
      }
      .container {
        padding: 15px 30px;
        width: 550px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .header-logo {
        float: left;
      }
      .title {
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 10px;
        clear: both;
      }
      .section {
        margin-bottom: 8px;
      }
      .section-title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .section-content {
        padding-left: 8px;
      }
      ul {
        margin: 4px 0;
        padding-left: 20px;
      }
      li {
        margin-bottom: 2px;
      }
      .patient-info {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .login-box {
        margin-top: 15px;
        padding: 10px;
        border: 1px solid #ccc;
        background-color: #f9f9f9;
      }
      .login-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .warning {
        font-weight: bold;
        margin: 10px 0;
      }
      .signature {
        text-align: right;
        margin-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      ${logoHtml ? `<div class="header-logo">${logoHtml}</div>` : ''}
      <div class="title">
        ${InPatientInfo && InPatientInfo.DrgroupDepartments ? InPatientInfo.DrgroupDepartments.name : ''}т хэвтэн эмчлүүлсэн тухай
      </div>

      <div class="section">
        <div class="patient-info">
          ${PatientData ? PatientData.p_lastname : ''} овогтой ${PatientData ? PatientData.p_firstname : ''}
          ${PatientData && PatientData.p_birthday ? ObjectHelper.GetAgeDateStr(PatientData.p_birthday) : '...'} нас/
          ${PatientData && PatientData.p_genderObj ? PatientData.p_genderObj.Label : '...'},
        </div>
        <div>
          Улсын 3-р төв эмнэлгийн ${InPatientInfo && InPatientInfo.DrgroupDepartments ? InPatientInfo.DrgroupDepartments.name : ''}т
          ${InPatientInfo && InPatientInfo.date_admission ? InPatientInfo.date_admission : ObjectHelper.getDateYMD({ Date: new Date() })} -с
          ${InPatientInfo && InPatientInfo.date_discharge ? InPatientInfo.date_discharge : ObjectHelper.getDateYMD({ Date: new Date() })} хооронд
        </div>
        <div>Онош: ${Data.Diagnosis || ''} оноштойгоор хэвтэж эмчлүүлэв.</div>
      </div>

      <div class="section">
        <div class="section-title">Хийгдсэн оношилгоо, шинжилгээ:</div>
        <div class="section-content">${Data.HiigdsenShinjilgee || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">Хийгдсэн эмчилгээ:</div>
        <div class="section-content">${Data.HiigdsenEmchilgee || ''}</div>
      </div>

      <div class="section">
        <div class="section-title">Цаашид:</div>

        <div>
          <div class="section-title">Амьдралын хэв маяг</div>
          <ul>
            ${LifeAdviceList.map((e) => `<li>${e.Label}</li>`).join('')}
            ${Data.LifeAdviceOther ? `<li>${Data.LifeAdviceOther}</li>` : ''}
          </ul>
        </div>

        <div>
          <div class="section-title">Хяналт</div>
          <ul>
            ${MonitoringList.map((e) => `<li>${e.Label}</li>`).join('')}
            ${Data.MonitoringOther ? `<li>${Data.MonitoringOther}</li>` : ''}
          </ul>
        </div>

        <div>
          <div class="section-title">Эмэн эмчилгээ</div>
          <div class="section-content">
            ${Data.UuhEm || ''}
            <div class="warning">ДЭЭРХ ЭМҮҮДИЙГ ЭМНЭЛГЭЭС ГАРСАН ӨДРӨӨС УУЖ ЭХЭЛНЭ ҮҮ!</div>
            <div>Цус шингэлэх эмүүдийг зогсоовол стент бөглөрч Зүрхний шигдээсээр хүндэрдэг тул эмчийн зааваргүйгээр эм зогсоохгүйг анхаарна уу.</div>
          </div>
        </div>
      </div>

      <div class="login-box">
        <div class="login-title">Иргэний платформ (үзлэгийн түүх) орох хаяг:</div>
        <div>https://smr.telemedicine.mn/patient</div>
        ${
          PatientData && PatientData.p_registration && Password
            ? `
        <div>Нэвтрэх нэр: ${PatientData.p_registration}</div>
        <div>Нууц үг: ${Password.replace(/\s+/g, '')}</div>
        <div>Кодны хүчинтэй хугацаа: ${expireDateStr}</div>
        `
            : ''
        }
      </div>

      <div class="signature">
        <div>Эмчийн нэр: .......................................................</div>
      </div>

      <div class="signature">
        <div>Мэдээллийг бүрэн уншиж танилцсан, зөвшөөрсөн иргэн: .......................................................</div>
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = OutPatientInfo;
