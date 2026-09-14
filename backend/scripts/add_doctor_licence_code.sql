-- =============================================================================
-- DoctorsProfile licence columns - tracker row 13
--
-- The tender's acceptance criterion is "Зөвшөөрлийн кодгүй эмч нэвтрэхгүй" - a
-- doctor with no professional practice licence code cannot log in. The tracker
-- records that row as Дууссан, 100%. There is no licence column on
-- DoctorsProfile and no such check anywhere in the login path, so as recorded
-- it will fail UAT. READINESS §6 raises it; this is the schema half.
--
-- THE UNIQUE INDEX IS COMMENTED OUT ON PURPOSE. A practice licence ought to be
-- one per person, but ЗСҮТ have not confirmed that, and the verification query
-- at the end of this script exists precisely to find out whether the data
-- agrees. Enabling a unique index before knowing would fail the whole ALTER on
-- the first duplicate and tell you nothing useful about why.
--
-- LicenseSource records where the code came from - 'admin' for one typed in by
-- an administrator, 'emkht' for one fetched from the national registry. That
-- choice is an open customer question (BLOCKERS item 4). Recording it now means
-- a later ЭМХТ sync writes a different value into the same column instead of
-- needing another migration.
--
-- THE QUERY AT THE BOTTOM IS A CUSTOMER DELIVERABLE, not a sanity check. The
-- second half of blocker item 4 is "does an existing doctor without a code lose
-- access on the day this is enforced". That is not a question to answer with an
-- opinion. Run it, send ЗСҮТ the number per hospital, and let them decide.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.DoctorsProfile', 'LicenseCode') IS NULL
BEGIN
    ALTER TABLE dbo.DoctorsProfile
        ADD [LicenseCode]           NVARCHAR(50) NULL,
            [LicenseIssuedDate]     DATETIME     NULL,
            [LicenseExpireDate]     DATETIME     NULL,
            [LicenseVerifiedDate]   DATETIME     NULL,
            [LicenseVerifiedUserId] INT          NULL,
            [LicenseSource]         NVARCHAR(20) NULL;  -- 'admin' | 'emkht'
    PRINT 'added licence columns to DoctorsProfile';
END
ELSE PRINT 'DoctorsProfile licence columns already exist';
GO

-- Non-unique for now: lookups need it either way, and it can be rebuilt as
-- UNIQUE once the customer confirms one code per person AND the query below
-- shows no duplicates.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DoctorsProfile_LicenseCode')
BEGIN
    CREATE INDEX IX_DoctorsProfile_LicenseCode
        ON dbo.DoctorsProfile ([LicenseCode]) WHERE [LicenseCode] IS NOT NULL;
    PRINT 'added IX_DoctorsProfile_LicenseCode';
END
ELSE PRINT 'IX_DoctorsProfile_LicenseCode already exists';
GO

-- Enable only after ЗСҮТ confirm the code is per-person and unique, and after
-- the duplicate count below is zero:
-- CREATE UNIQUE INDEX UX_DoctorsProfile_LicenseCode
--     ON dbo.DoctorsProfile ([LicenseCode]) WHERE [LicenseCode] IS NOT NULL;

-- ---------------------------------------------------------------------------
-- FOR THE CUSTOMER: who would lose access on the day this is enforced.
-- ---------------------------------------------------------------------------
SELECT ISNULL(o.Name, N'(байгууллага тодорхойгүй)') AS Organization,
       COUNT(*)                                      AS Doctors,
       SUM(CASE WHEN d.LicenseCode IS NULL OR LTRIM(RTRIM(d.LicenseCode)) = ''
                THEN 1 ELSE 0 END)                   AS WouldBeLockedOut
  FROM dbo.DoctorsProfile d
  LEFT JOIN dbo.Organization o ON o.Id = d.OrganizationId
 WHERE ISNULL(d.rec_status, 0) <> 2
 GROUP BY o.Name
 ORDER BY WouldBeLockedOut DESC;

-- Would a unique index succeed today?
SELECT COUNT(*) AS DuplicateLicenceCodes
  FROM (
    SELECT LicenseCode
      FROM dbo.DoctorsProfile
     WHERE LicenseCode IS NOT NULL AND LTRIM(RTRIM(LicenseCode)) <> ''
     GROUP BY LicenseCode
    HAVING COUNT(*) > 1
  ) x;
GO
