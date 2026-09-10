-- =============================================================================
-- Flag the fields worth showing as grid columns and searching on.
--
-- TenderFormTable puts the first four IsSearchable fields of a form into the
-- list grid, so without this every list shows only registration number and
-- date. These are the identity/summary fields a doctor scans a list by -
-- surgery date, surgery type, responsible doctor, NYHA class - not clinical
-- detail, which belongs in the form itself.
--
-- Data only. Re-runnable.
--
-- No regeneration needed: generate_form_views.js never reads IsSearchable (it
-- keys off FieldCode/FieldType/IsActive/Position), and the grid reads the flag
-- live from the DB through POST /TenderForm/GetConfig. A browser refresh is
-- enough. The flagged FieldCode must already be a column in the generated view,
-- which it is for every form below.
--
-- Every UPDATE below sits inside the DB_NAME() guard. It did not always: the
-- rhythm block used to sit after SET NOEXEC OFF, which SQL Server executes even
-- while NOEXEC is on - so that block ran against whatever database it was
-- pointed at, guard or no guard. The single SET NOEXEC OFF is now at the very
-- end, immediately before the verification SELECT.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- start from a clean slate for the generated forms so re-running is stable
UPDATE dbo.TenderFormField
   SET IsSearchable = 0
 WHERE FormCode IN ('1.5', '1.6', '1.7', '1.8', '1.9');

-- the surgery-record forms share a common header block
UPDATE dbo.TenderFormField
   SET IsSearchable = 1
 WHERE FormCode IN ('1.5', '1.6', '1.7', '1.8', '1.9')
   AND FieldCode IN (
        'DateOfSurgery',
        'TypeOfSurgery',
        'DoctorInCharge',
        'PreOpNYHA',
        'DateOfAdmission',
        'PatientsHistoryID'
   );

-- give each field a stable order so the grid columns are predictable
UPDATE f
   SET f.IsSearchable = 1
  FROM dbo.TenderFormField f
 WHERE f.FormCode IN ('1.1', '1.3')
   AND f.FieldCode IN ('MesZaslynOgnoo', 'UvchTuuhDugaar', 'TuluvlugdsunMesZasal');

-- =============================================================================
-- Rhythm forms (tender item 2), appended for item 5 - "list, search, export".
--
-- 2.1 previously flagged its own "Ognoo" field, which produced a second column
-- headed "Огноо" next to the grid's own form-date column - two identical
-- headings, one of them always empty. The form date already carries that, so
-- the field is dropped from the grid and the slot goes to a real one.
--
-- 2.2 had nothing flagged at all, so its list showed only registration number
-- and date for a 244-field registry. These four are what a doctor scans an
-- atrial-fibrillation list by: when they were seen, and the three scores that
-- decide anticoagulation - CHADS2-VASc (stroke risk), EHRA (symptom burden)
-- and HAS-BLED (bleeding risk).
-- =============================================================================

UPDATE dbo.TenderFormField
   SET IsSearchable = 0
 WHERE FormCode IN ('2.1', '2.2');

UPDATE dbo.TenderFormField
   SET IsSearchable = 1
 WHERE FormCode = '2.1'
   AND FieldCode IN ('UvchniiOnosh', 'AjilbarTurul', 'EfshOnosh', 'AblatsiArga');

UPDATE dbo.TenderFormField
   SET IsSearchable = 1
 WHERE FormCode = '2.2'
   AND FieldCode IN (
        'VzlegiinOgnooEmnelegtHevtsenOgnooUdur',
        'CHADS2VAScOnoo',
        'EHRAOnoo',
        'HASBLED'
   );

-- =============================================================================
-- Form 3.1 (Титэм судасны оношилгоо эмчилгээ) - the last form with nothing
-- flagged, so a 166-field registry listed with only registration number and
-- date.
--
-- 3.1 has no date, no case identifier and no operator field of its own, so
-- unlike the surgery forms there is nothing here to flag for those. It does not
-- need any: TenderFormData carries FormDate, PatRegNo and DoctorId, and the
-- grid already renders all three as fixed columns. Flagging a dictionary date
-- would reproduce the duplicate-"Огноо" bug described for 2.1 above.
--
-- What is left is the clinical shape of the case, in the order a cath-lab list
-- is read:
--   AnginaStatus           - why the patient is on the table (ACS ST+ is what
--                            you scan a list for)
--   CharacterOfExamination - scheduled vs urgent; separates elective workload
--                            from emergency
--   ResultConclusion       - the angiographic diagnosis (Coro normal .. 3
--                            vessel / isolated LMCA)
--   DecisionForCAG         - procedure type; also the field driving the
--                            "Coronary angiography only skips Angioplasty" rule
--
-- Grid order is fixed by SectionPos, Position - not by the order below.
-- =============================================================================

UPDATE dbo.TenderFormField
   SET IsSearchable = 0
 WHERE FormCode = '3.1';

UPDATE dbo.TenderFormField
   SET IsSearchable = 1
 WHERE FormCode = '3.1'
   AND FieldCode IN (
        'AnginaStatus',
        'CharacterOfExamination',
        'ResultConclusion',
        'DecisionForCAG'
   );

SET NOEXEC OFF;
GO

SELECT FormCode,
       COUNT(*) AS SearchableFields,
       STRING_AGG(FieldCode, ', ') WITHIN GROUP (ORDER BY SectionPos, Position) AS Fields
FROM dbo.TenderFormField
WHERE IsSearchable = 1
GROUP BY FormCode
ORDER BY FormCode;
GO
