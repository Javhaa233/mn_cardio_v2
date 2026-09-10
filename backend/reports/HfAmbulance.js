function HfAmbulance(Data) {
  const { AmbulanceData, TestData, TreatmentData, PatientData } = Data;

  const patient = AmbulanceData?.Patient || PatientData || {};
  const doctor = AmbulanceData?.DoctorsProfile || {};
  const org = AmbulanceData?.Organization || {};

  const renderRow = (label, value) => `
    <tr>
      <td style="width: 40%;">${label}</td>
      <td>${value ?? ''}</td>
    </tr>`;

  const renderMultiple = (label, items) => {
    if (!Array.isArray(items) || items.length === 0) return '';
    const labels = items.map((i) => i.Label || i).join(', ');
    return renderRow(label, labels);
  };

  const boolToLabel = (val) => (val === 'y' ? 'Тийм' : val === 'n' ? 'Үгүй' : '');

  return `
  <html>
    <head>
      <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px;}
          .section-title { background: #eee; font-weight: bold; padding: 6px; }
        </style>
    </head>
    <body>
      <h2 style="text-align: center;">АМБУЛАТОРИЙН ҮЗЛЭГ</h2>

      <!-- Ерөнхий мэдээлэл -->
      <table>
        <thead><tr><th colspan="2">Эмчлүүлэгчийн ерөнхий мэдээлэл</th></tr></thead>
        <tbody>
          ${renderRow('Овог, Нэр', patient.FullName)}
          ${renderRow('РД', patient.p_registration)}
          ${renderRow('Нас', patient.Age)}
          ${renderRow('Хүйс', patient.Gender?.label)}
          ${renderRow('Төрсөн огноо', patient.p_birthday)}
          ${renderRow('Утас 1', patient.p_telephone)}
          ${renderRow('Утас 2', patient.p_telephone2)}
          ${renderRow('Хаяг', patient.p_address)}
        </tbody>
      </table>

      <!-- Үзлэгийн мэдээлэл -->
      <table>
        <thead><tr><th colspan="2">Үзлэгийн мэдээлэл</th></tr></thead>
        <tbody>
          ${renderRow('Үзлэгийн төрөл', AmbulanceData?.ambulance_typeObj?.Label)}
          ${renderRow('Оношлогдсон он', AmbulanceData?.diagnosed_year)}
          ${renderRow('Байгууллага', org?.Name)}
          ${renderRow('Үзлэг хийсэн эмч', doctor?.FullName)}
          ${renderRow('NYHA ангилал', AmbulanceData?.nyhaObj?.Label)}
          ${renderRow('АД', `${AmbulanceData?.ad_deed}/${AmbulanceData?.ad_dood}`)}
          ${renderRow('ЗЦТ', AmbulanceData?.zts)}
          ${renderRow('Жин', AmbulanceData?.jin)}
        </tbody>
      </table>

      <!-- Зовиур -->
      <table>
        <thead><tr><th colspan="2">Зовиур</th></tr></thead>
        <tbody>
          ${renderMultiple('Зовиур', AmbulanceData?.heartacheObj)}
          ${renderRow('Бусад зовиур', AmbulanceData?.heartache_other)}
        </tbody>
      </table>

      <!-- Шинж тэмдгүүд -->
      <table>
        <thead><tr><th colspan="2">Шинж тэмдгүүд</th></tr></thead>
        <tbody>
          ${renderMultiple('Захын шинж', AmbulanceData?.hf_zahiin_shinj_codeObj)}
          ${renderMultiple('Уушгины шинж', AmbulanceData?.hf_uushig_shinj_codeObj)}
          ${renderMultiple('Зүрхний шинж', AmbulanceData?.hf_zurh_shinj_codeObj)}
          ${renderMultiple('Хэвлийн шинж', AmbulanceData?.hf_hevliin_shinj_codeObj)}
        </tbody>
      </table>

      <!-- Эмчилгээ -->
      <table>
        <thead><tr><th colspan="2">Эмчилгээ</th></tr></thead>
        <tbody>
          ${renderRow('АХФС/АРХ', TreatmentData?.hf_emchilgee_checkObj?.Label)}
          ${renderRow('ACE нэршил', TreatmentData?.hf_axpc_nershilObj?.Label)}
          ${renderRow('ARB нэршил', TreatmentData?.hf_apc_nershilObj?.Label)}
          ${renderRow('Бета хориглогч', TreatmentData?.hf_beta_horiglogch_nershilObj?.Label)}
          ${renderRow('MRA', TreatmentData?.hf_mra_checkObj?.Label)}
          ${renderRow('SGLT2', TreatmentData?.hf_sglt2_checkObj?.Label)}
          ${renderRow('Антитромботик', TreatmentData?.hf_antitrombotic_checkObj?.Label)}
          ${renderRow('Шээс хөөх', TreatmentData?.hf_shees_huuh_em_checkObj?.Label)}
          ${renderRow('Lipid бууруулах', TreatmentData?.hf_lipid_buuruulah_em_checkObj?.Label)}
          ${renderRow('Судас тэлэгч', TreatmentData?.hf_sudas_telegch_em_checkObj?.Label)}
          ${renderRow('Төхөөрөмж зөвлөмж', TreatmentData?.hf_tuhuurumj_zowloson_checkObj?.Label)}
        </tbody>
      </table>

      <!-- Лабораторийн шинжилгээ -->
      <table>
        <thead><tr><th colspan="2">Шинжилгээ</th></tr></thead>
        <tbody>
          ${renderRow('Огноо', TestData?.test_date)}
          ${renderRow('Цусны цагаан эс', TestData?.tsagaan_es)}
          ${renderRow('Ялтас эс', TestData?.yaltas_es)}
          ${renderRow('Гемоглобин', TestData?.gemoglobin)}
          ${renderRow('Натри', TestData?.natri)}
          ${renderRow('Кали', TestData?.kali)}
          ${renderRow('Шээсний хүчил', TestData?.sheesnii_huchil)}
          ${renderRow('Креатинин', TestData?.creatinin)}
          ${renderRow('Мочевин', TestData?.mochevin)}
          ${renderRow('Альбумин', TestData?.albumin)}
          ${renderRow('ALAT', TestData?.alat)}
          ${renderRow('GGT', TestData?.g_g_t)}
          ${renderRow('Digoksin level', TestData?.digoksin_level)}
          ${renderRow('Төмөр', TestData?.tumur)}
          ${renderRow('Ferritin', TestData?.ferritin)}
          ${renderRow('NT-proBNP', TestData?.n_t_pro_b_n_p)}
          ${renderRow('BNP', TestData?.b_n_p)}
          ${renderRow('HbA1c', TestData?.hb_a1c)}
        </tbody>
      </table>
          <p style="margin-top: 40px;">Гарын үсэг: _____________________________</p>
    </body>
  </html>
  `;
}

module.exports = HfAmbulance;
