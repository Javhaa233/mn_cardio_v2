-- =============================================================================
-- RemoteVisit — booking columns for mobile tender 2.6 Цахим үзлэг
--
-- Tracker row #40 asks for, verbatim:
--   "Алсын зайн үзлэгийн хүсэлт, цаг захиалга, үзлэг"
--   (remote-examination request, APPOINTMENT BOOKING, examination)
--   acceptance: "Цахим үзлэгийн бүрэн урсгал ажиллана"
--
-- RemoteVisit today is four columns — Id, Comment, CreateDate, PatientId — so a
-- patient can file a request and nothing more. There is no appointment or
-- booking table anywhere else in model/ either (SmsDoctorSchedule is doctor-side
-- SMS scheduling, not patient booking), so the booking half of that row cannot
-- be built without these columns.
--
-- RemoteVisit is a newer-generation table (PK `Id`, PascalCase columns,
-- CreateDate bookkeeping), so the new columns follow that generation —
-- CLAUDE.md §5.
--
-- NOT RUN. Per CLAUDE.md §2 the repo owns no migrations: this is a request to
-- whoever holds SQL access. Idempotent, so it is safe to re-run.
--
-- WHAT IT ADDS
--   RequestedDate  the date/time the patient asks for
--   ScheduledDate  the slot the clinic actually confirms (may differ from the
--                  request; the doctor-side queue needs both to be answerable)
--   Status         where the request is in the flow — see the OptionTypes note
--   DoctorId       the assigned doctor (DoctorsProfile.id)
--   UpdateDate     when the row last changed state; CreateDate alone cannot
--                  tell a stale request from a freshly triaged one
--
-- STILL BLOCKED ON THE CUSTOMER (CLAUDE.md §4 step 4 / §9 "Ask, don't invent"):
-- the status list is a `dico`, and its seed rows are DB work, not code. Nothing
-- in this script invents them. The dictionary this schema expects is:
--
--   INSERT INTO dbo.DicoType (dico, Name, Description)
--   VALUES ('remotevisit_status', N'Цахим үзлэгийн төлөв',
--           N'Mobile tender 2.6 — remote examination request workflow');
--
--   INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
--   VALUES ('remotevisit_status', N'Хүсэлт илгээсэн', 'requested',  1, 0),
--          ('remotevisit_status', N'Цаг товлосон',    'scheduled',  2, 0),
--          ('remotevisit_status', N'Үзлэг хийгдсэн',  'completed',  3, 0),
--          ('remotevisit_status', N'Цуцалсан',        'cancelled',  4, 0);
--
-- Those five labels are derived, not quoted from the tender, so they need
-- clinical sign-off before they are inserted. The DEFAULT below only assumes
-- that the first state is called 'requested'.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- ---------------------------------------------------------------- columns ---

IF COL_LENGTH('dbo.RemoteVisit', 'RequestedDate') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit ADD RequestedDate datetime NULL;
    PRINT 'added RemoteVisit.RequestedDate';
END
ELSE PRINT 'RemoteVisit.RequestedDate already exists';
GO

IF COL_LENGTH('dbo.RemoteVisit', 'ScheduledDate') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit ADD ScheduledDate datetime NULL;
    PRINT 'added RemoteVisit.ScheduledDate';
END
ELSE PRINT 'RemoteVisit.ScheduledDate already exists';
GO

-- varchar, not int: OptionTypes.value is a string column, and every other
-- dico-backed field in this schema stores the option value verbatim.
IF COL_LENGTH('dbo.RemoteVisit', 'Status') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit
        ADD Status varchar(20) NOT NULL
            CONSTRAINT DF_RemoteVisit_Status DEFAULT ('requested');
    PRINT 'added RemoteVisit.Status';
END
ELSE PRINT 'RemoteVisit.Status already exists';
GO

-- No FK to DoctorsProfile: the existing PatientId column carries none either,
-- and adding one here would fail on any historical row a later triage backfills
-- with a doctor who has since been removed. Kept consistent with the table.
IF COL_LENGTH('dbo.RemoteVisit', 'DoctorId') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit ADD DoctorId int NULL;
    PRINT 'added RemoteVisit.DoctorId';
END
ELSE PRINT 'RemoteVisit.DoctorId already exists';
GO

IF COL_LENGTH('dbo.RemoteVisit', 'UpdateDate') IS NULL
BEGIN
    ALTER TABLE dbo.RemoteVisit ADD UpdateDate datetime NULL;
    PRINT 'added RemoteVisit.UpdateDate';
END
ELSE PRINT 'RemoteVisit.UpdateDate already exists';
GO

-- ---------------------------------------------------------------- backfill ---

-- Every existing row predates the workflow: it is a request that was filed and
-- never triaged. The NOT NULL default has already put them in 'requested'; this
-- only gives them a requested date, which is the moment they were submitted.
UPDATE dbo.RemoteVisit
   SET RequestedDate = CreateDate
 WHERE RequestedDate IS NULL
   AND CreateDate IS NOT NULL;
GO

-- ----------------------------------------------------------------- indexes ---

-- The patient's own history: filter PatientId, order Id desc. This is the read
-- behind GET /api/patient/evisits and the patient-portal list.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_RemoteVisit_PatientId' AND object_id = OBJECT_ID('dbo.RemoteVisit')
)
BEGIN
    CREATE INDEX IX_RemoteVisit_PatientId
        ON dbo.RemoteVisit (PatientId, Id DESC);
    PRINT 'created IX_RemoteVisit_PatientId';
END
ELSE PRINT 'IX_RemoteVisit_PatientId already exists';
GO

-- The doctor's queue: open requests assigned to me, soonest slot first. The
-- tender's list criterion is a search under 3 seconds, so this is not optional
-- once the doctor side reads the table by status.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_RemoteVisit_DoctorId_Status' AND object_id = OBJECT_ID('dbo.RemoteVisit')
)
BEGIN
    CREATE INDEX IX_RemoteVisit_DoctorId_Status
        ON dbo.RemoteVisit (DoctorId, Status, ScheduledDate);
    PRINT 'created IX_RemoteVisit_DoctorId_Status';
END
ELSE PRINT 'IX_RemoteVisit_DoctorId_Status already exists';
GO

SET NOEXEC OFF;
GO

-- ------------------------------------------------------------------ verify ---

SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'RemoteVisit'
ORDER BY ORDINAL_POSITION;
GO

SELECT
    Status,
    COUNT(*)                                              AS Rows_,
    SUM(CASE WHEN DoctorId      IS NULL THEN 1 ELSE 0 END) AS Unassigned,
    SUM(CASE WHEN ScheduledDate IS NULL THEN 1 ELSE 0 END) AS Unscheduled
FROM dbo.RemoteVisit
GROUP BY Status;
GO
