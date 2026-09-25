-- =============================================================================
-- Chat v2 - the schema the chat rebuild needs.
--
-- CONTEXT. Chat has three tables (ChatRooms, ChatRoomTooUsers, ChatMessages) and
-- they cannot express who a participant is. helper/Auth.js:8-10 states the
-- problem plainly:
--
--     "Patients live in PatientUsers and staff in Users; both are IDENTITY
--      columns starting at 1, so ids collide across the tables. Every cache
--      entry and every lookup must therefore be qualified by role."
--
-- ChatRoomTooUsers.UserId and ChatMessages.UserId carry no such qualifier. They
-- are bare integers, and ChatRoomTooUsers declares THREE competing belongsTo
-- against them - Users(Id), DoctorsProfile(UserId) and Patient(user_id). Doctor
-- #5 and patient #5 are therefore the same row to the chat schema, and
-- helper/ChatHelper.js:10-14 resolves every sender through Models.Users, so a
-- patient id of 5 writes a message authored by staff #5.
--
-- Doctor<->patient chat (mobile tender section 8) is impossible until that is
-- fixed. This script fixes it.
--
-- WHAT IT DOES
--   Step 0  inspect - READ THE OUTPUT BEFORE RUNNING ANYTHING ELSE
--   Step 1  UserType discriminator + unread/status/room-type columns
--   Step 2  widen MessageText from NVARCHAR(255)
--   Step 3  backfill UserType and remap patient ids
--   Step 4  dedupe memberships, then the unique constraint
--   Step 5  indexes and foreign keys
--   Step 6  verify
--
-- Step 0 is SELECT-only. Steps 1-5 are idempotent and safe to re-run.
--
-- THE ONE DECISION BAKED IN HERE: for UserType='P', UserId holds
-- Patient.id_data - NOT PatientUsers.Id. Auth.resolvePatientSession
-- (helper/Auth.js:70-104) is explicit that under DAN there may be no
-- PatientUsers row at all ("session.PatientUserId = patientUser ? ... : null"),
-- so keying membership to a row that will not exist in the target auth model
-- guarantees a rewrite. PatientId is populated on both the password path and the
-- DAN path, and helper/PatientScope.js:28-39 already maps it to patient_id for
-- every legacy clinical table.
--
-- CLAUDE.md section 2: there are no migrations. This is hand-written DDL and it
-- is a request to whoever holds SQL access, not something the repo runs.
-- Pure ASCII - no BOM required for sqlcmd -i.
-- =============================================================================


-- Refuse any database other than the three this project uses (runbook Stage 2.2).
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- =============================================================================
-- STEP 0 - INSPECT. Run this alone, first, and read it. Nothing here writes.
-- =============================================================================

-- 0a. Volume. If ChatMessages is in the millions, the ALTER COLUMN in Step 2
--     wants a maintenance window.
SELECT
  (SELECT COUNT(*) FROM [ChatRooms])                                    AS Rooms,
  (SELECT COUNT(*) FROM [ChatRoomTooUsers])                             AS Members,
  (SELECT COUNT(DISTINCT UserId) FROM [ChatRoomTooUsers])               AS DistinctMemberIds,
  (SELECT COUNT(*) FROM [ChatMessages])                                 AS Messages,
  (SELECT COUNT(*) FROM [File] WHERE LinkedObjectName = 'ChatMessages') AS ExistingChatFiles;

-- 0b. What the columns actually are today. The Sequelize models were written
--     after the tables; trust the catalog, not model/Chat/*.js.
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('ChatMessages', 'ChatRoomTooUsers', 'ChatRooms')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 0c. Duplicate memberships. These exist - GetChatRoomUsers
--     (ChatController.js:195-205) carries an explicit "Remove duplicates based
--     on UserId" pass, which was written because duplicates were observed.
--     They will block the unique index in Step 4.
SELECT ChatRoomId, UserId, COUNT(*) AS Cnt
FROM [ChatRoomTooUsers]
GROUP BY ChatRoomId, UserId
HAVING COUNT(*) > 1
ORDER BY Cnt DESC;

-- 0d. Orphans. These will block the foreign keys in Step 5.
SELECT COUNT(*) AS OrphanMemberships
FROM [ChatRoomTooUsers] t
WHERE NOT EXISTS (SELECT 1 FROM [ChatRooms] r WHERE r.Id = t.ChatRoomId);

SELECT COUNT(*) AS OrphanMessages
FROM [ChatMessages] m
WHERE NOT EXISTS (SELECT 1 FROM [ChatRooms] r WHERE r.Id = m.ChatRoomId);

-- 0e. THE CLASSIFICATION PROBE. This is the one whose output decides Step 3.
--
--     IsStaffId=1, IsPatientUserId=0    -> staff.   UserType='S', id unchanged.
--     IsStaffId=0, IsPatientUserId=1    -> patient. UserType='P', id remapped to
--                                          Patient.id_data.
--     IsStaffId=1 AND IsPatientUserId=1 -> the id exists in BOTH tables. This is
--                                          NOT by itself a problem, and on a
--                                          real database it is the NORMAL result
--                                          - measured 2026-09-09 on
--                                          MnCardio_restored, all 55 member ids
--                                          hit both, because PatientUsers spans
--                                          1-3120 and Users spans 7-3377. Almost
--                                          every small integer exists in both.
--                                          Read 0g, not this, to decide.
--     both 0                            -> orphan (deleted account). Deactivated
--                                          in Step 3, not deleted.
SELECT
    t.UserId,
    MAX(CASE WHEN u.Id  IS NOT NULL THEN 1 ELSE 0 END) AS IsStaffId,
    MAX(u.RoleId)                                      AS StaffRoleId,
    MAX(CASE WHEN pu.Id IS NOT NULL THEN 1 ELSE 0 END) AS IsPatientUserId,
    MAX(p.id_data)                                     AS PatientIdIfAny,
    COUNT(*)                                           AS RowCnt
FROM [ChatRoomTooUsers] t
LEFT JOIN [Users]        u  ON u.Id      = t.UserId AND u.RoleId <> 4
LEFT JOIN [PatientUsers] pu ON pu.Id     = t.UserId
LEFT JOIN [Patient]      p  ON p.user_id = t.UserId
GROUP BY t.UserId
ORDER BY IsStaffId, IsPatientUserId, t.UserId;

-- 0f. The same probe for message authors.
SELECT
    m.UserId,
    MAX(CASE WHEN u.Id  IS NOT NULL THEN 1 ELSE 0 END) AS IsStaffId,
    MAX(CASE WHEN pu.Id IS NOT NULL THEN 1 ELSE 0 END) AS IsPatientUserId,
    COUNT(*)                                           AS MsgCnt
FROM [ChatMessages] m
LEFT JOIN [Users]        u  ON u.Id  = m.UserId AND u.RoleId <> 4
LEFT JOIN [PatientUsers] pu ON pu.Id = m.UserId
GROUP BY m.UserId
ORDER BY IsStaffId, IsPatientUserId, m.UserId;

-- 0g. THE DECISIVE CHECK. Run the Step 3 backfill's exact predicates as counts.
--
--     Provenance, not id-space overlap, is what settles this. The only two code
--     paths that ever inserted into ChatRoomTooUsers were AddChatRoom
--     (ChatController.js:71) and AddUserToChatRoom (:247), and both did
--     Models.Users.findByPk(UserId) and inserted only on a hit - so every
--     existing row is staff. /Chat was also blocked for RoleId 4 by
--     restrictPatientRoutes, so a patient could never reach either route.
--
--     If all three counts below are 0, the Step 3 backfill is a NO-OP: it
--     rewrites nothing, UserType='S' (the DEFAULT) is already correct for every
--     row, and there is nothing to get wrong. That was the result on
--     MnCardio_restored.
--
--     If any is non-zero, STOP and resolve those rows by hand before Step 3.
SELECT
  (SELECT COUNT(*) FROM [ChatRoomTooUsers] t
     JOIN [Patient] p ON p.user_id = t.UserId
    WHERE NOT EXISTS (SELECT 1 FROM [Users] u
                      WHERE u.Id = t.UserId AND u.RoleId <> 4)) AS MembershipsToRemap,
  (SELECT COUNT(*) FROM [ChatMessages] m
     JOIN [Patient] p ON p.user_id = m.UserId
    WHERE NOT EXISTS (SELECT 1 FROM [Users] u
                      WHERE u.Id = m.UserId AND u.RoleId <> 4)) AS MessagesToRemap,
  (SELECT COUNT(*) FROM [ChatRoomTooUsers] t
    WHERE NOT EXISTS (SELECT 1 FROM [Users] u
                      WHERE u.Id = t.UserId AND u.RoleId <> 4)) AS MembershipsToDeactivate;

-- 0h. Corroboration: every chat member should resolve to a NON-patient Users
--     row. Expect only RoleId 1/2/3, and zero rows from the second query.
SELECT u.RoleId, COUNT(DISTINCT t.UserId) AS Ids
FROM [ChatRoomTooUsers] t JOIN [Users] u ON u.Id = t.UserId
GROUP BY u.RoleId ORDER BY u.RoleId;

SELECT COUNT(DISTINCT t.UserId) AS MembersWithNoUsersRow
FROM [ChatRoomTooUsers] t
WHERE NOT EXISTS (SELECT 1 FROM [Users] u WHERE u.Id = t.UserId);

GO


-- =============================================================================
-- STEP 1 - DISCRIMINATOR AND NEW COLUMNS
--
-- ADD ... NOT NULL ... DEFAULT is a metadata-only operation on SQL Server 2012+,
-- so every statement here is instant regardless of row count.
-- =============================================================================

-- --- ChatRoomTooUsers -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'ChatRoomTooUsers' AND COLUMN_NAME = 'UserType')
BEGIN
    -- 'S' = staff,   UserId -> Users.Id
    -- 'P' = patient, UserId -> Patient.id_data  (NOT PatientUsers.Id - see header)
    ALTER TABLE [ChatRoomTooUsers]
        ADD [UserType] CHAR(1) NOT NULL
        CONSTRAINT [DF_ChatRoomTooUsers_UserType] DEFAULT ('S');
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'ChatRoomTooUsers' AND COLUMN_NAME = 'LastReadMessageId')
BEGIN
    -- Unread is a high-water mark, not a receipt table. ChatMessages.Id is an
    -- IDENTITY column, so "Id > LastReadMessageId" is exact and index-seekable.
    -- CreateDate would not be: it is written by the app via
    -- ObjectHelper.getDateYMDHMS() at 1-second resolution, not by the server
    -- clock, so it ties. A receipt table would be (messages x members) rows to
    -- answer what one INT answers - and comparing the OTHER member's high-water
    -- mark gives 1:1 read receipts for free anyway.
    ALTER TABLE [ChatRoomTooUsers] ADD [LastReadMessageId] INT NULL;
    ALTER TABLE [ChatRoomTooUsers] ADD [LastReadDate]      DATETIME NULL;
    ALTER TABLE [ChatRoomTooUsers] ADD [IsMuted] BIT NOT NULL
        CONSTRAINT [DF_ChatRoomTooUsers_IsMuted] DEFAULT (0);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ChatRoomTooUsers_UserType')
    ALTER TABLE [ChatRoomTooUsers] WITH CHECK
        ADD CONSTRAINT [CK_ChatRoomTooUsers_UserType] CHECK ([UserType] IN ('S', 'P'));
GO

-- --- ChatMessages -----------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'ChatMessages' AND COLUMN_NAME = 'UserType')
BEGIN
    ALTER TABLE [ChatMessages]
        ADD [UserType] CHAR(1) NOT NULL
            CONSTRAINT [DF_ChatMessages_UserType] DEFAULT ('S'),
            -- 'S' = sent    - visible to the room, already fanned out
            -- 'P' = pending - carrier row for an attachment whose bytes are not
            --                 on disk yet. Visible to its author only (the
            --                 Op.or in GetMessages), never fanned out until
            --                 /Chat/CommitMessage promotes it. This is what
            --                 stops a recipient seeing an empty bubble a second
            --                 before the image arrives.
            [Status] CHAR(1) NOT NULL
            CONSTRAINT [DF_ChatMessages_Status] DEFAULT ('S'),
            [AttachmentCount] INT NOT NULL
            CONSTRAINT [DF_ChatMessages_AttCnt] DEFAULT (0);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ChatMessages_UserType')
    ALTER TABLE [ChatMessages] WITH CHECK
        ADD CONSTRAINT [CK_ChatMessages_UserType] CHECK ([UserType] IN ('S', 'P'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ChatMessages_Status')
    ALTER TABLE [ChatMessages] WITH CHECK
        ADD CONSTRAINT [CK_ChatMessages_Status] CHECK ([Status] IN ('S', 'P'));
GO

-- --- ChatRooms --------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'ChatRooms' AND COLUMN_NAME = 'RoomType')
BEGIN
    -- 'DD' doctor<->doctor 1:1
    -- 'DP' doctor<->patient 1:1
    -- 'GR' group (doctors only - a patient is never added to a group, because
    --      adding a member to an existing room retroactively grants them the
    --      entire history, which for a DP room is a disclosure of clinical
    --      conversation)
    ALTER TABLE [ChatRooms]
        ADD [RoomType] CHAR(2) NOT NULL
            CONSTRAINT [DF_ChatRooms_RoomType] DEFAULT ('DD'),
            [CreateUserType] CHAR(1) NOT NULL
            CONSTRAINT [DF_ChatRooms_CreateUserType] DEFAULT ('S');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ChatRooms_RoomType')
    ALTER TABLE [ChatRooms] WITH CHECK
        ADD CONSTRAINT [CK_ChatRooms_RoomType] CHECK ([RoomType] IN ('DD', 'DP', 'GR'));
GO


-- =============================================================================
-- STEP 2 - WIDEN MessageText
--
-- model/Chat/ChatMessages.js declares Sequelize.STRING, which is NVARCHAR(255).
-- A longer message throws a truncation error inside the socket handler, where
-- ChatHelper's try/catch swallows it (helper/ChatHelper.js:26) - and
-- ChatSocket.js broadcasts it to everyone anyway, because the return value of
-- SaveMessages is discarded at line 15. So today a long message is delivered to
-- every participant's screen and exists in nobody's history.
--
-- NVARCHAR(2000), not MAX: 2000 characters is far beyond any chat turn, it keeps
-- the value in-row with no LOB indirection, and it keeps the LIKE '%...%' that
-- ModelHelper generates on a normal column rather than a blob.
--
-- NULL, because an attachment-only message has no text. The application enforces
-- "text or attachment, not neither".
--
-- MEASURED 2026-09-09 against MnCardio_restored: the column is ALREADY
-- NVARCHAR(MAX) and nullable, so the guard below skips it and this step is a
-- no-op there. The model was the thing that was wrong - it declared
-- Sequelize.STRING (NVARCHAR(255)) against a MAX column. Kept for any database
-- where the column really is narrow.
-- =============================================================================

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ChatMessages'
             AND COLUMN_NAME = 'MessageText'
             AND CHARACTER_MAXIMUM_LENGTH < 2000
             AND CHARACTER_MAXIMUM_LENGTH <> -1)
BEGIN
    ALTER TABLE [ChatMessages] ALTER COLUMN [MessageText] NVARCHAR(2000) NULL;
END
GO


-- =============================================================================
-- STEP 3 - BACKFILL
--
-- Every existing row defaulted to 'S' in Step 1. Correct only the rows that are
-- provably NOT staff and ARE a patient login, and remap them from
-- PatientUsers.Id to Patient.id_data.
--
-- >>> If probe 0e returned any ambiguous ids (IsStaffId=1 AND IsPatientUserId=1)
-- >>> STOP HERE and resolve them by hand first. These UPDATEs would silently
-- >>> pick the wrong human.
--
-- >>> The two "SET UserId = p.id_data" statements REWRITE HISTORICAL PRODUCTION
-- >>> DATA. If probe 0e showed zero patient rows - the expected case - they
-- >>> affect nothing and no approval is needed. If it showed any, this is a
-- >>> customer-approved data change under CLAUDE.md section 9.
-- =============================================================================

UPDATE t
   SET t.UserType = 'P',
       t.UserId   = p.id_data
FROM [ChatRoomTooUsers] t
JOIN [Patient] p ON p.user_id = t.UserId
WHERE NOT EXISTS (SELECT 1 FROM [Users] u WHERE u.Id = t.UserId AND u.RoleId <> 4);
GO

UPDATE m
   SET m.UserType = 'P',
       m.UserId   = p.id_data
FROM [ChatMessages] m
JOIN [Patient] p ON p.user_id = m.UserId
WHERE NOT EXISTS (SELECT 1 FROM [Users] u WHERE u.Id = m.UserId AND u.RoleId <> 4);
GO

-- A room that now contains a patient is a doctor<->patient room.
UPDATE r SET r.RoomType = 'DP'
FROM [ChatRooms] r
WHERE EXISTS (SELECT 1 FROM [ChatRoomTooUsers] t
              WHERE t.ChatRoomId = r.Id AND t.UserType = 'P');
GO

-- More than two active members is a group. Runs after 'DP' so a 3-way room
-- containing a patient is classified as a group, which is the stricter answer.
UPDATE r SET r.RoomType = 'GR'
FROM [ChatRooms] r
WHERE (SELECT COUNT(*) FROM [ChatRoomTooUsers] t
       WHERE t.ChatRoomId = r.Id AND t.IsActive = '1') > 2;
GO

-- Orphan memberships (the account exists in neither table - a deleted user).
-- Deactivated, never deleted: the message history stays readable to the people
-- who are still in the room.
UPDATE t SET t.IsActive = '0'
FROM [ChatRoomTooUsers] t
WHERE t.UserType = 'S'
  AND NOT EXISTS (SELECT 1 FROM [Users] u WHERE u.Id = t.UserId AND u.RoleId <> 4);
GO

-- Unread starts at "everything already read". Nobody should log in to three
-- years of unread messages on the day this ships.
UPDATE t
   SET t.LastReadMessageId = x.MaxId,
       t.LastReadDate      = GETDATE()
FROM [ChatRoomTooUsers] t
CROSS APPLY (SELECT MAX(Id) AS MaxId FROM [ChatMessages] m
             WHERE m.ChatRoomId = t.ChatRoomId) x
WHERE t.LastReadMessageId IS NULL;
GO

-- Attachment counts for any pre-existing File rows. Expected: none.
UPDATE m SET m.AttachmentCount = f.Cnt
FROM [ChatMessages] m
JOIN (SELECT LinkedObjectId, COUNT(*) AS Cnt
      FROM [File]
      WHERE LinkedObjectName = 'ChatMessages' AND rec_status IN ('9', '1')
      GROUP BY LinkedObjectId) f ON f.LinkedObjectId = m.Id;
GO


-- =============================================================================
-- STEP 4 - DEDUPE, THEN CONSTRAIN
--
-- Runs AFTER the Step 3 backfill on purpose: remapping patient ids can create
-- new collisions that did not exist before.
-- =============================================================================

-- Preserve "active if any of the duplicates was active" onto the row we keep.
;WITH d AS (
    SELECT Id, IsActive,
           ROW_NUMBER() OVER (PARTITION BY ChatRoomId, UserId, UserType ORDER BY Id) AS rn,
           MAX(CASE WHEN IsActive = '1' THEN 1 ELSE 0 END)
               OVER (PARTITION BY ChatRoomId, UserId, UserType) AS AnyActive
    FROM [ChatRoomTooUsers]
)
UPDATE d SET IsActive = CASE WHEN AnyActive = 1 THEN '1' ELSE '0' END WHERE rn = 1;
GO

-- Then drop everything but the lowest Id per (room, user, type).
;WITH d AS (
    SELECT Id, ROW_NUMBER() OVER (PARTITION BY ChatRoomId, UserId, UserType ORDER BY Id) AS rn
    FROM [ChatRoomTooUsers]
)
DELETE FROM d WHERE rn > 1;
GO

-- With this in place, AddChatRoom's double-click race becomes a constraint
-- violation to catch and re-read, instead of two rooms for the same pair.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_ChatRoomTooUsers_Room_User')
    CREATE UNIQUE INDEX [UX_ChatRoomTooUsers_Room_User]
        ON [ChatRoomTooUsers] ([ChatRoomId], [UserId], [UserType]);
GO


-- =============================================================================
-- STEP 5 - INDEXES AND FOREIGN KEYS
-- =============================================================================

-- "My rooms", and the membership check itself. The INCLUDE list is everything
-- AssertMembership and the room list need, so both are covering.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ChatRoomTooUsers_User')
    CREATE INDEX [IX_ChatRoomTooUsers_User]
        ON [ChatRoomTooUsers] ([UserType], [UserId], [IsActive])
        INCLUDE ([ChatRoomId], [LastReadMessageId], [IsMuted]);
GO

-- Message paging, the last-message-per-room OUTER APPLY, and the unread COUNT
-- range seek.
--
-- MessageText is deliberately NOT in the INCLUDE list: an NVARCHAR(2000) in the
-- leaf pages would triple the index size to save one key lookup per room.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ChatMessages_Room_Id')
    CREATE INDEX [IX_ChatMessages_Room_Id]
        ON [ChatMessages] ([ChatRoomId], [Id] DESC)
        INCLUDE ([UserId], [UserType], [Status], [IsDelete], [AttachmentCount]);
GO

-- Attachment lookups. Also helps every other LinkedObjectName using the File
-- table, which is all of them.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_File_LinkedObject')
    CREATE INDEX [IX_File_LinkedObject]
        ON [File] ([LinkedObjectName], [LinkedObjectId], [rec_status])
        INCLUDE ([FieldName], [generated_name], [original_name], [ext], [size]);
GO

-- Orphan memberships must go first or the foreign key below cannot be created.
--
-- These are rows pointing at a ChatRooms row that no longer exists, so they are
-- unreachable by every query in the application - GetChatRoomList and
-- BuildRoomList both JOIN ChatRooms. Deleting them removes nothing a user can
-- see. MEASURED 2026-09-09 on MnCardio_restored: 2 rows (Ids 5 and 6, both for
-- the deleted ChatRoomId 3, created 2020-05-31), and 0 messages in that room.
DELETE t
FROM [ChatRoomTooUsers] t
WHERE NOT EXISTS (SELECT 1 FROM [ChatRooms] r WHERE r.Id = t.ChatRoomId);
GO

DELETE m
FROM [ChatMessages] m
WHERE NOT EXISTS (SELECT 1 FROM [ChatRooms] r WHERE r.Id = m.ChatRoomId);
GO

-- Referential integrity.
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ChatRoomTooUsers_ChatRooms')
    ALTER TABLE [ChatRoomTooUsers] WITH CHECK
        ADD CONSTRAINT [FK_ChatRoomTooUsers_ChatRooms]
        FOREIGN KEY ([ChatRoomId]) REFERENCES [ChatRooms]([Id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ChatMessages_ChatRooms')
    ALTER TABLE [ChatMessages] WITH CHECK
        ADD CONSTRAINT [FK_ChatMessages_ChatRooms]
        FOREIGN KEY ([ChatRoomId]) REFERENCES [ChatRooms]([Id]);
GO

-- NOTE, deliberately absent: no denormalised LastMessageId / LastMessageDate on
-- ChatRooms. With IX_ChatMessages_Room_Id, an
-- OUTER APPLY (SELECT TOP 1 ... ORDER BY Id DESC) over the 10-50 rooms a user
-- belongs to is a handful of index seeks. A denormalised column is a write-path
-- invariant that drifts the first time anyone soft-deletes a message, and buys
-- nothing measurable at this scale.


-- =============================================================================
-- STEP 6 - VERIFY
-- =============================================================================

SELECT UserType, COUNT(*) AS Cnt FROM [ChatRoomTooUsers] GROUP BY UserType;
SELECT UserType, COUNT(*) AS Cnt FROM [ChatMessages]     GROUP BY UserType;
SELECT Status,   COUNT(*) AS Cnt FROM [ChatMessages]     GROUP BY Status;
SELECT RoomType, COUNT(*) AS Cnt FROM [ChatRooms]        GROUP BY RoomType;

-- Must be 0.
SELECT COUNT(*) AS StillDuplicated FROM (
    SELECT ChatRoomId, UserId, UserType
    FROM [ChatRoomTooUsers]
    GROUP BY ChatRoomId, UserId, UserType
    HAVING COUNT(*) > 1
) z;

-- Must be 0. Every 'P' member has to resolve to a real Patient row, or
-- ChatIdentity.Me will fail closed and that person silently loses their rooms.
SELECT COUNT(*) AS UnresolvablePatients
FROM [ChatRoomTooUsers] t
WHERE t.UserType = 'P'
  AND NOT EXISTS (SELECT 1 FROM [Patient] p WHERE p.id_data = t.UserId);

SELECT COUNT(*) AS UnresolvablePatientMessages
FROM [ChatMessages] m
WHERE m.UserType = 'P'
  AND NOT EXISTS (SELECT 1 FROM [Patient] p WHERE p.id_data = m.UserId);

-- Must report NVARCHAR / 2000.
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ChatMessages' AND COLUMN_NAME = 'MessageText';
GO
