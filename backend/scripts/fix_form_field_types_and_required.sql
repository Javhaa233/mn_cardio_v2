-- Field dictionary corrections for the tender phase-4 forms.
--
-- This is DATA, not DDL: every statement updates rows in TenderFormField.
-- Per CLAUDE.md section 4, changing a field is a dictionary row rather than a
-- code change, which is why none of this lives in the frontend.
--
-- Run order does not matter. Safe to re-run: every statement is idempotent.
--
-- After running, regenerate the views and configs, because FieldType decides
-- the column type in the generated per-form view:
--
--     node scripts/generate_form_views.js
--     touch server.js          # nodemon does not watch model/ or ModelConfigs/
--
-- Refuse any database other than the three this project uses (runbook Stage 2.2).
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- ===========================================================================
-- PART 1 - control types the seed generator inferred wrongly
-- ===========================================================================
--
-- These were derived from the tender appendices by a generator, which the seed
-- headers say explicitly. They are typing errors, not clinical content, so the
-- labels are untouched.

-- 2.2: weight and height came out as RadioBox bound to option set f22_17, and
-- f22_17 is { Todorhoigui, Ugui } - an unknown/no pair. A weight in kilograms
-- is a number, and the option set makes it impossible to record one.
UPDATE dbo.TenderFormField
   SET FieldType = 'Number', OptionType = NULL
 WHERE FormCode = '2.2'
   AND FieldCode IN ('JinKg', 'UndurSm')
   AND FieldType <> 'Number';

-- BMI and BSA are calculated numerics, but came out as Text on 1.6 and 1.9
-- while every other form has them as Number. The client now writes computed
-- values into them, so the type has to agree across forms.
UPDATE dbo.TenderFormField
   SET FieldType = 'Number'
 WHERE FieldCode IN ('BMIAutocalculator', 'BSAAutocalculator')
   AND FieldType <> 'Number';

-- 1.9: body weight came out as Text; Number everywhere else.
UPDATE dbo.TenderFormField
   SET FieldType = 'Number'
 WHERE FormCode = '1.9'
   AND FieldCode = 'BodyWeightKg'
   AND FieldType <> 'Number';

-- 1.9: date of admission came out as Text; Date on 1.5, 1.6, 1.7 and 1.8.
UPDATE dbo.TenderFormField
   SET FieldType = 'Date'
 WHERE FormCode = '1.9'
   AND FieldCode = 'DateOfAdmission'
   AND FieldType <> 'Date';

-- ===========================================================================
-- PART 2 - required fields
-- ===========================================================================
--
-- Only 5 of 1,612 dictionary rows carried IsRequired, so the validation the
-- tender asks for had almost nothing to enforce.
--
-- This flags the MINIMUM defensible set only: the field that identifies the
-- case, and the principal date. Both are already required on forms 1.1, 1.3
-- and 2.1, so this extends an existing decision rather than inventing one.
--
-- It is deliberately NOT a clinical judgement about which answers a doctor
-- must give. That is tracker row 23 (Talbaryn toli batlah) and the fourteen
-- per-form approval rows, all owned by the customer. Widen this list once the
-- field dictionary is signed off.
--
-- A form is only blocked at Confirm, never at Save, so an incomplete record
-- can still be saved and finished later.

DECLARE @Required TABLE (FormCode NVARCHAR(10), FieldCode NVARCHAR(100));

INSERT INTO @Required (FormCode, FieldCode) VALUES
    -- case identifier
    ('1.5', 'PatientsHistoryID'),
    ('1.6', 'PatientsHistoryID'),
    ('1.7', 'PatientsHistoryID'),
    ('1.8', 'PatientsHistoryID'),
    ('1.9', 'PatientsHistoryID'),
    -- principal date
    ('1.5', 'DateOfAdmission'),
    ('1.6', 'DateOfAdmission'),
    ('1.7', 'DateOfAdmission'),
    ('1.8', 'DateOfAdmission'),
    ('1.9', 'DateOfAdmission'),
    ('2.2', 'VzlegiinOgnooEmnelegtHevtsenOgnooUdur'),
    ('3.1', 'DateOfAdmissionTo');

UPDATE f
   SET f.IsRequired = 1
  FROM dbo.TenderFormField f
  JOIN @Required r
    ON r.FormCode = f.FormCode
   AND r.FieldCode = f.FieldCode
 WHERE f.IsRequired = 0;

-- ===========================================================================
-- What changed
-- ===========================================================================
SELECT FormCode,
       COUNT(*)                                    AS Fields,
       SUM(CASE WHEN IsRequired = 1 THEN 1 ELSE 0 END)   AS Required,
       SUM(CASE WHEN IsSearchable = 1 THEN 1 ELSE 0 END) AS Searchable,
       SUM(CASE WHEN ParentField IS NOT NULL THEN 1 ELSE 0 END) AS Conditional
  FROM dbo.TenderFormField
 GROUP BY FormCode
 ORDER BY FormCode;
