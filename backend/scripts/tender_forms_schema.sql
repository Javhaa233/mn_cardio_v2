-- =============================================================================
-- Tender phase 4 (Цахим маягт, модуль хөгжүүлэлт) - JSON-backed form storage
--
-- Three tables:
--   TenderForm       - the form registry (1.1, 1.3, 1.6, 2.1, 3.1 ...)
--   TenderFormField  - the field dictionary; also the WBS "Data dictionary"
--                      deliverable, and what makes the dynamic form module work
--   TenderFormData   - one row per filled form instance, answers held as JSON
--
-- Answers live in TenderFormData.Data as JSON keyed by TenderFormField.FieldCode.
-- Operational fields (patient, date, doctor, org, status) stay real columns so
-- list screens sort and filter on indexes rather than on the blob.
--
-- Per-form SQL views project the JSON back into columns, which lets the existing
-- generic /BaseObject controller give us list, search, sort and Excel export
-- with no per-form backend code.
--
-- Existing wide tables (AtrialRhythmNew, SurgeryBeforeVisitsCheck, ...) are NOT
-- touched. They keep working exactly as they do today.
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

-- -----------------------------------------------------------------------------
-- 1. TenderForm - registry of the tender's forms
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.TenderForm', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TenderForm (
        FormCode      varchar(20)    NOT NULL CONSTRAINT PK_TenderForm PRIMARY KEY,
        NameMn        nvarchar(300)  NOT NULL,
        NameEn        nvarchar(300)      NULL,
        GroupCode     varchar(30)        NULL,  -- surgery | rhythm | angio | exam
        GroupLabelMn  nvarchar(200)      NULL,
        Version       int            NOT NULL CONSTRAINT DF_TenderForm_Version DEFAULT (1),
        Position      int            NOT NULL CONSTRAINT DF_TenderForm_Position DEFAULT (0),
        IsActive      bit            NOT NULL CONSTRAINT DF_TenderForm_IsActive DEFAULT (1),
        CreateDate    datetime       NOT NULL CONSTRAINT DF_TenderForm_CreateDate DEFAULT (GETDATE()),
        UpdateDate    datetime           NULL
    );
    PRINT 'created TenderForm';
END
ELSE PRINT 'TenderForm already exists';
GO

-- -----------------------------------------------------------------------------
-- 2. TenderFormField - the field dictionary
--    One row per field. Drives the rendered form, the JSON keys, and the
--    generated view. FieldType values are the ones the frontend already
--    understands (RadioBox, Text, Number, Date, CheckBox, TextArea,
--    SingleSelect), so no new controls are needed.
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.TenderFormField', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TenderFormField (
        Id            int            NOT NULL IDENTITY(1,1)
                      CONSTRAINT PK_TenderFormField PRIMARY KEY,
        FormCode      varchar(20)    NOT NULL,
        FieldCode     varchar(100)   NOT NULL,  -- the JSON key
        LabelMn       nvarchar(500)  NOT NULL,
        LabelEn       nvarchar(500)      NULL,
        FieldType     varchar(30)    NOT NULL
                      CONSTRAINT DF_TenderFormField_Type DEFAULT ('RadioBox'),
        OptionType    varchar(50)        NULL,  -- OptionTypes.dico
        SectionCode   varchar(50)        NULL,
        SectionLabel  nvarchar(300)      NULL,
        SectionPos    int            NOT NULL CONSTRAINT DF_TenderFormField_SectionPos DEFAULT (0),
        ParentField   varchar(100)       NULL,  -- conditional reveal: show when
        ParentValue   nvarchar(100)      NULL,  --   ParentField == ParentValue
        IsRequired    bit            NOT NULL CONSTRAINT DF_TenderFormField_Req DEFAULT (0),
        IsSearchable  bit            NOT NULL CONSTRAINT DF_TenderFormField_Search DEFAULT (0),
        Md            tinyint            NULL,  -- 12-column grid width
        Position      int            NOT NULL CONSTRAINT DF_TenderFormField_Position DEFAULT (0),
        Unit          nvarchar(30)       NULL,
        HelpTextMn    nvarchar(1000)     NULL,
        IsActive      bit            NOT NULL CONSTRAINT DF_TenderFormField_Active DEFAULT (1),
        CreateDate    datetime       NOT NULL CONSTRAINT DF_TenderFormField_CreateDate DEFAULT (GETDATE()),
        UpdateDate    datetime           NULL,
        CONSTRAINT UQ_TenderFormField_Form_Code UNIQUE (FormCode, FieldCode),
        CONSTRAINT FK_TenderFormField_Form FOREIGN KEY (FormCode)
            REFERENCES dbo.TenderForm (FormCode)
    );
    CREATE INDEX IX_TenderFormField_Form
        ON dbo.TenderFormField (FormCode, SectionPos, Position)
        INCLUDE (FieldCode, FieldType, OptionType);
    PRINT 'created TenderFormField';
END
ELSE PRINT 'TenderFormField already exists';
GO

-- -----------------------------------------------------------------------------
-- 3. TenderFormData - one row per filled form instance
--    PatRegNo is the patient key, matching the convention already used by
--    AtrialRhythmNew, ValveDiseases, CongenitalMalformations, HfHospitalization.
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.TenderFormData', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TenderFormData (
        Id             int            NOT NULL IDENTITY(1,1)
                       CONSTRAINT PK_TenderFormData PRIMARY KEY,
        FormCode       varchar(20)    NOT NULL,
        FormVersion    int            NOT NULL CONSTRAINT DF_TenderFormData_Ver DEFAULT (1),

        PatRegNo       nvarchar(20)   NOT NULL,   -- Patient.p_registration
        PatientId      int                NULL,   -- Patient.id_data, for joins

        FormDate       date           NOT NULL,   -- identifies the instance
        VisitId        int                NULL,
        SurgeryId      int                NULL,
        DoctorId       int                NULL,
        OrganizationId int                NULL,

        Data           nvarchar(max)  NOT NULL,   -- the answers, as JSON

        Status         tinyint        NOT NULL CONSTRAINT DF_TenderFormData_Status DEFAULT (0),
                                                 -- 0 draft, 1 confirmed
        rec_status     int            NOT NULL CONSTRAINT DF_TenderFormData_Rec DEFAULT (1),
                                                 -- 2 = deleted, matching house convention
        CreateDate     datetime       NOT NULL CONSTRAINT DF_TenderFormData_CreateDate DEFAULT (GETDATE()),
        CreateUserId   int                NULL,
        UpdateDate     datetime           NULL,
        UpdateUserId   int                NULL,

        CONSTRAINT FK_TenderFormData_Form FOREIGN KEY (FormCode)
            REFERENCES dbo.TenderForm (FormCode),
        CONSTRAINT CK_TenderFormData_Json CHECK (ISJSON(Data) = 1)
    );

    -- "this patient's forms", newest first
    CREATE INDEX IX_TenderFormData_Patient
        ON dbo.TenderFormData (PatRegNo, FormCode, FormDate DESC)
        INCLUDE (Status, rec_status);

    -- the per-form menu list
    CREATE INDEX IX_TenderFormData_Form
        ON dbo.TenderFormData (FormCode, FormDate DESC)
        INCLUDE (PatRegNo, Status, rec_status);

    PRINT 'created TenderFormData';
END
ELSE PRINT 'TenderFormData already exists';
GO

SET NOEXEC OFF;
GO

-- summary
SELECT 'TenderForm'      AS TableName, COUNT(*) AS Rows FROM dbo.TenderForm
UNION ALL SELECT 'TenderFormField', COUNT(*) FROM dbo.TenderFormField
UNION ALL SELECT 'TenderFormData',  COUNT(*) FROM dbo.TenderFormData;
GO
