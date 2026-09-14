const { Models, Op } = require('../../config/DB');
const Flags = require('../../helper/FeatureFlags');

/**
 * FHIR R4 projection handlers.
 *
 * THE ENVELOPE IS FHIR'S, NOT OURS. Every other surface in this codebase uses
 * either the lowercase { success, message, data } or the legacy PascalCase
 * shape - but a FHIR endpoint that wraps its resources in a house envelope is
 * not a FHIR endpoint, and no FHIR client would read it. Errors are
 * OperationOutcome, the standard's own error resource, for the same reason.
 *
 * Nothing here writes. A projection is a view over data the EMR already owns;
 * accepting FHIR writes would mean mapping an external model back onto 200
 * tables, which is the project this deliberately is not.
 */

const FHIR_JSON = 'application/fhir+json; charset=utf-8';

/** The standard's error resource. */
const outcome = (res, status, code, diagnostics) =>
  res
    .status(status)
    .type(FHIR_JSON)
    .json({
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'error', code, diagnostics }],
    });

const disabled = (res) =>
  outcome(
    res,
    503,
    'not-supported',
    'FHIR export is disabled on this server (FEATURE_FHIR_EXPORT). The scope of FHIR ' +
      'compliance is an open decision - see mobile/BLOCKERS.md.'
  );

/**
 * FHIR administrative-gender, from the local code.
 *
 * Returns undefined rather than guessing when the value is unrecognised.
 * 'unknown' is a POSITIVE assertion in FHIR - it says somebody looked and could
 * not establish it - so emitting it for a value we simply failed to map would
 * be putting a claim in the record that nobody made.
 */
function genderOf(code) {
  const v = String(code === null || code === undefined ? '' : code).trim().toLowerCase();
  if (['1', 'm', 'male', 'эр'].includes(v)) return 'male';
  if (['2', 'f', 'female', 'эм'].includes(v)) return 'female';
  return undefined;
}

/** YYYY-MM-DD, which is what FHIR `date` means - never a datetime. */
function dateOnly(d) {
  if (!d) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return undefined;
  return dt.toISOString().slice(0, 10);
}

function isoInstant(d) {
  if (!d) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return undefined;
  return dt.toISOString();
}

/** Drop undefined keys - FHIR forbids null for an absent element. */
const clean = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined || obj[k] === null) delete obj[k];
    else if (Array.isArray(obj[k]) && obj[k].length === 0) delete obj[k];
  });
  return obj;
};

function toPatientResource(p) {
  return clean({
    resourceType: 'Patient',
    id: String(p.id_data),
    identifier: p.p_registration
      ? [
          {
            // The Mongolian citizen registration number. A real system-of-record
            // URI has to be agreed with ЭМХТ; this is a placeholder namespace
            // and is flagged as such rather than silently invented.
            system: 'urn:mn:gov:registration-number',
            value: String(p.p_registration),
          },
        ]
      : undefined,
    name: [
      clean({
        use: 'official',
        family: p.p_lastname || undefined,
        given: p.p_firstname ? [p.p_firstname] : undefined,
      }),
    ],
    gender: genderOf(p.p_gender),
    birthDate: dateOnly(p.p_birthday),
    telecom: [p.p_telephone, p.p_telephone2]
      .filter(Boolean)
      .map((v) => ({ system: 'phone', value: String(v) })),
  });
}

/**
 * A Visit's ICD-coded diagnosis as a Condition.
 *
 * clinicalStatus and verificationStatus are deliberately OMITTED. The EMR does
 * not record whether a diagnosis is active or resolved, or whether it was
 * confirmed or provisional, and both are meaningful clinical assertions in
 * FHIR. Emitting a default would be inventing clinical information - the one
 * thing a projection must never do.
 */
function toConditionResource(v) {
  const code = v.icd10 ? String(v.icd10).trim() : '';
  const text = v.main_diagnosis_mn || v.main_diagnosis || undefined;

  return clean({
    resourceType: 'Condition',
    id: String(v.id_data),
    subject: { reference: 'Patient/' + String(v.PatientId) },
    recordedDate: isoInstant(v.visit_date),
    code: clean({
      coding: code
        ? [{ system: 'http://hl7.org/fhir/sid/icd-10', code, display: text }]
        : undefined,
      text,
    }),
  });
}

const bundle = (entries, total) => ({
  resourceType: 'Bundle',
  type: 'searchset',
  total,
  entry: entries.map((r) => ({ resource: r })),
});

exports.getPatient = async (req, res) => {
  try {
    if (!Flags.FhirExport) return disabled(res);

    const id = parseInt(req.params.id, 10);
    if (!id) return outcome(res, 400, 'value', 'Invalid Patient id');

    const p = await Models.Patient.findByPk(id, {
      attributes: [
        'id_data',
        'p_registration',
        'p_lastname',
        'p_firstname',
        'p_gender',
        'p_birthday',
        'p_telephone',
        'p_telephone2',
      ],
      raw: true,
    });
    if (!p) return outcome(res, 404, 'not-found', 'Patient not found');

    return res.type(FHIR_JSON).json(toPatientResource(p));
  } catch (ex) {
    console.error('[api/fhir] getPatient: ' + ex.message);
    return outcome(res, 500, 'exception', 'Internal error');
  }
};

exports.searchCondition = async (req, res) => {
  try {
    if (!Flags.FhirExport) return disabled(res);

    // `patient` is required. An unbounded Condition search over ~450,000 Visit
    // rows is not a search, it is an export - and an export is exactly the
    // thing that needs the scope decision before it exists.
    const patient = String(req.query.patient || '').replace(/^Patient\//, '');
    const id = parseInt(patient, 10);
    if (!id) {
      return outcome(res, 400, 'required', 'The `patient` search parameter is required');
    }

    const count = Math.min(parseInt(req.query._count, 10) || 50, 200);

    /*
     * MEASURED ON MnCardio_test 2026-09-14, and it changes what this endpoint
     * can honestly return: across 450,604 Visit rows, icd10, exam_type_icd,
     * cause_icd10 and procedure_icd9 are ALL EMPTY - zero coded rows. Only
     * main_diagnosis has content, on 18,326 of them (4%).
     *
     * So "comply with ICD" (tracker 19/20) is not a standards-adoption task at
     * all: the columns exist and the coding has never been captured. Raised in
     * mobile/BLOCKERS.md rather than papered over.
     *
     * Filtering on icd10 alone would therefore return an empty Bundle forever,
     * which looks like a broken endpoint rather than an uncoded dataset. FHIR
     * permits a CodeableConcept with `text` and no `coding` - that is exactly
     * "a diagnosis was recorded, it is not coded" - so a visit with either is
     * included, and toConditionResource emits a coding only when one exists.
     * Nothing is invented either way.
     */
    const NonEmpty = (col) => ({ [col]: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } });

    const rows = await Models.Visit.findAll({
      where: {
        PatientId: id,
        [Op.or]: [NonEmpty('icd10'), NonEmpty('main_diagnosis')],
      },
      attributes: ['id_data', 'PatientId', 'visit_date', 'icd10', 'main_diagnosis', 'main_diagnosis_mn'],
      order: [['visit_date', 'DESC']],
      limit: count,
      raw: true,
    });

    return res.type(FHIR_JSON).json(bundle(rows.map(toConditionResource), rows.length));
  } catch (ex) {
    console.error('[api/fhir] searchCondition: ' + ex.message);
    return outcome(res, 500, 'exception', 'Internal error');
  }
};

/**
 * CapabilityStatement - what this server actually supports.
 *
 * Deliberately small and honest. A generated statement claiming resources that
 * are not implemented is worse than none: it is what an integrator builds
 * against before discovering the gap.
 */
exports.metadata = async (req, res) => {
  if (!Flags.FhirExport) return disabled(res);

  return res.type(FHIR_JSON).json({
    resourceType: 'CapabilityStatement',
    status: 'draft',
    date: new Date().toISOString().slice(0, 10),
    kind: 'instance',
    software: { name: 'MnCardio', version: '2.0.0' },
    fhirVersion: '4.0.1',
    format: ['application/fhir+json'],
    rest: [
      {
        mode: 'server',
        documentation:
          'Read-only projection. Two resources only, and no write operations. The scope of ' +
          'FHIR compliance for this system is an open decision.',
        resource: [
          { type: 'Patient', interaction: [{ code: 'read' }] },
          {
            type: 'Condition',
            interaction: [{ code: 'search-type' }],
            searchParam: [{ name: 'patient', type: 'reference' }],
          },
        ],
      },
    ],
  });
};
