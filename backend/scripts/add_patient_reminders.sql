-- =============================================================================
-- PatientReminder / PatientReminderLog
--
-- Mobile tender: "patient-configurable notifications (medication, exercise,
-- follow-up appointments)". Nothing of the kind exists today.
--
-- THE UNIQUE INDEX ON (ReminderId, DueAt) IS THE MOST IMPORTANT LINE IN THIS
-- FILE. It is the idempotency key, not an optimisation.
--
-- The dispatcher runs every minute. A PM2 restart mid-tick, a clock adjustment,
-- a slow tick overlapping the next one - each would otherwise deliver the same
-- 08:00 medication reminder twice, or five times. The dispatcher writes the log
-- row BEFORE it sends and lets the duplicate key throw; catching that is how it
-- knows the reminder has already gone out. Remove this index and the feature
-- silently starts double-notifying people about their medication.
--
-- BOTH PatRegNo AND PatientId ARE STORED, deliberately denormalised. Every
-- rehab-era table keys on PatRegNo, while Notification.ToPatientId and
-- PushDevice(UserType 'P', UserId) key on Patient.id_data. Carrying both avoids
-- a join on every one-minute tick for the sake of one column.
--
-- TIMES ARE LOCAL WALL-CLOCK STRINGS, NOT datetimes. "08:00" means eight in the
-- morning where the patient is, every day, and that is not a point in time.
-- Storing a datetime would bind it to whatever timezone the row was written in.
-- MEASURED 2026-09-14: the application server runs UTC, while Mongolia is
-- UTC+8 - so a dispatcher that read the host clock would fire an 08:00 reminder
-- at 16:00 local. services/ReminderDispatcher.js converts explicitly.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PatientReminder')
BEGIN
    CREATE TABLE [PatientReminder] (
        [Id]             INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]       NVARCHAR(20)  NULL,
        [PatientId]      INT           NULL,   -- Patient.id_data
        [ReminderType]   NVARCHAR(50)  NULL,   -- dico patient_reminder_type
        [Title]          NVARCHAR(255) NULL,
        [Body]           NVARCHAR(MAX) NULL,
        [Frequency]      NVARCHAR(20)  NULL,   -- dico patient_reminder_freq
        [TimesOfDay]     NVARCHAR(200) NULL,   -- 'HH:mm' CSV, e.g. '08:00,20:00'
        [DaysOfWeek]     NVARCHAR(20)  NULL,   -- '1,3,5'; 1=Mon. NULL = every day
        [StartDate]      DATE NULL,
        [EndDate]        DATE NULL,
        [LinkObjectName] NVARCHAR(100) NULL,
        [LinkObjectId]   INT NULL,
        [IsActive]       BIT NOT NULL CONSTRAINT [DF_PatientReminder_IsActive] DEFAULT (1),
        [CreateDate]     DATETIME NULL,
        [UpdateDate]     DATETIME NULL,
        [CreateUserId]   INT NULL
    );
    PRINT 'created PatientReminder';
END
ELSE PRINT 'PatientReminder already exists';
GO

-- The dispatcher's per-tick query: active, in date range.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PatientReminder_Active')
BEGIN
    CREATE INDEX IX_PatientReminder_Active
        ON [PatientReminder] ([IsActive], [StartDate], [EndDate]);
    PRINT 'added IX_PatientReminder_Active';
END
ELSE PRINT 'IX_PatientReminder_Active already exists';
GO

-- The patient's own list.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PatientReminder_Patient')
BEGIN
    CREATE INDEX IX_PatientReminder_Patient ON [PatientReminder] ([PatientId], [IsActive]);
    PRINT 'added IX_PatientReminder_Patient';
END
ELSE PRINT 'IX_PatientReminder_Patient already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PatientReminderLog')
BEGIN
    CREATE TABLE [PatientReminderLog] (
        [Id]             INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ReminderId]     INT      NOT NULL,
        -- The local wall-clock minute this occurrence was due. Stored as the
        -- key so the same minute cannot be claimed twice.
        [DueAt]          DATETIME NOT NULL,
        [SentAt]         DATETIME NULL,
        [Channel]        NVARCHAR(20)  NULL,   -- notification | push
        [Status]         NVARCHAR(20)  NULL,   -- sent | failed | skipped
        [NotificationId] INT NULL,
        [Detail]         NVARCHAR(500) NULL
    );
    PRINT 'created PatientReminderLog';
END
ELSE PRINT 'PatientReminderLog already exists';
GO

-- See the header. This is what makes the dispatcher safe to restart.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_PatientReminderLog_Due')
BEGIN
    CREATE UNIQUE INDEX UX_PatientReminderLog_Due
        ON [PatientReminderLog] ([ReminderId], [DueAt]);
    PRINT 'added UX_PatientReminderLog_Due (idempotency key - see header)';
END
ELSE PRINT 'UX_PatientReminderLog_Due already exists';
GO

SELECT TABLE_NAME, COUNT(*) AS Columns
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME IN ('PatientReminder', 'PatientReminderLog')
 GROUP BY TABLE_NAME;
GO
