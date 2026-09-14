-- =============================================================================
-- RehabExercise - 39 PLACEHOLDER rows for mobile tender 2.7
--
-- DRAFTED BY ITSYSTEM. THE CONTENT IS NOT REAL AND IS NOT APPROVED.
--
-- WHY PLACEHOLDERS RATHER THAN REAL EXERCISES. The tender commits to 39 short
-- exercise instruction videos, to be filmed with ЗСҮТ's rehabilitation
-- physicians. Filming has not started, the hosting decision is open
-- (mobile/BLOCKERS.md items 9 and 10), and the exercise names, categories and
-- durations are clinical content. CLAUDE.md §9 is explicit that clinical
-- wording is not ours to invent - so nothing here pretends to be a real
-- exercise. Every Name says so, in Mongolian, on the row itself.
--
-- WHAT THIS BUYS. GET /api/patient/rehab/exercises currently returns an empty
-- list, which the mobile developer cannot build a screen against: no ids, no
-- ordering, no categories to group by, and no way to exercise the "video not
-- available yet" state. These rows give all of that immediately, and they are
-- unmistakably placeholders so they cannot be shown to a patient by accident.
--
-- HOW THE REAL CONTENT ARRIVES. Not through another script. This commit also
-- registers RehabExerciseConfig in ModelConfigs/mainConfig.js, which gives
-- /api/BaseObject list, detail, create, update and Excel export over this table
-- for free - so ЗСҮТ type the real 39 in themselves, with the category dropdown
-- populated from the rehab_category dico. Replacing a placeholder is an edit to
-- a row, not a deployment.
--
-- MediaRef IS DELIBERATELY NULL. helper/MediaRef.js reads a prefix scheme -
-- 'file:', 'url:', 'asset:' - so whichever hosting option the customer picks
-- becomes an UPDATE to this column rather than a schema change or an app
-- release. NULL means "no video yet", which is the state to build against.
--
-- MnCardio_test only. Placeholder content must never reach a production or
-- restored database, so the guard is narrower than the other scripts here.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: placeholder content, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- Categories cycle through the drafted rehab_category values so the app's
-- grouping, ordering and empty-media handling are all exercised by real rows.
-- Idempotent on Code: re-running never duplicates, and never overwrites a row
-- someone has since filled in with real content.
DECLARE @i INT = 1;

WHILE @i <= 39
BEGIN
    DECLARE @Code NVARCHAR(50) = 'EX-' + RIGHT('0' + CAST(@i AS NVARCHAR(2)), 2);

    IF NOT EXISTS (SELECT 1 FROM dbo.RehabExercise WHERE Code = @Code)
    BEGIN
        INSERT INTO dbo.RehabExercise
            (Code, Name, Description, CategoryCode, DurationSec, OrderNo, MediaRef, IsActive, CreateDate)
        VALUES (
            @Code,
            N'Дасгал №' + CAST(@i AS NVARCHAR(2)) + N' — нэр батлагдаагүй',
            N'Түр зуурын мөр. Бичлэг хийгдээгүй, нэр болон ангилал эмнэлзүйн багаар батлагдаагүй.',
            CASE (@i - 1) % 6
                WHEN 0 THEN 'warmup'
                WHEN 1 THEN 'aerobic'
                WHEN 2 THEN 'strength'
                WHEN 3 THEN 'flexibility'
                WHEN 4 THEN 'breathing'
                ELSE 'cooldown'
            END,
            NULL,   -- DurationSec: unknown until the videos are filmed
            @i,
            NULL,   -- MediaRef: no video yet
            1,
            GETDATE()
        );
    END

    SET @i = @i + 1;
END
GO

SELECT COUNT(*) AS TotalRows,
       SUM(CASE WHEN MediaRef IS NULL THEN 1 ELSE 0 END) AS WithoutVideo
  FROM dbo.RehabExercise;

SELECT Code, Name, CategoryCode, OrderNo
  FROM dbo.RehabExercise
 ORDER BY OrderNo;
GO
