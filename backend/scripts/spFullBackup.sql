-- =============================================================================
-- dbo.spFullBackup - nightly full backup of the MnCardio database
--
-- Written, not run. DDL for the customer's DBA. Review the path before creating.
--
-- -----------------------------------------------------------------------------
-- WHY THIS FILE EXISTS
-- -----------------------------------------------------------------------------
-- backend/controllers/system/AppController.js schedules a job every day at
-- 23:00 server local time (node-schedule '0 0 23 * * *') that does:
--
--     const data = await Models.Backup.create({});
--     sequelize
--       .query('EXEC spFullBackup @BackUpId=' + data.Id)
--       .then(() => {})
--       .catch(() => { data.Status = 0; data.CreatedDate = new Date(); data.save(); });
--
-- Until this file, spFullBackup was not defined anywhere in either repository.
-- If the production database already has one, compare before replacing it:
--
--     EXEC sp_helptext 'dbo.spFullBackup';
--
-- Contract with that caller, which this procedure keeps:
--   * name spFullBackup, resolved unqualified - created here in dbo;
--   * one argument, @BackUpId = the Id of the Backup row the caller just
--     inserted (every other parameter below has a default);
--   * success = return without raising. Any result set is ignored;
--   * failure = RAISE AN ERROR. That is the only way the caller learns of it,
--     and all it then does is set Backup.Status = 0. Nobody is alerted.
--
-- -----------------------------------------------------------------------------
-- WHAT IT DOES
-- -----------------------------------------------------------------------------
--   1. BACKUP DATABASE DB_NAME() TO DISK = @Dir/<db>_FULL_<yyyyMMdd_HHmm>.bak
--      WITH CHECKSUM, INIT.
--      COMPRESSION is added only on editions that support it (Enterprise,
--      Developer, Standard). Express and Web do not, and requesting it there is
--      an error - so on Express the file is uncompressed, roughly the size of
--      the used data pages. Plan disk space for that.
--   2. RESTORE VERIFYONLY FROM DISK = <that file> WITH CHECKSUM.
--   3. Records FileName, Status = '1', CreatedDate and ExpiredDate on the
--      Backup row @BackUpId. Called with no @BackUpId (for example from host
--      cron through sqlcmd) it inserts its own Backup row instead, so the
--      Backup table stays the one place to look either way.
--   4. On any error: records Status = '0' where it can, then THROWs, with the
--      original error number and message in the text.
--
--   Note: a failing BACKUP raises two errors (for example 3201 "Cannot open
--   backup device", then 3013 "BACKUP DATABASE is terminating abnormally") and
--   TRY/CATCH only sees the last one. For the full reason, run the procedure
--   by hand in SSMS/sqlcmd or read the SQL Server error log.
--
-- -----------------------------------------------------------------------------
-- NOT DONE HERE: RETENTION
-- -----------------------------------------------------------------------------
-- Deleting old .bak files from T-SQL needs xp_delete_file, which is
-- undocumented. Delete them on the SQL Server host instead - see
-- docs/handover/admin-guide.md section 5. Linux:
--
--     find <backup-dir> -maxdepth 1 -name '*_FULL_*.bak' -mtime +14 -delete
--
-- @KeepDays does not delete anything. It only fills Backup.ExpiredDate so the
-- table shows when a file is due to go. Keep it equal to the host-side value.
--
-- -----------------------------------------------------------------------------
-- SET BEFORE CREATING
-- -----------------------------------------------------------------------------
-- The @Dir default below is a PLACEHOLDER: <SET-BACKUP-DIR>.
-- Replace it with a directory ON THE SQL SERVER HOST (not the app host) that the
-- SQL Server service account can write to, e.g.
--     Linux:    /var/opt/mssql/backup
--     Windows:  D:\SQLBackup
-- While the placeholder is left in, every run fails on purpose (Status = 0),
-- so a forgotten setting shows up in the Backup table instead of silently
-- writing somewhere unexpected.
--
-- -----------------------------------------------------------------------------
-- PERMISSIONS
-- -----------------------------------------------------------------------------
-- The scheduled job runs this as the APPLICATION's SQL login (SQL_USER).
--   * BACKUP DATABASE    needs db_backupoperator (or db_owner) in this database.
--   * RESTORE VERIFYONLY needs CREATE DATABASE permission (server level, per the
--                        RESTORE documentation). Without it step 2 fails and the
--                        night is recorded as failed although the .bak exists.
--   * EXECUTE on dbo.spFullBackup.
--   * The SQL Server SERVICE ACCOUNT must have write access to @Dir.
--
-- -----------------------------------------------------------------------------
-- TIME LIMIT
-- -----------------------------------------------------------------------------
-- config/DbConnection.js sets requestTimeout 300000 ms (5 minutes). If backup
-- plus verify takes longer, the driver cancels the request, SQL Server aborts the
-- backup, and the row is marked Status = 0. Time one run by hand first:
--
--     EXEC dbo.spFullBackup;
--
-- If it comes near 5 minutes, schedule it from host cron with sqlcmd instead
-- (sqlcmd has no query timeout by default) - see the guide, section 5.
--
-- Requires SQL Server 2016 SP1 or later (CREATE OR ALTER). Contract minimum is
-- SQL Server 2017, so this is satisfied.
-- =============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.spFullBackup
    @BackUpId INT           = NULL,
    @Dir      NVARCHAR(400) = N'<SET-BACKUP-DIR>',   -- PLACEHOLDER: the DBA sets this
    @KeepDays INT           = 14                     -- informational; see RETENTION
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Db       SYSNAME       = DB_NAME();
    DECLARE @Now      DATETIME      = GETDATE();
    DECLARE @Stamp    VARCHAR(13)   = CONVERT(CHAR(8), @Now, 112) + '_'
                                      + REPLACE(CONVERT(CHAR(5), @Now, 108), ':', '');
    DECLARE @Edition  NVARCHAR(128) = CAST(SERVERPROPERTY('Edition') AS NVARCHAR(128));
    DECLARE @FileName NVARCHAR(260) = NULL;
    DECLARE @File     NVARCHAR(700) = NULL;
    DECLARE @ErrNo    INT;
    DECLARE @ErrMsg   NVARCHAR(2048);

    BEGIN TRY
        -- Refuse to run with the placeholder, an empty value, or NULL.
        IF @Dir IS NULL OR LTRIM(RTRIM(@Dir)) = N'' OR @Dir LIKE N'<%'
            THROW 50001, N'spFullBackup: backup directory is not configured. Set the @Dir default in dbo.spFullBackup.', 1;

        -- Append a separator matching the style of the path given.
        IF RIGHT(@Dir, 1) NOT IN (N'/', N'\')
            SET @Dir = @Dir + CASE WHEN CHARINDEX(N'/', @Dir) > 0 THEN N'/' ELSE N'\' END;

        SET @FileName = @Db + N'_FULL_' + @Stamp + N'.bak';
        SET @File     = @Dir + @FileName;

        -- COMPRESSION is an error on Express and Web; only ask where supported.
        IF @Edition LIKE N'Enterprise%' OR @Edition LIKE N'Developer%' OR @Edition LIKE N'Standard%'
            BACKUP DATABASE @Db TO DISK = @File
                WITH CHECKSUM, INIT, COMPRESSION, NAME = @FileName;
        ELSE
            BACKUP DATABASE @Db TO DISK = @File
                WITH CHECKSUM, INIT, NAME = @FileName;

        RESTORE VERIFYONLY FROM DISK = @File WITH CHECKSUM;

        IF @BackUpId IS NOT NULL
            UPDATE dbo.[Backup]
               SET FileName    = @FileName,
                   Status      = '1',
                   CreatedDate = @Now,
                   ExpiredDate = DATEADD(DAY, @KeepDays, @Now)
             WHERE Id = @BackUpId;
        ELSE
            INSERT INTO dbo.[Backup] (Status, FileName, CreatedDate, ExpiredDate)
            VALUES ('1', @FileName, @Now, DATEADD(DAY, @KeepDays, @Now));
    END TRY
    BEGIN CATCH
        SET @ErrNo  = ERROR_NUMBER();
        SET @ErrMsg = ERROR_MESSAGE();

        -- Record the failure. This must never hide the original error, so it
        -- has its own TRY/CATCH and its own failure is ignored.
        BEGIN TRY
            IF @BackUpId IS NOT NULL
                UPDATE dbo.[Backup]
                   SET FileName    = @FileName,
                       Status      = '0',
                       CreatedDate = @Now
                 WHERE Id = @BackUpId;
            ELSE
                INSERT INTO dbo.[Backup] (Status, FileName, CreatedDate)
                VALUES ('0', @FileName, @Now);
        END TRY
        BEGIN CATCH
            -- intentionally empty
        END CATCH;

        SET @ErrMsg = LEFT(N'spFullBackup failed (error ' + CAST(@ErrNo AS NVARCHAR(12))
                           + N'): ' + ISNULL(@ErrMsg, N''), 2048);
        THROW 50002, @ErrMsg, 1;
    END CATCH;
END
GO

-- -----------------------------------------------------------------------------
-- After creating (all by hand, all optional):
--
--   -- grant to the application login, if it is not db_owner
--   -- ALTER ROLE db_backupoperator ADD MEMBER [<app-login>];
--   -- GRANT EXECUTE ON dbo.spFullBackup TO [<app-login>];
--   -- USE master; GRANT CREATE DATABASE TO [<app-login>];   -- for VERIFYONLY
--
--   -- one manual run, timed
--   -- EXEC dbo.spFullBackup;
--
--   -- the last week
--   -- SELECT TOP (7) Id, Status, FileName, CreatedDate, ExpiredDate
--   --   FROM dbo.[Backup] ORDER BY Id DESC;
-- -----------------------------------------------------------------------------
