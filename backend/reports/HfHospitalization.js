function HfHospitalization({ HospitalizationData }) {
  const data = HospitalizationData || {};
  const patient = data.Patient || {};
  const doctor = data.DoctorsProfile || {};
  const organization = data.Organization || {};

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 10px;}
          .section-title { background: #eee; font-weight: bold; padding: 6px; }
          .sub-section { margin-left: 15px; }
        </style>
      </head>
      <body>
        <div>Огноо: ${data.CreatedDate || '-'}</div>
        <div>Эмчийн нэр: ${doctor.FullName || '-'}</div>
        <h2>Зүрхний дутагдал (Хэвтэн эмчлүүлэгч)</h2>

        <div class="section-title">Өвчтөний мэдээлэл</div>
        <table>
          <tr><th>Өвчтөний нэр:</th><td>${patient.FullName || '-'}</td></tr>
          <tr><th>Нас:</th><td>${patient.Age || '-'}</td></tr>
          <tr><th>Хүйс:</th><td>${patient.Gender?.label || '-'}</td></tr>
          <tr><th>Регистрийн дугаар:</th><td>${patient.p_registration || '-'}</td></tr>
          <tr><th>Хаяг:</th><td>${patient.p_address || '-'}</td></tr>
          <tr><th>Утас 1:</th><td>${patient.p_telephone || '-'}</td></tr>
          <tr><th>Утас 2:</th><td>${patient.p_telephone2 || '-'}</td></tr>
        </table>

        <div class="section-title">Эмнэлэгт хэвтэлтийн мэдээлэл</div>
        <table>
          <tr><th>Эмнэлэг:</th><td>${organization.Name || '-'}</td></tr>
          <tr><th>Тасаг:</th><td>${data.tasagObj?.Label || '-'}</td></tr>
          <tr><th>Хэвтсэн огноо:</th><td>${data.hospitalized_date || '-'}</td></tr>
          <tr><th>Гарсан огноо:</th><td>${data.discharge_date || '-'}</td></tr>
          <tr><th>Өвчний түүхийн дугаар:</th><td>${data.history_no || '-'}</td></tr>
          <tr><th>Хэвтсэн хоног:</th><td>${data.or_honog || '-'}</td></tr>
          <tr><th>Тасгийн нэмэлт:</th><td>${data.tasag_other || '-'}</td></tr>
          <tr><th>Хэвтэлтийн төрөл:</th><td>${data.hf_hevtelt || '-'}</td></tr>
        </table>

        <div class="section-title">Оношлогдсон онош / Хавсарсан өвчнүүд</div>
        <table>
          <tr><th>Үндсэн онош:</th><td>Зүрхний дутагдал</td></tr>
          <tr><th>Хавсарсан онош:</th><td>${
            data.hf_hawsarsan_emgegObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Өвчний түүх:</th><td>${
            data.hf_uwchinii_tvvhObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Өвчний түүхийн нэмэлт:</th><td>${data.hf_uwchinii_tvvh_other || '-'}</td></tr>
          <tr><th>Зүрхний дутагдлын төрөл:</th><td>${
            data.hf_cardiomiopati_turulObj?.Label || '-'
          }</td></tr>
        </table>

        <div class="section-title">Зүрх судасны шинж тэмдгүүд</div>
        <table>
          <tr><th>Амьсгаадах шинж:</th><td>${
            data.heartacheObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Амьсгаадах шинж нэмэлт:</th><td>${data.heartache_other || '-'}</td></tr>
          <tr><th>Зүрхний шинжүүд:</th><td>${
            data.hf_zurh_shinj_codeObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Зүрхний хэвийн бус үйл ажиллагаа:</th><td>${data.hf_zurh_shinj || '-'}</td></tr>
          <tr><th>Уушгины шинж:</th><td>${
            data.hf_uushig_shinj_codeObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Хэвлийн шинж:</th><td>${
            data.hf_hevliin_shinj_codeObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Зүрхний хэвийн бус цохилт:</th><td>${data.hf_rhythmObj?.Label || '-'}</td></tr>
          <tr><th>Зүрхний хэвийн бус цохилт нэмэлт:</th><td>${data.hf_rhythm_other || '-'}</td></tr>
        </table>

        <div class="section-title">Лабораторийн шинжилгээ</div>
        <table>
          <tr><th>Шинжилгээний огноо:</th><td>${data.laboratory_test_date || '-'}</td></tr>
          <tr><th>Цусны цагаан эс (WBC):</th><td>${data.tsagaan_es || '-'}</td></tr>
          <tr><th>Улаан эс (RBC):</th><td>${data.ulaan_es || '-'}</td></tr>
          <tr><th>Ялтас (PLT):</th><td>${data.yaltas_es || '-'}</td></tr>
          <tr><th>Гемоглобин:</th><td>${data.gemoglobin || '-'}</td></tr>
          <tr><th>Натри:</th><td>${data.natri || '-'}</td></tr>
          <tr><th>Кали:</th><td>${data.kali || '-'}</td></tr>
          <tr><th>Шээсний хүчил:</th><td>${data.sheesnii_huchil || '-'}</td></tr>
          <tr><th>Креатинин:</th><td>${data.creatinin || '-'} ${
            data.creatinin_typeObj?.Label || ''
          }</td></tr>
          <tr><th>Мочевин:</th><td>${data.mochevin || '-'}</td></tr>
          <tr><th>Альбумин:</th><td>${data.albumin || '-'}</td></tr>
          <tr><th>ТТГ:</th><td>${data.t_sh_h || '-'}</td></tr>
          <tr><th>АЛАТ:</th><td>${data.alat || '-'}</td></tr>
          <tr><th>АСАТ:</th><td>${data.asat || '-'}</td></tr>
          <tr><th>ГГТ:</th><td>${data.g_g_t || '-'}</td></tr>
          <tr><th>Digoksin түвшин:</th><td>${data.digoksin_level || '-'}</td></tr>
          <tr><th>NT-proBNP:</th><td>${data.n_t_pro_b_n_p || '-'}</td></tr>
          <tr><th>BNP:</th><td>${data.b_n_p || '-'}</td></tr>
          <tr><th>Тумэр маркер:</th><td>${data.tumur || '-'}</td></tr>
          <tr><th>Ферритин:</th><td>${data.ferritin || '-'} ${
            data.ferritin_typeObj?.Label || ''
          }</td></tr>
          <tr><th>Санамсаргүй глюкоз:</th><td>${data.sanamsargui_glukoz || '-'}</td></tr>
          <tr><th>HbA1c:</th><td>${data.hb_a1c || '-'}</td></tr>
          <tr><th>СРБ:</th><td>${data.s_r_b || '-'}</td></tr>
        </table>

        <div class="section-title">Цээжний рентген</div>
        <table>
          <tr><th>Огноо:</th><td>${data.tseej_rent_date || '-'}</td></tr>
          <tr><th>Өөрчлөлт:</th><td>${data.hf_tseej_rentgen_uurchlutObj?.Label || '-'}</td></tr>
          <tr><th>Өөрчлөлтийн нэмэлт:</th><td>${
            data.hf_tseej_rentgen_uurchlut_other || '-'
          }</td></tr>
        </table>

        <div class="section-title">Зүрхний дууны шинжилгээ</div>
        <table>
          <tr><th>Огноо:</th><td>${data.het_avia_date || '-'}</td></tr>
          <tr><th>LVDD:</th><td>${data.lvdd || '-'}</td></tr>
          <tr><th>LVDS:</th><td>${data.lvds || '-'}</td></tr>
          <tr><th>IVSS:</th><td>${data.ivss || '-'}</td></tr>
          <tr><th>PWD:</th><td>${data.pwd || '-'}</td></tr>
          <tr><th>LV mass:</th><td>${data.lvmass || '-'}</td></tr>
          <tr><th>LVEF:</th><td>${data.lvef || '-'}</td></tr>
          <tr><th>LV strain:</th><td>${data.lv_strain || '-'}</td></tr>
          <tr><th>LA volume:</th><td>${data.la_volume || '-'}</td></tr>
          <tr><th>LA area:</th><td>${data.la_area || '-'}</td></tr>
          <tr><th>E/e' med:</th><td>${data.e_e_med || '-'}</td></tr>
          <tr><th>E/e' lat:</th><td>${data.e_e_lat || '-'}</td></tr>
          <tr><th>e' med:</th><td>${data.e_med || '-'}</td></tr>
          <tr><th>e' lat:</th><td>${data.e_lat || '-'}</td></tr>
          <tr><th>Уушгины systolic даралт:</th><td>${data.uushig_systol_daralt || '-'}</td></tr>
          <tr><th>TAPSE:</th><td>${data.tapse || '-'}</td></tr>
          <tr><th>RV FAC:</th><td>${data.rv_fac || '-'}</td></tr>
          <tr><th>RVW d:</th><td>${data.rvw_d || '-'}</td></tr>
        </table>

        <div class="section-title">Цахилгаан зүрхний шинжилгээ</div>
        <table>
          <tr><th>Огноо:</th><td>${data.tsa_bichleg_date || '-'}</td></tr>
          <tr><th>QRS бүрдэл:</th><td>${data.qrs_burdel || '-'}</td></tr>
          <tr><th>Зүрхний хэвийн бус цохилт:</th><td>${data.hf_rhythmObj?.Label || '-'}</td></tr>
          <tr><th>Зүрхний хоргил:</th><td>${data.hf_zurh_horigObj?.Label || '-'}</td></tr>
          <tr><th>Зүрхний хоргилын нэмэлт:</th><td>${data.hf_zurh_horig_other || '-'}</td></tr>
        </table>

        <div class="section-title">Эмийн эмчилгээ (оруулах үеийн)</div>
        <table>
          <tr><th>АРНС:</th><td>${data.g_hf_emchilgee_checkObj?.Label || '-'}</td></tr>
          <tr><th>Бета хориглогч:</th><td>${
            data.g_is_beta_horiglogchObj?.Label === 'Тийм'
              ? data.g_hf_beta_horiglogch_nershilObj?.Label +
                ' - ' +
                data.g_hf_beta_horiglogch_tun +
                'мг'
              : 'Үгүй'
          }</td></tr>
          <tr><th>MRA:</th><td>${
            data.g_is_mraObj?.Label === 'Тийм'
              ? data.g_hf_mra_checkObj?.Label + ' - ' + data.g_hf_mra_tun + 'мг'
              : 'Үгүй'
          }</td></tr>
          <tr><th>SGLT2:</th><td>${
            data.g_is_sglt2Obj?.Label === 'Тийм'
              ? data.g_hf_sglt2_checkObj?.Label + ' - ' + data.g_hf_sglt2_tun + 'мг'
              : 'Үгүй'
          }</td></tr>
          <tr><th>Digoksin:</th><td>${data.g_is_digoksinObj?.Label || '-'}</td></tr>
          <tr><th>Antitrombotic:</th><td>${
            data.g_is_antitromboticObj?.Label === 'Тийм'
              ? 'Тун: ' + data.g_hf_antitrombotic_tun
              : 'Үгүй'
          }</td></tr>
          <tr><th>Шээс хөөх эм:</th><td>${data.g_is_shees_huuh_emObj?.Label || '-'}</td></tr>
          <tr><th>Липид бууруулах эм:</th><td>${
            data.g_is_lipid_buuruulahObj?.Label || '-'
          }</td></tr>
          <tr><th>Судас тэлэгч:</th><td>${data.g_is_sudas_telegchObj?.Label || '-'}</td></tr>
        </table>

        <div class="section-title">Гарсан байдал</div>
        <table>
          <tr><th>Эмнэлгээс гарсан байдал:</th><td>${
            data.hf_emnlegees_garsan_baidalObj?.Label || '-'
          }</td></tr>
          <tr><th>Амбулаторийн хяналт:</th><td>${data.is_hyanaltObj?.Label || '-'}</td></tr>
          <tr><th>Хяналтанд авах санал болгоогүй шалтгаан:</th><td>${
            data.hf_ambultoriin_hynalt_sanal_bolgoogvi || '-'
          }</td></tr>
          <tr><th>Хэвтэн эмчлүүлэхэд нөлөөлсөн хүчин зүйлс:</th><td>${
            data.hf_hewtehed_nuluuluh_huchin_zuilsObj?.map((item) => item.Label).join(', ') || '-'
          }</td></tr>
          <tr><th>Хэвтэн эмчлүүлэхэд нөлөөлсөн хүчин зүйлийн нэмэлт:</th><td>${
            data.hf_hewtehed_nuluuluh_huchin_zuils_other || '-'
          }</td></tr>
        </table>

        <div class="section-title">Нэмэлт мэдээлэл</div>
        <table>
          <tr><th>Тэмдэглэл:</th><td>${data.other_notes || '-'}</td></tr>
          <tr><th>Хорт хавдрын тэмдэглэл:</th><td>${data.hort_havdar_notes || '-'}</td></tr>
        </table>

        <p style="margin-top: 40px;">Гарын үсэг: _____________________________</p>
      </body>
    </html>
  `;
}

module.exports = HfHospitalization;
