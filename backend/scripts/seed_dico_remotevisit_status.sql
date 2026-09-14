-- =============================================================================
-- remotevisit_status - the state machine behind mobile tender 2.6 Цахим үзлэг
--
-- DRAFTED BY ITSYSTEM. NOT APPROVED BY ЗСҮТ.
--
-- The SQL below was written verbatim inside the header of
-- add_remotevisit_booking_columns.sql, which deliberately did not insert it:
-- option lists are a dictionary, and a dictionary the customer has not signed
-- off does not belong in a schema change. It is lifted here into its own
-- runnable file so the flow can be built and demonstrated now.
--
-- ONLY THE VALUES ARE LOAD-BEARING, NOT THE LABELS. 'requested' is the column
-- DEFAULT on RemoteVisit.Status and the other three are compared by
-- helper/RemoteVisitFlow.js. When ЗСҮТ approve different wording, that is an
-- UPDATE to OptionTypes.label - no code change, no app release, because the
-- client reads labels from GET /api/patient/options/remotevisit_status rather
-- than hardcoding them.
--
-- GUARD IS NARROWER THAN THE OTHER SCRIPTS IN THIS FOLDER, on purpose: the
-- usual three-database allowlist would let unapproved wording reach a restored
-- production copy. Test only, until it is approved.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: unapproved draft wording, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'remotevisit_status')
BEGIN
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('remotevisit_status', N'Цахим үзлэгийн төлөв',
            N'Mobile tender 2.6 - remote examination request workflow. DRAFT, awaiting ЗСҮТ approval.');
    PRINT 'added DicoType remotevisit_status';
END
ELSE PRINT 'DicoType remotevisit_status already exists';
GO

-- Idempotent per value rather than DELETE-then-INSERT: if the customer has
-- already edited a label in place, re-running this must not silently revert it.
IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'remotevisit_status' AND value = 'requested')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('remotevisit_status', N'Хүсэлт илгээсэн', 'requested', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'remotevisit_status' AND value = 'scheduled')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('remotevisit_status', N'Цаг товлосон', 'scheduled', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'remotevisit_status' AND value = 'completed')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('remotevisit_status', N'Үзлэг хийгдсэн', 'completed', 3, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'remotevisit_status' AND value = 'cancelled')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('remotevisit_status', N'Цуцалсан', 'cancelled', 4, 0);
GO

SELECT dico, value, label, pos FROM dbo.OptionTypes WHERE dico = 'remotevisit_status' ORDER BY pos;
GO
