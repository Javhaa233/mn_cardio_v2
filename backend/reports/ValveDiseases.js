function ValveDiseases(Data) {
  const ValveData = Data?.ValveData || Data?.responseData?.Data || Data?.Data || {};
  const patient = ValveData?.Patient || {};
  const doctor = ValveData?.DoctorsProfile || {};
  const org = ValveData?.Organization || {};

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toLocaleDateString();
  };

  const renderRow = (label, value) => `
    <tr>
      <td style="width: 50%;">${label}</td>
      <td style="width: 50%; text-align: center;">${value ?? '—'}</td>
    </tr>`;

  const renderSection = (title, rows) => `
    <table>
      <thead><tr><th colspan="2">${title}</th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;

  // Patient Information
  const patientInfo = [
    renderRow('Овог, нэр', patient.FullName),
    renderRow('Регистр', patient.p_registration),
    renderRow('Нас', patient.Age),
    renderRow('Хүйс', patient.Gender?.label),
    renderRow('Төрсөн огноо', formatDate(patient.p_birthday)),
    renderRow('Хаяг', patient.p_address),
    renderRow('Утас 1', patient.p_telephone),
    renderRow('Утас 2', patient.p_telephone2),
  ];

  // Basic Examination
  const basicExam = [
    renderRow('Өндөр (см)', ValveData.undur),
    renderRow('Жин (кг)', ValveData.jin),
    renderRow('Онош тавьсан огноо', formatDate(ValveData.DiagnosedDate)),
    renderRow('Шинжилгээ хийсэн огноо', formatDate(ValveData.ShinjilgeeDate)),
    renderRow('Удамшил', ValveData.is_udamshil === 'yes' ? 'Тийм' : 'Үгүй'),
    renderRow('Харвалт', ValveData.is_harvalt === 'y' ? 'Тийм' : 'Үгүй'),
  ];

  // Laboratory Results
  const labResults = [
    renderRow('WBC', ValveData.wbc),
    renderRow('RBC', ValveData.rbc),
    renderRow('HB', ValveData.hb),
    renderRow('HCT', ValveData.hct),
    renderRow('PLT', ValveData.plt),
    renderRow('COE', ValveData.coe),
    renderRow('PT', ValveData.pt),
    renderRow('INR', ValveData.inr),
    renderRow('Fibrinogen', ValveData.fibrinogen),
    renderRow('TT', ValveData.tt),
    renderRow('APTT', ValveData.aptt),
    renderRow('Мочевин', ValveData.mochevin),
    renderRow('Креатинин', ValveData.creatinin),
    renderRow('ASLO', ValveData.aslo),
    renderRow('CRB', ValveData.crb),
    renderRow('RF', ValveData.rf),
    renderRow('Ниит уураг', ValveData.niit_uurag),
    renderRow('Альбумин', ValveData.alibumin),
    renderRow('ASAT', ValveData.asat),
    renderRow('ALAT', ValveData.alat),
    renderRow('Ниит билирубин', ValveData.niit_bilirubin),
    renderRow('GGT', ValveData.ggt),
    renderRow('Глюкоз', ValveData.glukoz),
    renderRow('HBsAg', ValveData.is_hbs_ag),
    renderRow('HCV', ValveData.is_hcv),
    renderRow('TEMBVV', ValveData.is_tembvv),
    renderRow('HIV', ValveData.is_hiv),
  ];

  // Echocardiography
  const echoResults = [
    renderRow('LVDD', ValveData.lvdd),
    renderRow('LVDS', ValveData.lvds),
    renderRow('IVSD', ValveData.ivsd),
    renderRow('PWD', ValveData.pwd),
    renderRow('LV Massi', ValveData.lv_massi),
    renderRow('LVEF', ValveData.lvef),
    renderRow('LV CLS', ValveData.lv_cls),
    renderRow('LA Volume', ValveData.la_volume),
    renderRow('EE Med', ValveData.ee_med),
    renderRow('EE Lat', ValveData.ee_lat),
    renderRow('Дундаж EE', ValveData.dundaj_ee),
    renderRow('TASLAWCH E', ValveData.taslawch_e),
    renderRow('Хажуу хана E', ValveData.hajuu_hana_e),
    renderRow('UUSHIG Systol Daralt', ValveData.uushig_systol_daralt),
    renderRow('TAPSE', ValveData.tapse),
    renderRow('RV FAC', ValveData.rv_fac),
    renderRow('SPAP', ValveData.spap),
  ];

  // Valve Specific Data
  const valveData = [
    renderSection('1. Гол судасны хавхлага', [
      renderRow('Нарийсалт', ValveData?.a_gol_sud_narObj?.Label),
      renderRow('Дутуу ажиллалт', ValveData?.a_gol_sud_dutObj?.Label),
      renderRow('Мэс ажилбар', ValveData?.a_gol_sud_mes_ajilObj?.Label),
      renderRow('Имплантын төрөл', ValveData?.a_gol_sud_imp_typeObj?.Label),
      renderRow('AOV Mean PG', ValveData.aov_mean_pg),
      renderRow('AOV V Max', ValveData.aov_v_max),
      renderRow('AOV PG Max', ValveData.aov_pg_max),
    ]),

    renderSection('2. Митрал хавхлага', [
      renderRow('Нарийсалт', ValveData?.a_mit_narObj?.Label),
      renderRow('Дутуу ажиллалт', ValveData?.a_mit_dutObj?.Label),
      renderRow('Мэс ажилбар', ValveData?.a_mit_mes_ajilObj?.Label),
      renderRow('Имплантын төрөл', ValveData?.a_mit_imp_typeObj?.Label),
      renderRow('MV Mean PG', ValveData.mv_mean_pg),
      renderRow('MV PHT', ValveData.mv_pht),
      renderRow('Wilkins Score', ValveData.vilkinsiin_shal_onoo),
    ]),

    renderSection('3. Баруун ховдлын хавхлагууд', [
      renderRow('Нарийсалт', ValveData?.a_vvd3xx_narObj?.Label),
      renderRow('Дутуу ажиллалт', ValveData?.a_vvd3xx_dutObj?.Label),
      renderRow('Мэс ажилбар', ValveData?.a_vvd3xx_mes_ajilObj?.Label),
      renderRow('Имплантын төрөл', ValveData?.a_vvd3xx_imp_typeObj?.Label),
    ]),

    renderSection('4. Уушгины хавхлага', [
      renderRow('Нарийсалт', ValveData?.a_ua_narObj?.Label),
      renderRow('Дутуу ажиллалт', ValveData?.a_ua_dutObj?.Label),
      renderRow('Мэс ажилбар', ValveData?.a_ua_mes_ajilObj?.Label),
      renderRow('Имплантын төрөл', ValveData?.a_ua_imp_typeObj?.Label),
    ]),
  ];

  // Surgery Details
  const surgeryDetails = [
    renderRow('Мэс заслын огноо', formatDate(ValveData.mes_zasal_date)),
    renderRow('Имплант код 1', ValveData.implant_kod1),
    renderRow('Имплант код 2', ValveData.implant_kod2),
    renderRow('Имплант код 3', ValveData.implant_kod3),
    renderRow('Имплант код 4', ValveData.implant_kod4),
    renderRow('St. Jude Medical хэмжээ', ValveData.st_jude_medical_hemjeeObj?.Label),
    renderRow('Medtronic хэмжээ', ValveData.medtronic_hemjeeObj?.Label),
    renderRow('Бентал мэс засал', ValveData.is_bental_mes === 'y' ? 'Тийм' : 'Үгүй'),
    renderRow('Дэвид мэс засал', ValveData.is_devid_mes === 'y' ? 'Тийм' : 'Үгүй'),
    renderRow('Цус алдагдал', ValveData.is_tsus_aldagdal === 'y' ? 'Тийм' : 'Үгүй'),
    renderRow('Хэм алдагдал', ValveData.is_hem_aldagdal === 'y' ? 'Тийм' : 'Үгүй'),
    renderRow(
      'Тархины цусны харвалт',
      ValveData.is_tarhinii_tsus_harwalt === 'y' ? 'Тийм' : 'Үгүй'
    ),
    renderRow('Хийн хиймэл хавхлагын хэмжээ', ValveData.hiimel_hawh_hemjee),
    renderRow('Хийн хиймэл хавхлагын төрөл', ValveData.hiimel_hawh_turul),
  ];

  // Post-Op Details
  const postOpDetails = [
    renderRow('Мэс заслын дараах INR', ValveData.mes_daraa_inrObj?.Label),
    renderRow('Мэс заслын дараах өндөр', ValveData.undur_mes_daraa),
    renderRow('Мэс заслын дараах жин', ValveData.jin_mes_daraa),
    renderRow('AD Deed', ValveData.ad_deed),
    renderRow('AD Dood', ValveData.ad_dood),
    renderRow('Пульс', ValveData.pulse),
    renderRow('Зүүн тосгуурын хэмжээ', ValveData.zvvn_tosguur),
    renderRow('Зүүн ховдлын хэмжээ', ValveData.zvvn_howdol),
    renderRow('Зүүн ховдлын агших чадвар', ValveData.zvvn_howdol_agshih_chadwar),
    renderRow('Регургитацийн зэрэг', ValveData.reg_hundiin_zereg),
  ];

  // Doctor Information
  const doctorInfo = [
    renderRow('Үзлэг хийсэн эмч', doctor?.FullName),
    renderRow('Байгууллага', org?.Name),
    renderRow('Үүсгэсэн огноо', formatDate(ValveData.CreatedDate)),
    renderRow('Баталгаажуулсан огноо', formatDate(ValveData.ConfirmedDate)),
  ];

  return `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
        h2 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
        .section-title { background: #eee; font-weight: bold; padding: 6px; }
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <h2>Зүрхний хавхлагын онош болон мэс заслын төлөвлөгөө</h2>

      ${renderSection('Өвчтөний ерөнхий мэдээлэл', patientInfo)}
      ${renderSection('Үндсэн шинжилгээ', basicExam)}
      ${renderSection('Лабораторийн үр дүн', labResults)}
      ${renderSection('Эхокардиографийн үр дүн', echoResults)}
      ${valveData.join('')}
      ${renderSection('Мэс заслын дэлгэрэнгүй', surgeryDetails)}
      ${renderSection('Мэс заслын дараах үр дүн', postOpDetails)}
      ${renderSection('Эмчийн мэдээлэл', doctorInfo)}

      <p style="margin-top: 40px;">Гарын үсэг: _____________________________</p>
    </body>
  </html>
  `;
}

module.exports = ValveDiseases;
