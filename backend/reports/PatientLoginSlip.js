/**
 * The "how to reach your records" box printed on the discharge sheet
 * (reports/OutPatientInfo.js) and the visit sheet (reports/Visit.js).
 *
 * Credentials come from helper/PatientCredential.js:
 *   - Password set   -> this sheet issued it: print it large, grouped "482 917"
 *   - Password null  -> a password was issued earlier for this record; say so
 *                       and tell the patient what to do if they lost it,
 *                       instead of printing a password that is not theirs.
 *
 * Patients copy these by hand onto a phone, so the login name and password are
 * printed in a monospace face with spaced groups: no guessing 0 vs O.
 */
const PORTAL_URL = 'https://smr.telemedicine.mn/patient';

function Escape(Value) {
  return String(Value === undefined || Value === null ? '' : Value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function GroupDigits(Password) {
  const Clean = String(Password).replace(/\s+/g, '');
  return /^\d{6}$/.test(Clean) ? `${Clean.slice(0, 3)} ${Clean.slice(3)}` : Clean;
}

function PatientLoginSlip({ UserName, Password, ExpireDate, Labels }) {
  const L = Object.assign(
    {
      Title: 'Иргэний платформ (үзлэгийн түүх) орох:',
      LoginName: 'Нэвтрэх нэр',
      Password: 'Нууц үг',
      Valid: 'Нууц үгийн хүчинтэй хугацаа',
    },
    Labels || {}
  );

  const Value =
    'font-family: "Consolas", "Courier New", monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;';

  const Credentials = UserName
    ? `
      <table style="border-collapse: collapse; margin: 6px 0;">
        <tr>
          <td style="padding: 2px 10px 2px 0;">${Escape(L.LoginName)}:</td>
          <td style="${Value}">${Escape(UserName)}</td>
        </tr>
        ${
          Password
            ? `<tr>
          <td style="padding: 2px 10px 2px 0;">${Escape(L.Password)}:</td>
          <td style="${Value}">${Escape(GroupDigits(Password))}</td>
        </tr>`
            : ''
        }
      </table>
      ${
        Password
          ? `${ExpireDate ? `<div>${Escape(L.Valid)}: ${Escape(ExpireDate)}</div>` : ''}
      <div style="margin-top: 4px; font-size: 11px;">
        1. Утсан дээрээ дээрх хаягийг нээнэ. &nbsp;
        2. Нэвтрэх нэрт регистрийн дугаараа бичнэ. &nbsp;
        3. Нууц үгийн 6 оронтой тоог хоосон зайгүйгээр бичнэ.
      </div>`
          : `<div style="font-size: 11px;">
        Нууц үгийг өмнө нь хэвлэж өгсөн. Мартсан бол эмчдээ хандаж шинэ нууц үг авна уу.
      </div>`
      }`
    : '';

  return `
    <div style="margin-top: 15px; padding: 10px; border: 1px solid #ccc; page-break-inside: avoid;">
      <div style="font-weight: bold; margin-bottom: 5px;">${Escape(L.Title)}</div>
      <div>${PORTAL_URL}</div>
      ${Credentials}
    </div>`;
}

module.exports = PatientLoginSlip;
