const express = require('express');
const c = require('./controller');

/**
 * /api/fhir/* — a READ-ONLY FHIR R4 projection.
 *
 * WHAT THIS IS, AND WHAT IT IS NOT.
 *
 * ICD, FHIR/HL7, SNOMED CT and LOINC are named in tender §1.4 and again in the
 * phase-3 schedule (tracker rows 19, 20). None of them appears anywhere in this
 * backend, and the requirement's wording - "дагаж мөрдөх", comply with - cannot
 * be tested as written.
 *
 * Adopting FHIR as the exchange format for a 200-table EMR is a project in its
 * own right, not a phase-3 task inside a three-month mobile build, and nobody
 * should pretend otherwise. So this is the honest minimum: a read-only
 * PROJECTION over the two resources the existing data genuinely supports -
 * Patient, and Condition from ICD-coded diagnoses on Visit. The data model is
 * untouched.
 *
 * It has an acceptance criterion that can actually be tested: the response
 * validates against the R4 StructureDefinition. That is worth more against rows
 * 19-20 than a claim of compliance nobody can check.
 *
 * BEHIND FEATURE_FHIR_EXPORT, default false, because the scope decision is
 * still outstanding (BLOCKERS item 5) - which resources, export-only or
 * bidirectional, and to whom. Turning it on before that is agreed publishes an
 * interface somebody will integrate against.
 *
 * Authenticated like everything else. A FHIR endpoint is not a public one just
 * because the standard is public.
 */
const router = express.Router();

const gate = [require('../../helper/VerifyTokenJson'), require('../../helper/DenyPatient')];

// One patient as a FHIR R4 Patient resource
router.get('/Patient/:id', gate, c.getPatient);
// ICD-coded diagnoses as a searchset Bundle of Condition resources
router.get('/Condition', gate, c.searchCondition);
// Examinations as Encounter resources. ?patient= is required on both of these
// for the same reason it is on Condition: unbounded is an export, not a search
router.get('/Encounter', gate, c.searchEncounter);
// Vital signs and laboratory results as Observation. A LOINC coding is emitted
// only for a CodeMapping row marked Verified - see add_code_mapping.sql
router.get('/Observation', gate, c.searchObservation);
// What this server claims to support - the standard's own discovery document
router.get('/metadata', gate, c.metadata);

module.exports = router;
