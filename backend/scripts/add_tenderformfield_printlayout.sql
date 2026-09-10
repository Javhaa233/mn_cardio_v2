-- =============================================================================
-- TenderFormField.PrintLayout - optional per-section print layout override
--
-- reports/TenderForm.js infers a section's printed shape from the dictionary:
-- a run of RadioBox fields whose option sets are nested (f12_yn inside
-- f12_yn3, say) becomes a tick matrix; four or more Seg* fields become the
-- coronary segment grid; a Table field becomes its own grid; everything else
-- becomes label/value rows.
--
-- That inference is right for every form seeded so far. This column exists for
-- the case where it is not - set it on ANY field of a section to force that
-- whole section's layout.
--
--   'checklist'  force the tick matrix
--   'pairs'      force plain label/value rows
--   NULL         infer (the default, and what all 1,687 existing rows do)
--
-- NOTHING REQUIRES THIS COLUMN. The renderer treats it as absent when it does
-- not exist, so print works before this script is ever run. Apply it only when
-- a clinical reviewer says a section prints in the wrong shape.
--
-- Idempotent. Safe to re-run.
-- =============================================================================
SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.TenderFormField', 'PrintLayout') IS NULL
BEGIN
    ALTER TABLE dbo.TenderFormField ADD PrintLayout varchar(20) NULL;
    PRINT 'added TenderFormField.PrintLayout';
END
ELSE PRINT 'TenderFormField.PrintLayout already exists';
GO

SET NOEXEC OFF;
GO

SELECT PrintLayout, COUNT(*) AS Fields
FROM dbo.TenderFormField
GROUP BY PrintLayout;
GO
