const { Models, Op } = require('../../config/DB');
const Flags = require('../../helper/FeatureFlags');
const CodeMappings = require('../../helper/CodeMappings');

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
          'Read-only projection, no write operations. The scope of FHIR compliance for this ' +
          'system is an open decision. NOTE: Condition and Observation may return resources ' +
          'with a CodeableConcept carrying text and no coding - the source data is largely ' +
          'uncoded, and no ICD or LOINC code is asserted unless one has been verified.',
        resource: [
          { type: 'Patient', interaction: [{ code: 'read' }] },
          {
            type: 'Condition',
            interaction: [{ code: 'search-type' }],
            searchParam: [{ name: 'patient', type: 'reference' }],
          },
          {
            type: 'Encounter',
            interaction: [{ code: 'search-type' }],
            searchParam: [{ name: 'patient', type: 'reference' }],
          },
          {
            type: 'Observation',
            interaction: [{ code: 'search-type' }],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'code', type: 'token' },
            ],
          },
        ],
      },
    ],
  });
};

/* ======================================================================
 * Encounter and Observation — mobile tender §1.4.
 * ====================================================================== */


/**
 * A Visit as a FHIR R4 Encounter.
 *
 * `status` is 'finished' for every row, and that is a statement about the DATA
 * MODEL rather than a default. Visit records a completed examination - there is
 * no in-progress state, no admission and no discharge on this table, so every
 * row that exists describes something that already happened. An 'unknown'
 * status would be less true, not more careful.
 *
 * `class` is AMB (ambulatory). Visit is the outpatient examination register;
 * inpatient stays live in Stay and HfStay and are not projected here.
 *
 * serviceProvider points at the organisation. No Practitioner reference is
 * emitted: Visit.id is a Users.Id, not a clinician resource this server
 * publishes, and a reference to a Practitioner endpoint that does not exist
 * would be a dangling pointer in every Bundle.
 */
function toEncounterResource(v) {
  const text = v.main_diagnosis_mn || v.main_diagnosis || undefined;

  return clean({
    resourceType: 'Encounter',
    id: String(v.id_data),
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    subject: { reference: 'Patient/' + String(v.PatientId) },
    period: clean({ start: isoInstant(v.visit_date), end: isoInstant(v.visit_date) }),
    reasonCode: text ? [clean({ text })] : undefined,
    serviceProvider: v.OrganizationId
      ? { reference: 'Organization/' + String(v.OrganizationId) }
      : undefined,
  });
}

/**
 * One measurement as a FHIR R4 Observation.
 *
 * THE CODING IS CONDITIONAL, AND THAT IS THE POINT. A LOINC code is emitted
 * only when CodeMapping.Verified = 1 for that field. Unverified, the resource
 * still carries `code.text` - "this measurement was recorded, it is not coded"
 * - which is exactly what searchCondition already does for an uncoded
 * diagnosis. Emitting an unreviewed LOINC code would silently assert that a
 * number means something nobody has checked, to every system that consumes it.
 *
 * valueQuantity is used when the stored string parses as a number and a unit is
 * known; otherwise valueString. LaboratoryTest stores everything as a string,
 * including values that are not quantities at all, and those must not be
 * coerced into one.
 */
function toObservationResource({ id, patientId, date, map, localCode, value, category }) {
  const numeric = Number(String(value).replace(',', '.'));
  const isQuantity = !!(map && map.Unit && String(value).trim() !== '' && Number.isFinite(numeric));

  return clean({
    resourceType: 'Observation',
    id,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: category,
          },
        ],
      },
    ],
    code: clean({
      // Verified only. See the header.
      coding:
        map && map.Verified && map.Code
          ? [{ system: map.System || 'http://loinc.org', code: map.Code, display: map.Display }]
          : undefined,
      text: (map && map.Display) || localCode,
    }),
    subject: { reference: 'Patient/' + String(patientId) },
    effectiveDateTime: isoInstant(date),
    valueQuantity: isQuantity
      ? { value: numeric, unit: map.Unit, system: 'http://unitsofmeasure.org', code: map.Unit }
      : undefined,
    valueString: isQuantity ? undefined : String(value),
  });
}

/**
 * GET /fhir/Encounter?patient=
 *
 * `patient` is required, for the same reason it is on Condition: an unbounded
 * search over 450,604 Visit rows is an export, and an export is the thing the
 * outstanding scope decision is about.
 */
exports.searchEncounter = async (req, res) => {
  try {
    if (!Flags.FhirExport) return disabled(res);

    const patient = String(req.query.patient || '').replace(/^Patient\//, '');
    const id = parseInt(patient, 10);
    if (!id) {
      return outcome(res, 400, 'required', 'The `patient` search parameter is required');
    }

    const count = Math.min(parseInt(req.query._count, 10) || 50, 200);

    const rows = await Models.Visit.findAll({
      where: { PatientId: id },
      attributes: [
        'id_data',
        'PatientId',
        'visit_date',
        'main_diagnosis',
        'main_diagnosis_mn',
        'OrganizationId',
      ],
      order: [['visit_date', 'DESC']],
      limit: count,
      raw: true,
    });

    return res.type(FHIR_JSON).json(bundle(rows.map(toEncounterResource), rows.length));
  } catch (ex) {
    console.error('[api/fhir] searchEncounter: ' + ex.message);
    return outcome(res, 500, 'exception', 'Internal error');
  }
};

/**
 * GET /fhir/Observation?patient=&code=
 *
 * TWO SOURCES, ONE BUNDLE: the patient's own vital-sign log
 * (PatientMonitoring) and their laboratory results (LaboratoryTest). Those are
 * the two tables that hold anything an Observation can honestly represent.
 *
 * ?code= filters by LOINC code and matches ONLY verified mappings - an
 * unverified field has no code to filter on, so returning it for a code query
 * would mean answering "give me systolic blood pressure" with a column somebody
 * believes is systolic blood pressure. Without ?code= everything is returned,
 * coded or not.
 *
 * The resource id is composite - one row of PatientMonitoring is five
 * Observations - because each needs a stable identity a client can dereference
 * and de-duplicate on.
 */
exports.searchObservation = async (req, res) => {
  try {
    if (!Flags.FhirExport) return disabled(res);

    const patient = String(req.query.patient || '').replace(/^Patient\//, '');
    const id = parseInt(patient, 10);
    if (!id) {
      return outcome(res, 400, 'required', 'The `patient` search parameter is required');
    }

    // Accept a bare code or the token form "http://loinc.org|8480-6".
    const rawCode = String(req.query.code || '').trim();
    const wantCode = rawCode.indexOf('|') === -1 ? rawCode : rawCode.split('|').pop().trim();
    const count = Math.min(parseInt(req.query._count, 10) || 100, 500);

    const maps = await CodeMappings.All();
    const out = [];

    /* ---- vital signs, from the patient's own journal ------------------- */
    const VITALS = ['blood_pressure', 'blood_pressure2', 'pulse', 'weight', 'inr'];
    const pm = await Models.PatientMonitoring.findAll({
      where: { patient_id: id },
      attributes: ['id_data', 'date', 'blood_pressure', 'blood_pressure2', 'pulse', 'weight', 'inr'],
      order: [['date', 'DESC']],
      limit: count,
      raw: true,
    });

    pm.forEach((r) => {
      VITALS.forEach((f) => {
        const v = r[f];
        if (v === null || v === undefined || String(v).trim() === '') return;
        const map = maps.get('PatientMonitoring|' + f) || null;
        if (wantCode && !(map && map.Verified && map.Code === wantCode)) return;
        out.push(
          toObservationResource({
            id: 'pm-' + r.id_data + '-' + f,
            patientId: id,
            date: r.date,
            map,
            localCode: f,
            value: v,
            category: 'vital-signs',
          })
        );
      });
    });

    /* ---- laboratory results -------------------------------------------- */
    const LAB_FIELDS = [...maps.keys()]
      .filter((k) => k.indexOf('LaboratoryTest|') === 0)
      .map((k) => k.split('|')[1]);

    if (LAB_FIELDS.length) {
      const labs = await Models.LaboratoryTest.findAll({
        where: { PatientId: id },
        order: [['LaboratoryTestDate', 'DESC']],
        limit: count,
        raw: true,
      });

      labs.forEach((r) => {
        LAB_FIELDS.forEach((f) => {
          const v = r[f];
          if (v === null || v === undefined || String(v).trim() === '') return;
          const map = maps.get('LaboratoryTest|' + f) || null;
          if (wantCode && !(map && map.Verified && map.Code === wantCode)) return;
          out.push(
            toObservationResource({
              id: 'lab-' + r.Id + '-' + f,
              patientId: id,
              date: r.LaboratoryTestDate,
              map,
              localCode: f,
              value: v,
              category: 'laboratory',
            })
          );
        });
      });
    }

    return res.type(FHIR_JSON).json(bundle(out.slice(0, count), out.length));
  } catch (ex) {
    console.error('[api/fhir] searchObservation: ' + ex.message);
    return outcome(res, 500, 'exception', 'Internal error');
  }
};
