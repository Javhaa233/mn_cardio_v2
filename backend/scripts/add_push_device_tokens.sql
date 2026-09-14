-- =============================================================================
-- PushDevice - FCM / APNs registration, mobile tender tracker row 48
--
-- There is no push implementation anywhere in this backend, and without one a
-- backgrounded app receives nothing at all - which silently guts medication and
-- exercise reminders, chat alerts and advice notifications. Four tracker rows
-- depend on it.
--
-- UserId IS QUALIFIED BY UserType, AND MUST BE. 'S' means Users.Id, 'P' means
-- Patient.id_data. Those two id spaces collide - both are IDENTITY columns
-- starting at 1 - so an unqualified id would deliver a patient's notification
-- to whichever staff member happens to share the number.
-- helper/ChatIdentity.js documents the same pair, and Notification.ToPatientId
-- uses the same patient key, so one identifier spans notifications, chat and
-- push.
--
-- THE UNIQUE INDEX ON Token IS A PRIVACY CONTROL, NOT AN OPTIMISATION.
-- A token identifies a device install, not a person. A shared clinic tablet, or
-- a phone handed to a family member, produces the same token under a second
-- account. Without uniqueness the first owner's row still matches that token
-- and they keep receiving the second person's clinical notifications. With it,
-- registration is forced to MOVE the token to its new owner - which is what
-- helper/PushHelper.Register does.
--
-- Dead tokens are DEACTIVATED, never deleted: IsActive 0 plus DisabledReason
-- keeps the evidence of which device it was and why it stopped.
--
-- NOT registered in ModelConfigs/mainConfig.js, deliberately - see the model.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PushDevice')
BEGIN
    CREATE TABLE [PushDevice] (
        [Id]             INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserType]       NVARCHAR(1)   NOT NULL,   -- 'S' staff | 'P' patient
        [UserId]         INT           NOT NULL,   -- Users.Id or Patient.id_data
        [Platform]       NVARCHAR(10)  NOT NULL,   -- android | ios | web
        [Token]          NVARCHAR(512) NOT NULL,
        [DeviceId]       NVARCHAR(128) NULL,
        [AppVersion]     NVARCHAR(32)  NULL,
        [Locale]         NVARCHAR(10)  NULL,
        [IsActive]       BIT NOT NULL CONSTRAINT [DF_PushDevice_IsActive] DEFAULT (1),
        [LastSeenDate]   DATETIME NULL,
        [FailCount]      INT NOT NULL CONSTRAINT [DF_PushDevice_FailCount] DEFAULT (0),
        [DisabledReason] NVARCHAR(100) NULL,
        [CreateDate]     DATETIME NULL,
        [UpdateDate]     DATETIME NULL
    );
    PRINT 'created PushDevice';
END
ELSE PRINT 'PushDevice already exists';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_PushDevice_Token')
BEGIN
    CREATE UNIQUE INDEX UX_PushDevice_Token ON [PushDevice] ([Token]);
    PRINT 'added UX_PushDevice_Token (privacy control - see header)';
END
ELSE PRINT 'UX_PushDevice_Token already exists';
GO

-- The fan-out query: every active device for one identity.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PushDevice_Owner')
BEGIN
    CREATE INDEX IX_PushDevice_Owner ON [PushDevice] ([UserType], [UserId], [IsActive]);
    PRINT 'added IX_PushDevice_Owner';
END
ELSE PRINT 'IX_PushDevice_Owner already exists';
GO

SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME = 'PushDevice'
 ORDER BY ORDINAL_POSITION;
GO
