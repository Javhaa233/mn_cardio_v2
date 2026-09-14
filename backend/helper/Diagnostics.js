/**
 * Шинжилгээ, оношлогоо — tender §3.1.
 *
 * FOUR TABLES BEHIND ONE SHAPE. The app needs "this patient's investigations"
 * as a single chronological list; the database keeps them in four unrelated
 * tables of two different generations, with four different date columns and no
 * common ancestor. This file is the mapping, declared once, so /api/doctor and
 * /api/patient cannot disagree about what an investigation is - the same reason
 * helper/RiskInputs.js exists.
 *
 * WHICH TABLES, AND WHY NOT THE OTHER TWO. Measured on MnCardio_test
 * 2026-09-14: LaboratoryTest 360 rows, PCathlab 5,367, ExaminationEcho 2,673,
 * EcgExamination 1,266 - all with PatientId populated on every row.
 * EchoExamination and PEcgRest are EMPTY (0 rows) and neither carries a patient
 * column at all: EchoExamination is an EAV side-table keyed by id_group. They
 * are deliberately not exposed - an endpoint that can only ever return nothing
 * is worse than one that is honestly absent.
 *
 * NO UNITS AND NO REFERENCE RANGES ARE INVENTED HERE. LaboratoryTest stores
 * every result as a STRING with no unit column and no reference column
 * anywhere in the schema. A reference range is a clinical decision that decides
 * whether a doctor acts, so `unit` and `refRange` come back null until the
 * CodeMapping table is populated with LOINC codes and ranges. `flag` is null
 * for the same reason: without a range there is nothing to compare against, and
 * a fabricated "H" next to a potassium result is a patient-safety problem, not
 * a rendering detail.
 */

const { Models, Op } = require('../config/DB');

/**
 * One descriptor per type. `Date` is the column the list is ordered and
 * windowed by; where a table has no real clinical date, date_creation is used
 * and that is called out rather than hidden.
 */
const TYPES = {
  lab: {
    Model: 'LaboratoryTest',
    PK: 'Id',
    Date: 'LaboratoryTestDate',
    Org: null,
    TitleMn: 'Лабораторийн шинжилгээ',
    Summary: 'diagnosis',
    ListAttrs: ['Id', 'LaboratoryTestDate', 'diagnosis', 'complaint', 'PatientId'],
  },
  echo: {
    Model: 'ExaminationEcho',
    PK: 'id_data',
    Date: 'echo_date',
    Org: 'OrganizationId',
    TitleMn: 'Зүрхний эхо',
    Summary: 'comment',
    ListAttrs: ['id_data', 'echo_date', 'comment', 'doctor_name', 'PatientId', 'OrganizationId'],
  },
  cathlab: {
    Model: 'PCathlab',
    PK: 'id_data',
    Date: 'cath_lab_operation_date',
    Org: 'OrganizationId',
    TitleMn: 'Ангиографи / судасны ажилбар',
    Summary: 'Conclusion',
    ListAttrs: [
      'id_data',
      'cath_lab_operation_date',
      'cath_lab_operation_procedure',
      'Conclusion',
      'doctors_name',
      'PatientId',
      'OrganizationId',
    ],
  },
  ecg: {
    Model: 'EcgExamination',
    PK: 'id_data',
    // EcgExamination has no clinical date column - only the legacy bookkeeping
    // one. Using it is the honest choice; inventing a date is not.
    Date: 'date_creation',
    Org: 'OrganizationId',
    TitleMn: 'Зүрхний цахилгаан бичлэг',
    Summary: 'comment',
    ListAttrs: ['id_data', 'date_creation', 'comment', 'PatientId', 'OrganizationId'],
  },
};

const TYPE_NAMES = Object.keys(TYPES);

const IsType = (t) => Object.prototype.hasOwnProperty.call(TYPES, String(t || ''));

/**
 * LaboratoryTest is a wide table of string results. These are the panels it
 * holds, in the order a report prints them, with the column names exactly as
 * the schema spells them - including `total_proteoin`, which is a typo in the
 * database and must be matched, not corrected (CLAUDE.md §10).
 *
 * `label` is the standard international abbreviation, which is what the column
 * already is. No Mongolian name is invented for any of these: clinical wording
 * comes from the customer verbatim, and the place it will arrive is CodeMapping.
 */
const LAB_PANELS = [
  {
    Code: 'blood',
    DateField: 'blood_test_date',
    LabelMn: 'Цусны ерөнхий шинжилгээ',
    Fields: ['wbc', 'rbc', 'hb', 'hct', 'platelet', 'coe'],
  },
  {
    Code: 'liver',
    DateField: 'liver_test_date',
    LabelMn: 'Элэгний үзүүлэлт',
    Fields: ['total_proteoin', 'albumin', 'asat', 'alat', 'total_bilirubin', 'ggt', 'glucose'],
  },
  {
    Code: 'kidney',
    DateField: 'kidney_test_date',
    LabelMn: 'Бөөрний үзүүлэлт',
    Fields: ['mochevin', 'creatinine'],
  },
  {
    Code: 'serology',
    DateField: null,
    LabelMn: 'Халдварын шинжилгээ',
    // hbs_ag, hcv, syphilis and hiv are exactly the results tender §1.2 has in
    // mind when it requires confidential classification. They are listed here
    // so they are DECLARED rather than arriving by accident, and the endpoints
    // that serve this panel run helper/Confidentiality before returning it.
    Fields: ['hbs_ag', 'hcv', 'syphilis', 'hiv'],
    Confidential: true,
  },
  {
    Code: 'coagulation',
    DateField: 'tsusnii_bulegnelt_date',
    LabelMn: 'Цусны бүлэгнэлт',
    Fields: ['pt', 'inr', 'fibrinogen', 'tt', 'aptt'],
  },
  {
    Code: 'risk_score',
    DateField: null,
    LabelMn: 'Эрсдэлийн оноо',
    Fields: ['euro_score_2', 'logistic_euroscore', 'sts', 'nyha'],
  },
  {
    Code: 'imaging',
    DateField: null,
    LabelMn: 'Дүрс оношилгоо',
    Fields: ['chest_ktg', 'chest_xray', 'abdomen_echo', 'spirometry', 'chatlab'],
  },
];

/**
 * Normalise one row of any type into the list shape the app renders.
 *
 * `summary` is trimmed rather than sent whole: a Conclusion can run to several
 * paragraphs, and a list row shows one line. The full text is in the detail.
 */
function ShapeListRow(type, row) {
  const T = TYPES[type];
  const summary = row[T.Summary] ? String(row[T.Summary]).trim() : null;

  return {
    type,
    id: row[T.PK],
    date: row[T.Date] || null,
    title: type === 'cathlab' && row.cath_lab_operation_procedure
      ? String(row.cath_lab_operation_procedure).trim()
      : T.TitleMn,
    summary: summary ? (summary.length > 200 ? summary.slice(0, 199) + '…' : summary) : null,
    organization: T.Org ? row[T.Org] || null : null,
    PatientId: row.PatientId,
  };
}

/**
 * One patient's investigations, newest first.
 *
 * `type` is optional: without it all four tables are read and merged. The merge
 * is done in JS rather than as a UNION because the four tables share no column
 * names or types, so a UNION would need a cast per column per table and would
 * still have to be re-sorted here for paging.
 *
 * PAGING IS APPLIED AFTER THE MERGE, and each table is therefore read up to
 * `limit + offset` rows deep rather than `limit`. That is correct for the page
 * requested and it is bounded, since limit is capped at 100 by the callers.
 */
async function List({ PatientId, Type, From, To, Limit, Offset }) {
  const types = Type ? [Type] : TYPE_NAMES;
  const depth = (Limit || 20) + (Offset || 0);

  const perType = await Promise.all(
    types.map(async (t) => {
      const T = TYPES[t];
      const where = { PatientId };

      if (From || To) {
        const range = {};
        if (From) range[Op.gte] = From;
        if (To) range[Op.lte] = To;
        where[T.Date] = range;
      }

      const rows = await Models[T.Model].findAll({
        where,
        attributes: T.ListAttrs,
        order: [[T.Date, 'DESC']],
        limit: depth,
        raw: true,
      });

      return rows.map((r) => ShapeListRow(t, r));
    })
  );

  const all = perType.flat();

  // A null date sorts last rather than first: an undated record is not the most
  // recent one, and Date(null) is 1970 which would put it at the bottom of a
  // DESC sort anyway - this makes that explicit instead of accidental.
  all.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  return {
    total: all.length,
    rows: all.slice(Offset || 0, (Offset || 0) + (Limit || 20)),
  };
}

/**
 * One investigation in full.
 *
 * Returns null when the id does not exist, so the caller answers 404 - and the
 * PatientId is returned with it so the caller can prove the record belongs to
 * the patient it asked about rather than trusting the id.
 */
async function GetOne({ Type, Id }) {
  const T = TYPES[Type];
  if (!T) return null;

  const row = await Models[T.Model].findOne({ where: { [T.PK]: Id }, raw: true });
  if (!row) return null;

  const base = {
    type: Type,
    id: row[T.PK],
    date: row[T.Date] || null,
    PatientId: row.PatientId,
    organization: T.Org ? row[T.Org] || null : null,
  };

  if (Type !== 'lab') {
    // Echo, cathlab and ECG are flat clinical records. They are returned whole
    // rather than through a field dictionary, because unlike the lab panels
    // their columns ARE the report and the web forms already render them.
    return Object.assign(base, { record: row });
  }

  // Lab results become the { name, value, unit, refRange, flag } list the
  // mobile specification asks for, grouped into the panels a report prints.
  const panels = LAB_PANELS.map((P) => ({
    code: P.Code,
    label: P.LabelMn,
    date: P.DateField ? row[P.DateField] || null : null,
    confidential: P.Confidential === true,
    results: P.Fields.filter((f) => row[f] !== null && row[f] !== undefined && row[f] !== '').map(
      (f) => ({
        name: f,
        label: f.toUpperCase(),
        value: row[f],
        // Null until CodeMapping is seeded. See this file's header - these are
        // deliberately absent, not forgotten.
        unit: null,
        refRange: null,
        flag: null,
      })
    ),
  })).filter((P) => P.results.length > 0);

  return Object.assign(base, {
    complaint: row.complaint || null,
    diagnosis: row.diagnosis || null,
    disorders: row.disorders || null,
    regular_medication: row.regular_medication || null,
    surgical_plan: row.surgical_plan || null,
    panels,
  });
}

/**
 * Strip the panels a caller may not see.
 *
 * Called when helper/Confidentiality refuses this reader: the record still
 * comes back, with the confidential panels replaced by a marker, so the app can
 * say "there is a result here you cannot open" rather than pretending the
 * investigation does not exist. Hiding its existence would make a doctor think
 * a test was never done.
 */
function MaskConfidential(detail) {
  if (!detail || !detail.panels) return detail;
  return Object.assign({}, detail, {
    panels: detail.panels.map((P) =>
      P.confidential ? Object.assign({}, P, { results: [], restricted: true }) : P
    ),
  });
}

module.exports = { TYPES, TYPE_NAMES, IsType, List, GetOne, LAB_PANELS, MaskConfidential };
