-- =============================================================================
-- LoginAttempt - persistence for the lockout that already works
--
-- Tracker row 20: notify after three failed passwords. helper/LoginGuard.js
-- already does that, counting in memory, and the acceptance criterion is
-- satisfied without this script. What this buys is the two things memory
-- cannot: the counter surviving a restart, and a forensic record of who tried
-- what from where.
--
-- NO PASSWORD IS EVER STORED HERE, in any form - not the submitted value, not a
-- hash of it, not its length. The row records that an attempt happened.
--
-- FailReason IS RECORDED AND NEVER RETURNED. The API answer stays the single
-- opaque "Login name or password is incorrect" whether the account is unknown
-- or the password was wrong; this column is for whoever investigates later, not
-- for the caller. LoginGuard also checks the lockout BEFORE the user lookup, so
-- the two cases cannot be told apart by timing either.
--
-- LOCKOUT IS A WINDOW, NEVER PERMANENT. LockedUntil is a timestamp. A permanent
-- lock on a username an attacker can guess is a denial-of-service against the
-- real doctor, on a system used for clinical work.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LoginAttempt')
BEGIN
    CREATE TABLE [LoginAttempt] (
        [Id]          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserType]    NVARCHAR(10)  NULL,   -- 'staff' | 'patient'
        [UserName]    NVARCHAR(100) NULL,
        [UserId]      INT           NULL,
        [AttemptDate] DATETIME      NULL,
        [Success]     BIT           NULL,
        -- NO_USER | BAD_PASSWORD | NO_ROLE | LOCKED | NO_LICENSE
        [FailReason]  NVARCHAR(50)  NULL,
        [IpAddress]   NVARCHAR(45)  NULL,   -- 45 = IPv6 with an IPv4 tail
        [UserAgent]   NVARCHAR(255) NULL
    );
    PRINT 'created LoginAttempt';
END
ELSE PRINT 'LoginAttempt already exists';
GO

-- The lookup LoginGuard makes on every login: recent attempts for one name.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LoginAttempt_Lookup')
BEGIN
    CREATE INDEX IX_LoginAttempt_Lookup
        ON [LoginAttempt] ([UserType], [UserName], [AttemptDate] DESC);
    PRINT 'added IX_LoginAttempt_Lookup';
END
ELSE PRINT 'IX_LoginAttempt_Lookup already exists';
GO

/*
 * Lock state on the accounts themselves.
 *
 * FailedLoginCount gets a DEFAULT so existing rows land at 0 rather than NULL -
 * NULL would make "have they failed recently" a three-way question in every
 * comparison that touches it.
 *
 * LockNotifiedDate is what stops the notification firing once per failure past
 * the threshold. A doctor mistyping ten times should get one email, not seven.
 */
IF COL_LENGTH('dbo.Users', 'FailedLoginCount') IS NULL
BEGIN
    ALTER TABLE dbo.Users
        ADD [FailedLoginCount] INT NOT NULL CONSTRAINT DF_Users_FailedLoginCount DEFAULT(0),
            [LastFailedLogin]  DATETIME NULL,
            [LockedUntil]      DATETIME NULL,
            [LockNotifiedDate] DATETIME NULL;
    PRINT 'added lockout columns to Users';
END
ELSE PRINT 'Users lockout columns already exist';
GO

IF COL_LENGTH('dbo.PatientUsers', 'FailedLoginCount') IS NULL
BEGIN
    ALTER TABLE dbo.PatientUsers
        ADD [FailedLoginCount] INT NOT NULL CONSTRAINT DF_PatientUsers_FailedLoginCount DEFAULT(0),
            [LastFailedLogin]  DATETIME NULL,
            [LockedUntil]      DATETIME NULL,
            [LockNotifiedDate] DATETIME NULL;
    PRINT 'added lockout columns to PatientUsers';
END
ELSE PRINT 'PatientUsers lockout columns already exist';
GO

SELECT 'LoginAttempt' AS Obj, COUNT(*) AS Cols FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='LoginAttempt'
UNION ALL
SELECT 'Users.lockout', COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Users' AND COLUMN_NAME LIKE '%Lock%'
UNION ALL
SELECT 'PatientUsers.lockout', COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='PatientUsers' AND COLUMN_NAME LIKE '%Lock%';
GO
