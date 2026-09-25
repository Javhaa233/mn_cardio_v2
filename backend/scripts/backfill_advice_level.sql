-- Backfill Advice.level (and the geography columns that go with it) for
-- historical tickets that were saved without them.
--
-- WHY THIS MATTERS
-- Every visibility rule for a ticket filters on level IN ('1','2','3') -
-- GetListCity, GetListSoum and the newer GetFeed all do. A row with a NULL
-- level is therefore invisible to every non-admin user, permanently. On the
-- database this was written against, 2,216 of 5,497 tickets (40%) were in that
-- state, so a doctor browsing the ticket feed was silently seeing 60% of it.
--
-- WHERE THE VALUE COMES FROM
-- Advice.id is the author's UserId. DoctorsProfile.id is also that UserId
-- (not the profile PK - see DoctorsProfile.id vs id_data). From the profile we
-- reach Organization, which carries level and the three address columns. This
-- is exactly what AdviceController stamps onto a NEW ticket at creation time,
-- so the backfill reproduces what the create path would have written.
--
-- KNOWN LIMITATION - please read before running on production.
-- This derives from the author's CURRENT organization, which is a proxy for
-- their organization at the time of posting. Measured on 3,281 rows that
-- already have a level and can be checked, 3,163 agree with the author's
-- current org and 118 (3.6%) disagree - doctors who moved employer since. So
-- expect a small number of backfilled rows to receive a level that differs
-- from historical truth. That is why this script ONLY fills NULLs and never
-- overwrites an existing value: the rows we can verify are left exactly as
-- they are.
--
-- Rows with no author, no organization, or an organization with no level
-- cannot be resolved and are left NULL. There were 21 of those.
--
-- HOW TO RUN
--   1. Take a backup.
--   2. Run STEP 1 and read the numbers. Nothing is written.
--   3. Run STEP 2 inside the transaction, read the row counts, then COMMIT
--      (or ROLLBACK, which is the default state of this file).
--   4. Run STEP 3 to confirm.
--   5. STEP 4 is the rollback, and only works in the same session because it
--      relies on the backup table created in STEP 2.

-- Refuse any database other than the three this project uses (runbook Stage 2.2).
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

SET NOCOUNT ON;
GO

-- ===========================================================================
-- STEP 1 - dry run. Read-only. Shows exactly what STEP 2 would change.
-- ===========================================================================
PRINT '--- STEP 1: dry run ---';

SELECT COUNT(*) AS rows_with_null_level
FROM [Advice]
WHERE [level] IS NULL;

SELECT COUNT(*) AS resolvable
FROM [Advice] a
JOIN [DoctorsProfile] d ON d.[id] = a.[id]
JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
WHERE a.[level] IS NULL AND o.[level] IS NOT NULL;

SELECT o.[level] AS would_become_level, COUNT(*) AS rows
FROM [Advice] a
JOIN [DoctorsProfile] d ON d.[id] = a.[id]
JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
WHERE a.[level] IS NULL AND o.[level] IS NOT NULL
GROUP BY o.[level];

SELECT COUNT(*) AS unresolvable_left_as_null
FROM [Advice] a
WHERE a.[level] IS NULL
  AND NOT EXISTS (
        SELECT 1 FROM [DoctorsProfile] d
        JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
        WHERE d.[id] = a.[id] AND o.[level] IS NOT NULL);
GO

-- ===========================================================================
-- STEP 2 - the backfill, inside an explicit transaction.
-- ===========================================================================
BEGIN TRANSACTION;

-- Snapshot every row we are about to touch, so STEP 4 can put it back.
IF OBJECT_ID('tempdb..#AdviceLevelBackup') IS NOT NULL
    DROP TABLE #AdviceLevelBackup;

SELECT a.[id_data], a.[level], a.[addr_prov_city], a.[addr_soum_dist], a.[addr_bag_khoroo]
INTO #AdviceLevelBackup
FROM [Advice] a
WHERE a.[level] IS NULL;

PRINT '--- STEP 2: rows snapshotted ---';
SELECT COUNT(*) AS snapshotted FROM #AdviceLevelBackup;

-- The level itself.
UPDATE a
   SET a.[level] = o.[level]
FROM [Advice] a
JOIN [DoctorsProfile] d ON d.[id] = a.[id]
JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
WHERE a.[level] IS NULL
  AND o.[level] IS NOT NULL;

PRINT 'level rows updated:';
SELECT @@ROWCOUNT AS level_rows_updated;

-- The geography. Same source, and the same NULL-only rule: a ticket that
-- already carries a province keeps it. These columns matter because the
-- level-1 and level-2 visibility rules match on them - a ticket with a level
-- but no province is still invisible to the doctors who should see it.
UPDATE a
   SET a.[addr_prov_city] = o.[addr_prov_city]
FROM [Advice] a
JOIN [DoctorsProfile] d ON d.[id] = a.[id]
JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
WHERE a.[addr_prov_city] IS NULL
  AND o.[addr_prov_city] IS NOT NULL;

PRINT 'addr_prov_city rows updated:';
SELECT @@ROWCOUNT AS prov_rows_updated;

UPDATE a
   SET a.[addr_soum_dist] = o.[addr_soum_dist]
FROM [Advice] a
JOIN [DoctorsProfile] d ON d.[id] = a.[id]
JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
WHERE a.[addr_soum_dist] IS NULL
  AND o.[addr_soum_dist] IS NOT NULL;

PRINT 'addr_soum_dist rows updated:';
SELECT @@ROWCOUNT AS soum_rows_updated;

UPDATE a
   SET a.[addr_bag_khoroo] = o.[addr_bag_khoroo]
FROM [Advice] a
JOIN [DoctorsProfile] d ON d.[id] = a.[id]
JOIN [Organization] o ON o.[Id] = d.[OrganizationId]
WHERE a.[addr_bag_khoroo] IS NULL
  AND o.[addr_bag_khoroo] IS NOT NULL;

PRINT 'addr_bag_khoroo rows updated:';
SELECT @@ROWCOUNT AS bag_rows_updated;

-- Read the numbers above, then choose one:
--   COMMIT TRANSACTION;
--   ROLLBACK TRANSACTION;
ROLLBACK TRANSACTION;
GO

-- ===========================================================================
-- STEP 3 - verification. Run after COMMIT.
-- ===========================================================================
-- PRINT '--- STEP 3: after ---';
-- SELECT [level], COUNT(*) AS rows FROM [Advice] GROUP BY [level];
-- SELECT COUNT(*) AS still_null FROM [Advice] WHERE [level] IS NULL;

-- ===========================================================================
-- STEP 4 - rollback after COMMIT. Same session only: #AdviceLevelBackup is a
-- temp table and disappears when the connection closes. If you need to undo
-- this later than that, restore from the backup taken in the HOW TO RUN step.
-- ===========================================================================
-- UPDATE a
--    SET a.[level]           = b.[level],
--        a.[addr_prov_city]  = b.[addr_prov_city],
--        a.[addr_soum_dist]  = b.[addr_soum_dist],
--        a.[addr_bag_khoroo] = b.[addr_bag_khoroo]
-- FROM [Advice] a
-- JOIN #AdviceLevelBackup b ON b.[id_data] = a.[id_data];
