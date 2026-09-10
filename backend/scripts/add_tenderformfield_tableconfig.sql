-- =============================================================================
-- TenderFormField.TableConfig
--
-- Form 2.1 (EP / ablation protocol) is not a flat list of questions. It has
-- repeating sub-tables: an ACT time/value log, a 4-vein x 5-attempt pulmonary
-- vein isolation grid, and an 8-dose list. A field of FieldType 'Table' holds
-- its column definition here as JSON, and its value in TenderFormData.Data is
-- a JSON array of row objects - so no schema change is needed to store it.
--
-- Shape: [{ "code": "...", "label": "...", "type": "Text|Number|Date" }, ...]
--
-- Idempotent.
-- =============================================================================
SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.TenderFormField', 'TableConfig') IS NULL
BEGIN
    ALTER TABLE dbo.TenderFormField ADD TableConfig nvarchar(max) NULL;
    PRINT 'added TenderFormField.TableConfig';
END
ELSE PRINT 'TenderFormField.TableConfig already exists';
GO

-- rows count as a fixed set for grids like the vein table, or free for logs
IF COL_LENGTH('dbo.TenderFormField', 'TableRows') IS NULL
BEGIN
    ALTER TABLE dbo.TenderFormField ADD TableRows int NULL;
    PRINT 'added TenderFormField.TableRows';
END
ELSE PRINT 'TenderFormField.TableRows already exists';
GO

SET NOEXEC OFF;
GO
