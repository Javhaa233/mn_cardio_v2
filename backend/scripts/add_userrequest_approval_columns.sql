-- =============================================================================
-- UserRequests approval columns - doctor self-registration
--
-- A doctor applies at /auth/register and chooses their own password there. No
-- Users row exists until an administrator (role 1) approves, so nobody can log
-- in on an unapproved request. On approval the stored hash is copied unchanged
-- into Users.Password - no password is generated, emailed or shown to anyone.
--
--   PasswordHash    bcrypt of the applicant's password. NOT declared on the
--                   Sequelize model on purpose: the admin list reads requests
--                   through /BaseObject, which returns every declared column.
--                   helper/RegistrationRequest.js is its only reader/writer.
--   OrganizationId  the applicant's hospital, picked from Organization instead
--                   of the free-text OrgName that approval used to throw away
--                   (profiles were created with OrganizationId -1).
--   DecisionDate    when the request was approved or declined.
--   DeclineReason   shown to the applicant, by email and at login.
--
-- Additive and idempotent. Status stays in IsActive: '0' pending, '1' approved,
-- '2' declined. Requests filed before this have PasswordHash NULL; approving one
-- creates the account without a password and emails a set-password link.
--
-- Run: node scripts/run_sql.js --db <database> scripts/add_userrequest_approval_columns.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.UserRequests', 'PasswordHash') IS NULL
BEGIN
    ALTER TABLE dbo.UserRequests ADD [PasswordHash] NVARCHAR(100) NULL;
    PRINT 'added UserRequests.PasswordHash';
END
ELSE PRINT 'UserRequests.PasswordHash already exists';
GO

IF COL_LENGTH('dbo.UserRequests', 'OrganizationId') IS NULL
BEGIN
    ALTER TABLE dbo.UserRequests ADD [OrganizationId] INT NULL;
    PRINT 'added UserRequests.OrganizationId';
END
ELSE PRINT 'UserRequests.OrganizationId already exists';
GO

IF COL_LENGTH('dbo.UserRequests', 'DecisionDate') IS NULL
BEGIN
    ALTER TABLE dbo.UserRequests ADD [DecisionDate] DATETIME NULL;
    PRINT 'added UserRequests.DecisionDate';
END
ELSE PRINT 'UserRequests.DecisionDate already exists';
GO

IF COL_LENGTH('dbo.UserRequests', 'DeclineReason') IS NULL
BEGIN
    ALTER TABLE dbo.UserRequests ADD [DeclineReason] NVARCHAR(500) NULL;
    PRINT 'added UserRequests.DeclineReason';
END
ELSE PRINT 'UserRequests.DeclineReason already exists';
GO

-- Where the queue stands.
-- IsActive is a TINYINT in the table (the model calls it STRING).
SELECT ISNULL(CAST(IsActive AS NVARCHAR(10)), '(null)') AS IsActive, COUNT(*) AS Requests
  FROM dbo.UserRequests
 GROUP BY IsActive;
GO
