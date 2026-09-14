-- =============================================================================
-- RemoteVisit.MeetingUrl - the video link for mobile tender 2.6 Цахим үзлэг
--
-- A SEPARATE SCRIPT, not an edit to add_remotevisit_booking_columns.sql,
-- because that one has ALREADY BEEN RUN on MnCardio_test (verified 2026-09-14).
-- Editing an applied script changes nothing on a database that has already seen
-- it, and leaves the file lying about what it did.
--
-- WHY ADD IT NOW, BEFORE THE PLATFORM IS CHOSEN. Tracker row 40 asks for the
-- full remote-examination flow: request, appointment, examination. The first
-- two are satisfiable with the columns that exist. The third needs somewhere to
-- put the link to wherever the consultation actually happens - Zoom, Teams,
-- Jitsi, something self-hosted - and that choice is an open customer question
-- (mobile/BLOCKERS.md). Adding the column now makes the answer a VALUE rather
-- than a second DDL request three weeks from now. It is the same argument as
-- RehabExercise.MediaRef, which is deliberately a loose string for exactly this
-- reason.
--
-- nvarchar(500): meeting URLs carry long opaque tokens. Zoom and Teams join
-- links routinely pass 200 characters, and truncation would produce a link that
-- looks right and does not work.
--
-- The controller only ever returns this when Status = 'scheduled', and only to
-- the patient the visit belongs to or the assigned doctor - a join link is a
-- bearer credential for a clinical conversation.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.RemoteVisit', 'MeetingUrl') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit ADD MeetingUrl nvarchar(500) NULL;
    PRINT 'added RemoteVisit.MeetingUrl';
END
ELSE PRINT 'RemoteVisit.MeetingUrl already exists';
GO

-- UpdateDate belongs to the booking set and is listed in the original script's
-- header, but is not present on MnCardio_test - checked 2026-09-14. Without it
-- a stale request cannot be told from a freshly triaged one, so it is created
-- here rather than left to be noticed later by its absence.
IF COL_LENGTH('dbo.RemoteVisit', 'UpdateDate') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit ADD UpdateDate datetime NULL;
    PRINT 'added RemoteVisit.UpdateDate';
END
ELSE PRINT 'RemoteVisit.UpdateDate already exists';
GO

SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME = 'RemoteVisit'
 ORDER BY ORDINAL_POSITION;
GO
