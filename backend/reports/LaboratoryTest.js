function LaboratoryTest(Data) {
  const LabData = Data?.LabData || Data?.responseData?.Data || Data?.Data || {};
  const patient = LabData?.Patient || {};
  const doctor = LabData?.DoctorsProfile || {};
  const org = LabData?.Organization || {};

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

  // Basic Information
  const basicInfo = [
    renderRow('Шинжилгээ өгсөн огноо', formatDate(LabData.LaboratoryTestDate)),
    renderRow('Зовиур', LabData.complaint),
    renderRow('Хавсарсан эмгэг', LabData.disorders),
    renderRow('Тогтмол уудаг эм', LabData.regular_medication),
    renderRow('Онош', LabData.diagnosis),
  ];

  // Blood Test Results
  const bloodTestResults = [
    renderRow('Огноо', formatDate(LabData.blood_test_date)),
    renderRow('WBC', LabData.wbc),
    renderRow('RBC', LabData.rbc),
    renderRow('Hb', LabData.hb),
    renderRow('Hct', LabData.hct),
    renderRow('Platelet', LabData.platelet),
    renderRow('СОЭ', LabData.coe),
    renderRow('Euro score II', LabData.euro_score_2),
    renderRow('Logistic Euroscore', LabData.logistic_euroscore),
    renderRow('STS', LabData.sts),
    renderRow('NYHA class', LabData.nyha),
  ];

  // Liver Test Results
  const liverTestResults = [
    renderRow('Огноо', LabData.liver_test_date),
    renderRow('Нийт уураг (г/л)', LabData.total_proteoin),
    renderRow('Альбумин', LabData.albumin),
    renderRow('АСАТ', LabData.asat),
    renderRow('АЛАТ', LabData.alat),
    renderRow('Нийт Билирубин', LabData.total_bilirubin),
    renderRow('ГГТ', LabData.ggt),
    renderRow('Глюкоз', LabData.glucose),
  ];

  // Kidney Test Results
  const kidneyTestResults = [
    renderRow('Огноо', LabData.kidney_test_date),
    renderRow('Мочевин', LabData.mochevin),
    renderRow('Креатинин', LabData.creatinine),
    renderRow('HbsAg', LabData.hbs_ag),
    renderRow('HCV', LabData.hcv),
    renderRow('Тэмбүү', LabData.syphilis),
    renderRow('HIV', LabData.hiv),
  ];

  // Blood Coagulation Results
  const coagulationResults = [
    renderRow('Огноо', LabData.tsusnii_bulegnelt_date),
    renderRow('PT', LabData.pt),
    renderRow('INR', LabData.inr),
    renderRow('Fibrinogen', LabData.fibrinogen),
    renderRow('TT', LabData.tt),
    renderRow('АРТТ', LabData.aptt),
  ];

  // Additional Tests
  const additionalTests = [
    renderRow('Цээжний КТГ', LabData.chest_ktg),
    renderRow('Цээжний рентген зураг', LabData.chest_xray),
    renderRow('Хэвлийн эхо', LabData.abdomen_echo),
    renderRow('Спирометр', LabData.spirometry),
    renderRow('КАГ', LabData.chatlab),
    renderRow('Мэс заслын төлөвлөгөө', LabData.surgical_plan),
  ];

  // Doctor Information
  const doctorInfo = [
    renderRow('Үзлэг хийсэн эмч', doctor?.FullName),
    renderRow('Байгууллага', org?.Name),
    renderRow('Үүсгэсэн огноо', formatDate(LabData.CreateDate)),
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
      <h2>Лабораторийн шинжилгээний үр дүн</h2>

      ${renderSection('Өвчтөний ерөнхий мэдээлэл', patientInfo)}
      ${renderSection('Ерөнхий мэдээлэл', basicInfo)}
      ${renderSection('Цусны ерөнхий шинжилгээ', bloodTestResults)}
      ${renderSection('Элэгний шинжилгээ', liverTestResults)}
      ${renderSection('Бөөрний шинжилгээ', kidneyTestResults)}
      ${renderSection('Цусны бүлэгнэлт', coagulationResults)}
      ${renderSection('Нэмэлт шинжилгээнүүд', additionalTests)}
      ${renderSection('Эмчийн мэдээлэл', doctorInfo)}

      <p style="margin-top: 40px;">Гарын үсэг: _____________________________</p>
    </body>
  </html>
  `;
}

module.exports = LaboratoryTest;
