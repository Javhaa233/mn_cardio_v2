function VascularDisease(Data) {
  const diseaseData = Data?.Data || {};
  const treatmentData = Data?.TreatmentData || {};
  const patient = diseaseData?.Patient || {};
  const doctor = diseaseData?.DoctorsProfile || {};

  // Helper functions to format data
  const formatArray = (arr) =>
    arr && arr.length > 0 ? arr.map((item) => item.Label).join(', ') : '-';
  const formatValue = (val) => (val !== null && val !== undefined ? val : '-');
  const formatBool = (val) => {
    if (val === 'y') return 'Тийм';
    if (val === 'n') return 'Үгүй';
    return '-';
  };

  // Extract array data
  const heartache = formatArray(diseaseData?.heartacheObj);
  const rhythm = formatArray(diseaseData?.rhythmObj);
  const blocks = formatArray(diseaseData?.zurh_horigObj);
  const gissBlocks = formatArray(diseaseData?.giss_horigObj);
  const notCheckReasons = formatArray(treatmentData?.emchilgee_notcheckObj);
  const betaBlockers = formatArray(treatmentData?.beta_horiglogch_nershilObj);
  const mraCheck = formatArray(treatmentData?.mra_checkObj);
  const sglt2Check = formatArray(treatmentData?.sglt2_checkObj);
  const antiagregant = formatArray(treatmentData?.vd_antiagregant_checkObj);
  const antikoagulyant = formatArray(treatmentData?.vd_antikoagulyant_checkObj);
  const sheesHuuh = formatArray(treatmentData?.shees_huuh_em_checkObj);
  const lipid = formatArray(treatmentData?.lipid_buuruulah_em_checkObj);

  return `<html>
  <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
        h2 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
        .section-title { background: #eee; font-weight: bold; padding: 6px; margin-top: 20px; }
        .sub-section { margin-left: 20px; }
      </style>
  </head>
  <body>
    <div class="main">
      <h2 style="text-align: center;">Судасны эмгэгийн мэдээлэл</h2>

      <!-- Patient Information -->
      <div class="section-title">Өвчтөний мэдээлэл</div>
      <table>
        <tr><th width="25%">Өвчтөний нэр</th><td>${patient.FullName || '-'}</td></tr>
        <tr><th>Регистр</th><td>${patient.p_registration || '-'}</td></tr>
        <tr><th>Нас</th><td>${patient.Age || '-'}</td></tr>
        <tr><th>Хүйс</th><td>${patient?.Gender?.label || '-'}</td></tr>
        <tr><th>Төрсөн огноо</th><td>${patient.p_birthday || '-'}</td></tr>
        <tr><th>Гар утас</th><td>${patient.p_telephone || '-'}</td></tr>
        <tr><th>Хаяг</th><td>${patient.p_address || '-'}</td></tr>
        <tr><th>Үүсгэсэн огноо</th><td>${diseaseData?.CreatedDate || '-'}</td></tr>
        <tr><th>Эмч</th><td>${doctor.FullName || '-'}</td></tr>
      </table>

      <!-- Clinical Information -->
      <div class="section-title">Клиник мэдээлэл</div>
      <table>
        <tr><th width="25%">Цээжний өвдөлт</th><td>${heartache}</td></tr>
        <tr><th>Цээжний өвдөлтийн тэмдэглэл</th><td>${formatValue(
          diseaseData?.heartache_other
        )}</td></tr>
        <tr><th>CCS ангилал</th><td>${diseaseData?.vd_ccs_angilalObj?.Label || '-'}</td></tr>
        <tr><th>Цусны даралт</th><td>${formatValue(
          diseaseData?.ad_deed
        )}/${formatValue(diseaseData?.ad_dood)}</td></tr>
        <tr><th>Зүрхний цохилт</th><td>${formatValue(diseaseData?.ztst)}</td></tr>
        <tr><th>Өндөр</th><td>${formatValue(diseaseData?.undur)} см</td></tr>
        <tr><th>Жин</th><td>${formatValue(diseaseData?.jin)} кг</td></tr>
        <tr><th>BJI</th><td>${formatValue(diseaseData?.bji)}</td></tr>
        <tr><th>BGT</th><td>${formatValue(diseaseData?.bgt)}</td></tr>
      </table>

      <!-- Laboratory Results -->
      <div class="section-title">Лабораторийн үр дүн</div>
      <table>
        <tr>
          <th width="25%">WBC</th><td>${formatValue(diseaseData?.wbc)}</td>
          <th>LDL</th><td>${formatValue(diseaseData?.ldl)}</td>
        </tr>
        <tr>
          <th>RBC</th><td>${formatValue(diseaseData?.rbc)}</td>
          <th>HDL</th><td>${formatValue(diseaseData?.hdl)}</td>
        </tr>
        <tr>
          <th>HGB</th><td>${formatValue(diseaseData?.hgb)}</td>
          <th>Холестерин</th><td>${formatValue(diseaseData?.cholesterine)}</td>
        </tr>
        <tr>
          <th>HCT</th><td>${formatValue(diseaseData?.hct)}</td>
          <th>Триглицерид</th><td>${formatValue(diseaseData?.triglyceride)}</td>
        </tr>
        <tr>
          <th>PLT</th><td>${formatValue(diseaseData?.plt)}</td>
          <th>Кали</th><td>${formatValue(diseaseData?.kali)}</td>
        </tr>
        <tr>
          <th>Креатинин</th><td>${formatValue(diseaseData?.creatinin)}</td>
          <th>Креатинин төрөл</th><td>${diseaseData?.creatinin_typeObj?.Label || '-'}</td>
        </tr>
        <tr>
          <th>Мочевин</th><td>${formatValue(diseaseData?.mochevin)}</td>
          <th>eGFR</th><td>${formatValue(diseaseData?.egfr)}</td>
        </tr>
        <tr>
          <th>ASAT</th><td>${formatValue(diseaseData?.asat)}</td>
          <th>ALAT</th><td>${formatValue(diseaseData?.alam)}</td>
        </tr>
        <tr>
          <th>Ферритин</th><td>${formatValue(diseaseData?.ferritin)}</td>
          <th>CRP</th><td>${formatValue(diseaseData?.sensitive_crp)}</td>
        </tr>
        <tr>
          <th>NT-proBNP</th><td>${formatValue(diseaseData?.nt_pro_np)}</td>
          <th>Глюкоз</th><td>${formatValue(diseaseData?.sanamsargui_glukoz)}</td>
        </tr>
        <tr>
          <th>HbA1c</th><td>${formatValue(diseaseData?.hba_1_c)}</td>
          <th>Тропонин</th><td>${formatValue(diseaseData?.troponin)}</td>
        </tr>
      </table>

      <!-- ECG Information -->
      <div class="section-title">Зүрхний цахилгаан бичлэг</div>
      <table>
        <tr><th width="25%">Хэмнэл</th><td>${rhythm}</td></tr>
        <tr><th>Зүрхний хориг</th><td>${blocks}</td></tr>
        <tr><th>Гиссийн хориг</th><td>${gissBlocks}</td></tr>
        <tr><th>QRS бүрдэл</th><td>${formatValue(diseaseData?.qrs_burdel)}</td></tr>
        <tr><th>ST хэсгийн өөрчлөлт</th><td>${diseaseData?.vd_st_buultObj?.Label || '-'}</td></tr>
        <tr><th>ST хэсгийн өргөгдөл</th><td>${
          diseaseData?.vd_st_urgugdulObj?.Label || '-'
        }</td></tr>
        <tr><th>Т-шүд</th><td>${diseaseData?.vd_surug_t_shvdObj?.Label || '-'}</td></tr>
      </table>

      <!-- Echocardiography -->
      <div class="section-title">Эхокардиографи</div>
      <table>
        <tr>
          <th width="25%">LVDD</th><td>${formatValue(diseaseData?.lvdd)}</td>
          <th>LVDS</th><td>${formatValue(diseaseData?.lvds)}</td>
        </tr>
        <tr>
          <th>IVSD</th><td>${formatValue(diseaseData?.ivsd)}</td>
          <th>PWD</th><td>${formatValue(diseaseData?.pwd)}</td>
        </tr>
        <tr>
          <th>LV масс</th><td>${formatValue(diseaseData?.lv_mass)}</td>
          <th>LVEF (Teicholz)</th><td>${formatValue(diseaseData?.lvef_teicholz)}</td>
        </tr>
        <tr>
          <th>LVEF (Simpson)</th><td>${formatValue(diseaseData?.lvef_simpson_method)}</td>
          <th>LV GLS</th><td>${formatValue(diseaseData?.lv_gls)}</td>
        </tr>
        <tr>
          <th>LA эзэлхүүн</th><td>${formatValue(diseaseData?.la_volume)}</td>
          <th>EE медиаль</th><td>${formatValue(diseaseData?.ee_med)}</td>
        </tr>
        <tr>
          <th>EE латераль</th><td>${formatValue(diseaseData?.ee_lat)}</td>
          <th>Дундаж EE</th><td>${formatValue(diseaseData?.dundaj_ee)}</td>
        </tr>
        <tr>
          <th>TAPSE</th><td>${formatValue(diseaseData?.tapse)}</td>
          <th>RV FAC</th><td>${formatValue(diseaseData?.rv_fac)}</td>
        </tr>
      </table>

      <!-- Treatment Information -->
      <div class="section-title">Эмчилгээний мэдээлэл</div>
      <table>
        <tr><th width="25%">Эмчилгээ хийсэн эсэх</th><td>${
          treatmentData?.emchilgee_checkObj?.Label || '-'
        }</td></tr>
        <tr><th>Хийгдээгүй шалтгаан</th><td>${notCheckReasons}</td></tr>
        <tr><th>ACE inhibitor</th><td>${
          treatmentData?.axpc_nershilObj?.Label || '-'
        } (${formatValue(treatmentData?.axpc_tun)})</td></tr>
        <tr><th>ARB</th><td>${
          treatmentData?.apc_nershilObj?.Label || '-'
        } (${formatValue(treatmentData?.apc_tun)})</td></tr>
        <tr><th>Бета хориглуулагч</th><td>${formatBool(
          treatmentData?.is_beta_horiglogch
        )}: ${betaBlockers} (${formatValue(treatmentData?.beta_horiglogch_tun)})</td></tr>
        <tr><th>MRA</th><td>${formatBool(
          treatmentData?.is_mra
        )}: ${mraCheck} (${formatValue(treatmentData?.mra_tun)})</td></tr>
        <tr><th>SGLT2 inhibitor</th><td>${formatBool(
          treatmentData?.is_sglt2
        )}: ${sglt2Check} (${formatValue(treatmentData?.sglt2_tun)})</td></tr>
        <tr><th>Антиагрегант</th><td>${formatBool(
          treatmentData?.is_antiagregant
        )}: ${antiagregant}</td></tr>
        <tr><th>Антиагрегант 1</th><td>${formatValue(
          treatmentData?.vd_antiagregant_em_ner
        )} (${formatValue(treatmentData?.vd_antiagregant_tun)})</td></tr>
        <tr><th>Антиагрегант 2</th><td>${formatValue(
          treatmentData?.vd_antiagregant_em_ner1
        )} (${formatValue(treatmentData?.vd_antiagregant_tun1)})</td></tr>
        <tr><th>Антиагрегант 3</th><td>${formatValue(
          treatmentData?.vd_antiagregant_em_ner2
        )} (${formatValue(treatmentData?.vd_antiagregant_tun2)})</td></tr>
        <tr><th>Антикоагулянт</th><td>${formatBool(
          treatmentData?.is_antikoagulyant
        )}: ${antikoagulyant}</td></tr>
        <tr><th>Антикоагулянт тэмдэглэл</th><td>${formatValue(
          treatmentData?.vd_antikoagulyant_other
        )}</td></tr>
        <tr><th>Антикоагулянт 1</th><td>${formatValue(
          treatmentData?.vd_antikoagulyant_em_ner
        )} (${formatValue(treatmentData?.vd_antikoagulyant_tun)})</td></tr>
        <tr><th>Шээс гаргагч</th><td>${formatBool(
          treatmentData?.is_shees_huuh_em
        )}: ${sheesHuuh} (${formatValue(treatmentData?.shees_huuh_em_tun)})</td></tr>
        <tr><th>Липид бууруулах</th><td>${formatBool(
          treatmentData?.is_lipid_buuruulah
        )}: ${lipid} (${formatValue(treatmentData?.lipid_buuruulah_em_tun)})</td></tr>
      </table>

      <!-- Additional Notes -->
      <div class="section-title">Нэмэлт тэмдэглэл</div>
      <table>
        <tr><td>${formatValue(treatmentData?.notes)}</td></tr>
      </table>
    </div>
  </body>
</html>`;
}

module.exports = VascularDisease;
