function ValveDiseasesEndo(Data) {
  const { PatientData, Users, DoctorsProfile, Patient } = Data?.Data;

  // Helper function to create checkboxes
  const renderCheckbox = (value) => {
    return value === 'yes'
      ? '<div class="checkDiv"><span class="checkSpan">✓</span></div>'
      : '<div class="checkDiv"></div>';
  };

  // Helper function to render array data
  const renderArray = (arr) => {
    return arr && arr.length > 0 ? arr.join(', ') : '---';
  };

  return `<html>
  <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
        h2 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
        .section-title { background: #eee; font-weight: bold; padding: 6px; }
      </style>
  </head>
  <body>
    <div class="main">
      <h2 style="text-align: center;">СУДСНЫ ХАЛДВАРТНЫ ЭНДОКАРДИТЫ ТАЙЛАН</h2>
      
      <div class="patient-info">
        <div>Овог, нэр: ${Patient.FullName || '---'}</div>
        <div>Регистрийн дугаар: ${Patient.p_registration || '---'}</div>
      </div>
      
      <div class="patient-info">
        <div>Нас: ${Patient.Age || '---'}</div>
        <div>Хүйс: ${Patient.Gender?.label || '---'}</div>
      </div>
      
      <div class="section-title">ҮНДСЭН МЭДЭЭЛЭЛ</div>
      <table>
        <tr>
          <th>Талбар</th>
          <th>Утга</th>
        </tr>
        <tr>
          <td>Оношлогдсон огноо</td>
          <td>${Data.DiagnosedDate || '---'}</td>
        </tr>
        <tr>
          <td>Удамшил</td>
          <td>${renderArray(Data.odoogiin_zowiur)}</td>
        </tr>
        <tr>
          <td>Харвалт байгаа эсэх</td>
          <td>${renderCheckbox(Data.is_harvalt)} ${Data.is_harvalt === 'yes' ? 'Тийм' : 'Үгүй'}</td>
        </tr>
        <tr>
          <td>NYHA ангилал</td>
          <td>${Data.nyha || '---'}</td>
        </tr>
      </table>

      <div class="section-title">ШИНЖИЛГЭЭНИЙ ҮР ДҮН</div>
      <div class="two-column">
        <div class="column">
          <table>
            <tr>
              <th>Цусны шинжилгээ</th>
              <th>Үр дүн</th>
            </tr>
            <tr>
              <td>WBC</td>
              <td>${Data.wbc || '---'}</td>
            </tr>
            <tr>
              <td>RBC</td>
              <td>${Data.rbc || '---'}</td>
            </tr>
            <tr>
              <td>Hb</td>
              <td>${Data.hb || '---'}</td>
            </tr>
            <tr>
              <td>HCT</td>
              <td>${Data.hct || '---'}</td>
            </tr>
          </table>
        </div>
        <div class="column">
          <table>
            <tr>
              <th>Биохими</th>
              <th>Үр дүн</th>
            </tr>
            <tr>
              <td>Креатинин</td>
              <td>${Data.creatinin || '---'}</td>
            </tr>
            <tr>
              <td>CRB</td>
              <td>${Data.crb || '---'}</td>
            </tr>
            <tr>
              <td>ASAT</td>
              <td>${Data.asat || '---'}</td>
            </tr>
            <tr>
              <td>ALAT</td>
              <td>${Data.alat || '---'}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="section-title">ЭХОКАРДИОГРАММЫН ҮР ДҮН</div>
      <table>
        <tr>
          <th>Үзүүлэлт</th>
          <th>Утга</th>
        </tr>
        <tr>
          <td>LVEF (%)</td>
          <td>${Data.lvef || '---'}</td>
        </tr>
        <tr>
          <td>LV Mass Index</td>
          <td>${Data.lv_massi || '---'}</td>
        </tr>
        <tr>
          <td>LA Volume</td>
          <td>${Data.la_volume || '---'}</td>
        </tr>
        <tr>
          <td>Vegetation байрлал</td>
          <td>${Data.vegitasi_bairlal || '---'}</td>
        </tr>
        <tr>
          <td>Vegetation хэмжээ</td>
          <td>${Data.vegitasi_hemjee || '---'}</td>
        </tr>
      </table>

      <div class="section-title">ЭМЧИЛГЭЭНИЙ МЭДЭЭЛЭЛ</div>
      <table>
        <tr>
          <th>Талбар</th>
          <th>Утга</th>
        </tr>
        <tr>
          <td>Антибиотикийн нэр</td>
          <td>${Data.antibiotic_name || '---'}</td>
        </tr>
        <tr>
          <td>Хэрэглэсэн өдөр</td>
          <td>${Data.antibiotic_days || '---'}</td>
        </tr>
        <tr>
          <td>Мэс засал хийгдсэн</td>
          <td>${renderCheckbox(Data.is_mes_zasald_orson)} ${
            Data.is_mes_zasald_orson === 'yes' ? 'Тийм' : 'Үгүй'
          }</td>
        </tr>
        ${
          Data.is_mes_zasald_orson === 'yes'
            ? `
        <tr>
          <td>Мэс заслын огноо</td>
          <td>${Data.mes_zasal_date || '---'}</td>
        </tr>
        `
            : ''
        }
      </table>

      <div style="margin-top: 10px; text-align: right;">
        <div>Эмч: ${DoctorsProfile.FullName || '---'}</div>
        <div>Огноо: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>
  </body>
</html>`;
}

module.exports = ValveDiseasesEndo;
