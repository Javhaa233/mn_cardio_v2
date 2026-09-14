-- =============================================================================
-- Close RemoteVisit rows that pre-date the booking workflow
--
-- THE PROBLEM THIS FIXES, which add_remotevisit_booking_columns.sql created.
-- That script added
--
--     Status varchar(20) NOT NULL CONSTRAINT DF_RemoteVisit_Status DEFAULT ('requested')
--
-- and a NOT NULL column with a DEFAULT stamps that default onto EVERY EXISTING
-- ROW. RemoteVisit was a complaint box before it was a booking system, so every
-- historical entry - on MnCardio_test the oldest is from 2024-08-15 - now reads
-- as a request waiting for a clinician to triage it.
--
-- Nothing is broken, but the triage queue at GET /api/doctor/evisits defaults to
-- the open set, so those rows sit at the TOP of it forever: ordering is
-- RequestedDate ASC, oldest first, which is correct for triage and exactly
-- wrong here. They also count against the per-patient open-request cap, so a
-- patient with old entries cannot file a new one.
--
-- WHY 'cancelled' AND NOT 'completed'. Both are terminal and both clear the
-- queue. 'completed' asserts that a remote examination took place, and for
-- these rows nobody knows whether it did - the workflow that would have
-- recorded it did not exist. 'cancelled' asserts only that the request is no
-- longer live, which is true. Do not upgrade this to 'completed' to make a
-- report look tidier; it would be inventing clinical history.
--
-- THE CUTOFF. Only rows whose UpdateDate is NULL are touched. Every row written
-- or moved by the new code stamps UpdateDate, so that is a precise marker for
-- "this row has never been through the booking workflow" - far safer than a
-- hardcoded date, which would be wrong on any database where the DDL ran on a
-- different day.
--
-- PRODUCTION IS A CUSTOMER DECISION. Closing historical patient requests is a
-- change to clinical records. Run it on test freely; on production it needs
-- ЗСҮТ's agreement, and the SELECT at the end is there to show them the number
-- before anyone agrees to anything.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- What would change, before anything changes.
SELECT COUNT(*) AS WouldClose,
       MIN(CreateDate) AS Oldest,
       MAX(CreateDate) AS Newest
  FROM dbo.RemoteVisit
 WHERE Status = 'requested'
   AND UpdateDate IS NULL;
GO

UPDATE dbo.RemoteVisit
   SET Status = 'cancelled',
       UpdateDate = GETDATE()
 WHERE Status = 'requested'
   AND UpdateDate IS NULL;

PRINT 'closed ' + CAST(@@ROWCOUNT AS varchar(10)) + ' historical RemoteVisit row(s)';
GO

SELECT Status, COUNT(*) AS n FROM dbo.RemoteVisit GROUP BY Status;
GO
