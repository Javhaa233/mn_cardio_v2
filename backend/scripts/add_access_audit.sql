-- =============================================================================
-- UserActionHistory - forensic columns, and the index the patient's access log
-- cannot exist without
--
-- Tracker row 24 has two halves. The WRITE half already works:
-- helper/AccessAudit.js records who read whose record, and
-- BaseControllerHelper.CreateUserActionHistory now writes PatientId - the
-- column and the Patient association had always been declared, but nothing ever
-- populated them, so every historical row names an action with no subject.
--
-- This script adds what a row needs to be evidence rather than a note, and the
-- index that makes GET /api/patient/access-log affordable.
--
-- THE INDEX IS NOT OPTIONAL, IT IS THE FEATURE. UserActionHistory is already a
-- large table. Without IX_UserActionHistory_PatientId, a patient opening their
-- access log scans all of it, on a phone launch, potentially concurrently for
-- many patients. FEATURE_ACCESS_LOG_API stays false until this has run - the
-- endpoint refuses rather than quietly taking the server down.
--
-- NotifyState EXISTS BUT NOTHING DELIVERS YET. What "notify the patient when
-- their record is accessed" means is still a customer question with three
-- readings whose volumes differ by orders of magnitude (BLOCKERS item 15), so
-- ACCESS_NOTIFY_POLICY defaults to none and rows are marked 'none'. When the
-- answer arrives it changes a setting, not a schema.
--
-- HISTORICAL ROWS ARE LEFT ALONE. They have no PatientId and cannot be given
-- one - the information was never captured. The access log therefore starts
-- from the day this deploys, and saying so is more honest than backfilling a
-- guess.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- How big is it? Printed before the index is built, because that is what
-- decides whether this runs inside a maintenance window on production.
SELECT COUNT(*) AS ExistingRows,
       SUM(CASE WHEN PatientId IS NULL THEN 1 ELSE 0 END) AS WithoutPatient
  FROM dbo.UserActionHistory;
GO

IF COL_LENGTH('dbo.UserActionHistory', 'IpAddress') IS NULL
BEGIN
    ALTER TABLE dbo.UserActionHistory
        ADD [PatRegNo]    NVARCHAR(20)  NULL,
            [IpAddress]   NVARCHAR(45)  NULL,
            [Route]       NVARCHAR(200) NULL,
            [Channel]     NVARCHAR(20)  NULL,   -- 'web' | 'mobile'
            [RowCountNum] INT           NULL,   -- for Export rows
            [NotifyState] NVARCHAR(20)  NULL,   -- pending | sent | skipped | none
            [NotifyDate]  DATETIME      NULL;
    PRINT 'added forensic columns to UserActionHistory';
END
ELSE PRINT 'UserActionHistory forensic columns already exist';
GO

-- RowCountNum, not RowCount: ROWCOUNT is a reserved word in T-SQL and a column
-- of that name has to be bracketed in every query that touches it forever.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserActionHistory_PatientId')
BEGIN
    CREATE INDEX IX_UserActionHistory_PatientId
        ON dbo.UserActionHistory ([PatientId], [LogDate] DESC)
        WHERE [PatientId] IS NOT NULL;
    PRINT 'added IX_UserActionHistory_PatientId - GET /api/patient/access-log needs this';
END
ELSE PRINT 'IX_UserActionHistory_PatientId already exists';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserActionHistory_Notify')
BEGIN
    CREATE INDEX IX_UserActionHistory_Notify
        ON dbo.UserActionHistory ([NotifyState], [LogDate])
        WHERE [NotifyState] = 'pending';
    PRINT 'added IX_UserActionHistory_Notify';
END
ELSE PRINT 'IX_UserActionHistory_Notify already exists';
GO

SELECT COLUMN_NAME, DATA_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME = 'UserActionHistory'
 ORDER BY ORDINAL_POSITION;
GO
