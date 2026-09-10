const ObjectHelper = require('../helper/ObjectHelper');
const tt = require('./translate');

function Visit(Data, Language, Password) {
  var ICD10 = [];
  var MajorFindings = [];
  var Treatments = [];
  var Referrals = [];
  var Procedures = [];

  var Language = Language ? Language : 'mn';
  var Password = Password;

  const t = function (word) {
    return tt(word, Language);
  };

  const VisitDate = new Date(Data.visit_date);

  ICD10 =
    Data.Journals &&
    Data.Journals.filter(
      (item) => item.JournalRef && item.JournalRef.jr_type + '' === '5' && !item.IsDelete
    );

  MajorFindings =
    Data.Journals &&
    Data.Journals.filter(
      (item) => item.JournalRef && item.JournalRef.jr_type + '' === '4' && !item.IsDelete
    );

  Treatments =
    Data.Journals &&
    Data.Journals.filter(
      (item) => item.JournalRef && item.JournalRef.jr_type + '' === '1' && !item.IsDelete
    );

  Referrals =
    Data.Journals &&
    Data.Journals.filter(
      (item) => item.JournalRef && item.JournalRef.jr_type + '' === '3' && !item.IsDelete
    );

  Procedures =
    Data.Journals &&
    Data.Journals.filter(
      (item) => item.JournalRef && item.JournalRef.jr_type + '' === '2' && !item.IsDelete
    );

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Visit</title>
    <style>
      html {
        zoom: 1;
      }
      body {
        margin: 0 auto;
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 9px;
      }
    </style>
  </head>
  <body>
    <div style="padding: 0 15px 0 40px; font-weight: normal; width: 480px">
      <div style="margin-bottom: 15px; font-weight: bold; font-size: 10px">
        <div>${Data && Data.Patient ? Data.Patient.FullName : ''}</div>
        <div>${Data && Data.Patient ? Data.Patient.Age : ''} ${t('years old')}, ${
          Data && Data.Patient && Data.Patient.Gender ? t(Data.Patient.Gender.label) : ''
        }</div>
      </div>
      <div style="margin-bottom: 15px; font-weight: bold; width: 40%">
        <div style="display: inline-block; width: 100%">
          <div style="float: left">${t('Date of visit')}</div>
          <div style="float: right">${Data.visit_date}</div>
        </div>
        <div style="display: inline-block; width: 100%">
          <div style="float: left">${Language === 'en' ? 'Doctor' : 'Үзлэг хийсэн эмч'}</div>
          <div style="float: right">${Data && Data.Users ? Data.Users.UserName : ''}</div>
        </div>
      </div>
      ${
        Data.chief_complaintObj && Data.chief_complaintObj.length > 0
          ? `<div style="margin-bottom: 10px">
        <div>
          <span style="font-size: 11px">${t('Chief complaint')}</span>
        </div>
        <div>${Data.chief_complaintObj
          .map((item) => {
            return t(item.Label);
          })
          .join(', ')}</div>
      </div>`
          : ''
      }
      ${
        Data.other_chief_complaint
          ? `<div style="margin-bottom: 10px">
        <div>
          <span style="font-size: 11px">${t('Other chief complaint')}</span>
        </div>
        <div>${t(Data.other_chief_complaint)}</div>
      </div>`
          : ''
      }
      ${
        Data.s_bp || Data.d_bp || Data.pe_vs_heart
          ? `<div style="margin-bottom: 15px; font-size: 11px">
        ${Data.s_bp ? `<div>${t('Systolic pressure')}: ${Data.s_bp}</div>` : ''}
        ${Data.d_bp ? `<div>${t('Diastolic pressure')}: ${Data.d_bp}</div>` : ''}
        ${Data.pe_vs_heart ? `<div>${t('Heart rate')}: ${Data.pe_vs_heart}</div>` : ''}
      </div>`
          : ''
      }
      
      ${
        ICD10.length > 0
          ? `<div style="margin-bottom: 15px">
        <div style="font-size: 11px">${Language === 'en' ? 'ICD10' : 'ICD10-Үндсэн онош'}:</div>
        ${ICD10.map((item) => {
          return `<div>${t(item.JournalRef.jr_label)}</div>`;
        }).join('')}
        <div>
        </div>
      </div>`
          : ''
      }
      
      ${
        MajorFindings.length > 0
          ? `<div style="margin-bottom: 15px">
        <div style="font-size: 11px">${t('Major findings')}</div>
        ${MajorFindings.map((item) => {
          return `<div>${t(item.JournalRef.jr_label)}</div>`;
        }).join('')}
      </div>`
          : ''
      }
      
      ${
        Treatments.length > 0
          ? `<div style="margin-bottom: 15px">
        <div style="font-size: 11px">${t('Treatment')}</div>
        ${Treatments.map((item) => {
          return `<div>${item.j_label}</div>`;
        }).join('')}
      </div>`
          : ''
      }
    
      ${
        Referrals.length > 0
          ? `<div style="margin-bottom: 15px">
        <div style="font-size: 11px">${t('Referral')}</div>
        ${Referrals.map((item) => {
          return `<div>${t(item.JournalRef.jr_label)}</div>`;
        }).join('')}
      </div>`
          : ''
      }
      
      ${
        Procedures.length > 0
          ? `<div style="margin-bottom: 15px">
        <div style="font-size: 11px">${t('Procedures')}</div>
        ${Procedures.map((item) => {
          return `<div>${t(item.JournalRef.jr_label)}</div>`;
        }).join('')}
      </div>`
          : ''
      }
      <div>
        <div>Иргэний платформ (үзлэгийн түүх) орох хаяг:</div>
        <div>https://smr.telemedicine.mn/patient</div>
        ${
          Data && Data.Patient && Data.Patient.p_registration
            ? `
        <div>${t('Login name')}: ${Data.Patient.p_registration}</div>`
            : ''
        }
        ${
          // A password is printed ONLY on the sheet that created the account.
          // Reprints used to issue a fresh one every time, which silently
          // invalidated whatever the patient was already carrying; now the
          // controller passes null for an existing account and this line
          // disappears rather than showing a password that is not theirs.
          Password
            ? `
        <div>${t('Password')}: ${Password.replace(/\s+/g, '')}</div>`
            : ''
        }
        <div>Кодны хүчинтэй хугацаа:</div>
        <div>Дараагийн зүрхний үзлэг хүртэл эсвэл ${ObjectHelper.getDateYMD({
          Date: new Date(VisitDate.setMonth(VisitDate.getMonth() + 6)),
        })}</div>
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = Visit;
