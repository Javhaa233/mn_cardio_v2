/**
 * Эх сурвалжийн тэмдэглэгээ — the source stamp both tenders require on every
 * export (§1.8: which organisation, which database, who produced it, when, and
 * under what filter).
 *
 * WHY IT IS A HELPER. The stamp already existed, once, inside
 * helper/DoctorExamReportHelper.js, where only that one report could use it.
 * Every new export - the patient's journal, the visit list, the summary - needs
 * the identical block, and a stamp that says something slightly different
 * depending on which endpoint produced it is worse than no stamp at all: the
 * point of it is that an exported file can be traced back to a source, and that
 * only works if the format is fixed. DoctorExamReportHelper now calls this.
 *
 * TIMES ARE UTC AND SAY SO. The server runs UTC (services/ReminderDispatcher
 * converts to Asia/Ulaanbaatar explicitly for exactly that reason), so a bare
 * timestamp on an exported file would be read as local by whoever opens it and
 * would be eight hours wrong. The suffix is not decoration.
 */

const ToDateOrNull = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  return s === '' ? null : s.slice(0, 10);
};

/**
 * The stamp as an array of lines, ready to be written into a spreadsheet
 * header, a text preamble or a PDF footer.
 *
 * `Register` names what was exported, because "which organisation and database"
 * does not tell a reader which register they are holding. `Note` is an optional
 * extra line for a caveat that belongs with the data - the doctor summary uses
 * it to say that each count is attributed to the user who CREATED the record.
 */
function Lines({ LogedUser, Register, From, To, Note }) {
  const ExportedBy =
    (LogedUser && (LogedUser.FullName || (LogedUser.Doctor && LogedUser.Doctor.FullName))) ||
    (LogedUser && LogedUser.UserName) ||
    '';

  const OrgName =
    (LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
      ? LogedUser.Doctor.Organization.Name
      : null) || '';

  const StartDate = ToDateOrNull(From);
  const EndDate = ToDateOrNull(To);
  const Period =
    StartDate || EndDate ? (StartDate || '...') + ' - ' + (EndDate || '...') : 'Бүх хугацаа';

  const out = [
    'Байгууллага: ' + OrgName,
    'Мэдээллийн сан: ' + (process.env.SQL_DB || ''),
    'Бүртгэл: ' + (Register || ''),
    'Хамрах хугацаа: ' + Period,
    'Гаргасан огноо: ' + new Date().toISOString().slice(0, 19) + 'Z (UTC)',
    'Гаргасан хэрэглэгч: ' + ExportedBy,
  ];
  if (Note) out.push('Тайлбар: ' + Note);
  return out;
}

/**
 * The same information as an object, for a JSON response.
 *
 * `reportSummary` already returns a `source` field of roughly this shape; this
 * is what the rest of the JSON reports adopt so there is one spelling of it.
 */
function Stamp({ LogedUser, Register, From, To }) {
  return {
    organization:
      (LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Name
        : null) || null,
    organizationId:
      (LogedUser && LogedUser.Doctor ? LogedUser.Doctor.OrganizationId : null) || null,
    database: process.env.SQL_DB || null,
    register: Register || null,
    from: ToDateOrNull(From),
    to: ToDateOrNull(To),
    generatedBy:
      (LogedUser && (LogedUser.FullName || LogedUser.UserName)) || null,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { Lines, Stamp, ToDateOrNull };
