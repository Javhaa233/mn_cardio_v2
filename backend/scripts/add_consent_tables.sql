-- =============================================================================
-- ConsentDocument / PatientConsent - tracker row 23
--
-- The tender requires consent capture for non-treatment use of personal data.
--
-- PatientConsent IS APPEND-ONLY. A withdrawal is a NEW ROW with Granted = 0,
-- never an UPDATE of the granting row. This is the whole design and the thing
-- most likely to be "simplified" later by someone adding an UPDATE: consent is
-- a legal record, and the question it has to answer is not "does this person
-- consent" but "what exactly did they agree to, when, and when did they
-- withdraw it". An UPDATE destroys the only evidence of the first two.
--
-- THE WORDING IS A ROW, NOT A STRING IN CODE. ConsentDocument holds the
-- Mongolian text ЗСҮТ supply, versioned. That is what de-blocks this: the
-- feature is complete without the legal text, and supplying it later is an
-- INSERT rather than a deployment. A wording change is a new Version, which is
-- also why PatientConsent records ConsentDocumentId - so an old consent stays
-- attached to the text that was actually shown.
--
-- KEYED BY PatRegNo, matching CVDMonitoring, PatientBodySize, the rehab tables
-- and what ДАН will assert. PatientUserId is recorded alongside where one
-- exists, but it is not the key: under the ДАН login path there is no
-- PatientUsers row at all.
--
-- NOTHING CALLS HasConsent YET, AND THAT IS CORRECT RATHER THAN INCOMPLETE.
-- The tender requires CAPTURE. The enforcement points are wherever
-- non-treatment use happens, and no such feature exists in this backend - there
-- is no research export, no secondary-use pipeline. Wiring a check into
-- something that does not exist would be theatre.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConsentDocument')
BEGIN
    CREATE TABLE [ConsentDocument] (
        [Id]            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PurposeCode]   NVARCHAR(50)  NULL,   -- dico 'consent_purpose'
        [Version]       NVARCHAR(20)  NULL,
        [TitleMn]       NVARCHAR(255) NULL,
        [BodyMn]        NVARCHAR(MAX) NULL,   -- the legal text ЗСҮТ supply
        [IsActive]      BIT NOT NULL CONSTRAINT [DF_ConsentDocument_IsActive] DEFAULT (1),
        [EffectiveFrom] DATETIME NULL,
        [CreateDate]    DATETIME NULL,
        [CreateUserId]  INT NULL
    );
    PRINT 'created ConsentDocument';
END
ELSE PRINT 'ConsentDocument already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PatientConsent')
BEGIN
    CREATE TABLE [PatientConsent] (
        [Id]                INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]          NVARCHAR(20) NULL,
        [PatientId]         INT NULL,
        [PatientUserId]     INT NULL,
        [ConsentDocumentId] INT NULL,
        [PurposeCode]       NVARCHAR(50) NULL,
        -- 1 = granted, 0 = withdrawn. NEVER updated: the current state is the
        -- most recent row per PurposeCode.
        [Granted]           BIT NULL,
        [GrantedDate]       DATETIME NULL,
        [Channel]           NVARCHAR(20) NULL,   -- 'mobile' | 'web' | 'paper'
        [IpAddress]         NVARCHAR(45) NULL,
        [CreateDate]        DATETIME NULL,
        [CreateUserId]      INT NULL
    );
    PRINT 'created PatientConsent';
END
ELSE PRINT 'PatientConsent already exists';
GO

-- "What is this person's current state for this purpose" = TOP 1 ordered by
-- GrantedDate DESC. This index is that query.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PatientConsent_PatRegNo')
BEGIN
    CREATE INDEX IX_PatientConsent_PatRegNo
        ON [PatientConsent] ([PatRegNo], [PurposeCode], [GrantedDate] DESC);
    PRINT 'added IX_PatientConsent_PatRegNo';
END
ELSE PRINT 'IX_PatientConsent_PatRegNo already exists';
GO

SELECT 'ConsentDocument' AS Obj, COUNT(*) AS Cols FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='ConsentDocument'
UNION ALL
SELECT 'PatientConsent', COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='PatientConsent';
GO
