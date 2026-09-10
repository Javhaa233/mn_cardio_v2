-- ---------------------------------------------------------------------------
-- AtrialRhythmNew: add the six columns the model declares but the table lacks.
--
-- model/Rhythm/AtrialRhythmNew.js declares 163 columns. Six of them have
-- never existed in the database, so EVERY select against the model fails:
--
--   Invalid column name 'shinj_daraa_date'.
--   Invalid column name 'z_s_umnuh_harvalt_suuliin_tohioldol'.
--   Invalid column name 'z_s_3havtast_emgeg_odoo'.
--   ... and three more that SQL Server only reports once the first are fixed,
--   because it returns invalid-column errors a few at a time. The full set was
--   found by diffing the model's rawAttributes against sys.columns.
--
-- The effect is that /api/AtrialRhythmNew/GetList — the list behind tender form
-- 2.2, the largest form in the upgrade tender — returns "An error occurred" for
-- every caller. Found by the acceptance harness on 2026-09-10.
--
-- This is the "no migrations" hazard in CLAUDE.md §2 showing up in practice:
-- the model was extended for form 2.2 and the matching DDL was never written,
-- so the mismatch stayed invisible until something actually queried the table.
--
-- Types follow the model's own declarations and the convention of the columns
-- immediately beside them (all nvarchar; shinj_daraa_date is declared DATE).
--
-- Idempotent. Safe to re-run.
-- ---------------------------------------------------------------------------
SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew') AND name = 'shinj_daraa_date')
BEGIN
    ALTER TABLE dbo.AtrialRhythmNew ADD shinj_daraa_date date NULL;
    PRINT 'added AtrialRhythmNew.shinj_daraa_date';
END
ELSE PRINT 'AtrialRhythmNew.shinj_daraa_date already present';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew') AND name = 'z_s_umnuh_harvalt_suuliin_tohioldol')
BEGIN
    ALTER TABLE dbo.AtrialRhythmNew ADD z_s_umnuh_harvalt_suuliin_tohioldol nvarchar(255) NULL;
    PRINT 'added AtrialRhythmNew.z_s_umnuh_harvalt_suuliin_tohioldol';
END
ELSE PRINT 'AtrialRhythmNew.z_s_umnuh_harvalt_suuliin_tohioldol already present';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew') AND name = 'z_s_3havtast_emgeg_odoo')
BEGIN
    ALTER TABLE dbo.AtrialRhythmNew ADD z_s_3havtast_emgeg_odoo nvarchar(255) NULL;
    PRINT 'added AtrialRhythmNew.z_s_3havtast_emgeg_odoo';
END
ELSE PRINT 'AtrialRhythmNew.z_s_3havtast_emgeg_odoo already present';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew') AND name = 'z_s_3havtast_emgeg_regur')
BEGIN
    ALTER TABLE dbo.AtrialRhythmNew ADD z_s_3havtast_emgeg_regur nvarchar(255) NULL;
    PRINT 'added AtrialRhythmNew.z_s_3havtast_emgeg_regur';
END
ELSE PRINT 'AtrialRhythmNew.z_s_3havtast_emgeg_regur already present';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew') AND name = 'z_s_turulh_emgeg_yes')
BEGIN
    ALTER TABLE dbo.AtrialRhythmNew ADD z_s_turulh_emgeg_yes nvarchar(255) NULL;
    PRINT 'added AtrialRhythmNew.z_s_turulh_emgeg_yes';
END
ELSE PRINT 'AtrialRhythmNew.z_s_turulh_emgeg_yes already present';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew') AND name = 'z_s_turulh_emgeg_yes_other')
BEGIN
    ALTER TABLE dbo.AtrialRhythmNew ADD z_s_turulh_emgeg_yes_other nvarchar(255) NULL;
    PRINT 'added AtrialRhythmNew.z_s_turulh_emgeg_yes_other';
END
ELSE PRINT 'AtrialRhythmNew.z_s_turulh_emgeg_yes_other already present';
GO

-- Confirm the model and the table now agree.
SELECT name, TYPE_NAME(user_type_id) AS type, max_length, is_nullable
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.AtrialRhythmNew')
  AND name IN ('shinj_daraa_date', 'z_s_umnuh_harvalt_suuliin_tohioldol', 'z_s_3havtast_emgeg_odoo',
               'z_s_3havtast_emgeg_regur', 'z_s_turulh_emgeg_yes', 'z_s_turulh_emgeg_yes_other')
ORDER BY name;
GO
