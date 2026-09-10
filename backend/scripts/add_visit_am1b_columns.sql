-- =============================================================================
-- Visit — the columns form АМ-1Б needs and the table does not have.
-- Upgrade tender item 4.1, tracker row №96
-- ("Өгөгдлийн сангийн хүснэгт, холбоос үүсгэх").
--
-- CONTEXT. Item 4.1's appendix is an image in the tender document
-- (`word/media/image5.png`): «ЭМЧИЙН ҮЗЛЭГИЙН БҮРТГЭЛ», form АМ-1Б, which is
-- appendix 11 of Minister of Health order А/611 of 2019-12-30. It is a 22-column
-- register, one row per examination.
--
-- Visit already carries most of it: visit_date, the Patient join (name,
-- registration, address, occupation, education, insurance, age, sex),
-- type_exam1/type_exam2 for the examination-type block, `disease`
-- (dico new_or_old) for Шинэ/Хуучин, and referred_by_13a for the referral
-- column. These five have no column at all.
--
-- Visit is the LEGACY table generation (PK id_data, snake_case), so these
-- follow that convention rather than the newer PascalCase one — CLAUDE.md §5.
--
-- No column is made NOT NULL and nothing existing is altered: there are ~450,000
-- Visit rows and every one of them predates these fields.
--
-- STILL NEEDED FROM ЗСҮТ before the fields can be coded rather than typed:
--   * `has_complication` uses the existing `yorn` dico, whose labels are the
--     English "Yes"/"No". A Mongolian option list is wanted here.
--   * columns 14/16 are ICD-10 and column 20 is ICD-9-PC. The Icd9PcLevel1..4
--     tables exist in the model and are referenced by no controller at all, so
--     wiring them is a separate decision.
--
-- Idempotent. Safe to re-run.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- АМ-1Б column 14 — Үзлэгийн төрөл /Z00-Z40/
IF COL_LENGTH('dbo.Visit', 'exam_type_icd') IS NULL
BEGIN
    ALTER TABLE dbo.Visit ADD exam_type_icd nvarchar(200) NULL;
    PRINT 'added Visit.exam_type_icd';
END
ELSE PRINT 'Visit.exam_type_icd already exists';
GO

-- АМ-1Б column 16 — Өвчний шалтгаан /ӨОУА-10/
IF COL_LENGTH('dbo.Visit', 'cause_icd10') IS NULL
BEGIN
    ALTER TABLE dbo.Visit ADD cause_icd10 nvarchar(200) NULL;
    PRINT 'added Visit.cause_icd10';
END
ELSE PRINT 'Visit.cause_icd10 already exists';
GO

-- АМ-1Б column 20 — Хийгдсэн ажилбар /ҮОУА-9/
IF COL_LENGTH('dbo.Visit', 'procedure_icd9') IS NULL
BEGIN
    ALTER TABLE dbo.Visit ADD procedure_icd9 nvarchar(200) NULL;
    PRINT 'added Visit.procedure_icd9';
END
ELSE PRINT 'Visit.procedure_icd9 already exists';
GO

-- АМ-1Б column 21 — Хүндрэлтэй эсэх, тийм(+) үгүй(-)
IF COL_LENGTH('dbo.Visit', 'has_complication') IS NULL
BEGIN
    ALTER TABLE dbo.Visit ADD has_complication varchar(10) NULL;
    PRINT 'added Visit.has_complication';
END
ELSE PRINT 'Visit.has_complication already exists';
GO

-- АМ-1Б column 22 — Хөдөлмөрийн чадвар түр алдалтын хоног
IF COL_LENGTH('dbo.Visit', 'incapacity_days') IS NULL
BEGIN
    ALTER TABLE dbo.Visit ADD incapacity_days int NULL;
    PRINT 'added Visit.incapacity_days';
END
ELSE PRINT 'Visit.incapacity_days already exists';
GO

SET NOEXEC OFF;
GO

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME = 'Visit'
   AND COLUMN_NAME IN ('exam_type_icd','cause_icd10','procedure_icd9','has_complication','incapacity_days')
 ORDER BY COLUMN_NAME;
GO
