-- =============================================================================
-- UserSession - make logout actually log out
--
-- READINESS §2.2 records this as the open half of token refresh: there is no
-- token store, so cancelling one session means rotating JWT_PASS and logging
-- EVERYONE out, and controllers/auth/UserController.LogOut is a stub that
-- returns success without doing anything. A stolen phone cannot currently be
-- cut off.
--
-- A DENYLIST, NOT A SESSION TABLE. helper/SessionStore.js holds the revoked-
-- and-not-yet-expired jti values in memory and refreshes them every 30 seconds;
-- verifyToken checks a Set. That is deliberate: the alternative - a database
-- read per request - would put a query in front of all 47 legacy prefixes plus
-- every mobile route, to answer "no" almost every time. The set only ever
-- contains tokens that were revoked AND have not yet expired, so it is tiny.
-- The cost is that a revoked token can survive up to 30 seconds.
--
-- TOKENS ALREADY IN THE WILD HAVE NO jti. helper/Auth.js has never put one in
-- the payload, and an access token lives ten hours. Treating "no jti" as
-- invalid would log out every active session the moment this deploys - which is
-- precisely the outage this feature exists to avoid. TOKEN_REVOCATION_ALLOW_LEGACY
-- defaults to true for that reason; flip it to false eleven hours after the
-- deploy, once nothing without a jti can still be valid.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserSession')
BEGIN
    CREATE TABLE [UserSession] (
        [Id]            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserType]      NVARCHAR(10) NULL,   -- 'staff' | 'patient'
        [UserId]        INT NULL,
        [Jti]           NVARCHAR(64) NULL,   -- access-token id
        [RefreshJti]    NVARCHAR(64) NULL,
        [IssuedDate]    DATETIME NULL,
        [ExpireDate]    DATETIME NULL,
        [LastSeenDate]  DATETIME NULL,
        [RevokedDate]   DATETIME NULL,
        -- logout | logout-all | admin | rotate
        [RevokedReason] NVARCHAR(50) NULL,
        [DeviceName]    NVARCHAR(100) NULL,
        [IpAddress]     NVARCHAR(45) NULL
    );
    PRINT 'created UserSession';
END
ELSE PRINT 'UserSession already exists';
GO

-- Filtered unique: one row per issued access token. Filtered because a row
-- whose Jti is NULL is not a duplicate of another, and SQL Server would
-- otherwise treat every NULL as equal under a plain UNIQUE index.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_UserSession_Jti')
BEGIN
    CREATE UNIQUE INDEX UX_UserSession_Jti ON [UserSession] ([Jti]) WHERE [Jti] IS NOT NULL;
    PRINT 'added UX_UserSession_Jti';
END
ELSE PRINT 'UX_UserSession_Jti already exists';
GO

-- "My sessions", and the periodic denylist refresh.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSession_User')
BEGIN
    CREATE INDEX IX_UserSession_User ON [UserSession] ([UserType], [UserId], [RevokedDate]);
    PRINT 'added IX_UserSession_User';
END
ELSE PRINT 'IX_UserSession_User already exists';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSession_Revoked')
BEGIN
    CREATE INDEX IX_UserSession_Revoked ON [UserSession] ([RevokedDate], [ExpireDate])
        WHERE [RevokedDate] IS NOT NULL;
    PRINT 'added IX_UserSession_Revoked';
END
ELSE PRINT 'IX_UserSession_Revoked already exists';
GO

SELECT COUNT(*) AS UserSessionColumns FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='UserSession';
GO
