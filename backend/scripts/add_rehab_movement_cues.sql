-- Rehabilitation content authoring: sets, warnings and timed messages.
--
-- Builds on add_rehab_program_tables.sql, which must already have run. The web
-- page /admin/RehabContent was rebuilt on 2026-09-24 so the rehab doctors can
-- write, per movement:
--
--   Sets / SetRestSec  "3 x 10 удаа, сет хооронд 30 сек амрах"
--   WarningText        a caution shown on the movement's preview screen
--   Cues               messages the player shows at the start of the movement
--                      and part-way through it (JSON, see below)
--
-- and, per exercise, a WarningText shown once before its first movement.
--
-- Cues is a JSON array, checked by helper/RehabCues.js on every save:
--   [{ "AtSec": 0,    "AtSet": null, "Text": "..." }]   start of the movement
--   [{ "AtSec": 15,   "AtSet": null, "Text": "..." }]   15 s into the work
--   [{ "AtSec": null, "AtSet": 2,    "Text": "..." }]   when set 2 begins
--
-- No clinical text is seeded: the wording is the rehab doctors' to write.
--
-- Safe to re-run. Run with: node scripts/run_sql.js --db <database> <this file>

IF COL_LENGTH('RehabMovement', 'Sets') IS NULL
    ALTER TABLE [RehabMovement] ADD [Sets] INT NULL;           -- NULL = one set
GO
IF COL_LENGTH('RehabMovement', 'SetRestSec') IS NULL
    ALTER TABLE [RehabMovement] ADD [SetRestSec] INT NULL;     -- rest between sets
GO
IF COL_LENGTH('RehabMovement', 'WarningText') IS NULL
    ALTER TABLE [RehabMovement] ADD [WarningText] NVARCHAR(MAX) NULL;
GO
IF COL_LENGTH('RehabMovement', 'Cues') IS NULL
    ALTER TABLE [RehabMovement] ADD [Cues] NVARCHAR(MAX) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_RehabMovement_Cues')
    ALTER TABLE [RehabMovement]
        ADD CONSTRAINT [CK_RehabMovement_Cues] CHECK ([Cues] IS NULL OR ISJSON([Cues]) = 1);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_RehabMovement_Sets')
    ALTER TABLE [RehabMovement]
        ADD CONSTRAINT [CK_RehabMovement_Sets] CHECK ([Sets] IS NULL OR [Sets] BETWEEN 1 AND 20);
GO

IF COL_LENGTH('RehabExercise', 'WarningText') IS NULL
    ALTER TABLE [RehabExercise] ADD [WarningText] NVARCHAR(MAX) NULL;
GO
