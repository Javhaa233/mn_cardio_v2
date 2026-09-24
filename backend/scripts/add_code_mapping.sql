-- CodeMapping — local field -> international code (LOINC, SNOMED CT, UCUM).
--
-- Mobile tender §1.4 names FHIR/HL7, SNOMED CT and LOINC. A projection cannot
-- emit a LOINC-coded Observation without something that says which LOINC code a
-- column called `hb` or `blood_pressure2` means, and nothing in this schema
-- says that. This is that table.
--
-- IT ALSO FILLS THE UNITS AND REFERENCE RANGES THAT ARE MISSING EVERYWHERE.
-- LaboratoryTest stores every result as a bare string: no unit column, no
-- reference column. helper/Diagnostics.js therefore returns unit and refRange
-- as null and says so in its header. Both come from here once a row is
-- verified.
--
-- ============================ THE Verified FLAG ============================
--
-- READ THIS BEFORE SETTING ANY ROW TO 1.
--
-- A wrong LOINC code does not fail loudly. It silently asserts that a number
-- means something it does not, to every system that consumes the exchange - and
-- a receiving system has no way to detect it. That is a clinical data-integrity
-- problem, not a configuration detail.
--
-- So every row seeded below is Verified = 0, and:
--
--   * api/fhir Observation emits a LOINC `coding` ONLY for a verified row.
--     An unverified row still produces an Observation, but as a CodeableConcept
--     with `text` and no `coding` - "a measurement was recorded, it is not
--     coded". That is exactly what the Condition endpoint already does for
--     uncoded diagnoses, and for the same reason: never invent coded clinical
--     information.
--   * helper/Diagnostics.js will only attach unit and refRange from verified
--     rows.
--
-- The codes below are the widely used ones for these measurements, entered as a
-- STARTING POINT FOR REVIEW, not as an assertion. They need sign-off from ЗСҮТ's
-- laboratory and clinical informatics side before any of them is flipped to 1.
-- Until then FEATURE_FHIR_EXPORT stays off and nothing leaves the building.
--
-- RefLow / RefHigh are left NULL throughout. A reference range depends on the
-- analyser, the method, the sex and often the age; copying a textbook range
-- into a national system would be worse than having none, because a doctor
-- would see a range beside a result and reasonably assume it applied.
--
-- Safe to re-run.

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CodeMapping')
BEGIN
    CREATE TABLE [CodeMapping] (
        [Id]          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        -- Which model/table the field belongs to, e.g. 'LaboratoryTest'.
        [LocalObject] NVARCHAR(100) NOT NULL,
        -- The column name, exactly as the schema spells it - including the
        -- typo `total_proteoin`, which must be matched and not corrected.
        [LocalCode]   NVARCHAR(100) NOT NULL,
        -- 'http://loinc.org', 'http://snomed.info/sct', …
        [System]      NVARCHAR(200) NULL,
        [Code]        NVARCHAR(50)  NULL,
        [Display]     NVARCHAR(255) NULL,
        -- UCUM, e.g. 'mm[Hg]', 'g/dL', '10*9/L'.
        [Unit]        NVARCHAR(50)  NULL,
        [RefLow]      DECIMAL(18,4) NULL,
        [RefHigh]     DECIMAL(18,4) NULL,
        -- 0 until a clinician or informatician has checked it. See the header:
        -- an unverified row is used for its LABEL only, never as a code.
        [Verified]    BIT NOT NULL CONSTRAINT [DF_CodeMapping_Verified] DEFAULT (0),
        [VerifiedBy]  INT NULL,
        [VerifiedAt]  DATETIME NULL,
        [Notes]       NVARCHAR(500) NULL,
        [CreateDate]  DATETIME NULL,
        CONSTRAINT [UQ_CodeMapping_Local] UNIQUE ([LocalObject], [LocalCode])
    );
    PRINT 'CodeMapping created';
END
ELSE PRINT 'CodeMapping already exists';
GO

;WITH Seed([LocalObject], [LocalCode], [Code], [Display], [Unit]) AS (
    SELECT * FROM (VALUES
        -- ---- PatientMonitoring: the patient's own daily log -----------------
        ('PatientMonitoring', 'blood_pressure',  '8480-6',  'Systolic blood pressure',            'mm[Hg]'),
        ('PatientMonitoring', 'blood_pressure2', '8462-4',  'Diastolic blood pressure',           'mm[Hg]'),
        ('PatientMonitoring', 'pulse',           '8867-4',  'Heart rate',                         '/min'),
        ('PatientMonitoring', 'weight',          '29463-7', 'Body weight',                        'kg'),
        ('PatientMonitoring', 'inr',             '6301-6',  'INR in Platelet poor plasma',        '{INR}'),

        -- ---- LaboratoryTest: haematology -----------------------------------
        ('LaboratoryTest', 'wbc',            '6690-2',  'Leukocytes in Blood',                 '10*9/L'),
        ('LaboratoryTest', 'rbc',            '789-8',   'Erythrocytes in Blood',               '10*12/L'),
        ('LaboratoryTest', 'hb',             '718-7',   'Hemoglobin in Blood',                 'g/dL'),
        ('LaboratoryTest', 'hct',            '4544-3',  'Hematocrit in Blood',                 '%'),
        ('LaboratoryTest', 'platelet',       '777-3',   'Platelets in Blood',                  '10*9/L'),
        ('LaboratoryTest', 'coe',            '4537-7',  'Erythrocyte sedimentation rate',      'mm/h'),

        -- ---- LaboratoryTest: liver and metabolic ---------------------------
        ('LaboratoryTest', 'total_proteoin', '2885-2',  'Protein in Serum or Plasma',          'g/L'),
        ('LaboratoryTest', 'albumin',        '1751-7',  'Albumin in Serum or Plasma',          'g/L'),
        ('LaboratoryTest', 'asat',           '1920-8',  'Aspartate aminotransferase',          'U/L'),
        ('LaboratoryTest', 'alat',           '1742-6',  'Alanine aminotransferase',            'U/L'),
        ('LaboratoryTest', 'total_bilirubin','1975-2',  'Bilirubin total in Serum or Plasma',  'umol/L'),
        ('LaboratoryTest', 'ggt',            '2324-2',  'Gamma glutamyl transferase',          'U/L'),
        ('LaboratoryTest', 'glucose',        '2345-7',  'Glucose in Serum or Plasma',          'mmol/L'),

        -- ---- LaboratoryTest: renal -----------------------------------------
        ('LaboratoryTest', 'mochevin',       '3094-0',  'Urea nitrogen in Serum or Plasma',    'mmol/L'),
        ('LaboratoryTest', 'creatinine',     '2160-0',  'Creatinine in Serum or Plasma',       'umol/L'),

        -- ---- LaboratoryTest: coagulation -----------------------------------
        ('LaboratoryTest', 'pt',             '5902-2',  'Prothrombin time',                    's'),
        ('LaboratoryTest', 'inr',            '6301-6',  'INR in Platelet poor plasma',         '{INR}'),
        ('LaboratoryTest', 'fibrinogen',     '3255-7',  'Fibrinogen in Platelet poor plasma',  'g/L'),
        ('LaboratoryTest', 'tt',             '3243-3',  'Thrombin time',                       's'),
        ('LaboratoryTest', 'aptt',           '3173-2',  'aPTT in Platelet poor plasma',        's'),

        -- ---- LaboratoryTest: serology --------------------------------------
        -- These four are the CONFIDENTIAL panel (helper/Diagnostics.js). They
        -- are mapped here so that if they are ever exchanged they are labelled
        -- correctly; whether they may be exchanged at all is a separate
        -- decision, governed by FEATURE_CONFIDENTIALITY and the access matrix.
        ('LaboratoryTest', 'hbs_ag',         '5196-1',  'Hepatitis B virus surface Ag',        NULL),
        ('LaboratoryTest', 'hcv',            '16128-1', 'Hepatitis C virus Ab',                NULL),
        ('LaboratoryTest', 'syphilis',       '20507-0', 'Reagin Ab in Serum (RPR)',            NULL),
        ('LaboratoryTest', 'hiv',            '75622-1', 'HIV 1+2 Ab in Serum or Plasma',       NULL)
    ) v([LocalObject], [LocalCode], [Code], [Display], [Unit])
)
INSERT INTO [CodeMapping] ([LocalObject], [LocalCode], [System], [Code], [Display], [Unit], [Verified], [Notes], [CreateDate])
SELECT s.[LocalObject], s.[LocalCode], 'http://loinc.org', s.[Code], s.[Display], s.[Unit], 0,
       N'Seeded 2026-09-14 as a starting point for review. NOT verified: no LOINC coding is emitted until Verified = 1.',
       GETDATE()
  FROM Seed s
 WHERE NOT EXISTS (
        SELECT 1 FROM [CodeMapping] m
         WHERE m.[LocalObject] = s.[LocalObject] AND m.[LocalCode] = s.[LocalCode]
       );

PRINT 'CodeMapping seed: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' row(s) added (all Verified = 0)';
GO

SET NOEXEC OFF;
GO

SELECT [LocalObject], COUNT(*) AS Mappings,
       SUM(CAST([Verified] AS INT)) AS Verified
  FROM [CodeMapping]
 GROUP BY [LocalObject];
GO
