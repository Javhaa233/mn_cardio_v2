-- =============================================================================
-- Notification.ToPatientId - let a notification be addressed to a PATIENT
--
-- Mobile tender, tracker row 48. Today Notification can be addressed to a staff
-- user (ToUserId) or a doctor profile (ToDoctorId) and to nobody else, so the
-- patient app has nothing to show and the Advice flow - the only producer of
-- notifications in the entire backend - can only ever notify clinicians.
--
-- WHY ToPatientId AND NOT ToPatientUserId. This is the decision to understand
-- before changing anything here, because the obvious choice is wrong.
--
-- Patients have TWO identities: a login row in PatientUsers, and the clinical
-- record Patient (PK id_data). Users.Id and PatientUsers.Id are both IDENTITY
-- columns starting at 1, so the two id spaces COLLIDE - helper/ChatIdentity.js
-- exists precisely because of that and qualifies every id with a UserType.
--
-- Decisively: helper/Auth.js sets session.PatientUserId only when a PatientUsers
-- row was found. Under the ДАН / PatRegNo login path there is no PatientUsers
-- row at all, so a ToPatientUserId column would be permanently NULL for exactly
-- the login method the tender is moving towards.
--
-- Patient.id_data is the key helper/PatientScope.js already scopes patient reads
-- by, the key ChatIdentity uses for UserType 'P', and the key PushDevice uses.
-- One identifier across notifications, chat and push.
--
-- READS ONLY. There is a matching entry in PatientScope.SCOPE_BY_OBJECT so a
-- patient can LIST their own notifications. Do not let a producer write through
-- BaseControllerHelper.BaseCreate: it calls ApplyPatientOwnership first, which
-- for a patient session OVERWRITES Data[ToPatientId] with the caller's own id.
-- A notification a patient's action generates for a DOCTOR would be re-addressed
-- to the patient. Producers use Models.Notification.create directly.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF COL_LENGTH('dbo.Notification', 'ToPatientId') IS NULL
BEGIN
    ALTER TABLE dbo.Notification ADD ToPatientId int NULL;
    PRINT 'added Notification.ToPatientId';
END
ELSE PRINT 'Notification.ToPatientId already exists';
GO

-- Filtered: the vast majority of rows are staff-addressed and carry NULL here,
-- and they should not pay for an index the patient app uses. Covers the only
-- query the app makes - my notifications, unread first, newest first.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
     WHERE name = 'IX_Notification_ToPatientId' AND object_id = OBJECT_ID('dbo.Notification')
)
BEGIN
    CREATE INDEX IX_Notification_ToPatientId
        ON dbo.Notification (ToPatientId, Seen, CreateDate DESC)
        WHERE ToPatientId IS NOT NULL;
    PRINT 'added IX_Notification_ToPatientId';
END
ELSE PRINT 'IX_Notification_ToPatientId already exists';
GO

-- Notification.belongsTo(ObjectNameDic) and findAllNew includes it, so a
-- LinkObjectName with no dictionary row renders blank in the bell. These are
-- the object names the patient-facing producers will write.
IF NOT EXISTS (SELECT 1 FROM dbo.ObjectNameDic WHERE ObjectName = 'VisitComments')
    INSERT INTO dbo.ObjectNameDic (ObjectName, ObjectNameMn, CreateDate)
    VALUES ('VisitComments', N'Эмчээс асуух асуулт', GETDATE());

IF NOT EXISTS (SELECT 1 FROM dbo.ObjectNameDic WHERE ObjectName = 'RemoteVisit')
    INSERT INTO dbo.ObjectNameDic (ObjectName, ObjectNameMn, CreateDate)
    VALUES ('RemoteVisit', N'Цахим үзлэг', GETDATE());

IF NOT EXISTS (SELECT 1 FROM dbo.ObjectNameDic WHERE ObjectName = 'Advice')
    INSERT INTO dbo.ObjectNameDic (ObjectName, ObjectNameMn, CreateDate)
    VALUES ('Advice', N'Эмчийн зөвлөгөө', GETDATE());

IF NOT EXISTS (SELECT 1 FROM dbo.ObjectNameDic WHERE ObjectName = 'AdviceComment')
    INSERT INTO dbo.ObjectNameDic (ObjectName, ObjectNameMn, CreateDate)
    VALUES ('AdviceComment', N'Зөвлөгөөний хариу', GETDATE());

IF NOT EXISTS (SELECT 1 FROM dbo.ObjectNameDic WHERE ObjectName = 'RehabAssessment')
    INSERT INTO dbo.ObjectNameDic (ObjectName, ObjectNameMn, CreateDate)
    VALUES ('RehabAssessment', N'Сэргээн засахын үнэлгээ', GETDATE());
GO

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME = 'Notification' AND COLUMN_NAME LIKE 'To%'
 ORDER BY ORDINAL_POSITION;

-- The value domain of Seen is not knowable from this repo - nothing in the
-- backend reads or writes it; it is set by the nightly EXEC spUpdateNotification
-- whose body lives in the database. Print it so whoever wires the mark-read
-- route picks the same value the web bell already uses.
SELECT DISTINCT Seen FROM dbo.Notification;
GO
