-- =============================================================================
-- Patient.ConfidentialityLevel + ConfidentialityGrant - tracker rows 21 and 22
--
-- The tender requires classified data to be hidden from unauthorised users.
--
-- THIS SCRIPT DELIBERATELY DOES NOT MAKE THAT WORK, AND SHOULD NOT.
-- The access-rights matrix does not exist (BLOCKERS item 8), and without it
-- there is no specification to implement against. Five things are unknown, and
-- every one of them changes CODE rather than configuration:
--
--   which levels exist, and their codes - so the dico cannot be seeded;
--   which RoleId may see which level - so enforcement is a switch with no cases;
--   whether hiding means the ROW IS ABSENT or the row is present with fields
--     masked - different queries, different response shapes, different frontend;
--   whether a hidden row still counts in aggregates - if totals change by role,
--     the existence of a confidential record leaks through a count;
--   who may break glass, for how long, and whether it is self-service.
--
-- So this adds the column and the break-glass table, and
-- helper/Confidentiality.js runs in 'warn' mode: it logs every row that WOULD
-- have been hidden and hides nothing. That is not a placeholder - it is how the
-- impact assessment gets produced. When ЗСҮТ ask "how much data would this
-- affect", the answer comes from that log rather than from a guess.
--
-- ConfidentialityGrant is break-glass: named access, time-boxed, audited. A
-- clinician in an emergency must be able to open a classified record, and the
-- system must record that they did. A design with no such path gets worked
-- around by sharing logins, which is worse than the problem.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.Patient', 'ConfidentialityLevel') IS NULL
BEGIN
    ALTER TABLE dbo.Patient
        ADD [ConfidentialityLevel]     NVARCHAR(20)  NULL,  -- dico, unseeded
            [ConfidentialitySetDate]   DATETIME      NULL,
            [ConfidentialitySetUserId] INT           NULL,
            [ConfidentialityReason]    NVARCHAR(255) NULL;
    PRINT 'added confidentiality columns to Patient';
END
ELSE PRINT 'Patient confidentiality columns already exist';
GO

-- Filtered: almost every patient is unclassified and should not pay for this.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Patient_Confidentiality')
BEGIN
    CREATE INDEX IX_Patient_Confidentiality
        ON dbo.Patient ([ConfidentialityLevel])
        WHERE [ConfidentialityLevel] IS NOT NULL;
    PRINT 'added IX_Patient_Confidentiality';
END
ELSE PRINT 'IX_Patient_Confidentiality already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ConfidentialityGrant')
BEGIN
    CREATE TABLE [ConfidentialityGrant] (
        [Id]              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatientId]       INT NULL,
        [UserId]          INT NULL,
        [GrantedByUserId] INT NULL,
        [GrantedDate]     DATETIME NULL,
        -- Time-boxed on purpose: a grant with no expiry is a permission, and
        -- break-glass that never closes is just a slower way of declassifying.
        [ExpireDate]      DATETIME NULL,
        [Reason]          NVARCHAR(255) NULL,
        [RevokedDate]     DATETIME NULL
    );
    PRINT 'created ConfidentialityGrant';
END
ELSE PRINT 'ConfidentialityGrant already exists';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ConfidentialityGrant_Lookup')
BEGIN
    CREATE INDEX IX_ConfidentialityGrant_Lookup
        ON [ConfidentialityGrant] ([PatientId], [UserId], [ExpireDate]);
    PRINT 'added IX_ConfidentialityGrant_Lookup';
END
ELSE PRINT 'IX_ConfidentialityGrant_Lookup already exists';
GO

-- For the customer conversation: nothing is classified yet, and cannot be until
-- the matrix names the levels.
SELECT COUNT(*) AS TotalPatients,
       SUM(CASE WHEN ConfidentialityLevel IS NOT NULL THEN 1 ELSE 0 END) AS Classified
  FROM dbo.Patient;
GO
