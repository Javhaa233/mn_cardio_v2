/*
  fix_form_conditional_links_and_sections.sql

  Repairs the tender-form dictionary (TenderFormField / TenderForm) where the
  automatic seeding got the STRUCTURE wrong. Labels are not touched - they are
  tender wording and belong to the clinical team.

  DATA ONLY: UPDATE, plus one INSERT of a missing question row. No DDL.
  Idempotent: every statement checks the state it is changing, so running it
  twice changes nothing the second time.
  Safe for recorded answers: no field's TYPE or OPTION SET is changed while any
  live TenderFormData row holds an answer for it (the NOT EXISTS guards). A
  field skipped for that reason is listed by the report at the end.

  Needs ParentValue expressions, which the engine understands as of this
  change (backend/helper/TenderFormVisibility.js, TenderForm.jsx IsVisible):
     'o2'   equals      'a|b'  any of      '!o1'  answered and not o1
  and visibility is transitive: a field whose parent is hidden is hidden.

  After running:  node scripts/generate_form_views.js   then  touch server.js

  This file is ASCII on purpose, so sqlcmd -i needs no BOM.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

/* A field may be retyped only while nothing is recorded against it. */
IF OBJECT_ID('tempdb..#Answered') IS NOT NULL DROP TABLE #Answered;
SELECT f.FormCode, f.FieldCode
INTO #Answered
FROM dbo.TenderFormField f
WHERE EXISTS (
  SELECT 1 FROM dbo.TenderFormData d
  WHERE d.FormCode = f.FormCode AND d.rec_status <> 2 AND ISJSON(d.Data) = 1
    AND NULLIF(JSON_VALUE(d.Data, '$.' + f.FieldCode), '') IS NOT NULL
);

/* ======================================================================
   FORM 3.1  Coronary diagnosis and treatment
   ====================================================================== */

/* L8175: "ask whether to DUPLICATE previous data" - the flag was never set on
   the test database, so the prompt could not fire. */
UPDATE dbo.TenderForm SET AllowDuplicate = 1, UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND ISNULL(AllowDuplicate, 0) = 0;

/* Dates. Seeded as radios over option set f31_51 = {dd, mm}, or as Number. */
UPDATE f SET FieldType = 'Date', OptionType = NULL, UpdateDate = GETDATE()
FROM dbo.TenderFormField f
WHERE f.FormCode = '3.1'
  AND f.FieldCode IN ('DatePainBegining', 'IfYesCallDate', 'DateOfFMCFirstMedicalContact',
                      'Date1stQualifyingECG', 'IfYesDateFibrinolysis', 'DateOfAdmissionTo',
                      'DateOfPrimaryPCI', 'IfYesDate', 'IfYesDate2', 'DateOfDischargeFromHospital')
  AND f.FieldType <> 'Date'
  AND NOT EXISTS (SELECT 1 FROM #Answered a WHERE a.FormCode = f.FormCode AND a.FieldCode = f.FieldCode);

/* L8594-8598: the three delays "should be automatically calculated (mn)".
   Numbers in minutes; the editor computes them and shows them read-only. */
UPDATE f SET FieldType = 'Number', OptionType = NULL, Unit = 'min', UpdateDate = GETDATE()
FROM dbo.TenderFormField f
WHERE f.FormCode = '3.1' AND f.FieldCode IN ('PainECG', 'ECGWireTime', 'ECGTIV')
  AND (f.FieldType <> 'Number' OR ISNULL(f.Unit, '') <> 'min')
  AND NOT EXISTS (SELECT 1 FROM #Answered a WHERE a.FormCode = f.FormCode AND a.FieldCode = f.FieldCode);

/* L8599-8606: "SAVE" and "COMPLETE AND SAVE ?" are the tender describing the
   two buttons, not questions. They are now real buttons (Save, and
   Duusgaj hadgalah -> Confirm), so the radio rows are retired. */
UPDATE dbo.TenderFormField SET IsActive = 0, UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode IN ('SAVE', 'COMPLETEANDSAVE') AND IsActive = 1;

/* "If yes" children waited for 'y', but these parents' option sets code Yes as
   o1 (f31_01 / f31_40 / f31_43 / f31_45 / f31_53), Abnormal as o2 (f31_11) and
   Occlusion as o5 (f31_27). Nothing could ever reveal them. */
UPDATE dbo.TenderFormField SET ParentValue = 'o1', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode IN ('IfYesEzetimibe', 'IfYesStatins', 'IfVentriculographyLVEF')
  AND ISNULL(ParentValue, '') <> 'o1';

UPDATE dbo.TenderFormField SET ParentValue = 'o2', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfAbnormal' AND ISNULL(ParentValue, '') <> 'o2';

UPDATE dbo.TenderFormField SET ParentValue = 'o5', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfOccludedAgeOfOcclusion' AND ISNULL(ParentValue, '') <> 'o5';

/* f31_43 carries the MI type in the same list: Y, Type 1, Type 4a, Type 4b. */
UPDATE dbo.TenderFormField SET ParentValue = 'o1|o3|o4|o5', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfYesDate' AND ISNULL(ParentValue, '') <> 'o1|o3|o4|o5';

/* f31_45 likewise: Yes, then BARC 3a .. 5b. */
UPDATE dbo.TenderFormField SET ParentValue = 'o1|o3|o4|o5|o6|o7|o8|o9', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfYesDate2' AND ISNULL(ParentValue, '') <> 'o1|o3|o4|o5|o6|o7|o8|o9';

/* Chains hung on the wrong question. Tender 3.1, "Lipid-lowering treatments":
   statins yes -> molecule -> dosage; ezetimibe hangs on lipid-lowering yes. */
UPDATE dbo.TenderFormField SET ParentField = 'IfYesStatins', ParentValue = 'o1', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfYesMolecule'
  AND (ISNULL(ParentField, '') <> 'IfYesStatins' OR ISNULL(ParentValue, '') <> 'o1');

UPDATE dbo.TenderFormField SET ParentField = 'IfYesMolecule', ParentValue = 'o1|o2|o3|o4|o5', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfYesDosage'
  AND (ISNULL(ParentField, '') <> 'IfYesMolecule' OR ISNULL(ParentValue, '') <> 'o1|o2|o3|o4|o5');

UPDATE dbo.TenderFormField SET ParentField = 'LipidLoweringTreatment', ParentValue = 'o1', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfYesEzetimibe2'
  AND (ISNULL(ParentField, '') <> 'LipidLoweringTreatment' OR ISNULL(ParentValue, '') <> 'o1');

/* "call 103 ... if yes Call date / Call time" */
UPDATE dbo.TenderFormField SET ParentField = 'Call103', ParentValue = 'o1', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode IN ('IfYesCallDate', 'IfYesCallTime')
  AND (ISNULL(ParentField, '') <> 'Call103' OR ISNULL(ParentValue, '') <> 'o1');

/* "Fibrinolysis ... if yes Date / Time ... if no, reasons" */
UPDATE dbo.TenderFormField SET ParentField = 'Fibrinolysis', ParentValue = 'y', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode IN ('IfYesDateFibrinolysis', 'IfYesTimeOfFibrinolysis')
  AND (ISNULL(ParentField, '') <> 'Fibrinolysis' OR ISNULL(ParentValue, '') <> 'y');

UPDATE dbo.TenderFormField SET ParentField = 'Fibrinolysis', ParentValue = 'n', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfNoReasons'
  AND (ISNULL(ParentField, '') <> 'Fibrinolysis' OR ISNULL(ParentValue, '') <> 'n');

/* "if no PCI, causes" hung on a free-text TIME field, so it never showed. The
   dictionary has no PCI yes/no question to hang it on; shown unconditionally
   until the clinical team names one (flagged in the ZSUT follow-up). */
UPDATE dbo.TenderFormField SET ParentField = NULL, ParentValue = NULL, UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND FieldCode = 'IfNoPCICauses' AND ParentField IS NOT NULL;

/* Sections. The seeding put 87 fields in s1 "PAST MEDICAL HISTORY"; the
   tender's own headings survived only as help text on the first field of each
   block. Restore them as sections so the rail can find them. SectionPos stays
   1, so they sort after s1 and before s2 by Position. */
UPDATE dbo.TenderFormField
SET SectionCode = 's1cag', SectionLabel = N'CORONARY ANGIOGRAPHY', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND SectionCode = 's1' AND Position BETWEEN 230 AND 760;

UPDATE dbo.TenderFormField
SET SectionCode = 's1ptca', SectionLabel = N'PTCA (CORONARY ANGIOPLASTY SESSION)', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND SectionCode = 's1' AND Position BETWEEN 770 AND 870;

/* L8330: "Coronary angiography only" skips the Angioplasty section. The
   angioplasty session, each dilated lesion (s2) and each stent (s3) show once
   Decision for CAG is answered with anything other than o1. Rows with their
   own parent keep it - visibility is transitive, so they hide with the rest. */
UPDATE dbo.TenderFormField SET ParentField = 'DecisionForCAG', ParentValue = '!o1', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND SectionCode IN ('s1ptca', 's2', 's3') AND ParentField IS NULL;

/* L8492: "Additional data for register ST+" appears automatically when the
   indication is ACS ST+ (<24h or >24h). The seeding filed the block under s10
   "Lipid-lowering treatments 1 year". It gets its own section, and it and the
   ST+-only sections after it (Clinic ST+, Revascularization, Deadlines) follow
   Angina status = ACS ST+ (f31_08 o4). The <24h / >24h split is ACS delay,
   a second field; both cases are ST+, so both reveal. */
UPDATE dbo.TenderFormField
SET SectionCode = 's10stp', SectionLabel = N'Additional data for register ST+', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND SectionCode = 's10' AND Position BETWEEN 1360 AND 1510;

UPDATE dbo.TenderFormField SET ParentField = 'AnginaStatus', ParentValue = 'o4', UpdateDate = GETDATE()
WHERE FormCode = '3.1' AND SectionCode IN ('s10stp', 's11', 's12', 's13')
  AND ParentField IS NULL AND IsActive = 1;

/* ======================================================================
   FORM 2.2  Atrial fibrillation registry
   ====================================================================== */

/* Dates seeded as radios over f22_17 = {Todorhoigui, Ugui}. */
UPDATE f SET FieldType = 'Date', OptionType = NULL, UpdateDate = GETDATE()
FROM dbo.TenderFormField f
WHERE f.FormCode = '2.2'
  AND f.FieldCode IN ('ShinjTemdegEhelsenOgnooUdurSar', 'OgnooUdurSarJil', 'EmnelegtAnhHevtsenOgnooUdurSar',
                      'UrdchilsanOnoshTavigdsanUdurSarJil', 'TiimBolZTsBHiisenOgnoogOruulah',
                      'TiimBolShinjilgeeniiOgnoogBichneVv', 'TiimBolShinjilgeeniiOgnoogBichneVv2',
                      'TiimBolTodruulnaUuCHADS2VASc', 'TiimBolTodruulnaUuEHRAOnoo',
                      'TiimBolTodruulnaUuOgnooUdur', 'TiimBolVndsenShinjilgeeHiisenOgnoog')
  AND f.FieldType <> 'Date'
  AND NOT EXISTS (SELECT 1 FROM #Answered a WHERE a.FormCode = f.FormCode AND a.FieldCode = f.FieldCode);

/* Measurements seeded as the same {unknown, no} radio - a blood pressure in
   mmHg, a heart rate, QRS duration, LV diameters and volumes, EF, PA pressure.
   Same class as the weight/height fix in fix_form_field_types_and_required.sql.
   CHADS2-VASc total becomes a number too: the editor now calculates it. */
UPDATE f SET FieldType = 'Number', OptionType = NULL, UpdateDate = GETDATE()
FROM dbo.TenderFormField f
WHERE f.FormCode = '2.2'
  AND f.FieldCode IN ('SistolynDaraltMmMUB', 'DiastolynDaraltMmMUB', 'ZvrhniiTsohiltynTooUdaaMin',
                      'ZvrhniiTsohilt', 'QRSVrgeljlehHugatsaa', 'ZvvnHovdlynDiastolynTugsguliinDiametr',
                      'ZvvnHovdlynSistolynTugsguliinDiametr', 'ZvvnHovdolynTsatsaltynFrakts',
                      'ZvvnHovdlynDiastolynTugsguliinEzelhvvn', 'ZvvnHovdlynSistolynTugsguliinEzelhvvn',
                      'SistolynVeiinUushignyArteriinDaraltygTootsoh', 'CHADS2VAScOnoo')
  AND f.FieldType <> 'Number'
  AND NOT EXISTS (SELECT 1 FROM #Answered a WHERE a.FormCode = f.FormCode AND a.FieldCode = f.FieldCode);

/* Medications (sections s78, s79) could only be answered "unknown" or "no" -
   f22_17 has no Yes. They take the form's own yes/no/unknown set, f22_14. */
UPDATE f SET OptionType = 'f22_14', UpdateDate = GETDATE()
FROM dbo.TenderFormField f
WHERE f.FormCode = '2.2' AND f.OptionType = 'f22_17' AND f.SectionCode IN ('s78', 's79')
  AND NOT EXISTS (SELECT 1 FROM #Answered a WHERE a.FormCode = f.FormCode AND a.FieldCode = f.FieldCode);

/* "Tiim bol ..." (if yes ...) rows, each under the yes/no question directly
   above it in the same section. Tiim = o2 in f22_14. The one in s6 ("Chest
   pain") is left alone: its question is the section heading, not a field. */
UPDATE c SET ParentField = m.Parent, ParentValue = 'o2', UpdateDate = GETDATE()
FROM dbo.TenderFormField c
JOIN (VALUES
  ('TiimBolZTsBHiisenOgnoogOruulah',      'ZTsBHiisenVv'),
  ('TiimBolShinjilgeeniiOgnoogBichneVv',  'ZvrhniiHetAviaShinjilgeeHiisenEseh'),
  ('TiimBolShinjilgeeniiOgnoogBichneVv2', 'TseejniiRentgenZuragAvsanEseh'),
  ('TiimBolTodruulnaUuCHADS2VASc',        'CHADS2VAScOnooVnelsenEseh'),
  ('TiimBolTodruulnaUuEHRAOnoo',          'EHRAOnooVnelsenVv'),
  ('TiimBolTodruulnaUuOgnooUdur',         'HASBLEDErsdeliinVnelgeeHiisenVv'),
  ('TiimBolVndsenShinjilgeeHiisenOgnoog', 'LaboratoriinShinjilgeeHiisenEseh'),
  ('TiimBolDoorhHvsnegtiigBuglunuVv',     'AjilbartaiHolbootoiHvndrelGarsanUu'),
  ('TiimBolDoorhHvsnegtiigBuglunuVv2',    'AjilbarynDaraaEmnelegtBaihVedTohioldson')
) m (Child, Parent) ON m.Child = c.FieldCode
WHERE c.FormCode = '2.2'
  AND (ISNULL(c.ParentField, '') <> m.Parent OR ISNULL(c.ParentValue, '') <> 'o2')
  AND EXISTS (SELECT 1 FROM dbo.TenderFormField p WHERE p.FormCode = '2.2' AND p.FieldCode = m.Parent AND p.OptionType = 'f22_14');

/* ======================================================================
   FORMS 1.5 - 1.9  Surgery appendices
   ====================================================================== */

/* Yes/no questions seeded as free text, so their "If yes" child waited for
   someone to TYPE the letter y. They become yorn radios, like the same
   question on the sibling forms. */
UPDATE f SET FieldType = 'RadioBox', OptionType = 'yorn', UpdateDate = GETDATE()
FROM dbo.TenderFormField f
JOIN (VALUES
  ('1.5', 'BloodTransfusionAfterSurgeryUntilDischarge'),
  ('1.6', 'Anticoagulants'),
  ('1.6', 'BloodTransfusionAfterSurgeryUntilDischarge'),
  ('1.8', 'BloodTransfusionAfterSurgeryUntilDischarge'),
  ('1.9', 'Antiplatelets'),
  ('1.9', 'Anticoagulants'),
  ('1.9', 'BloodTransfusionAfterSurgeryUntilDischarge')
) m (FormCode, FieldCode) ON m.FormCode = f.FormCode AND m.FieldCode = f.FieldCode
WHERE f.FieldType = 'Text'
  AND NOT EXISTS (SELECT 1 FROM #Answered a WHERE a.FormCode = f.FormCode AND a.FieldCode = f.FieldCode);

/* 1.7 never got the question: section s15 is titled "Blood transfusion after
   surgery until discharge:" and holds only its "If yes:" child, which was hung
   on ICU day (a number). Add the question, worded as on 1.5/1.6/1.8/1.9, and
   hang the child on it. */
IF NOT EXISTS (SELECT 1 FROM dbo.TenderFormField
               WHERE FormCode = '1.7' AND FieldCode = 'BloodTransfusionAfterSurgeryUntilDischarge')
  INSERT INTO dbo.TenderFormField
    (FormCode, FieldCode, LabelMn, FieldType, OptionType, SectionCode, SectionLabel, SectionPos,
     ParentField, ParentValue, IsRequired, IsSearchable, Md, Position, IsActive, CreateDate)
  SELECT '1.7', 'BloodTransfusionAfterSurgeryUntilDischarge', N'Blood transfusion after surgery until discharge:',
         'RadioBox', 'yorn', c.SectionCode, c.SectionLabel, c.SectionPos,
         NULL, NULL, 0, 0, 12, c.Position - 5, 1, GETDATE()
  FROM dbo.TenderFormField c
  WHERE c.FormCode = '1.7' AND c.FieldCode = 'IfYes3';

UPDATE dbo.TenderFormField
SET ParentField = 'BloodTransfusionAfterSurgeryUntilDischarge', ParentValue = 'y', UpdateDate = GETDATE()
WHERE FormCode = '1.7' AND FieldCode = 'IfYes3'
  AND ISNULL(ParentField, '') <> 'BloodTransfusionAfterSurgeryUntilDischarge';

COMMIT TRANSACTION;

/* ---------------------------------------------------------------------- report */
SELECT FormCode,
       COUNT(*) AS ActiveFields,
       SUM(CASE WHEN ParentField IS NOT NULL THEN 1 ELSE 0 END) AS Conditional
FROM dbo.TenderFormField WHERE IsActive = 1
GROUP BY FormCode ORDER BY FormCode;

/* anything still a date-or-measure radio: skipped because answers exist */
SELECT f.FormCode, f.FieldCode, f.FieldType, f.OptionType
FROM dbo.TenderFormField f
WHERE f.IsActive = 1 AND f.OptionType IN ('f31_51', 'f22_17');

/* conditional rows whose parent does not exist on the same form */
SELECT c.FormCode, c.FieldCode, c.ParentField
FROM dbo.TenderFormField c
WHERE c.ParentField IS NOT NULL AND c.IsActive = 1
  AND NOT EXISTS (SELECT 1 FROM dbo.TenderFormField p
                  WHERE p.FormCode = c.FormCode AND p.FieldCode = c.ParentField AND p.IsActive = 1);
