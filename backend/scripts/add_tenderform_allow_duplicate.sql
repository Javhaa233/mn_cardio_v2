-- =============================================================================
-- TenderForm.AllowDuplicate
--
-- Appendix 3.1 says, verbatim:
--   "ТиСДО/ТиСДЭ-нд орсон хүмүүс дахин энэ ажилбартаа орохоор болоход
--    ӨМНӨХ МЭДЭЭЛЛИЙГ DUPLICATE хийх үү гэж асуудаг байх!!!"
--   (when a patient returns for the same procedure, ask whether to duplicate
--    the previous record's data)
--
-- Which forms behave that way is a property of the form, so it lives on the
-- registry rather than being hard-coded in the component.
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

IF COL_LENGTH('dbo.TenderForm', 'AllowDuplicate') IS NULL
BEGIN
    ALTER TABLE dbo.TenderForm
        ADD AllowDuplicate bit NOT NULL
            CONSTRAINT DF_TenderForm_AllowDuplicate DEFAULT (0);
    PRINT 'added TenderForm.AllowDuplicate';
END
ELSE PRINT 'TenderForm.AllowDuplicate already exists';
GO

-- 3.1 is the form the tender calls this out for. The surgery records are also
-- repeatable per patient, but the document only asks for the prompt here, so
-- only 3.1 is switched on until the clinical team says otherwise.
UPDATE dbo.TenderForm SET AllowDuplicate = 1 WHERE FormCode = '3.1';

SET NOEXEC OFF;
GO

SELECT FormCode, AllowDuplicate, NameMn FROM dbo.TenderForm ORDER BY Position;
GO
